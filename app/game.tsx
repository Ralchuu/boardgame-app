import { IconSymbol } from '@/components/ui/icon-symbol'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useFavorites } from '@/hooks/useFavorites'
import { getSteamGameDetails, SteamGameDetails } from '@/services/steamApi'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function GameDetailPage() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const appidParam = Array.isArray(params.appid) ? params.appid[0] : params.appid
  const appid = appidParam ? parseInt(String(appidParam), 10) : NaN

  const [game, setGame] = useState<SteamGameDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const colorScheme = useColorScheme() ?? 'light'
  const theme = Colors[colorScheme]
  const insets = useSafeAreaInsets()

  useEffect(() => {
    let active = true

    async function load() {
      if (!appid || Number.isNaN(appid)) {
        setError('Invalid game id')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await getSteamGameDetails(appid)
        if (!active) return
        if (!data) {
          setError('Game details not found')
          setGame(null)
        } else {
          setGame(data)
          setError(null)
        }
      } catch (err) {
        console.log('Failed to load game details', err)
        if (active) setError('Failed to load game details')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [appid])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} />
        <Text style={{ marginTop: 8, color: theme.mutedText }}>Loading game...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.danger, marginBottom: 12 }}>{error}</Text>
        <Pressable
          onPress={() => router.back()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: 999,
          }}
        >
          <IconSymbol name="chevron.right" size={18} color={theme.primary} style={{ transform: [{ rotate: '180deg' }] }} />
          <Text style={{ color: theme.primary, fontWeight: '700' }}>Back</Text>
        </Pressable>
      </View>
    )
  }

  if (!game) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.mutedText }}>No details available</Text>
      </View>
    )
  }

  const fav = isFavorite(game.steam_appid)

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
    >
      <Pressable
        onPress={() => router.back()}
        style={{
          alignSelf: 'flex-start',
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 999,
        }}
      >
        <IconSymbol name="chevron.right" size={18} color={theme.primary} style={{ transform: [{ rotate: '180deg' }] }} />
        <Text style={{ color: theme.primary, fontWeight: '700' }}>Back</Text>
      </Pressable>

      {game.header_image && (
        <Image
          source={{ uri: game.header_image }}
          style={{ height: 220, width: '100%', borderRadius: 12, backgroundColor: theme.surfaceAlt }}
          resizeMode="cover"
        />
      )}

      <Text style={{ color: theme.text, fontSize: 22, fontWeight: '800', marginTop: 12 }}>{game.name}</Text>

      {game.release_date?.date ? <Text style={{ color: theme.mutedText, marginTop: 6 }}>{game.release_date.date}</Text> : null}

      {game.price_overview?.final_formatted ? (
        <Text style={{ color: theme.mutedText, marginTop: 6 }}>{game.price_overview.final_formatted}</Text>
      ) : null}

      {game.developers?.length ? (
        <Text style={{ color: theme.mutedText, marginTop: 8 }}>Developer: {game.developers.join(', ')}</Text>
      ) : null}

      {game.publishers?.length ? (
        <Text style={{ color: theme.mutedText, marginTop: 4 }}>Publisher: {game.publishers.join(', ')}</Text>
      ) : null}

      {game.genres?.length ? (
        <Text style={{ color: theme.mutedText, marginTop: 8 }}>Genres: {game.genres.map((g) => g.description).join(', ')}</Text>
      ) : null}

      {game.metacritic?.score ? (
        <Text style={{ color: theme.mutedText, marginTop: 8 }}>Metacritic: {game.metacritic.score}</Text>
      ) : null}

      {game.short_description ? (
        <Text style={{ color: theme.text, marginTop: 12, lineHeight: 20 }}>{game.short_description}</Text>
      ) : null}

      <Pressable
        onPress={() => (fav ? removeFavorite(game.steam_appid) : addFavorite(game.steam_appid))}
        style={{ marginTop: 16, padding: 12, borderRadius: 12, backgroundColor: fav ? theme.dangerSoft : theme.primary }}
      >
        <Text style={{ textAlign: 'center', color: fav ? theme.danger : theme.background, fontWeight: '700' }}>
          {fav ? 'Remove from favorites' : 'Add to favorites'}
        </Text>
      </Pressable>
    </ScrollView>
  )
}
