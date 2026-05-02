import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useFavorites } from '@/hooks/useFavorites'
import { getSteamGameDetails, SteamGameDetails } from '@/services/steamApi'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function FavoritesScreen() {
  const { favorites, removeFavorite, loading } = useFavorites()
  const [games, setGames] = useState<SteamGameDetails[]>([])
  const colorScheme = useColorScheme() ?? 'light'
  const theme = Colors[colorScheme]
  const insets = useSafeAreaInsets()

  useEffect(() => {
    async function load() {
      const data = await Promise.all(favorites.map(getSteamGameDetails))
      setGames(data.filter(Boolean) as SteamGameDetails[])
    }

    load()
  }, [favorites])

  if (loading) return <ActivityIndicator color={theme.primary} />

  return (
    <FlatList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ paddingHorizontal: 12, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }}
      data={games}
      keyExtractor={(item) => item.steam_appid.toString()}
      renderItem={({ item }) => (
        <View style={{ padding: 14, marginBottom: 12, borderWidth: 1, borderColor: theme.border, borderRadius: 18, backgroundColor: theme.surface }}>
          {item.header_image && (
            <Image source={{ uri: item.header_image }} style={{ height: 100, borderRadius: 12, backgroundColor: theme.surfaceAlt }} />
          )}
          <Text style={{ marginTop: 8, fontSize: 16, fontWeight: '800', color: theme.text }}>{item.name}</Text>
          {item.release_date?.date ? <Text style={{ color: theme.mutedText, marginTop: 4 }}>{item.release_date.date}</Text> : null}

          <Pressable
            onPress={() => removeFavorite(item.steam_appid)}
            style={{ marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: theme.dangerSoft }}
          >
            <Text style={{ textAlign: 'center', color: theme.danger, fontWeight: '700' }}>Remove</Text>
          </Pressable>
        </View>
      )}
    />
  )
}