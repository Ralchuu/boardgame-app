import { useFavorites } from '@/hooks/useFavorites'
import { getSteamGameDetails, searchSteamGames, SteamGameDetails } from '@/services/steamApi'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'

const genrePool = [
  'action',
  'rpg',
  'strategy',
  'simulation',
  'adventure',
  'indie',
  'platformer',
  'puzzle',
  'survival',
  'horror',
  'shooter',
  'roguelike',
  'casual',
  'fantasy',
  'sci-fi',
]

const modifierPool = [
  'cooperative',
  'multiplayer',
  'open world',
  'turn-based',
  'real-time',
  'narrative',
  'pixel art',
  'roguelike',
  'indie',
  'new',
  'free',
  'most played',
  'top rated',
]

function generateDiverseQueries(count: number = 6): string[] {
  const queries: string[] = []
  
  // Pick random single genres
  for (let i = 0; i < Math.floor(count * 0.3); i++) {
    const genre = genrePool[Math.floor(Math.random() * genrePool.length)]
    queries.push(genre)
  }
  
  // Pick combined genre + modifier queries for more diversity
  for (let i = queries.length; i < count; i++) {
    const genre = genrePool[Math.floor(Math.random() * genrePool.length)]
    const modifier = modifierPool[Math.floor(Math.random() * modifierPool.length)]
    queries.push(`${genre} ${modifier}`)
  }
  
  // Shuffle to randomize order
  return queries.sort(() => Math.random() - 0.5)
}

export default function GamesScreen() {
  const [games, setGames] = useState<SteamGameDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()

  const loadGames = useCallback(async (genre: string | null = selectedGenre) => {
    let queries: string[]
    
    if (genre) {
      // If a genre is selected, generate more queries to get more results
      queries = []
      for (let i = 0; i < 15; i++) {
        const modifier = modifierPool[Math.floor(Math.random() * modifierPool.length)]
        queries.push(`${genre} ${modifier}`)
      }
      queries = queries.sort(() => Math.random() - 0.5)
    } else {
      // Otherwise, generate diverse queries from all genres
      queries = generateDiverseQueries(6)
    }

    const searchResults = await Promise.all(queries.map(searchSteamGames))
    const candidateIds = Array.from(
      new Set(
        searchResults
          .flat()
          .filter((item) => item.appid)
          .map((item) => item.appid),
      ),
    ).slice(0, 60)

    const detailedResults = await Promise.all(candidateIds.map(getSteamGameDetails))
    return detailedResults.filter(Boolean) as SteamGameDetails[]
  }, [selectedGenre])

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10, color: 'black' }}>Loading Steam games...</Text>
      </View>
    )
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: 'white' }}
      contentContainerStyle={{ padding: 10 }}
      data={games}
      keyExtractor={(item) => item.steam_appid.toString()}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      ListHeaderComponent={
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: 'black', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Select Genre:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <Pressable
              onPress={() => handleGenreSelect(null)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginRight: 8,
                borderRadius: 20,
                backgroundColor: selectedGenre === null ? '#007AFF' : '#E5E7EB',
              }}
            >
              <Text style={{ color: selectedGenre === null ? 'white' : 'black', fontWeight: '600' }}>
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
                  backgroundColor: selectedGenre === genre ? '#007AFF' : '#E5E7EB',
                }}
              >
                <Text style={{ color: selectedGenre === genre ? 'white' : 'black', fontWeight: '600' }}>
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      }
      ListEmptyComponent={
        <Text style={{ color: 'black' }}>Pull down to load a new set of Steam games</Text>
      }
      renderItem={({ item }) => {
        const fav = isFavorite(item.steam_appid)

        return (
          <View style={{ marginBottom: 20, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14 }}>
            {item.header_image && (
              <Image
                source={{ uri: item.header_image }}
                style={{ height: 100, width: '100%', borderRadius: 8 }}
                resizeMode="cover"
              />
            )}

            <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>
              {item.name}
            </Text>
            {item.release_date?.date ? <Text style={{ color: '#666', marginTop: 4 }}>{item.release_date.date}</Text> : null}
            {item.price_overview?.final_formatted ? (
              <Text style={{ color: '#666', marginTop: 4 }}>{item.price_overview.final_formatted}</Text>
            ) : null}
            {item.short_description ? (
              <Text style={{ color: '#444', marginTop: 8, lineHeight: 20 }}>{item.short_description}</Text>
            ) : null}

            <Pressable
              onPress={() =>
                fav
                  ? removeFavorite(item.steam_appid)
                  : addFavorite(item.steam_appid)
              }
              style={{
                marginTop: 8,
                padding: 10,
                backgroundColor: fav ? '#FDECEC' : '#ddd',
                borderRadius: 8,
              }}
            >
              <Text style={{ color: fav ? '#B42318' : 'black', textAlign: 'center' }}>
                {fav ? 'Remove from favorites' : 'Favorite'}
              </Text>
            </Pressable>
          </View>
        )
      }}
    />
  )
}