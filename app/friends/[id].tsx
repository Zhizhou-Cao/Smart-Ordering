import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import {
  AllergyOption,
  DietOption,
  FriendProfile,
  STORAGE_KEYS,
  TasteOption,
} from '@/constants/storage';

const ORANGE = '#FF6B35';
const BG = '#F8F8F8';

const TASTE_OPTIONS: TasteOption[] = ['清淡', '微辣', '中辣', '重辣', '不限'];
const DIET_OPTIONS: DietOption[] = ['无限制', '素食', '清真', '低卡减脂'];
const ALLERGY_OPTIONS: AllergyOption[] = ['海鲜', '花生', '坚果', '乳制品', '无'];

export default function FriendDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [friend, setFriend] = useState<FriendProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [taste, setTaste] = useState<TasteOption[]>(['不限']);
  const [diet, setDiet] = useState<DietOption[]>(['无限制']);
  const [allergies, setAllergies] = useState<AllergyOption[]>(['无']);
  const [dislike, setDislike] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id || typeof id !== 'string') return;
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.friends);
        const list: FriendProfile[] = stored ? JSON.parse(stored) : [];
        const current = list.find((f) => f.id === id) ?? null;
        setFriend(current);
        if (current) {
          setName(current.name);
          setTaste(current.taste?.length ? current.taste : ['不限']);
          setDiet(current.diet?.length ? current.diet : ['无限制']);
          setAllergies(current.allergies?.length ? current.allergies : ['无']);
          setDislike(current.dislike ?? '');
          setNotes(current.notes ?? '');
        }
      } catch (e) {
        console.warn('Failed to load friend', e);
      }
    };
    load();
  }, [id]);

  const toggleTaste = (option: TasteOption) => {
    setTaste((prev) => {
      if (option === '不限') {
        return prev.includes('不限') ? [] : ['不限'];
      }
      const withoutAny = prev.filter((v) => v !== '不限');
      if (withoutAny.includes(option)) {
        return withoutAny.filter((v) => v !== option);
      }
      return [...withoutAny, option];
    });
  };

  const toggleDiet = (option: DietOption) => {
    setDiet((prev) => {
      if (option === '无限制') {
        return prev.includes('无限制') ? [] : ['无限制'];
      }
      const withoutAny = prev.filter((v) => v !== '无限制');
      if (withoutAny.includes(option)) {
        return withoutAny.filter((v) => v !== option);
      }
      return [...withoutAny, option];
    });
  };

  const toggleAllergy = (option: AllergyOption) => {
    setAllergies((prev) => {
      if (option === '无') {
        return prev.includes('无') ? [] : ['无'];
      }
      const withoutNone = prev.filter((v) => v !== '无');
      if (withoutNone.includes(option)) {
        return withoutNone.filter((v) => v !== option);
      }
      return [...withoutNone, option];
    });
  };

  const handleSave = async () => {
    if (!friend || !id || typeof id !== 'string') return;
    if (!name.trim()) {
      Alert.alert('提示', '请先填写好友姓名。');
      return;
    }
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.friends);
      const list: FriendProfile[] = stored ? JSON.parse(stored) : [];
      const updated: FriendProfile[] = list.map((f) =>
        f.id === id
          ? {
              ...f,
              name: name.trim(),
              taste: taste.length ? taste : ['不限'],
              diet: diet.length ? diet : ['无限制'],
              allergies: allergies.length ? allergies : ['无'],
              dislike,
              notes,
            }
          : f,
      );
      await AsyncStorage.setItem(STORAGE_KEYS.friends, JSON.stringify(updated));
      Alert.alert('已保存', '好友档案已更新。');
      router.back();
    } catch (e) {
      console.warn('Failed to update friend', e);
      Alert.alert('保存失败', '请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  const deleteFriend = async () => {
    if (!id || typeof id !== 'string') return;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.friends);
      const list: FriendProfile[] = stored ? JSON.parse(stored) : [];
      const updated = list.filter((f) => f.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.friends, JSON.stringify(updated));
      router.back();
    } catch (e) {
      console.error('删除失败', e);
      Alert.alert('删除失败', '请稍后重试。');
    }
  };

  const handleDelete = async () => {
    if (!id || typeof id !== 'string') return;
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('确定要删除这位好友吗？');
      if (confirmed) {
        await deleteFriend();
      }
    } else {
      Alert.alert('删除好友', '确定要删除这位好友吗？', [
        { text: '取消', style: 'cancel' },
        { text: '删除', style: 'destructive', onPress: deleteFriend },
      ]);
    }
  };

  const renderOption = <T extends string>(
    option: T,
    selected: boolean,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      key={option}
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.8}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text>
    </TouchableOpacity>
  );

  if (!friend) {
    return (
      <>
        <Stack.Screen
          options={{
            title: '好友详情',
            headerBackTitle: '好友',
          }}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#666' }}>未找到该好友档案。</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '好友详情',
          headerBackTitle: '好友',
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.root}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.label}>好友姓名</Text>
              <TextInput
                style={styles.input}
                placeholder="如：小王"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />

            <Text style={styles.sectionTitle}>口味偏好（可多选）</Text>
            <View style={styles.chipGroup}>
              {TASTE_OPTIONS.map((opt) =>
                renderOption(opt, taste.includes(opt), () => toggleTaste(opt)),
              )}
            </View>

            <Text style={styles.sectionTitle}>饮食类型（可多选）</Text>
            <View style={styles.chipGroup}>
              {DIET_OPTIONS.map((opt) =>
                renderOption(opt, diet.includes(opt), () => toggleDiet(opt)),
              )}
            </View>

            <Text style={styles.sectionTitle}>过敏食材（可多选）</Text>
            <View style={styles.chipGroup}>
              {ALLERGY_OPTIONS.map((opt) =>
                renderOption(opt, allergies.includes(opt), () => toggleAllergy(opt)),
              )}
            </View>

            <Text style={styles.sectionTitle}>不喜欢的食材</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="如：香菜、内脏、榴莲..."
              placeholderTextColor="#999"
              value={dislike}
              onChangeText={setDislike}
              multiline
            />

            <Text style={styles.sectionTitle}>其他备注</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="如：不能吃辣、控制胆固醇..."
              placeholderTextColor="#999"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.deleteButton, loading && { opacity: 0.7 }]}
              disabled={loading}
              onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>删除好友</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && { opacity: 0.7 }]}
              disabled={loading}
              onPress={handleSave}>
              <Text style={styles.saveButtonText}>{loading ? '保存中...' : '保存修改'}</Text>
            </TouchableOpacity>
          </View>
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
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
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
  },
  textarea: {
    minHeight: 72,
    marginTop: 4,
    textAlignVertical: 'top',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    borderColor: ORANGE,
    backgroundColor: '#FFE3D3',
  },
  chipText: {
    fontSize: 13,
    color: '#555',
  },
  chipTextSelected: {
    color: ORANGE,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  deleteButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FF3B30',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: ORANGE,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

