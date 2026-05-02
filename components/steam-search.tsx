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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Etsi Steam-pelejä</Text>
      <Text style={styles.subtitle}>Hae pelejä nimellä ja lisää ne suosikkeihin.</Text>

      <TextInput
        style={styles.input}
        placeholder="Kirjoita pelin nimi"
        placeholderTextColor="#7A7A7A"
        value={query}
        onChangeText={setQuery}
      />

      {loading ? <Text style={styles.helper}>Ladataan...</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && !error && query.trim() && games.length === 0 ? (
        <Text style={styles.helper}>Ei tuloksia tällä haulla.</Text>
      ) : null}

      {!query.trim() ? (
        <Text style={styles.helper}>Kokeile esimerkiksi Elden Ring tai Hades.</Text>
      ) : null}

      {games.map((item) => {
        const fav = isFavorite(item.appid)

        return (
          <Pressable key={item.appid} style={styles.card} onPress={() => router.push(`/game?appid=${item.appid}` as any)}>
            {item.tiny_image ? <Image source={{ uri: item.tiny_image }} style={styles.thumbnail} /> : null}
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              {item.release_date ? <Text style={styles.cardMeta}>{item.release_date}</Text> : null}
              {item.price ? <Text style={styles.cardMeta}>{item.price}</Text> : null}
              <Pressable onPress={(e: any) => { e?.stopPropagation?.(); fav ? removeFavorite(item.appid) : addFavorite(item.appid) }}>
                <Text style={styles.cardAction}>{fav ? 'Poista suosikeista' : 'Lisää suosikkeihin'}</Text>
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
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  helper: {
    color: '#666',
  },
  error: {
    color: '#B42318',
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F5F7FA',
  },
  thumbnail: {
    width: 92,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
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
    color: '#5F6368',
    fontSize: 13,
  },
  cardAction: {
    marginTop: 4,
    color: '#1463FF',
    fontWeight: '700',
  },
})