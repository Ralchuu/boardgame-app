import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useFavorites } from '@/hooks/useFavorites'
import { getSteamGameDetails, SteamGameDetails } from '@/services/steamApi'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function FavoritesScreen() {
  const { favorites, removeFavorite, loading, syncing, error } = useFavorites()
  const [games, setGames] = useState<SteamGameDetails[]>([])
  const [gamesLoading, setGamesLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const colorScheme = useColorScheme() ?? 'light'
  const theme = Colors[colorScheme]
  const insets = useSafeAreaInsets()

  useEffect(() => {
    let active = true

    async function load() {
      setGamesLoading(true)
      try {
        const data = await Promise.all(favorites.map(getSteamGameDetails))
        if (active) {
          setGames(data.filter(Boolean) as SteamGameDetails[])
        }
      } finally {
        if (active) {
          setGamesLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [favorites])

  const handleRefresh = async () => {
    setRefreshing(true)

    try {
      const data = await Promise.all(favorites.map(getSteamGameDetails))
      setGames(data.filter(Boolean) as SteamGameDetails[])
    } finally {
      setRefreshing(false)
    }
  }

  const isBusy = loading || gamesLoading

  if (isBusy && games.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} />
        <Text style={{ marginTop: 10, color: theme.mutedText }}>Loading favorites...</Text>
      </View>
    )
  }

  if (!isBusy && favorites.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background, paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>No favorites yet</Text>
        <Text style={{ marginTop: 8, color: theme.mutedText, textAlign: 'center', lineHeight: 20 }}>
          Search for a game and add it to favorites from the search or game detail page.
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ paddingHorizontal: 12, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }}
      data={games}
      keyExtractor={(item) => item.steam_appid.toString()}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      ListHeaderComponent={
        error ? (
          <View style={{ marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: theme.dangerSoft, borderWidth: 1, borderColor: theme.danger }}>
            <Text style={{ color: theme.danger, fontWeight: '700' }}>{error}</Text>
          </View>
        ) : syncing ? (
          <View style={{ marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: theme.surfaceAlt, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.mutedText, fontWeight: '600' }}>Syncing favorites...</Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push({ pathname: '/game', params: { appid: String(item.steam_appid) } })} style={{ marginBottom: 12 }}>
          <View style={{ padding: 14, borderWidth: 1, borderColor: theme.border, borderRadius: 18, backgroundColor: theme.surface }}>
            {item.header_image && (
              <Image source={{ uri: item.header_image }} style={{ height: 100, borderRadius: 12, backgroundColor: theme.surfaceAlt }} />
            )}
            <Text style={{ marginTop: 8, fontSize: 16, fontWeight: '800', color: theme.text }}>{item.name}</Text>
            {item.release_date?.date ? <Text style={{ color: theme.mutedText, marginTop: 4 }}>{item.release_date.date}</Text> : null}

            <Pressable
              onPress={(e: any) => {
                e?.stopPropagation?.()
                removeFavorite(item.steam_appid)
              }}
              disabled={syncing}
              style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 10,
                backgroundColor: syncing ? theme.surfaceAlt : theme.dangerSoft,
                opacity: syncing ? 0.75 : 1,
              }}
            >
              <Text style={{ textAlign: 'center', color: theme.danger, fontWeight: '700' }}>{syncing ? 'Removing...' : 'Remove'}</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    />
  )
}