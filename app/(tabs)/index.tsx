import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

const ORANGE = '#FF6B35';
const BG = '#F8F8F8';

export default function OrderHomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <Text style={styles.title}>今天怎么吃？</Text>
        <Text style={styles.subtitle}>基于你的偏好，帮你快速做点餐决定。</Text>

        <TouchableOpacity
          style={styles.cardPrimary}
          activeOpacity={0.9}
          onPress={() => router.push('/order/upload')}>
          <View style={styles.cardContent}>
            <Text style={styles.cardEmoji}>🍽️</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>我要去餐厅吃</Text>
              <Text style={styles.cardDesc}>上传菜单图片，结合同桌偏好智能推荐菜品。</Text>
            </View>
          </View>
          <Text style={styles.cardFoot}>开始点餐流程 →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardSecondary}
          activeOpacity={0.9}
          onPress={() => router.push('/order/random')}>
          <View style={styles.cardContent}>
            <Text style={styles.cardEmoji}>🎲</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>不知道吃什么</Text>
              <Text style={styles.cardDesc}>基于你的长期偏好，给出轻量级的灵感推荐。</Text>
            </View>
          </View>
          <Text style={styles.cardFoot}>帮我随便推荐一个 →</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#777',
    marginBottom: 20,
  },
  cardPrimary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.25)',
  },
  cardSecondary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  cardEmoji: {
    fontSize: 30,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#666',
  },
  cardFoot: {
    fontSize: 13,
    color: ORANGE,
    fontWeight: '600',
  },
});

