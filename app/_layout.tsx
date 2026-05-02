import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import 'react-native-reanimated'

import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useAuth } from '@/hooks/useAuth'
import { AuthProvider } from '@/services/authContext'

export const unstable_settings = {
  anchor: '(tabs)',
}

function RootLayoutNav() {
  const colorScheme = useColorScheme()
  const { user, loading } = useAuth()
  const appTheme = Colors[colorScheme ?? 'light']
  const baseNavigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme
  const navigationTheme = {
    ...baseNavigationTheme,
    colors: {
      ...baseNavigationTheme.colors,
      background: appTheme.background,
      card: appTheme.background,
    },
  }

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(appTheme.background).catch(() => {
      // Ignore; some environments may not support this call.
    })
  }, [appTheme.background])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: appTheme.background }}>
        <ActivityIndicator size="large" color={appTheme.primary} />
      </View>
    )
  }

  if (user) {
    return (
      <ThemeProvider value={navigationTheme}>
        <Stack screenOptions={{ contentStyle: { backgroundColor: appTheme.background } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="game" options={{ headerShown: false, presentation: 'card', animation: 'slide_from_right' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} backgroundColor={appTheme.background} translucent={false} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ presentation: 'card', title: 'Create Account' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} backgroundColor={appTheme.background} translucent={false} />
    </ThemeProvider>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  )
}
