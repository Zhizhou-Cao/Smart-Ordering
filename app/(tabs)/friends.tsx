import React, { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import { FriendProfile, STORAGE_KEYS } from '@/constants/storage';

const BG = '#F8F8F8';

export default function FriendsScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<FriendProfile[]>([]);

  const loadFriends = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.friends);
      if (stored) {
        const data: FriendProfile[] = JSON.parse(stored);
        setFriends(data);
      } else {
        setFriends([]);
      }
    } catch (e) {
      console.warn('Failed to load friends', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [loadFriends])
  );

  const renderTags = (friend: FriendProfile) => {
    const allergyTags =
      friend.allergies && friend.allergies.length
        ? friend.allergies.filter((a) => a !== '无')
        : [];
    const dietTags =
      friend.diet && friend.diet.length
        ? friend.diet.filter((d) => d !== '无限制')
        : [];

    const tags: string[] = [];
    if (allergyTags.length) {
      tags.push(`${allergyTags.join('、')} 过敏`);
    }
    if (dietTags.length) {
      tags.push(dietTags.join('、'));
    }

    return tags.length ? tags.join(' · ') : '无特别禁忌';
  };

  const renderItem = ({ item }: { item: FriendProfile }) => {
    const initial = item.name?.charAt(0) || '友';

    return (
      <TouchableOpacity
        style={styles.friendCard}
        activeOpacity={0.85}
        onPress={() => router.push(`/friends/${item.id}`)}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendTags}>{renderTags(item)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>好友档案</Text>
          <TouchableOpacity
            onPress={() => router.push('/friends/new')}
            style={styles.addButton}
            activeOpacity={0.8}>
            <Text style={styles.addButtonText}>+ 添加</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>提前维护好好友的饮食偏好，点餐时直接勾选。</Text>

        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={friends.length === 0 ? styles.emptyContainer : { paddingBottom: 24 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>还没有好友档案</Text>
              <Text style={styles.emptyText}>点击右上角「+ 添加」，为家人朋友建立第一份偏好档案。</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
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
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FF6B35',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#777',
  },
  list: {
    marginTop: 18,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE3D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  friendTags: {
    fontSize: 12,
    color: '#666',
  },
});


