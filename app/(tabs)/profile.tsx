import { useAuth } from '@/hooks/useAuth'
import { router } from 'expo-router'
import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

export default function ProfileScreen() {
  const { user, logout, loading } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20 }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ marginBottom: 30, alignItems: 'center' }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#007AFF',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 40, color: 'white' }}>👤</Text>
          </View>

          <Text style={{ fontSize: 18, fontWeight: '600', color: 'black', marginBottom: 8 }}>
            {user?.email}
          </Text>

          {user?.metadata?.creationTime && (
            <Text style={{ fontSize: 14, color: '#666' }}>
              Member since {new Date(user.metadata.creationTime).toLocaleDateString()}
            </Text>
          )}
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: 'black', marginBottom: 12 }}>
            Account Stats
          </Text>
          <View style={{ backgroundColor: '#F3F4F6', padding: 16, borderRadius: 8, marginBottom: 8 }}>
            <Text style={{ color: '#666', marginBottom: 4 }}>User ID</Text>
            <Text style={{ color: 'black', fontSize: 14, fontWeight: '500' }}>{user?.uid}</Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={handleLogout}
        disabled={loggingOut || loading}
        style={{
          backgroundColor: '#EF4444',
          padding: 14,
          borderRadius: 8,
          marginBottom: 20,
          opacity: loggingOut || loading ? 0.6 : 1,
        }}
      >
        {loggingOut ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
            Logout
          </Text>
        )}
      </Pressable>
    </View>
  )
}
