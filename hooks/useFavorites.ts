import { useAuth } from '@/hooks/useAuth'
import { database } from '@/services/firebase'
import { onValue, ref, runTransaction } from 'firebase/database'
import { useEffect, useState } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const normalizeFavorites = (value: unknown): number[] => {
    if (!Array.isArray(value)) {
      return []
    }

    return Array.from(
      new Set(
        value
          .map((item) => Number(item))
          .filter((item) => Number.isFinite(item) && item > 0),
      ),
    )
  }

  useEffect(() => {
    if (!user) {
      setFavorites([])
      setLoading(false)
      setSyncing(false)
      setError(null)
      return
    }

    let active = true
    setLoading(true)
    setError(null)
    const favoritesRef = ref(database, `favorites/${user.uid}`)

    const unsubscribe = onValue(favoritesRef, (snapshot) => {
      if (!active) return

      try {
        const data = snapshot.val()
        setFavorites(normalizeFavorites(data))
        setError(null)
      } catch (err) {
        console.error('Error reading favorites:', err)
        setFavorites([])
        setError('Failed to load favorites')
      } finally {
        setLoading(false)
      }
    }, (err) => {
      if (!active) return

      console.error('Favorites sync error:', err)
      setFavorites([])
      setError('Failed to sync favorites')
      setLoading(false)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [user])

  const addFavorite = async (gameId: number) => {
    if (!user) {
      setError('You need to be logged in to save favorites')
      return
    }

    setError(null)
    setSyncing(true)
    const previousFavorites = favorites
    const nextFavorites = normalizeFavorites([...favorites, gameId])
    setFavorites(nextFavorites)

    try {
      const favoritesRef = ref(database, `favorites/${user.uid}`)
      await runTransaction(favoritesRef, (currentData) => normalizeFavorites([...(Array.isArray(currentData) ? currentData : []), gameId]))
    } catch (err) {
      console.error('Error adding favorite:', err)
      setFavorites(previousFavorites)
      setError('Could not save favorite')
    }
    finally {
      setSyncing(false)
    }
  }

  const removeFavorite = async (gameId: number) => {
    if (!user) {
      setError('You need to be logged in to edit favorites')
      return
    }

    setError(null)
    setSyncing(true)
    const previousFavorites = favorites
    const nextFavorites = favorites.filter((id) => id !== gameId)
    setFavorites(nextFavorites)

    try {
      const favoritesRef = ref(database, `favorites/${user.uid}`)
      await runTransaction(favoritesRef, (currentData) => {
        const current = normalizeFavorites(currentData)
        const filtered = current.filter((id) => id !== gameId)
        return filtered.length > 0 ? filtered : null
      })
    } catch (err) {
      console.error('Error removing favorite:', err)
      setFavorites(previousFavorites)
      setError('Could not update favorites')
    }
    finally {
      setSyncing(false)
    }
  }

  const isFavorite = (gameId: number): boolean => {
    return favorites.includes(gameId)
  }

  return { favorites, loading, syncing, error, addFavorite, removeFavorite, isFavorite }
}