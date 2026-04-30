import { useAuth } from '@/hooks/useAuth'
import { database } from '@/services/firebase'
import { get, onValue, ref, set } from 'firebase/database'
import { useEffect, useState } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setFavorites([])
      setLoading(false)
      return
    }

    let active = true
    const favoritesRef = ref(database, `favorites/${user.uid}`)

    const unsubscribe = onValue(
      favoritesRef,
      (snapshot) => {
        if (!active) return
        try {
          const data = snapshot.val()
          setFavorites(Array.isArray(data) ? data : [])
        } catch (err) {
          console.error('Error reading favorites:', err)
          setFavorites([])
        } finally {
          setLoading(false)
        }
      }
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [user])

  const addFavorite = async (gameId: number) => {
    if (!user) {
      return
    }

    try {
      const favoritesRef = ref(database, `favorites/${user.uid}`)
      const snapshot = await get(favoritesRef)
      let current: number[] = snapshot.val() || []
      if (!current.includes(gameId)) {
        current.push(gameId)
        await set(favoritesRef, current)
      }
    } catch (err) {
      console.error('Error adding favorite:', err)
    }
  }

  const removeFavorite = async (gameId: number) => {
    if (!user) {
      return
    }

    try {
      const favoritesRef = ref(database, `favorites/${user.uid}`)
      const snapshot = await get(favoritesRef)
      let current: number[] = snapshot.val() || []
      const filtered = current.filter((id) => id !== gameId)
      await set(favoritesRef, filtered.length > 0 ? filtered : null)
    } catch (err) {
      console.error('Error removing favorite:', err)
    }
  }

  const isFavorite = (gameId: number): boolean => {
    return favorites.includes(gameId)
  }

  return { favorites, loading, addFavorite, removeFavorite, isFavorite }
}