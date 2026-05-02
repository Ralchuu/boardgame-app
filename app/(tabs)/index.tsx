import { IconSymbol } from '@/components/ui/icon-symbol'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useFavorites } from '@/hooks/useFavorites'
import { useGames } from '@/hooks/useGames'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, FlatList, Image, Pressable, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function HomeScreen() {
  const [query, setQuery] = useState('')
  const { games, loading, error } = useGames(query)
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const router = useRouter()
  const colorScheme = useColorScheme() ?? 'light'
  const theme = Colors[colorScheme]
  const insets = useSafeAreaInsets()

  const screenStyles = {
    backgroundColor: theme.background,
    color: theme.text,
  }

  return (
    <View style={[{ flex: 1, paddingHorizontal: 16, paddingTop: insets.top + 12, gap: 14 }, screenStyles]}>
      <View
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 24,
          padding: 18,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: -20,
            right: -22,
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: theme.primarySoft,
            opacity: 0.55,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: -34,
            left: -24,
            width: 92,
            height: 92,
            borderRadius: 46,
            backgroundColor: theme.surfaceAlt,
            opacity: 0.8,
          }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconSymbol size={26} name="gamecontroller.fill" color={theme.background} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: theme.text }}>Steam Finder</Text>
            <Text style={{ marginTop: 6, color: theme.mutedText, lineHeight: 20 }}>
              Etsi pelejä Steamistä, tutki tietoja ja talleta omat suosikit.
            </Text>
          </View>
        </View>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search Steam games..."
        placeholderTextColor={theme.mutedText}
        selectionColor={theme.tint}
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          color: theme.text,
          backgroundColor: theme.surface,
          marginBottom: 4,
          padding: 14,
          borderRadius: 16,
        }}
      />

      {loading && <ActivityIndicator color={theme.primary} />}
      {error ? <Text style={{ color: theme.danger }}>{error}</Text> : null}

      <FlatList
        data={games}
        keyExtractor={(item) => item.appid.toString()}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, gap: 12 }}
        ListEmptyComponent={
          !loading && !query.trim() ? (
            <Text style={{ color: theme.mutedText }}>Kirjoita nimi ja hae esimerkiksi Hades tai Portal 2.</Text>
          ) : null
        }
        renderItem={({ item }) => {
          const fav = isFavorite(item.appid)

          return (
            <Pressable onPress={() => router.push({ pathname: '/game', params: { appid: String(item.appid) } })}>
              <View
                style={{
                  padding: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 18,
                  backgroundColor: theme.surface,
                }}
              >
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {item.tiny_image ? (
                    <Image
                      source={{ uri: item.tiny_image }}
                      style={{
                        width: 96,
                        height: 54,
                        borderRadius: 12,
                        backgroundColor: theme.surfaceAlt,
                      }}
                    />
                  ) : null}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>{item.name}</Text>
                    {item.release_date ? <Text style={{ color: theme.mutedText, marginTop: 4 }}>{item.release_date}</Text> : null}
                    {item.price ? <Text style={{ color: theme.mutedText, marginTop: 4 }}>{item.price}</Text> : null}
                  </View>
                </View>

                <Pressable
                  onPress={(e: any) => {
                    e?.stopPropagation?.()
                    fav ? removeFavorite(item.appid) : addFavorite(item.appid)
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