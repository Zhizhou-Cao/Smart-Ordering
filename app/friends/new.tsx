import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';

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

export default function NewFriendScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [taste, setTaste] = useState<TasteOption[]>(['不限']);
  const [diet, setDiet] = useState<DietOption[]>(['无限制']);
  const [allergies, setAllergies] = useState<AllergyOption[]>(['无']);
  const [dislike, setDislike] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (!name.trim()) {
      Alert.alert('提示', '请先填写好友姓名。');
      return;
    }
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.friends);
      const list: FriendProfile[] = stored ? JSON.parse(stored) : [];
      const newFriend: FriendProfile = {
        id: Date.now().toString(),
        name: name.trim(),
        taste: taste.length ? taste : ['不限'],
        diet: diet.length ? diet : ['无限制'],
        allergies: allergies.length ? allergies : ['无'],
        dislike,
        notes,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.friends, JSON.stringify([...list, newFriend]));
      Alert.alert('已保存', '好友档案已保存。');
      router.back();
    } catch (e) {
      console.warn('Failed to save friend', e);
      Alert.alert('保存失败', '请稍后重试。');
    } finally {
      setLoading(false);
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

  return (
    <>
      <Stack.Screen
        options={{
          title: '新建好友',
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

          <TouchableOpacity
            style={[styles.saveButton, loading && { opacity: 0.7 }]}
            disabled={loading}
            onPress={handleSave}>
            <Text style={styles.saveButtonText}>{loading ? '保存中...' : '保存好友档案'}</Text>
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
  saveButton: {
    borderRadius: 999,
    backgroundColor: ORANGE,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

