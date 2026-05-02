import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useFavorites } from '@/hooks/useFavorites'
import { getSteamRecommendations, SteamGameDetails } from '@/services/steamApi'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function RecommendationsScreen() {
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites()
  const [games, setGames] = useState<SteamGameDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const colorScheme = useColorScheme() ?? 'light'
  const theme = Colors[colorScheme]
  const insets = useSafeAreaInsets()

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

  if (loading) return <ActivityIndicator color={theme.primary} />

  return (
    <View style={{ paddingHorizontal: 12, paddingTop: insets.top + 12, backgroundColor: theme.background, flex: 1 }}>
      <View style={{ backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: 20, padding: 14, marginBottom: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 6, color: theme.text }}>Recommendations</Text>
        <Text style={{ color: theme.mutedText, lineHeight: 20 }}>
          Suositukset perustuvat suosikkeihisi ja niiden genreihin, tageihin ja kehittäjiin.
        </Text>
      </View>

      {!favorites.length ? (
        <Text style={{ marginBottom: 12, color: theme.mutedText }}>
          Lisää muutama suosikki, niin suosittelen samankaltaisia pelejä niiden perusteella.
        </Text>
      ) : null}

      <FlatList
        data={games}
        keyExtractor={(item) => item.steam_appid.toString()}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <Text style={{ color: theme.mutedText }}>
            En löytänyt vielä riittävästi samankaltaisia pelejä. Kokeile lisätä lisää suosikkeja.
          </Text>
        }
        renderItem={({ item }) => {
          const fav = isFavorite(item.steam_appid)

          return (
            <Pressable onPress={() => router.push({ pathname: '/game', params: { appid: String(item.steam_appid) } })}>
              <View style={{ marginBottom: 12, padding: 14, borderWidth: 1, borderColor: theme.border, borderRadius: 18, backgroundColor: theme.surface }}>
                {item.header_image ? (
                  <Image source={{ uri: item.header_image }} style={{ height: 100, borderRadius: 12, backgroundColor: theme.surfaceAlt }} />
                ) : null}
                <Text style={{ marginTop: 8, fontWeight: '800', color: theme.text }}>{item.name}</Text>
                {item.release_date?.date ? (
                  <Text style={{ marginTop: 4, color: theme.mutedText }}>{item.release_date.date}</Text>
                ) : null}
                {item.genres?.length ? (
                  <Text style={{ marginTop: 4, color: theme.mutedText }}>
                    {item.genres.map((genre) => genre.description).join(' • ')}
                  </Text>
                ) : null}
                {item.short_description ? (
                  <Text style={{ marginTop: 6, color: theme.mutedText }}>{item.short_description}</Text>
                ) : null}

                <Pressable
                  onPress={(e: any) => {
                    e?.stopPropagation?.()
                    fav ? removeFavorite(item.steam_appid) : addFavorite(item.steam_appid)
                  }}
                  style={{
                    marginTop: 10,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: fav ? theme.dangerSoft : theme.primarySoft,
                  }}
                >
                  <Text style={{ textAlign: 'center', fontWeight: '700', color: fav ? theme.danger : theme.primaryText }}>
                    {fav ? 'Remove from favorites' : 'Add to favorites'}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          )
        }}
      />
    </View>
  )
}