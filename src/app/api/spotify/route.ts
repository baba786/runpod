import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Spotify client credentials are not set');
  }

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch access token:', response.status, errorText);
      throw new Error(`Failed to fetch access token: ${response.status} ${errorText}`);
    }

    const data: { access_token: string } = await response.json();
    console.log('Access token retrieved successfully');
    return data.access_token;
  } catch (error) {
    console.error('Error in getAccessToken:', error);
    throw new Error(`Failed to get access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

interface SpotifyEpisode {
  id: string;
  name: string;
  description: string;
  duration_ms: number;
  external_urls: { spotify: string };
}

interface ProcessedEpisode {
  id: string;
  title: string;
  description: string;
  duration: number;
  episodeUrl: string;
  durationDifference: number;
}

async function searchPodcasts(durationMs: number, offset = 0): Promise<ProcessedEpisode[]> {
  console.log('Searching for podcasts with duration:', durationMs, 'offset:', offset);
  const token = await getAccessToken();
  const categories = ['fitness', 'health', 'sports', 'motivation', 'science', 'technology', 'news'];
  const searchTerm = categories[Math.floor(Math.random() * categories.length)];
  
  try {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${searchTerm} podcast&type=episode&market=US&limit=50&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch podcasts:', response.status, errorText);
      throw new Error(`Failed to fetch podcasts: ${response.status} ${errorText}`);
    }

    const data: { episodes?: { items: SpotifyEpisode[] } } = await response.json();

    if (!data.episodes || !data.episodes.items) {
      console.error('Unexpected API response:', data);
      throw new Error('Unexpected API response structure');
    }

    const episodes = data.episodes.items;
    console.log('Number of episodes found:', episodes.length);

    let filteredEpisodes = episodes.filter((episode) => {
      const durationDifference = Math.abs(episode.duration_ms - durationMs);
      // Stricter filtering for shorter durations
      const allowedDifference = durationMs < 30 * 60 * 1000 
        ? Math.min(5 * 60 * 1000, durationMs * 0.1) 
        : Math.min(15 * 60 * 1000, durationMs * 0.2);
      return durationDifference <= allowedDifference;
    });

    // Sort by closest duration match
    filteredEpisodes.sort((a, b) => 
      Math.abs(a.duration_ms - durationMs) - Math.abs(b.duration_ms - durationMs)
    );

    console.log('Number of filtered episodes:', filteredEpisodes.length);

    // Convert to ProcessedEpisode type
    let processedEpisodes: ProcessedEpisode[] = filteredEpisodes.map((episode) => ({
      id: episode.id,
      title: episode.name,
      description: episode.description,
      duration: episode.duration_ms,
      episodeUrl: episode.external_urls.spotify,
      durationDifference: Math.abs(episode.duration_ms - durationMs)
    }));

    // If we don't have enough results and haven't reached the API limit, fetch more
    if (processedEpisodes.length < 5 && offset < 950) {
      const moreEpisodes = await searchPodcasts(durationMs, offset + 50);
      processedEpisodes = [...processedEpisodes, ...moreEpisodes];
    }

    // Return top 5 matches
    return processedEpisodes.slice(0, 5);
  } catch (error) {
    console.error('Error in searchPodcasts:', error);
    throw new Error(`Failed to search podcasts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const duration = searchParams.get('duration');

  if (!duration) {
    return NextResponse.json({ error: 'Duration is required' }, { status: 400 });
  }

  const durationMs = parseInt(duration);

  if (isNaN(durationMs)) {
    return NextResponse.json({ error: 'Invalid duration provided' }, { status: 400 });
  }

  try {
    const podcasts = await searchPodcasts(durationMs);
    return NextResponse.json({
      targetDuration: durationMs,
      podcasts: podcasts
    });
  } catch (error) {
    console.error('Detailed error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json({ error: 'Failed to fetch podcasts', details: errorMessage }, { status: 500 });
  }
}