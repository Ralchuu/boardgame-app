import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'steamFavorites'

let favoritesCache: number[] = []
let favoritesLoaded = false
const favoritesSubscribers = new Set<(favorites: number[]) => void>()

function emitFavorites(nextFavorites: number[]) {
  favoritesCache = nextFavorites
  favoritesSubscribers.forEach((subscriber) => subscriber(nextFavorites))
}

function normalizeFavorites(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>(favoritesCache)
  const [loading, setLoading] = useState(!favoritesLoaded)

  useEffect(() => {
    let active = true

    const subscriber = (nextFavorites: number[]) => {
      if (active) {
        setFavorites(nextFavorites)
      }
    }

    favoritesSubscribers.add(subscriber)

    async function load() {
      if (favoritesLoaded) {
        if (active) {
          setFavorites(favoritesCache)
          setLoading(false)
        }

        return
      }

      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY)
        if (!active) {
          return
        }

        if (data) {
          emitFavorites(normalizeFavorites(JSON.parse(data)))
        } else {
          emitFavorites([])
        }
      } catch {
        if (active) {
          emitFavorites([])
        }
      } finally {
        if (active) {
          favoritesLoaded = true
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
      favoritesSubscribers.delete(subscriber)
    }
  }, [])

  const persistFavorites = async (nextFavorites: number[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextFavorites))
    } catch {
      // Keep local state updated even if persistence fails.
    }
  }

  const addFavorite = (id: number) => {
    const currentFavorites = favoritesCache

    if (currentFavorites.includes(id)) {
      return
    }

    const nextFavorites = [...currentFavorites, id]
    emitFavorites(nextFavorites)
    void persistFavorites(nextFavorites)
  }

  const removeFavorite = (id: number) => {
    const currentFavorites = favoritesCache
    const nextFavorites = currentFavorites.filter((favoriteId) => favoriteId !== id)

    if (nextFavorites.length === currentFavorites.length) {
      return
    }

    emitFavorites(nextFavorites)
    void persistFavorites(nextFavorites)
  }

  const isFavorite = (id: number) => favorites.includes(id)

  return { favorites, loading, addFavorite, removeFavorite, isFavorite }
}