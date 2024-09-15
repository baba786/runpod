// src/app/api/spotify/route.ts

import { NextResponse } from 'next/server'

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Spotify client credentials are not set')
  throw new Error('Server configuration error')
}

// In-memory cache for the access token
let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.token
  }

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    'base64'
  )

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch access token:', response.status, errorText)
      throw new Error(
        `Failed to fetch access token: ${response.status} ${errorText}`
      )
    }

    const data: { access_token: string; expires_in: number } =
      await response.json()

    const expiresAt = now + data.expires_in * 1000 - 60000 // Subtract 1 minute to be safe
    cachedToken = { token: data.access_token, expiresAt }
    console.log('Access token retrieved and cached successfully')
    return data.access_token
  } catch (error) {
    console.error('Error in getAccessToken:', error)
    throw new Error(
      `Failed to get access token: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

interface SpotifyEpisode {
  id: string
  name: string
  description: string
  duration_ms: number
  external_urls: { spotify: string }
  images: Array<{ url: string; height: number; width: number }>
  release_date: string
}

interface ProcessedEpisode {
  id: string
  title: string
  description: string
  duration: number
  episodeUrl: string
  imageUrl?: string
  releaseDate?: string
  embedUrl: string
}

interface SearchPodcastsParams {
  durationMs: number
  searchTerm?: string
  toleranceMs?: number
  market?: string
  includeExplicit?: boolean
}

const MAX_OFFSET = 950 // Spotify's API limit
const LIMIT_PER_REQUEST = 50 // Maximum allowed by Spotify
const MAX_RESULTS = 5 // Limit total results to 5

async function getPodcastDetails(id: string): Promise<ProcessedEpisode> {
  const token = await getAccessToken()
  try {
    console.log(`Fetching podcast details for ID: ${id}`)
    const response = await fetch(`https://api.spotify.com/v1/episodes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log('Response Status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch podcast:', response.status, errorText)
      throw new Error(`Failed to fetch podcast: ${response.status}`)
    }

    const episode: SpotifyEpisode = await response.json()

    return {
      id: episode.id,
      title: episode.name,
      description: episode.description,
      duration: episode.duration_ms,
      episodeUrl: episode.external_urls.spotify,
      imageUrl: episode.images?.[0]?.url,
      releaseDate: episode.release_date,
      embedUrl: `https://open.spotify.com/embed/episode/${episode.id}`,
    }
  } catch (error) {
    console.error('Error in getPodcastDetails:', error)
    throw new Error(
      `Failed to get podcast details: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

async function searchPodcasts({
  durationMs,
  searchTerm = 'podcast',
  toleranceMs = 600000, // 10 minutes tolerance
  market = 'US',
  includeExplicit = false,
}: SearchPodcastsParams): Promise<ProcessedEpisode[]> {
  const token = await getAccessToken()
  const minDuration = Math.max(0, durationMs - toleranceMs)
  const maxDuration = durationMs + toleranceMs

  let offset = 0
  const allEpisodes: ProcessedEpisode[] = []

  while (offset < MAX_OFFSET && allEpisodes.length < MAX_RESULTS) {
    try {
      const url = new URL('https://api.spotify.com/v1/search')
      url.searchParams.append(
        'q',
        `${searchTerm} ${includeExplicit ? '' : 'NOT explicit'}`
      )
      url.searchParams.append('type', 'episode')
      url.searchParams.append('market', market)
      url.searchParams.append('limit', LIMIT_PER_REQUEST.toString())
      url.searchParams.append('offset', offset.toString())

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to search podcasts:', response.status, errorText)
        throw new Error(`Failed to search podcasts: ${response.status}`)
      }

      const data: { episodes: { items: SpotifyEpisode[] } } =
        await response.json()
      const episodes = data.episodes.items

      const filteredEpisodes = episodes
        .filter(
          (episode) =>
            episode.duration_ms >= minDuration &&
            episode.duration_ms <= maxDuration
        )
        .map((episode) => ({
          id: episode.id,
          title: episode.name,
          description: episode.description,
          duration: episode.duration_ms,
          episodeUrl: episode.external_urls.spotify,
          imageUrl: episode.images?.[0]?.url,
          releaseDate: episode.release_date,
          embedUrl: `https://open.spotify.com/embed/episode/${episode.id}`,
        }))

      allEpisodes.push(...filteredEpisodes)

      if (
        allEpisodes.length >= MAX_RESULTS ||
        episodes.length < LIMIT_PER_REQUEST
      ) {
        break
      }

      offset += LIMIT_PER_REQUEST
    } catch (error) {
      console.error('Error in searchPodcasts:', error)
      throw new Error(
        `Failed to search podcasts: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  // Return only the first MAX_RESULTS
  return allEpisodes.slice(0, MAX_RESULTS)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const podcastId = searchParams.get('id')
  const duration = searchParams.get('duration')
  const searchTerm = searchParams.get('searchTerm') || undefined
  const toleranceMs = searchParams.get('toleranceMs')
    ? parseInt(searchParams.get('toleranceMs')!, 10)
    : undefined
  const market = searchParams.get('market') || undefined
  const includeExplicit = searchParams.get('includeExplicit') === 'true'

  if (podcastId) {
    // Fetch details of a specific podcast episode
    try {
      const podcast = await getPodcastDetails(podcastId)
      return NextResponse.json(podcast)
    } catch (error) {
      console.error('Detailed error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred'
      if (errorMessage.includes('Failed to fetch podcast: 404')) {
        return NextResponse.json(
          { error: 'Podcast not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch podcast', details: errorMessage },
        { status: 500 }
      )
    }
  } else if (duration) {
    // Search for podcasts based on duration
    const durationMs = parseInt(duration, 10)
    if (isNaN(durationMs)) {
      return NextResponse.json({ error: 'Invalid duration' }, { status: 400 })
    }

    try {
      const podcasts = await searchPodcasts({
        durationMs,
        searchTerm,
        toleranceMs,
        market,
        includeExplicit,
      })
      return NextResponse.json({ podcasts })
    } catch (error) {
      console.error('Error searching podcasts:', error)
      return NextResponse.json(
        { error: 'Failed to search podcasts' },
        { status: 500 }
      )
    }
  } else {
    // Invalid request
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
