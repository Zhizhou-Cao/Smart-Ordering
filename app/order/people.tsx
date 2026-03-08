import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FriendProfile, STORAGE_KEYS, UserPreferences } from '@/constants/storage';

const ORANGE = '#FF6B35';
const BG = '#F8F8F8';

export default function PeopleScreen() {
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [tempPreference, setTempPreference] = useState('');
  const [loading, setLoading] = useState(false);

  const loadFriends = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.friends);
      const list: FriendProfile[] = stored ? JSON.parse(stored) : [];
      setFriends(list);
    } catch (e) {
      console.warn('Failed to load friends', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [loadFriends])
  );

  const toggleFriend = (id: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const calcPeopleCount = () => {
    if (mode === 'single') return 1;
    let count = 1; // 自己
    count += selectedFriendIds.length;
    if (tempPreference.trim()) count += 1;
    return count;
  };

  const buildMyPreferenceString = (prefs: UserPreferences | null): string => {
    if (!prefs) return '';
    const taste = prefs.taste?.length ? prefs.taste.join('、') : '不限';
    const diet = prefs.diet?.length ? prefs.diet.join('、') : '无限制';
    const allergies =
      prefs.allergies?.length && !prefs.allergies.includes('无')
        ? prefs.allergies.join('、')
        : '无';
    const dislike = prefs.dislike || '无';
    const notes = prefs.notes || '无';
    return `口味：${taste}；饮食类型：${diet}；过敏食材：${allergies}；不喜欢：${dislike}；备注：${notes}`;
  };

  /** 构建带人数说明的本人偏好字符串，供 Dify 使用 */
  const buildMyPreferenceWithCount = (prefs: UserPreferences | null, peopleCount: number): string => {
    const base = buildMyPreferenceString(prefs);
    return `本次用餐人数：${peopleCount}人。\n本人偏好 - ${base}`;
  };

  const uploadImageToDify = async (imageUri: string) => {
    let body: FormData;

    if (Platform.OS === 'web') {
      // 网页端：fetch blob
      const res = await fetch(imageUri);
      const blob = await res.blob();
      body = new FormData();
      // @ts-ignore React Native / web FormData file
      body.append('file', blob, 'menu.jpg');
    } else {
      // 手机端：直接用 uri 构建 FormData
      body = new FormData();
      body.append(
        'file',
        {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'menu.jpg',
        } as any,
      );
    }
    body.append('user', 'app-user');

    const uploadUrl =
      Platform.OS === 'web' ? '/api/upload' : 'https://api.dify.ai/v1/files/upload';

    const headers: Record<string, string> = {};
    if (Platform.OS !== 'web') {
      headers['Authorization'] = `Bearer ${process.env.EXPO_PUBLIC_DIFY_API_KEY}`;
    }

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers,
      body,
    });

    const text = await response.text();
    console.log('上传状态：', response.status);
    console.log('上传结果：', text);

    if (!response.ok) throw new Error('UPLOAD_ERROR');
    return JSON.parse(text).id as string;
  };

  const callDifyWorkflow = async (
    uploadFileId: string,
    myPreference: string,
    selectedFriends: string,
    tempCompanions: string,
  ) => {
    const workflowUrl =
      Platform.OS === 'web' ? '/api/recommend' : 'https://api.dify.ai/v1/workflows/run';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (Platform.OS !== 'web') {
      headers['Authorization'] = `Bearer ${process.env.EXPO_PUBLIC_DIFY_API_KEY}`;
    }

    const requestBody = {
      inputs: {
        menu_image: {
          transfer_method: 'local_file',
          upload_file_id: uploadFileId,
          type: 'image',
        },
        my_preference: myPreference,
        selected_friends: selectedFriends || '',
        temp_companions: tempCompanions || '',
      },
      response_mode: 'blocking',
      user: 'app-user',
    };

    console.log('发送给Dify的参数：', JSON.stringify(requestBody, null, 2));

    const response = await fetch(workflowUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const text = await response.text();
    console.log('工作流状态：', response.status);
    console.log('工作流结果：', text);

    if (!response.ok) throw new Error('WORKFLOW_ERROR');

    const data = JSON.parse(text);
    console.log('完整outputs：', JSON.stringify(data?.data?.outputs, null, 2));

    const outputs = data?.data?.outputs || data?.outputs || {};
    const result =
      outputs?.analyse_result ||
      outputs?.text ||
      outputs?.result ||
      (Object.values(outputs)
        .filter((v) => typeof v === 'string')
        .sort((a, b) => (b as string).length - (a as string).length)[0] as string);

    if (!result || result.length < 10) throw new Error('PARSE_ERROR');
    return result;
  };

  const handleStart = async () => {
    if (Platform.OS === 'web') {
      console.warn('注意：网页端可能有CORS限制，请用手机Expo Go测试完整功能');
    }

    console.log('API KEY:', process.env.EXPO_PUBLIC_DIFY_API_KEY);
    console.log('API URL:', process.env.EXPO_PUBLIC_DIFY_API_URL);

    const imageUri = typeof params.imageUri === 'string' ? params.imageUri : '';
    if (!imageUri) {
      Alert.alert('提示', '请先返回上一步上传菜单图片。');
      return;
    }

    try {
      setLoading(true);

      const [prefsRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.userPreferences),
      ]);
      const prefs: UserPreferences | null = prefsRaw ? JSON.parse(prefsRaw) : null;
      const peopleCountNum = calcPeopleCount();
      const myPreferenceStr = buildMyPreferenceWithCount(prefs, peopleCountNum);

      // 单人用餐时必须传空字符串，避免 Dify 误判为多人
      const selectedFriendsNames = mode === 'single' ? '' : friends
        .filter((f) => selectedFriendIds.includes(f.id))
        .map((f) => f.name)
        .join('、');
      const tempCompanionsForApi = mode === 'single' ? '' : tempPreference;

      const uploadId = await uploadImageToDify(imageUri);
      const recommendationText = await callDifyWorkflow(
        uploadId,
        myPreferenceStr,
        selectedFriendsNames,
        tempCompanionsForApi,
      );

      const peopleCount = String(calcPeopleCount());
      router.push({
        pathname: '/order/result',
        params: {
          peopleCount,
          recommendation: recommendationText ?? '',
        },
      });
    } catch (error: any) {
      console.error('完整错误信息：', JSON.stringify(error, null, 2));
      console.error('错误message：', error?.message);
      console.error('错误stack：', error?.stack);
      Alert.alert('推荐失败', '请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderFriend = ({ item }: { item: FriendProfile }) => {
    const selected = selectedFriendIds.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.friendRow, selected && styles.friendRowSelected]}
        activeOpacity={0.85}
        onPress={() => toggleFriend(item.id)}>
        <View style={styles.friendLeft}>
          <View style={styles.friendAvatar}>
            <Text style={styles.friendAvatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.friendName}>{item.name}</Text>
            <Text style={styles.friendSubtitle}>
              {item.taste?.join('、') || '口味不限'}
            </Text>
          </View>
        </View>
        <Text style={[styles.checkmark, selected && styles.checkmarkSelected]}>
          {selected ? '✓' : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '确认用餐人数',
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.root}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Step 2 · 确认用餐人数</Text>
            <Text style={styles.subtitle}>
              告诉我这餐是自己吃，还是和好友一起，我们会综合所有人的偏好来推荐。
            </Text>

            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeButton, mode === 'single' && styles.modeButtonActive]}
                onPress={() => setMode('single')}>
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === 'single' && styles.modeButtonTextActive,
                  ]}>
                  单独用餐
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, mode === 'multi' && styles.modeButtonActive]}
                onPress={() => setMode('multi')}>
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === 'multi' && styles.modeButtonTextActive,
                  ]}>
                  多人用餐
                </Text>
              </TouchableOpacity>
            </View>

            {mode === 'multi' && (
              <>
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>从好友档案选人</Text>
                  {friends.length === 0 ? (
                    <Text style={styles.emptyFriends}>
                      还没有好友档案，可先在「好友」Tab 中添加。
                    </Text>
                  ) : (
                    <FlatList
                      data={friends}
                      keyExtractor={(item) => item.id}
                      renderItem={renderFriend}
                      scrollEnabled={false}
                    />
                  )}
                </View>

                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>临时同桌偏好（可选）</Text>
                  <Text style={styles.sectionHint}>如：小李不吃海鲜，爸妈口味清淡。</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="用一句话描述一下同桌整体偏好..."
                    placeholderTextColor="#999"
                    multiline
                    value={tempPreference}
                    onChangeText={setTempPreference}
                  />
                </View>
              </>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>开始推荐（为 {calcPeopleCount()} 人）</Text>
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingCard}>
                <Text style={styles.loadingEmoji}>🍽️</Text>
                <Text style={styles.loadingText}>AI 正在分析菜单，请稍候...</Text>
                <ActivityIndicator size="small" color={ORANGE} />
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  root: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  subtitle: {
    fontSize: 13,
    color: '#777',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modeButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  modeButtonActive: {
    borderColor: ORANGE,
    backgroundColor: '#FFE3D3',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#555',
  },
  modeButtonTextActive: {
    color: ORANGE,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  sectionHint: {
    fontSize: 12,
    color: '#777',
    marginBottom: 8,
  },
  emptyFriends: {
    fontSize: 13,
    color: '#777',
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  friendRowSelected: {
    backgroundColor: '#FFF4EC',
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE3D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  friendAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: ORANGE,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  friendSubtitle: {
    fontSize: 12,
    color: '#777',
  },
  checkmark: {
    width: 24,
    textAlign: 'center',
    fontSize: 16,
    color: '#CCC',
  },
  checkmarkSelected: {
    color: ORANGE,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222',
    backgroundColor: '#FAFAFA',
    minHeight: 64,
    textAlignVertical: 'top',
  },
  primaryButton: {
    borderRadius: 999,
    backgroundColor: ORANGE,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    width: '75%',
    maxWidth: 320,
    borderRadius: 16,
    backgroundColor: '#FFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingEmoji: {
    fontSize: 28,
  },
  loadingText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
});

