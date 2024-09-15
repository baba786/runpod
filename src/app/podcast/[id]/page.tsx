// src/app/podcast/[id]/page.tsx

import { Podcast } from '@/types'
import PodcastClient from './PodcastClient'
import { headers } from 'next/headers'
import { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const podcast = await getPodcast(params.id)
  return {
    title: podcast.title,
    description: podcast.description,
  }
}

async function getPodcast(id: string): Promise<Podcast> {
  const headersList = headers()
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const host = headersList.get('host') || 'localhost:3000'
  const baseUrl = `${protocol}://${host}`

  const res = await fetch(`${baseUrl}/api/spotify?id=${id}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Failed to fetch podcast: ${res.status} ${errorText}`)
  }

  const data = await res.json()

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    duration: data.duration,
    imageUrl: data.imageUrl,
    releaseDate: data.releaseDate,
    episodeUrl: data.episodeUrl,
  }
}

export default async function PodcastPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { inputType?: string; inputValue?: string }
}) {
  try {
    const podcast = await getPodcast(params.id)
    return (
      <PodcastClient
        podcast={podcast}
        inputType={searchParams.inputType}
        inputValue={searchParams.inputValue}
      />
    )
  } catch (error) {
    console.error('Error loading podcast:', error)
    return (
      <div className="p-4 text-red-600">
        Failed to load podcast:{' '}
        {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }
}
