import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useFavorites } from '@/hooks/useFavorites'
import { useGames } from '@/hooks/useGames'
import { useState } from 'react'
import { ActivityIndicator, FlatList, Image, Pressable, Text, TextInput, View } from 'react-native'

export default function HomeScreen() {
  const [query, setQuery] = useState('')
  const { games, loading, error } = useGames(query)
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const colorScheme = useColorScheme() ?? 'light'
  const theme = Colors[colorScheme]

  const screenStyles = {
    backgroundColor: theme.background,
    color: theme.text,
  }

  return (
    <View style={[{ flex: 1, padding: 16 }, screenStyles]}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.text }}>Steam Finder</Text>
      <Text style={{ marginTop: 6, color: theme.icon }}>Etsi pelejä Steamistä ja talleta omat suosikit.</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search Steam games..."
        placeholderTextColor={colorScheme === 'dark' ? '#9BA1A6' : '#888'}
        selectionColor={theme.tint}
        style={{
          borderWidth: 1,
          borderColor: colorScheme === 'dark' ? '#3A3F42' : '#DDD',
          color: theme.text,
          backgroundColor: colorScheme === 'dark' ? '#1E2124' : '#FFF',
          marginVertical: 12,
          padding: 12,
          borderRadius: 12,
        }}
      />

      {loading && <ActivityIndicator />}
      {error ? <Text style={{ color: '#B42318' }}>{error}</Text> : null}

      <FlatList
        data={games}
        keyExtractor={(item) => item.appid.toString()}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          !loading && !query.trim() ? (
            <Text style={{ color: theme.icon }}>Kirjoita nimi ja hae esimerkiksi Hades tai Portal 2.</Text>
          ) : null
        }
        renderItem={({ item }) => {
          const fav = isFavorite(item.appid)

          return (
            <View
              style={{
                padding: 12,
                borderWidth: 1,
                borderColor: colorScheme === 'dark' ? '#3A3F42' : '#E5E7EB',
                borderRadius: 14,
                marginBottom: 10,
                backgroundColor: colorScheme === 'dark' ? '#1E2124' : '#fff',
              }}
            >
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {item.tiny_image ? (
                  <Image
                    source={{ uri: item.tiny_image }}
                    style={{
                      width: 96,
                      height: 54,
                      borderRadius: 10,
                      backgroundColor: colorScheme === 'dark' ? '#2A2E31' : '#E5E7EB',
                    }}
                  />
                ) : null}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>{item.name}</Text>
                  {item.release_date ? <Text style={{ color: theme.icon, marginTop: 4 }}>{item.release_date}</Text> : null}
                  {item.price ? <Text style={{ color: theme.icon, marginTop: 4 }}>{item.price}</Text> : null}
                </View>
              </View>

              <Pressable
                onPress={() => (fav ? removeFavorite(item.appid) : addFavorite(item.appid))}
                style={{
                  marginTop: 10,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: fav ? '#FDECEC' : '#E8F0FF',
                }}
              >
                <Text style={{ textAlign: 'center', fontWeight: '700', color: fav ? '#B42318' : '#174AE5' }}>
                  {fav ? 'Remove from favorites' : 'Add to favorites'}
                </Text>
              </Pressable>
            </View>
          )
        }}
      />
    </View>
  )
}