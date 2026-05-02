import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useAuth } from '@/hooks/useAuth'
import { router } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, clearError } = useAuth()
  const colorScheme = useColorScheme() ?? 'light'
  const theme = Colors[colorScheme]

  const handleLogin = useCallback(async () => {
    try {
      clearError()
      await login(email, password)
      // Don't navigate immediately - let the auth state update trigger navigation
    } catch (err) {
      console.log('Login error:', err)
    }
  }, [email, password, login, clearError])

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingHorizontal: 20, justifyContent: 'center' }}>
      <View
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 24,
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: '800', color: theme.text, marginBottom: 8, textAlign: 'center' }}>
          Steam Games
        </Text>
        <Text style={{ textAlign: 'center', color: theme.mutedText, marginBottom: 24, lineHeight: 20 }}>
          Log in to sync favorites and get personalized recommendations.
        </Text>

        {error && (
          <View style={{ backgroundColor: theme.dangerSoft, padding: 12, borderRadius: 12, marginBottom: 16 }}>
            <Text style={{ color: theme.danger, fontSize: 14 }}>{error}</Text>
          </View>
        )}

        <TextInput
          placeholder="Email"
          placeholderTextColor={theme.mutedText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 14,
            padding: 14,
            fontSize: 16,
            marginBottom: 12,
            color: theme.text,
            backgroundColor: theme.background,
          }}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor={theme.mutedText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 14,
            padding: 14,
            fontSize: 16,
            marginBottom: 20,
            color: theme.text,
            backgroundColor: theme.background,
          }}
        />

        <Pressable
          onPress={handleLogin}
          disabled={loading || !email || !password}
          style={{
            backgroundColor: theme.primary,
            padding: 14,
            borderRadius: 14,
            marginBottom: 16,
            opacity: loading || !email || !password ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={{ color: theme.background, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
              Login
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push('/register')} disabled={loading}>
          <Text style={{ textAlign: 'center', color: theme.primary, fontSize: 14 }}>
            Don't have an account? <Text style={{ fontWeight: '700' }}>Sign up</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
