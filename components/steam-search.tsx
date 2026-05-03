import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useFavorites } from '@/hooks/useFavorites'
import { useGames } from '@/hooks/useGames'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

export default function SteamSearch() {
  const [query, setQuery] = useState('')
  const { games, loading, error } = useGames(query)
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const router = useRouter()
  const colorScheme = useColorScheme() ?? 'light'
  const theme = Colors[colorScheme]

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Search Steam games</Text>
      <Text style={[styles.subtitle, { color: theme.mutedText }]}>Search games by name and add them to your favorites.</Text>

      <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Type a game name"
          placeholderTextColor={theme.mutedText}
          value={query}
          onChangeText={setQuery}
        />
        {query.trim() && (
          <Pressable 
            onPress={() => setQuery('')} 
            style={{
              paddingRight: 14,
              paddingLeft: 8,
              paddingVertical: 12,
              justifyContent: 'center',
              alignItems: 'center',
              minWidth: 40,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: '700', color: theme.primary }}>×</Text>
          </Pressable>
        )}
      </View>

      {loading ? <Text style={[styles.helper, { color: theme.mutedText }]}>Loading...</Text> : null}
      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}

      {!loading && !error && query.trim() && games.length === 0 ? (
        <Text style={[styles.helper, { color: theme.mutedText }]}>No results for this search.</Text>
      ) : null}

      {!query.trim() ? (
        <Text style={[styles.helper, { color: theme.mutedText }]}>Try searching for 'Elden Ring' or 'Hades'.</Text>
      ) : null}

      {games.map((item) => {
        const fav = isFavorite(item.appid)

        return (
          <Pressable key={item.appid} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => router.push(`/game?appid=${item.appid}` as any)}>
            {item.tiny_image ? <Image source={{ uri: item.tiny_image }} style={[styles.thumbnail, { backgroundColor: theme.surfaceAlt }]} /> : null}
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
              {item.release_date ? <Text style={[styles.cardMeta, { color: theme.mutedText }]}>{item.release_date}</Text> : null}
              {item.price ? <Text style={[styles.cardMeta, { color: theme.mutedText }]}>{item.price}</Text> : null}
              <Pressable onPress={(e: any) => { e?.stopPropagation?.(); fav ? removeFavorite(item.appid) : addFavorite(item.appid) }}>
                <Text style={[styles.cardAction, { color: theme.primary }]}>{fav ? 'Remove from favorites' : 'Add to favorites'}</Text>
              </Pressable>
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  clearButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  helper: {
    fontSize: 14,
  },
  error: {
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  thumbnail: {
    width: 92,
    height: 52,
    borderRadius: 10,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardMeta: {
    fontSize: 13,
  },
  cardAction: {
    marginTop: 4,
    fontWeight: '700',
  },
})