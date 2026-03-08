import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';

/** 规范化图片 URI，确保 iOS 上可正确使用（调试时可在控制台查看） */
function normalizeImageUri(uri: string): string {
  if (Platform.OS !== 'ios') return uri;
  if (!uri) return uri;
  if (uri.startsWith('file://')) return uri;
  if (uri.startsWith('/')) return `file://${uri}`;
  return uri;
}

const ORANGE = '#FF6B35';
const BG = '#F8F8F8';

export default function UploadMenuScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  const requestPermission = async (type: 'camera' | 'library') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const pickFromLibrary = async () => {
    const granted = await requestPermission('library');
    if (!granted) {
      Alert.alert('权限不足', '请在系统设置中允许访问相册。');
      return;
    }
    try {
      setPicking(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        const raw = result.assets[0].uri;
        const uri = normalizeImageUri(raw);
        console.log('[Upload] 从相册选择图片 uri:', uri);
        setImageUri(uri);
      }
    } catch (e) {
      console.warn('pickFromLibrary error', e);
      Alert.alert('出错了', '选择图片时出现问题，请稍后重试。');
    } finally {
      setPicking(false);
    }
  };

  const takePhoto = async () => {
    const granted = await requestPermission('camera');
    if (!granted) {
      Alert.alert('权限不足', '请在系统设置中允许使用相机。');
      return;
    }
    try {
      setPicking(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        const raw = result.assets[0].uri;
        const uri = normalizeImageUri(raw);
        console.log('[Upload] 拍照图片 uri:', uri);
        setImageUri(uri);
      }
    } catch (e) {
      console.warn('takePhoto error', e);
      Alert.alert('出错了', '拍照时出现问题，请稍后重试。');
    } finally {
      setPicking(false);
    }
  };

  const handleNext = () => {
    if (!imageUri) {
      Alert.alert('提示', '请先上传或拍摄一张菜单图片。');
      return;
    }
    console.log('[Upload] 下一步传递的 imageUri:', imageUri);
    router.push({
      pathname: '/order/people',
      params: { imageUri },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '上传菜单',
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
            showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Step 1 · 上传菜单</Text>
            <Text style={styles.subtitle}>
              拍一张菜单，或者从相册中选一张，我们会基于图片内容给出推荐。
            </Text>

            <View style={styles.imageCard}>
              {imageUri ? (
                <>
                  <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                  <Text style={styles.imageHint}>
                    如菜单有多页，可多拍几张，后续版本会支持多图。
                  </Text>
                </>
              ) : (
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderEmoji}>📷</Text>
                  <Text style={styles.placeholderText}>尚未选择图片</Text>
                  <Text style={styles.placeholderSub}>上传清晰的菜单照片，识别效果会更好。</Text>
                </View>
              )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={pickFromLibrary}
                disabled={picking}
                activeOpacity={0.85}>
                <Text style={styles.secondaryButtonText}>
                  {picking ? '处理中...' : '从相册选择'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={takePhoto}
                disabled={picking}
                activeOpacity={0.85}>
                <Text style={styles.secondaryButtonText}>
                  {picking ? '处理中...' : '拍照上传'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.primaryButton, !imageUri && { opacity: 0.5 }]}
            disabled={!imageUri}
            onPress={handleNext}>
            <Text style={styles.primaryButtonText}>下一步</Text>
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#777',
    marginBottom: 16,
  },
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#EEE',
  },
  imageHint: {
    fontSize: 12,
    color: '#777',
    marginTop: 8,
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  placeholderEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  placeholderSub: {
    fontSize: 12,
    color: '#777',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: ORANGE,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  secondaryButtonText: {
    color: ORANGE,
    fontSize: 14,
    fontWeight: '600',
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

