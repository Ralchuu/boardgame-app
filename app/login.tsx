import { useAuth } from '@/hooks/useAuth'
import { router } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, clearError } = useAuth()

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
    <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'black', marginBottom: 30, textAlign: 'center' }}>
        Steam Games
      </Text>

      {error && (
        <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ color: '#DC2626', fontSize: 14 }}>{error}</Text>
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
          marginBottom: 20,
          color: 'black',
        }}
      />

      <Pressable
        onPress={handleLogin}
        disabled={loading || !email || !password}
        style={{
          backgroundColor: '#007AFF',
          padding: 14,
          borderRadius: 8,
          marginBottom: 16,
          opacity: loading || !email || !password ? 0.6 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
            Login
          </Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.push('/register')}
        disabled={loading}
      >
        <Text style={{ textAlign: 'center', color: '#007AFF', fontSize: 14 }}>
          Don't have an account? <Text style={{ fontWeight: '600' }}>Sign up</Text>
        </Text>
      </Pressable>
    </View>
  )
}
