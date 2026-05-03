import { searchSteamGames, SteamGame } from '@/services/steamApi'
import { useEffect, useState } from 'react'

export function useGames(query: string) {
  const [games, setGames] = useState<SteamGame[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setGames([])
        setError('')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const results = await searchSteamGames(query)
        if (!cancelled) {
          setGames(results)
        }
      } catch {
        if (!cancelled) {
          setError('Steam search failed')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }, 350)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  return { games, loading, error }
}