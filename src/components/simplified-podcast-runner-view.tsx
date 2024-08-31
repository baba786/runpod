'use client'

import React, { useState, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Clock, MapPin, Flag } from "lucide-react"

type Podcast = {
  id: string
  title: string
  host: string
  imageUrl: string
  duration: number
}

type RunGoal = {
  type: 'time' | 'distance'
  value: number
}

const samplePodcast: Podcast = {
  id: '1',
  title: 'The Runner\'s High',
  host: 'Sarah Johnson',
  imageUrl: '/placeholder.svg?height=300&width=300',
  duration: 1800 // 30 minutes in seconds
}

export function SimplifiedPodcastRunnerView() {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [podcast] = useState<Podcast>(samplePodcast)
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false)
  const [podcastProgress, setPodcastProgress] = useState(0)
  const [runGoal] = useState<RunGoal>({ type: 'time', value: 1800 }) // 30 minutes in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPodcastPlaying) {
      interval = setInterval(() => {
        setPodcastProgress(prev => Math.min(prev + 1, podcast.duration))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPodcastPlaying, podcast.duration])

  const toggleRunning = () => {
    setIsRunning(!isRunning)
    setIsPodcastPlaying(!isRunning)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    if (runGoal.type === 'time') {
      return (elapsedTime / runGoal.value) * 100
    } else {
      // For distance goals, we'll use time as a proxy (assuming a constant pace)
      return (elapsedTime / (runGoal.value * 60 * 5)) * 100 // Assuming 5 min/km pace
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
        {/* Podcast Section (2/3 of the screen) */}
        <div className="h-[calc(66.666vh-2rem)]">
          <img 
            src={podcast.imageUrl} 
            alt={podcast.title} 
            className="w-full h-1/2 object-cover"
          />
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-2">{podcast.title}</h2>
            <p className="text-gray-600 mb-4">Hosted by {podcast.host}</p>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">{formatTime(podcastProgress)}</span>
              <span className="text-sm text-gray-500">{formatTime(podcast.duration)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(podcastProgress / podcast.duration) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-center space-x-4">
              <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                <SkipBack size={24} />
              </button>
              <button 
                className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={toggleRunning}
              >
                {isPodcastPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                <SkipForward size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Running Section (1/3 of the screen) */}
        <div className="h-[calc(33.333vh-1rem)] bg-gray-800 text-white p-4">
          <h3 className="text-xl font-semibold mb-4">Run in Progress</h3>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Clock className="mr-2" size={20} />
              <span className="text-2xl font-bold">{formatTime(elapsedTime)}</span>
            </div>
            <div className="flex items-center">
              <Flag className="mr-2" size={20} />
              <span className="text-2xl font-bold">
                {runGoal.type === 'time' 
                  ? formatTime(runGoal.value)
                  : `${runGoal.value} km`}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
            <div 
              className="bg-green-500 h-4 rounded-full"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <button 
            className={`w-full py-3 rounded-lg text-lg font-semibold ${
              isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
            onClick={toggleRunning}
          >
            {isRunning ? 'Stop Run' : 'Start Run'}
          </button>
        </div>
      </div>
    </div>
  )
}