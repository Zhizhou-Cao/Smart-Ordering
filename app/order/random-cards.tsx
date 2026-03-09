import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { menuDatabase, Dish } from '@/constants/menuDatabase';
import { STORAGE_KEYS } from '@/constants/storage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 420);
const CARD_HEIGHT = CARD_WIDTH * 1.1;

export default function RandomCardsScreen() {
  const { allAllergens: allAllergensParam, isVegetarian: isVegetarianParam } =
    useLocalSearchParams<{ allAllergens?: string; isVegetarian?: string }>();

  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedDishes, setSavedDishes] = useState<Dish[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const swipeLeftRef = useRef<() => void>(() => {});
  const swipeRightRef = useRef<() => void>(() => {});
  const resetPositionRef = useRef<() => void>(() => {});

  useEffect(() => {
    loadPreferencesAndFilter();
    loadSavedDishes();
  }, []);

  const loadPreferencesAndFilter = async () => {
    try {
      const prefStr = await AsyncStorage.getItem(STORAGE_KEYS.userPreferences);
      const pref = prefStr ? JSON.parse(prefStr) : {};
      const allAllergens: string[] = [];
      try {
        const fromParams = allAllergensParam ? JSON.parse(allAllergensParam) : [];
        if (Array.isArray(fromParams)) allAllergens.push(...fromParams);
      } catch (_) {}
      const myAllergies = pref.allergies || [];
      if (Array.isArray(myAllergies)) {
        myAllergies.forEach((a: string) => {
          if (a && a !== '无' && !allAllergens.includes(a)) allAllergens.push(a);
        });
      }
      const isVegetarian = isVegetarianParam === 'true';

      let filtered = menuDatabase.filter((dish) => {
        const hasAllergen = dish.allergens.some(
          (a) => allAllergens.includes(a)
        );
        if (hasAllergen) return false;
        if (isVegetarian && !dish.tags.includes('素食')) return false;
        return true;
      });

      filtered = filtered.sort(() => Math.random() - 0.5);
      setFilteredDishes(filtered);
    } catch (e) {
      setFilteredDishes(menuDatabase.sort(() => Math.random() - 0.5));
    }
  };

  const loadSavedDishes = async () => {
    const saved = await AsyncStorage.getItem('savedDishes');
    if (saved) setSavedDishes(JSON.parse(saved));
  };

  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH * 1.5, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex((prev) =>
        filteredDishes.length ? (prev + 1) % filteredDishes.length : 0
      );
    });
  };

  const swipeRight = () => {
    const currentDish = filteredDishes[currentIndex];
    if (!currentDish) return;
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH * 1.5, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(async () => {
      position.setValue({ x: 0, y: 0 });
      const newSaved = [...savedDishes];
      if (!newSaved.find((d) => d.id === currentDish.id)) {
        newSaved.push(currentDish);
        setSavedDishes(newSaved);
        await AsyncStorage.setItem('savedDishes', JSON.stringify(newSaved));
        Alert.alert('已收藏！', `${currentDish.emoji} ${currentDish.name} 已加入收藏`);
      }
      setCurrentIndex((prev) =>
        filteredDishes.length ? (prev + 1) % filteredDishes.length : 0
      );
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  swipeLeftRef.current = swipeLeft;
  swipeRightRef.current = swipeRight;
  resetPositionRef.current = resetPosition;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeRightRef.current();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeLeftRef.current();
        } else {
          resetPositionRef.current();
        }
      },
    })
  ).current;

  const cardRotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const leftOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const rightOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  if (filteredDishes.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: '今天吃什么',
            headerBackVisible: false,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
                <Text style={{ fontSize: 16, color: '#FF6B35' }}>‹ 返回</Text>
              </TouchableOpacity>
            ),
          }}
        />
        <Text style={styles.emptyState}>没有符合条件的菜品</Text>
      </View>
    );
  }

  const currentDish = filteredDishes[currentIndex];
  const nextDish = filteredDishes[(currentIndex + 1) % filteredDishes.length];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '今天吃什么',
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <Text style={{ fontSize: 16, color: '#FF6B35' }}>‹ 返回</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.hintRow}>
        <Text style={styles.hint}>← 左滑换一个</Text>
        <Text style={styles.hint}>右滑收藏 →</Text>
      </View>

      <View style={styles.cardArea}>
        <View style={[styles.card, styles.nextCard]}>
          <Text style={styles.dishEmoji}>{nextDish.emoji}</Text>
          <Text style={styles.dishName}>{nextDish.name}</Text>
        </View>

        <Animated.View
          style={[
            styles.card,
            styles.currentCard,
            {
              transform: [
                { translateX: position.x },
                { rotate: cardRotation },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Animated.View style={[styles.swipeLabel, styles.nopeLabel, { opacity: leftOpacity }]}>
            <Text style={styles.nopeLabelText}>跳过</Text>
          </Animated.View>
          <Animated.View style={[styles.swipeLabel, styles.likeLabel, { opacity: rightOpacity }]}>
            <Text style={styles.likeLabelText}>收藏 ❤️</Text>
          </Animated.View>

          <Text style={styles.dishEmoji}>{currentDish.emoji}</Text>
          <Text style={styles.dishName}>{currentDish.name}</Text>
          <Text style={styles.dishCuisine}>{currentDish.cuisine}</Text>
          <Text style={styles.dishDesc}>{currentDish.description}</Text>
          <View style={styles.tagRow}>
            {currentDish.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.skipBtn} onPress={swipeLeft}>
          <Text style={styles.skipBtnText}>跳过 →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={swipeRight}>
          <Text style={styles.saveBtnText}>❤️ 收藏</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.savedListBtn} onPress={() => setShowSaved(true)}>
        <Text style={styles.savedListBtnText}>📋 查看收藏 ({savedDishes.length})</Text>
      </TouchableOpacity>

      {showSaved && (
        <View style={styles.savedModal}>
          <View style={styles.savedModalContent}>
            <View style={styles.savedModalHeader}>
              <Text style={styles.savedModalTitle}>❤️ 我的收藏</Text>
              <TouchableOpacity onPress={() => setShowSaved(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {savedDishes.length === 0 ? (
                <Text style={styles.emptyText}>还没有收藏，右滑添加！</Text>
              ) : (
                savedDishes.map((dish) => (
                  <View key={dish.id} style={styles.savedItem}>
                    <Text style={styles.savedItemEmoji}>{dish.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.savedItemName}>{dish.name}</Text>
                      <Text style={styles.savedItemDesc}>{dish.description}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={async () => {
                        const newSaved = savedDishes.filter((d) => d.id !== dish.id);
                        setSavedDishes(newSaved);
                        await AsyncStorage.setItem('savedDishes', JSON.stringify(newSaved));
                      }}
                    >
                      <Text style={{ color: '#999', fontSize: 18 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8', alignItems: 'center' },
  emptyState: { marginTop: 48, fontSize: 16, color: '#666' },
  hintRow: { flexDirection: 'row', justifyContent: 'space-between', width: '85%', marginTop: 16, marginBottom: 8 },
  hint: { color: '#999', fontSize: 13 },
  cardArea: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginTop: 8,
    position: 'relative',
    alignItems: 'center',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  currentCard: { zIndex: 2 },
  nextCard: { zIndex: 1, transform: [{ scale: 0.95 }], top: 10 },
  dishEmoji: { fontSize: 72, marginBottom: 16 },
  dishName: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  dishCuisine: {
    fontSize: 14,
    color: '#FF6B35',
    marginBottom: 12,
    backgroundColor: '#FFF0EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dishDesc: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' },
  tag: { backgroundColor: '#F0F0F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 12, color: '#666' },
  swipeLabel: { position: 'absolute', top: 24, padding: 8, borderRadius: 8, borderWidth: 3 },
  likeLabel: { right: 24, borderColor: '#FF6B35' },
  likeLabelText: { color: '#FF6B35', fontWeight: 'bold', fontSize: 18 },
  nopeLabel: { left: 24, borderColor: '#999' },
  nopeLabelText: { color: '#999', fontWeight: 'bold', fontSize: 18 },
  buttonRow: { flexDirection: 'row', gap: 16, marginTop: 20 },
  skipBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 30, borderWidth: 2, borderColor: '#ddd' },
  skipBtnText: { color: '#666', fontSize: 16, fontWeight: '600' },
  saveBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 30, backgroundColor: '#FF6B35' },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  savedListBtn: { marginTop: 16, padding: 12 },
  savedListBtnText: { color: '#FF6B35', fontSize: 15 },
  savedModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 10,
    elevation: 10,
  },
  savedModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  savedModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  savedModalTitle: { fontSize: 18, fontWeight: 'bold' },
  closeBtn: { fontSize: 20, color: '#999' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 32 },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  savedItemEmoji: { fontSize: 32 },
  savedItemName: { fontSize: 16, fontWeight: '600', color: '#333' },
  savedItemDesc: { fontSize: 13, color: '#999', marginTop: 2 },
});
