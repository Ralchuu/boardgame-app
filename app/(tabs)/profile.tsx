import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useAuth } from '@/hooks/useAuth'
import { router } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ProfileScreen() {
  const { user, logout, loading } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)
  const colorScheme = useColorScheme() ?? 'light'
  const theme = Colors[colorScheme]
  const insets = useSafeAreaInsets()

  const handleLogout = useCallback(async () => {
    try {
      setLoggingOut(true)
      await logout()
      router.replace('/login')
    } catch (error) {
      console.log('Logout error:', error)
    } finally {
      setLoggingOut(false)
    }
  }, [logout])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingHorizontal: 20, paddingTop: insets.top + 12 }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ marginBottom: 30, alignItems: 'center', backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 24, padding: 20 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 40, color: theme.background }}>👤</Text>
          </View>

          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 8 }}>
            {user?.email}
          </Text>

          {user?.metadata?.creationTime && (
            <Text style={{ fontSize: 14, color: theme.mutedText }}>
              Member since {new Date(user.metadata.creationTime).toLocaleDateString()}
            </Text>
          )}
        </View>

        <View style={{ marginBottom: 20, backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 20, padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 12 }}>
            Account Stats
          </Text>
          <View style={{ backgroundColor: theme.surfaceAlt, padding: 16, borderRadius: 14, marginBottom: 8 }}>
            <Text style={{ color: theme.mutedText, marginBottom: 4 }}>User ID</Text>
            <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>{user?.uid}</Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={handleLogout}
        disabled={loggingOut || loading}
        style={{
          backgroundColor: theme.danger,
          padding: 14,
          borderRadius: 14,
          marginBottom: insets.bottom + 20,
          opacity: loggingOut || loading ? 0.6 : 1,
        }}
      >
        {loggingOut ? (
          <ActivityIndicator color={theme.background} />
        ) : (
          <Text style={{ color: theme.background, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
            Logout
          </Text>
        )}
      </Pressable>
    </View>
  )
}
