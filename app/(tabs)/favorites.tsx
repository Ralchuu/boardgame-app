import { useFavorites } from '@/hooks/useFavorites'
import { getSteamGameDetails, SteamGameDetails } from '@/services/steamApi'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native'

export default function FavoritesScreen() {
  const { favorites, removeFavorite, loading } = useFavorites()
  const [games, setGames] = useState<SteamGameDetails[]>([])

  useEffect(() => {
    async function load() {
      const data = await Promise.all(favorites.map(getSteamGameDetails))
      setGames(data.filter(Boolean) as SteamGameDetails[])
    }

    load()
  }, [favorites])

  if (loading) return <ActivityIndicator />

  return (
    <FlatList
      data={games}
      keyExtractor={(item) => item.steam_appid.toString()}
      renderItem={({ item }) => (
        <View style={{ padding: 12, margin: 10, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14 }}>
          {item.header_image && (
            <Image source={{ uri: item.header_image }} style={{ height: 100, borderRadius: 10 }} />
          )}
          <Text style={{ marginTop: 8, fontSize: 16, fontWeight: '700' }}>{item.name}</Text>
          {item.release_date?.date ? <Text style={{ color: '#666', marginTop: 4 }}>{item.release_date.date}</Text> : null}

          <Pressable
            onPress={() => removeFavorite(item.steam_appid)}
            style={{ marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: '#FDECEC' }}
          >
            <Text style={{ textAlign: 'center', color: '#B42318', fontWeight: '700' }}>Remove</Text>
          </Pressable>
        </View>
      )}
    />
  )
}