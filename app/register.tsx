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
    <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'black', marginBottom: 30, textAlign: 'center' }}>
        Create Account
      </Text>

      {displayError && (
        <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ color: '#DC2626', fontSize: 14 }}>{displayError}</Text>
        </View>
      )}

      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
        style={{
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          marginBottom: 12,
          color: 'black',
        }}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
        style={{
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          marginBottom: 12,
          color: 'black',
        }}
      />

      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor="#999"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!loading}
        style={{
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          marginBottom: 20,
          color: 'black',
        }}
      />

      <Pressable
        onPress={handleSignup}
        disabled={loading || !email || !password || !confirmPassword}
        style={{
          backgroundColor: '#007AFF',
          padding: 14,
          borderRadius: 8,
          marginBottom: 16,
          opacity: loading || !email || !password || !confirmPassword ? 0.6 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
            Sign Up
          </Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={{ textAlign: 'center', color: '#007AFF', fontSize: 14 }}>
          Already have an account? <Text style={{ fontWeight: '600' }}>Log in</Text>
        </Text>
      </Pressable>
    </View>
  )
}
