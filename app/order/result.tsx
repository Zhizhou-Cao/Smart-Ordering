import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import Markdown from 'react-native-markdown-display';

const ORANGE = '#FF6B35';
const BG = '#F8F8F8';

type Params = {
  peopleCount?: string;
  recommendation?: string;
};

type RecommendSection = {
  title: string;
  emoji: string;
  color: string;
  items: string[];
};

const STRONG_COLOR = '#FFE3D3';
const TRY_COLOR = '#E6F6EA';
const CAUTION_COLOR = '#FFF4CC';
const AVOID_COLOR = '#FFD9D9';

function buildMockRecommendations(seed: number): RecommendSection[] {
  const strongPool = [
    '番茄牛腩锅（可调辣度，适合大多数人口味）',
    '时蔬拼盘（生菜、油麦菜、菌菇类，清爽解腻）',
    '清蒸鲈鱼（少盐少油，老人小孩都合适）',
    '菌菇鸡汤锅（暖胃不油腻）',
  ];
  const tryPool = [
    '香辣口水鸡（单独一份给爱吃辣的人）',
    '黑椒牛柳意面（主食和肉一份到位）',
    '蒜蓉粉丝蒸扇贝（适合海鲜爱好者）',
    '干锅花菜（少油版本）',
  ];
  const cautionPool = [
    '重辣水煮鱼（对不能吃辣的人不太友好）',
    '奶油焗饭（热量偏高）',
    '烟熏培根披萨（口味偏重，容易腻）',
  ];
  const avoidPool = [
    '超辣小龙虾（对痛风和不能吃辣的人非常不友好）',
    '大份红烧五花肉（油脂含量过高）',
    '花生拼盘（如有坚果过敏人群需避免）',
  ];

  const pick = (pool: string[], n: number) => {
    const result: string[] = [];
    for (let i = 0; i < n; i++) {
      const index = (seed + i * 3) % pool.length;
      result.push(pool[index]);
    }
    return result;
  };

  return [
    {
      title: '强烈推荐',
      emoji: '✅',
      color: STRONG_COLOR,
      items: pick(strongPool, 3),
    },
    {
      title: '可以尝试',
      emoji: '👍',
      color: TRY_COLOR,
      items: pick(tryPool, 3),
    },
    {
      title: '谨慎选择',
      emoji: '⚠️',
      color: CAUTION_COLOR,
      items: pick(cautionPool, 3),
    },
    {
      title: '建议回避',
      emoji: '❌',
      color: AVOID_COLOR,
      items: pick(avoidPool, 3),
    },
  ];
}

export default function ResultScreen() {
  const { peopleCount, recommendation } = useLocalSearchParams<Params>();
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000));

  const sections = useMemo(() => buildMockRecommendations(seed), [seed]);

  const countNumber = useMemo(() => {
    const parsed = parseInt(String(peopleCount ?? '1'), 10);
    return Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
  }, [peopleCount]);

  const hasAiResult = typeof recommendation === 'string' && recommendation.trim().length > 0;

  const handleRestart = () => {
    router.back();
  };

  const handleFinish = () => {
    router.replace('/(tabs)');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '推荐结果',
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
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>已为 {countNumber} 人综合偏好，给出如下点餐建议。</Text>

            {hasAiResult ? (
              <View style={styles.markdownCard}>
                <Markdown
                  style={{
                    body: { fontSize: 15, color: '#333', lineHeight: 24 },
                    heading2: { fontSize: 17, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
                    bullet_list: { marginLeft: 8 },
                  }}>
                  {recommendation as string}
                </Markdown>
              </View>
            ) : (
              <>
                {sections.map((section) => (
                  <View
                    key={section.title}
                    style={[styles.card, { backgroundColor: section.color }]}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardEmoji}>{section.emoji}</Text>
                      <Text style={styles.cardTitle}>{section.title}</Text>
                    </View>
                    {section.items.map((item, index) => (
                      <Text key={`${section.title}-${index}-${item}`} style={styles.cardItem}>
                        • {item}
                      </Text>
                    ))}
                  </View>
                ))}

                <View style={styles.tipsCard}>
                  <Text style={styles.tipsTitle}>💡 搭配建议</Text>
                  <Text style={styles.tipsText}>
                    - 建议以「一份主食 + 2 道蔬菜 + 1–2 道肉类 + 1 道汤」为一桌基础配置，既不浪费也不容易吃撑。
                  </Text>
                  <Text style={styles.tipsText}>
                    - 可将重辣、重油菜品放在桌边一侧，避免串味影响到口味清淡的人。
                  </Text>
                  <Text style={styles.tipsText}>
                    - 如有老人或小朋友，优先选择软烂、易咀嚼的菜，如鱼肉、炖汤、蒸蛋等。
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          {!hasAiResult && (
            <TouchableOpacity style={styles.primaryButton} onPress={() => setSeed((s) => s + 1)}>
              <Text style={styles.primaryButtonText}>重新推荐一轮</Text>
            </TouchableOpacity>
          )}

          {hasAiResult && (
            <View style={styles.bottomButtons}>
              <TouchableOpacity onPress={handleRestart} style={styles.restartButton}>
                <Text style={styles.restartButtonText}>🔄 重新推荐</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleFinish} style={styles.finishButton}>
                <Text style={styles.finishButtonText}>✅ 结束推荐</Text>
              </TouchableOpacity>
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
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  markdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  card: {
    borderRadius: 12,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  cardEmoji: {
    fontSize: 18,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
  cardItem: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    color: '#222',
  },
  tipsText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
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
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  restartButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: ORANGE,
    alignItems: 'center',
  },
  restartButtonText: {
    color: ORANGE,
    fontWeight: 'bold',
    fontSize: 16,
  },
  finishButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: ORANGE,
    alignItems: 'center',
  },
  finishButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

