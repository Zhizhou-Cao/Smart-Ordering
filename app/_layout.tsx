import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerBackTitle: '返回',
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen
          name="order/upload"
          options={{
            title: '上传菜单',
          }}
        />
        <Stack.Screen
          name="order/people"
          options={{
            title: '确认用餐人数',
          }}
        />
        <Stack.Screen
          name="order/result"
          options={{
            title: '推荐结果',
          }}
        />
        <Stack.Screen
          name="order/random"
          options={{
            title: '不知道吃什么',
          }}
        />
        <Stack.Screen
          name="order/random-cards"
          options={{
            title: '今天吃什么',
          }}
        />
        <Stack.Screen
          name="friends/new"
          options={{
            title: '新建好友',
          }}
        />
        <Stack.Screen
          name="friends/[id]"
          options={{
            title: '好友详情',
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
