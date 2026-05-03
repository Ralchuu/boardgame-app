import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useFavorites } from '@/hooks/useFavorites'
import { getSteamGameDetails, searchSteamGames, SteamGameDetails } from '@/services/steamApi'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const genrePool = [
  'action',
  'adventure',
  'casual',
  'indie',
  'rpg',
  'simulation',
  'strategy',
]

const broadSearchPool = [
  'popular',
  'top rated',
  'new',
  'free',
  'multiplayer',
  'singleplayer',
  'open world',
  'story',
  'co-op',
  'adventure',
  'action',
  'indie',
  'strategy',
  'simulation',
  'fantasy',
  'sci-fi',
  'survival',
  'horror',
  'puzzle',
  'platformer',
]

const genreAppIds: Record<string, number[]> = {
  action: [
    730,
    570,
    271590,
    1245620,
    1174180,
    292030,
    1091500,
    367520,
    620,
    252490,
    381210,
    892970,
  ],
  adventure: [
    292030,
    1174180,
    367520,
    413150,
    105600,
    268910,
    391540,
    1086940,
    1091500,
    1245620,
    620,
    70,
  ],
  casual: [
    413150,
    105600,
    431960,
    268910,
    391540,
    322330,
    4000,
    620,
    632360,
    1145360,
  ],
  indie: [
    367520,
    413150,
    105600,
    268910,
    391540,
    322330,
    1145360,
    632360,
    504230,
    250900,
    588650,
    646570,
  ],
  rpg: [
    292030,
    1091500,
    1245620,
    1086940,
    489830,
    377160,
    1151340,
    413150,
    367500,
    236850,
    12210,
    391540,
  ],
  simulation: [
    413150,
    227300,
    255710,
    431960,
    440900,
    892970,
    582010,
    281990,
    236850,
    394360,
    427520,
    294100,
  ],
  strategy: [
    570,
    289070,
    281990,
    394360,
    236850,
    427520,
    294100,
    646570,
    322330,
    221100,
    440900,
    105600,
  ],
}

function isSteamGameDetails(game: SteamGameDetails | null): game is SteamGameDetails {
  return game !== null
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function matchesGenre(game: SteamGameDetails, selectedGenre: string | null) {
  if (!selectedGenre) {
    return true
  }

  const target = normalizeText(selectedGenre)

  return game.genres?.some((genre) => {
    const description = normalizeText(genre.description)
    return description === target
  }) ?? false
}

function generateDiverseQueries(count: number = 8): string[] {
  const queries: string[] = []

  for (let i = 0; i < count; i++) {
    const query = broadSearchPool[Math.floor(Math.random() * broadSearchPool.length)]
    queries.push(query)
  }

  return Array.from(new Set(queries)).sort(() => Math.random() - 0.5)
}

function shuffleNumbers(values: number[]) {
  return [...values].sort(() => Math.random() - 0.5)
}

export default function GamesScreen() {
  const [games, setGames] = useState<SteamGameDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const router = useRouter()
  const colorScheme = useColorScheme() ?? 'light'
  const theme = Colors[colorScheme]
  const insets = useSafeAreaInsets()

  const loadGames = useCallback(
    async (genre: string | null = selectedGenre) => {
      if (genre) {
        // Use a broad sample of games and filter by the actual Steam genre metadata.
        // This keeps the result pool independent from title text.
        const queries = generateDiverseQueries(12)
        const searchResults = await Promise.all(queries.map(searchSteamGames))

        const candidateIds = Array.from(
          new Set(
            searchResults
              .flat()
              .filter((item) => item.appid)
              .map((item) => item.appid),
          ),
        ).slice(0, 120)

        const detailedResults = await Promise.all(candidateIds.map(getSteamGameDetails))

        return detailedResults
          .filter(isSteamGameDetails)
          .filter((game) => matchesGenre(game, genre))
      }

      const queries = generateDiverseQueries(8)
      const searchResults = await Promise.all(queries.map(searchSteamGames))

      const candidateIds = Array.from(
        new Set(
          searchResults
            .flat()
            .filter((item) => item.appid)
            .map((item) => item.appid),
        ),
      ).slice(0, 80)

      const detailedResults = await Promise.all(candidateIds.map(getSteamGameDetails))

      return detailedResults
        .filter(isSteamGameDetails)
    },
    [selectedGenre],
  )

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        const data = await loadGames()

        if (active) {
          setGames(data)
        }
      } catch (error) {
        console.log('Failed to load games:', error)
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
  }, [loadGames])

  const handleRefresh = async () => {
    setRefreshing(true)

    try {
      const data = await loadGames()
      setGames(data)
    } catch (error) {
      console.log('Failed to refresh games:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleGenreSelect = async (genre: string | null) => {
    setSelectedGenre(genre)
    setLoading(true)

    try {
      const data = await loadGames(genre)
      setGames(data)
    } catch (error) {
      console.log('Failed to load games:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && games.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} />
        <Text style={{ marginTop: 10, color: theme.mutedText }}>Loading Steam games...</Text>
      </View>
    )
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingHorizontal: 12, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }}
      data={games}
      keyExtractor={(item) => item.steam_appid.toString()}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      ListHeaderComponent={
        <View style={{ marginBottom: 16, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 20, padding: 14 }}>
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700', marginBottom: 10 }}>Select Genre</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <Pressable
              onPress={() => handleGenreSelect(null)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginRight: 8,
                borderRadius: 20,
                backgroundColor: selectedGenre === null ? theme.primary : theme.surfaceAlt,
              }}
            >
              <Text style={{ color: selectedGenre === null ? theme.background : theme.text, fontWeight: '700' }}>
                All
              </Text>
            </Pressable>

            {genrePool.map((genre) => (
              <Pressable
                key={genre}
                onPress={() => handleGenreSelect(genre)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginRight: 8,
                  borderRadius: 20,
                  backgroundColor: selectedGenre === genre ? theme.primary : theme.surfaceAlt,
                }}
              >
                <Text style={{ color: selectedGenre === genre ? theme.background : theme.text, fontWeight: '700' }}>
                  {genre.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      }
      ListEmptyComponent={
        <Text style={{ color: theme.mutedText }}>No games found for this genre. Pull down to refresh.</Text>
      }
      renderItem={({ item }) => {
        const fav = isFavorite(item.steam_appid)

        return (
          <Pressable
            onPress={() => router.push({ pathname: '/game', params: { appid: String(item.steam_appid) } })}
            style={{ marginBottom: 16 }}
          >
            <View style={{ padding: 14, borderWidth: 1, borderColor: theme.border, borderRadius: 18, backgroundColor: theme.surface }}>
              {item.header_image && (
                <Image
                  source={{ uri: item.header_image }}
                  style={{ height: 100, width: '100%', borderRadius: 12, backgroundColor: theme.surfaceAlt }}
                  resizeMode="cover"
                />
              )}

              <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800', marginTop: 8 }}>
                {item.name}
              </Text>

              {item.genres?.length ? (
                <Text style={{ color: theme.mutedText, marginTop: 4 }}>
                  {item.genres.map((genre) => genre.description).join(', ')}
                </Text>
              ) : null}

              {item.release_date?.date ? (
                <Text style={{ color: theme.mutedText, marginTop: 4 }}>{item.release_date.date}</Text>
              ) : null}

              {item.price_overview?.final_formatted ? (
                <Text style={{ color: theme.mutedText, marginTop: 4 }}>{item.price_overview.final_formatted}</Text>
              ) : null}

              {item.short_description ? (
                <Text style={{ color: theme.mutedText, marginTop: 8, lineHeight: 20 }}>{item.short_description}</Text>
              ) : null}

              <Pressable
                onPress={(e: any) => {
                  e?.stopPropagation?.()
                  fav ? removeFavorite(item.steam_appid) : addFavorite(item.steam_appid)
                }}
                style={{
                  marginTop: 8,
                  padding: 10,
                  backgroundColor: fav ? theme.dangerSoft : theme.primarySoft,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: fav ? theme.danger : theme.primaryText, textAlign: 'center', fontWeight: '700' }}>
                  {fav ? 'Remove from favorites' : 'Favorite'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        )
      }}
    />
  )
}