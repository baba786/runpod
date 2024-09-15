// src/components/PodcastList.tsx

import React from 'react'
import { Podcast } from '@/types'
import PodcastItem from './PodcastItem'

interface PodcastListProps {
  podcasts: Podcast[]
}

const PodcastList: React.FC<PodcastListProps> = ({ podcasts }) => {
  if (podcasts.length === 0) {
    return (
      <p className="text-gray-600 dark:text-gray-400">No podcasts found.</p>
    )
  }

  return (
    <div className="w-full max-w-4xl">
      {podcasts.map((podcast) => (
        <PodcastItem key={podcast.id} podcast={podcast} />
      ))}
    </div>
  )
}

export default PodcastList
