import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useAuth } from '@/hooks/useAuth'
import { router } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const { login, loading, error, clearError } = useAuth()
  const colorScheme = useColorScheme() ?? 'light'
  const theme = Colors[colorScheme]

  const handleLogin = useCallback(async () => {
    setLocalError(null)

    if (!email.trim() || !password.trim()) {
      setLocalError('Email and password are required.')
      return
    }

    if (!isValidEmail(email)) {
      setLocalError('Please enter a valid email address.')
      return
    }

    try {
      clearError()
      await login(email, password)
      // Don't navigate immediately - let the auth state update trigger navigation
    } catch (err) {
      // Error text is handled by the auth context
    }
  }, [email, password, login, clearError])

  const displayError = localError || error

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={'padding'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: 24,
             padding: 20,
            marginTop: 40,
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: '800', color: theme.text, marginBottom: 8, textAlign: 'center' }}>
            Steam Games
          </Text>
          <Text style={{ textAlign: 'center', color: theme.mutedText, marginBottom: 24, lineHeight: 20 }}>
            Log in to sync favorites and get personalized recommendations.
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
            onChangeText={(value) => {
              setEmail(value)
              setLocalError(null)
              if (error) clearError()
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
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

          <View
            key={`login-password-${showPassword ? 'text' : 'secure'}`}
            style={{
              position: 'relative',
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 14,
              marginBottom: 20,
              backgroundColor: theme.background,
            }}
          >
            <TextInput
              placeholder="Password"
              placeholderTextColor={theme.mutedText}
              value={password}
              onChangeText={(value) => {
                setPassword(value)
                setLocalError(null)
                if (error) clearError()
              }}
              secureTextEntry={false}
              autoComplete="current-password"
              textContentType="password"
              autoCorrect={false}
              spellCheck={false}
              autoCapitalize="none"
              importantForAutofill="no"
              editable={!loading}
              style={{
                flex: 1,
                padding: 14,
                fontSize: 16,
                color: showPassword ? theme.text : 'transparent',
              }}
            />
            {!showPassword && (
              <Text
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: 14,
                  right: 76,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: theme.text,
                }}
              >
                {'•'.repeat(password.length)}
              </Text>
            )}
            <Pressable
              onPress={() => setShowPassword((value) => !value)}
              disabled={loading}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            >
              <Text style={{ color: theme.primary, fontWeight: '700' }}>{showPassword ? 'Hide' : 'Show'}</Text>
            </Pressable>
          </View>

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
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
