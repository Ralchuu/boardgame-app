import { useFavorites } from '@/hooks/useFavorites'
import { getSteamRecommendations, SteamGameDetails } from '@/services/steamApi'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, RefreshControl, Text, View } from 'react-native'

export default function RecommendationsScreen() {
  const { favorites } = useFavorites()
  const [games, setGames] = useState<SteamGameDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadRecommendations = useCallback(async () => {
    const data = favorites.length ? await getSteamRecommendations(favorites) : []
    setGames(data)
  }, [favorites])

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)

      try {
        const data = favorites.length ? await getSteamRecommendations(favorites) : []
        if (active) {
          setGames(data)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [loadRecommendations])

  const handleRefresh = async () => {
    setRefreshing(true)

    try {
      await loadRecommendations()
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) return <ActivityIndicator />

  return (
    <View style={{ padding: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 10 }}>Recommendations</Text>

      {!favorites.length ? (
        <Text style={{ marginBottom: 12, color: '#666' }}>
          Lisää muutama suosikki, niin suosittelen samankaltaisia pelejä niiden perusteella.
        </Text>
      ) : null}

      <FlatList
        data={games}
        keyExtractor={(item) => item.steam_appid.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <Text style={{ color: '#666' }}>
            En löytänyt vielä riittävästi samankaltaisia pelejä. Kokeile lisätä lisää suosikkeja.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14 }}>
            {item.header_image ? (
              <Image source={{ uri: item.header_image }} style={{ height: 100, borderRadius: 10 }} />
            ) : null}
            <Text style={{ marginTop: 8, fontWeight: '700' }}>{item.name}</Text>
            {item.release_date?.date ? (
              <Text style={{ marginTop: 4, color: '#666' }}>{item.release_date.date}</Text>
            ) : null}
            {item.genres?.length ? (
              <Text style={{ marginTop: 4, color: '#666' }}>
                {item.genres.map((genre) => genre.description).join(' • ')}
              </Text>
            ) : null}
            {item.short_description ? (
              <Text style={{ marginTop: 6, color: '#444' }}>{item.short_description}</Text>
            ) : null}
          </View>
        )}
      />
    </View>
  )
}