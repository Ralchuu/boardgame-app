export type SteamGame = {
  appid: number
  name: string
  tiny_image?: string
  release_date?: string
  price?: string
}

export type SteamGameDetails = {
  steam_appid: number
  name: string
  header_image?: string
  short_description?: string
  genres?: { id: string; description: string }[]
  categories?: { id: number; description: string }[]
  tags?: Record<string, number>
  is_free?: boolean
  release_date?: {
    coming_soon?: boolean
    date?: string
  }
  price_overview?: {
    final?: number
    final_formatted?: string
    initial?: number
    initial_formatted?: string
  }
  developers?: string[]
  publishers?: string[]
  metacritic?: {
    score?: number
    url?: string
  }
}

type SteamStoreSearchItem = {
  id: number
  name: string
  tiny_image?: string
  price?: {
    final_formatted?: string
  }
  release_date?: { date?: string } | string | null
  published?: string | null
  type?: string
}

type SteamStoreSearchResponse = {
  total: number
  items: SteamStoreSearchItem[]
}

type SteamAppDetailsResponse = Record<
  number,
  {
    success: boolean
    data?: SteamGameDetails
  }
>

const PROXY_BASE_URL = process.env.EXPO_PUBLIC_STEAM_API_BASE_URL?.replace(/\/$/, '') || ''
const STORE_SEARCH_URL = 'https://store.steampowered.com/api/storesearch/'
const APP_DETAILS_URL = 'https://store.steampowered.com/api/appdetails'

function buildSearchUrl(query: string) {
  if (PROXY_BASE_URL) {
    return `${PROXY_BASE_URL}/search?q=${encodeURIComponent(query)}`
  }

  return `${STORE_SEARCH_URL}?term=${encodeURIComponent(query)}&l=en&cc=us`
}

function buildDetailsUrl(appid: number) {
  if (PROXY_BASE_URL) {
    return `${PROXY_BASE_URL}/details?appid=${appid}`
  }

  return `${APP_DETAILS_URL}?appids=${appid}&l=en&cc=us`
}

export async function searchSteamGames(query: string): Promise<SteamGame[]> {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return []

  const response = await fetch(buildSearchUrl(trimmedQuery), {
    headers: {
      Accept: 'application/json',
    },
  })
  const data = (await response.json()) as SteamStoreSearchResponse

  return (data.items ?? [])
    .filter((item) => !item.type || item.type === 'app')
    .slice(0, 30)
    .map((item) => ({
      appid: item.id,
      name: item.name,
      tiny_image: item.tiny_image,
      release_date:
        typeof item.release_date === 'string'
          ? item.release_date
          : item.release_date?.date ?? item.published ?? undefined,
      price: item.price?.final_formatted,
    }))
}

export async function getSteamGameDetails(appid: number): Promise<SteamGameDetails | null> {
  const response = await fetch(buildDetailsUrl(appid), {
    headers: {
      Accept: 'application/json',
    },
  })
  const data = (await response.json()) as SteamAppDetailsResponse
  const details = data?.[appid]

  if (!details?.success || !details.data) return null

  return {
    ...details.data,
    steam_appid: details.data.steam_appid ?? appid,
  }
}

function scoreRecommendationCandidate(
  candidate: SteamGameDetails,
  favoriteGenreCounts: Map<string, number>,
  favoriteTags: Set<string>,
  favoriteCategories: Set<string>,
  favoriteDevelopers: Set<string>,
  favoriteTitleTokens: Set<string>,
): number {
  let score = 0

  candidate.genres?.forEach((genre) => {
    const genreName = genre.description.toLowerCase()
    score += (favoriteGenreCounts.get(genreName) ?? 0) * 3
  })

  Object.keys(candidate.tags ?? {}).forEach((tag) => {
    if (favoriteTags.has(tag.toLowerCase())) {
      score += 2
    }
  })

  candidate.categories?.forEach((category) => {
    if (favoriteCategories.has(category.description.toLowerCase())) {
      score += 2
    }
  })

  candidate.developers?.forEach((developer) => {
    if (favoriteDevelopers.has(developer.toLowerCase())) {
      score += 1
    }
  })

  const candidateTokens = tokenizeTitle(candidate.name)
  for (const token of candidateTokens) {
    if (favoriteTitleTokens.has(token)) {
      score -= 4
    }
  }

  if (candidate.is_free) {
    score += 1
  }

  if (candidate.metacritic?.score) {
    score += Math.min(candidate.metacritic.score / 25, 4)
  }

  return score
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\b(deluxe|definitive|complete|goty|game of the year|anniversary|ultimate|remastered|remake|edition|bundle|collection|pack|hd|vr|special edition)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenizeTitle(title: string): Set<string> {
  return new Set(
    normalizeTitle(title)
      .split(' ')
      .filter((token) => token.length > 2),
  )
}

function getFranchiseKey(title: string): string {
  const tokens = Array.from(tokenizeTitle(title))

  if (!tokens.length) {
    return ''
  }

  return tokens
    .slice(0, 3)
    .filter((token) => !/^(i|ii|iii|iv|v|vi|vii|viii|ix|x|\d+)$/.test(token))
    .join(' ')
}

function isNearDuplicateTitle(candidateName: string, favoriteNames: string[]): boolean {
  const candidateNormalized = normalizeTitle(candidateName)
  if (!candidateNormalized) {
    return false
  }

  const candidateTokens = tokenizeTitle(candidateName)

  return favoriteNames.some((favoriteName) => {
    const favoriteNormalized = normalizeTitle(favoriteName)
    if (!favoriteNormalized) {
      return false
    }

    if (candidateNormalized === favoriteNormalized) {
      return true
    }

    if (candidateNormalized.includes(favoriteNormalized) || favoriteNormalized.includes(candidateNormalized)) {
      return true
    }

    const favoriteTokens = tokenizeTitle(favoriteName)
    let sharedTokens = 0

    candidateTokens.forEach((token) => {
      if (favoriteTokens.has(token)) {
        sharedTokens += 1
      }
    })

    const overlapRatio = sharedTokens / Math.max(candidateTokens.size, favoriteTokens.size, 1)
    return overlapRatio >= 0.6
  })
}

function buildRecommendationQueries(favoriteGames: SteamGameDetails[]): string[] {
  const queries = new Set<string>()
  const fallbackQueries = ['action', 'adventure', 'rpg', 'strategy', 'simulation', 'indie', 'co-op']
  const stopWords = new Set([
    'game',
    'games',
    'edition',
    'deluxe',
    'complete',
    'ultimate',
    'remastered',
    'remake',
    'bundle',
    'collection',
    'pack',
    'hd',
    'vr',
  ])

  favoriteGames.forEach((game) => {
    game.genres?.slice(0, 2).forEach((genre) => {
      queries.add(genre.description)
    })

    game.categories?.slice(0, 3).forEach((category) => {
      queries.add(category.description)
    })

    Object.keys(game.tags ?? {})
      .slice(0, 3)
      .forEach((tag) => {
        queries.add(tag.replace(/_/g, ' '))
      })

    const titleTokens = Array.from(tokenizeTitle(game.name)).filter((token) => !stopWords.has(token))
    if (titleTokens.length) {
      queries.add(titleTokens.slice(0, 2).join(' '))
    }
  })

  fallbackQueries.forEach((query) => queries.add(query))

  return Array.from(queries)
}

export async function getSteamRecommendations(favoriteIds: number[]): Promise<SteamGameDetails[]> {
  if (!favoriteIds.length) {
    return []
  }

  const favoriteDetails = (await Promise.all(favoriteIds.map(getSteamGameDetails))).filter(Boolean) as SteamGameDetails[]

  if (!favoriteDetails.length) {
    return []
  }

  const favoriteGenreCounts = new Map<string, number>()
  const favoriteTags = new Set<string>()
  const favoriteCategories = new Set<string>()
  const favoriteDevelopers = new Set<string>()
  const favoriteTitleTokens = new Set<string>()
  const favoriteNames = favoriteDetails.map((game) => game.name)
  const favoriteFamilyKeys = new Set<string>()

  favoriteDetails.forEach((game) => {
    game.genres?.forEach((genre) => {
      const key = genre.description.toLowerCase()
      favoriteGenreCounts.set(key, (favoriteGenreCounts.get(key) ?? 0) + 1)
    })

    Object.keys(game.tags ?? {}).forEach((tag) => {
      favoriteTags.add(tag.toLowerCase())
    })

    game.categories?.forEach((category) => {
      favoriteCategories.add(category.description.toLowerCase())
    })

    game.developers?.forEach((developer) => {
      favoriteDevelopers.add(developer.toLowerCase())
    })

    tokenizeTitle(game.name).forEach((token) => {
      favoriteTitleTokens.add(token)
    })

    const familyKey = getFranchiseKey(game.name)
    if (familyKey) {
      favoriteFamilyKeys.add(familyKey)
    }
  })

  const searchQueries = buildRecommendationQueries(favoriteDetails)

  const candidateMap = new Map<number, SteamGameDetails>()

  for (const query of searchQueries) {
    const searchResults = await searchSteamGames(query)

    const detailedCandidates = await Promise.all(
      searchResults
        .filter((item) => !favoriteIds.includes(item.appid))
        .map((item) => getSteamGameDetails(item.appid)),
    )

    detailedCandidates.filter(Boolean).forEach((candidate) => {
      const game = candidate as SteamGameDetails
      const familyKey = getFranchiseKey(game.name)

      if (
        !favoriteIds.includes(game.steam_appid) &&
        !isNearDuplicateTitle(game.name, favoriteNames) &&
        (!familyKey || !favoriteFamilyKeys.has(familyKey))
      ) {
        candidateMap.set(game.steam_appid, game)
      }
    })
  }

  const rankedCandidates = Array.from(candidateMap.values())
    .map((candidate) => ({
      candidate,
      score: scoreRecommendationCandidate(
        candidate,
        favoriteGenreCounts,
        favoriteTags,
        favoriteCategories,
        favoriteDevelopers,
        favoriteTitleTokens,
      ),
    }))
    .sort((left, right) => right.score - left.score)

  const selectedCandidates: SteamGameDetails[] = []
  const selectedFamilyKeys = new Set<string>()

  for (const { candidate, score } of rankedCandidates) {
    if (score <= 0) {
      continue
    }

    const familyKey = getFranchiseKey(candidate.name)
    if (familyKey && selectedFamilyKeys.has(familyKey)) {
      continue
    }

    selectedCandidates.push(candidate)

    if (familyKey) {
      selectedFamilyKeys.add(familyKey)
    }

    if (selectedCandidates.length >= 12) {
      break
    }
  }

  return selectedCandidates
}