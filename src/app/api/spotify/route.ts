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
}

async function searchPodcasts(durationMs: number): Promise<ProcessedEpisode[]> {
  console.log('Starting searchPodcasts with duration:', durationMs);
  const token = await getAccessToken();
  console.log('Access token obtained');
  try {
    const response = await fetch(`https://api.spotify.com/v1/search?q=podcast&type=episode&market=US&limit=50`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Search API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch podcasts:', response.status, errorText);
      throw new Error(`Failed to fetch podcasts: ${response.status} ${errorText}`);
    }

    const data: { episodes?: { items: SpotifyEpisode[] } } = await response.json();
    console.log('Spotify API response received');

    if (!data.episodes || !data.episodes.items) {
      console.error('Unexpected API response:', data);
      throw new Error('Unexpected API response structure');
    }

    const episodes = data.episodes.items;
    console.log('Number of episodes found:', episodes.length);

    // Filter episodes based on duration
    const filteredEpisodes = episodes.filter((episode) =>
      Math.abs(episode.duration_ms - durationMs) < 10 * 60 * 1000 // Within 10 minutes
    );

    return filteredEpisodes.slice(0, 3).map((episode) => ({
      id: episode.id,
      title: episode.name,
      description: episode.description,
      duration: episode.duration_ms,
      episodeUrl: episode.external_urls.spotify
    }));
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
    return NextResponse.json(podcasts);
  } catch (error) {
    console.error('Detailed error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json({ error: 'Failed to fetch podcasts', details: errorMessage }, { status: 500 });
  }
}
