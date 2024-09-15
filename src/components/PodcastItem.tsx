// src/components/PodcastItem.tsx

import React from 'react'
import { Podcast } from '@/types'
import Image from 'next/image'

interface PodcastItemProps {
  podcast: Podcast
}

const PodcastItem: React.FC<PodcastItemProps> = ({ podcast }) => {
  // Helper function to format duration from milliseconds to mm:ss
  const formatDuration = (durationMs: number) => {
    const totalSeconds = Math.floor(durationMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Format the release date
  const formattedDate = new Date(podcast.releaseDate).toLocaleDateString()

  return (
    <div className="flex flex-col sm:flex-row bg-white dark:bg-gray-800 shadow-md rounded-md p-4 mb-4">
      <div className="w-full sm:w-32 h-32 relative">
        <Image
          src={podcast.imageUrl}
          alt={podcast.title}
          layout="fill"
          objectFit="cover"
          className="rounded-md"
        />
      </div>
      <div className="sm:ml-4 flex-grow">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {podcast.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {podcast.description}
        </p>
        <div className="mt-2 flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-300">
            Duration: {formatDuration(podcast.duration)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-300">
            Release Date: {formattedDate}
          </span>
        </div>
        <div className="mt-4">
          <a
            href={podcast.episodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Listen on Spotify
          </a>
        </div>
      </div>
    </div>
  )
}

export default PodcastItem
