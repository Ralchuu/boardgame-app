import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useAuth } from '@/hooks/useAuth'
import { router } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native'

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const { signup, loading, error, clearError } = useAuth()
  const colorScheme = useColorScheme() ?? 'light'
  const theme = Colors[colorScheme]

  const handleSignup = useCallback(async () => {
    setLocalError(null)

    if (!email || !password || !confirmPassword) {
      setLocalError('All fields are required')
      return
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    try {
      clearError()
      await signup(email, password)
      // Don't navigate immediately - let the auth state update trigger navigation
    } catch (err) {
      console.log('Signup error:', err)
    }
  }, [email, password, confirmPassword, signup, clearError])

  const displayError = localError || error

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
          Create Account
        </Text>
        <Text style={{ textAlign: 'center', color: theme.mutedText, marginBottom: 24, lineHeight: 20 }}>
          Create an account to save favorites and use recommendations.
        </Text>

        {displayError && (
          <View style={{ backgroundColor: theme.dangerSoft, padding: 12, borderRadius: 12, marginBottom: 16 }}>
            <Text style={{ color: theme.danger, fontSize: 14 }}>{displayError}</Text>
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
            marginBottom: 12,
            color: theme.text,
            backgroundColor: theme.background,
          }}
        />

        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor={theme.mutedText}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
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
          onPress={handleSignup}
          disabled={loading || !email || !password || !confirmPassword}
          style={{
            backgroundColor: theme.primary,
            padding: 14,
            borderRadius: 14,
            marginBottom: 16,
            opacity: loading || !email || !password || !confirmPassword ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={{ color: theme.background, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
              Sign Up
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.back()} disabled={loading}>
          <Text style={{ textAlign: 'center', color: theme.primary, fontSize: 14 }}>
            Already have an account? <Text style={{ fontWeight: '700' }}>Log in</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
