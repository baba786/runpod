import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
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

    const data = await response.json();
    console.log('Access token retrieved successfully');
    return data.access_token;
  } catch (error: unknown) {
    console.error('Error in getAccessToken:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to get access token: ${error.message}`);
    }
    throw new Error('Failed to get access token: Unknown error');
  }
}

async function searchPodcasts(durationMs: number) {
  console.log('Starting searchPodcasts with duration:', durationMs);
  const token = await getAccessToken();
  console.log('Access token obtained');
  try {
    const response = await fetch(`https://api.spotify.com/v1/search?q=podcast&type=show&market=US&limit=50`, {
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

    const data = await response.json();
    console.log('Spotify API response received');

    if (!data.shows || !data.shows.items) {
      console.error('Unexpected API response:', data);
      throw new Error('Unexpected API response structure');
    }

    const shows = data.shows.items;
    console.log('Number of shows found:', shows.length);

    // Fetch episodes for each show and filter based on duration
    const filteredShows = await Promise.all(shows.map(async (show: any) => {
      const episodesResponse = await fetch(`https://api.spotify.com/v1/shows/${show.id}/episodes?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const episodesData = await episodesResponse.json();
      console.log(`Episodes data for show ${show.id}:`, episodesData);
      
      if (!episodesData.items) {
        console.error(`No episodes found for show ${show.id}`);
        return null;
      }
      
      const matchingEpisodes = episodesData.items.filter((episode: any) =>
        Math.abs(episode.duration_ms - durationMs) < 10 * 60 * 1000 // Within 10 minutes
      );
      return matchingEpisodes.length > 0 ? { ...show, matchingEpisodes } : null;
    }));

    return filteredShows
      .filter(Boolean)
      .slice(0, 3)
      .map((show: any) => ({
        showName: show.name,
        publisher: show.publisher,
        images: show.images,
        showUrl: show.external_urls.spotify,
        episodeName: show.matchingEpisodes[0].name,
        episodeUrl: show.matchingEpisodes[0].external_urls.spotify,
        episodeDuration: show.matchingEpisodes[0].duration_ms,
        embedUrl: `https://open.spotify.com/embed/episode/${show.matchingEpisodes[0].id}`
      }));
  } catch (error: unknown) {
    console.error('Error in searchPodcasts:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to search podcasts: ${error.message}`);
    }
    throw new Error('Failed to search podcasts: Unknown error');
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const duration = searchParams.get('duration');

  if (!duration) {
    return NextResponse.json({ error: 'Duration is required' }, { status: 400 });
  }

  const durationMs = parseInt(duration);

  try {
    const podcasts = await searchPodcasts(durationMs);
    return NextResponse.json(podcasts);
  } catch (error: unknown) {
    console.error('Detailed error:', error);
    
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json({ error: 'Failed to fetch podcasts', details: errorMessage }, { status: 500 });
  }
}