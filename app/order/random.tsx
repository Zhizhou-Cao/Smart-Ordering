import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';

import { FriendProfile, STORAGE_KEYS, UserPreferences } from '@/constants/storage';

const ORANGE = '#FF6B35';
const BG = '#F8F8F8';

export default function RandomSuggestScreen() {
  const [selfPrefs, setSelfPrefs] = useState<UserPreferences | null>(null);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [tempPreference, setTempPreference] = useState('');

  const loadUserPrefs = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.userPreferences);
      if (stored) {
        const data: UserPreferences = JSON.parse(stored);
        setSelfPrefs(data);
      }
    } catch (e) {
      console.warn('Failed to load user prefs', e);
    }
  }, []);

  const loadFriends = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.friends);
      const list: FriendProfile[] = stored ? JSON.parse(stored) : [];
      setFriends(list);
    } catch (e) {
      console.warn('Failed to load friends', e);
    }
  }, []);

  useEffect(() => {
    loadUserPrefs();
  }, [loadUserPrefs]);

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [loadFriends])
  );

  const selectedFriends = useMemo(
    () => friends.filter((f) => selectedFriendIds.includes(f.id)),
    [friends, selectedFriendIds]
  );

  const toggleFriend = (id: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleStartRandom = () => {
    const myAllergies = (selfPrefs?.allergies || []).filter((a) => a && a !== '无');
    const friendAllergies = selectedFriends.flatMap((f) =>
      (f.allergies || []).filter((a) => a && a !== '无')
    );
    const allAllergens = [...new Set([...myAllergies, ...friendAllergies])];
    const isVegetarian =
      (selfPrefs?.diet?.includes('素食') ?? false) ||
      selectedFriends.some((f) => f.diet?.includes('素食'));
    router.push({
      pathname: '/order/random-cards',
      params: {
        allAllergens: JSON.stringify(allAllergens),
        isVegetarian: isVegetarian ? 'true' : 'false',
      },
    });
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
          title: '不知道吃什么',
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
            <Text style={styles.title}>Step 1 · 选择用餐人数</Text>
            <Text style={styles.subtitle}>
              一个人吃还是和好友一起？我们会综合所有人的偏好来随机推荐。
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
                  <Text style={styles.sectionHint}>
                    如：小李不吃海鲜，爸妈口味清淡。
                  </Text>
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

          <TouchableOpacity style={styles.primaryButton} onPress={handleStartRandom}>
            <Text style={styles.primaryButtonText}>开始随机推荐</Text>
          </TouchableOpacity>
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#777',
    marginBottom: 20,
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
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 24,
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
});
