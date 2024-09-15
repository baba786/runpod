// src/app/podcast/[id]/PodcastClient.tsx

'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Clock, MapPin, ArrowLeft } from 'lucide-react'
import { Podcast } from '@/types'
import { useRouter } from 'next/navigation'
import { useSession } from '@/components/SessionProvider' // Adjust the import path if necessary

export default function PodcastClient({
  podcast,
  inputType,
  inputValue,
}: {
  podcast: Podcast
  inputType?: string
  inputValue?: string
}) {
  const router = useRouter()
  const { session } = useSession() // Use your existing useSession hook
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [runGoal, setRunGoal] = useState<number>(0)
  const [distance, setDistance] = useState<number>(0) // For distance tracking

  useEffect(() => {
    // Calculate run goal based on input
    let value = parseFloat(inputValue || '0')
    if (isNaN(value) || value <= 0) {
      value = 3600 // Default to 1 hour if invalid input
    } else {
      if (inputType === 'hours') {
        value = value * 3600
      } else if (inputType === 'minutes') {
        value = value * 60
      } else if (inputType === 'miles') {
        const minutesPerMile = 10 // Adjust as needed
        value = value * minutesPerMile * 60
        setDistance(parseFloat(inputValue || '0')) // Ensure inputValue is a string
      }
    }
    setRunGoal(value)
  }, [inputType, inputValue])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const handleStartRun = async () => {
    setIsRunning(true)
    // Record podcast listen if the user is signed in
    if (session) {
      try {
        const durationInSeconds = runGoal // Total duration in seconds
        await fetch('/api/user-progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            date: new Date().toISOString().split('T')[0], // Use YYYY-MM-DD format
            distance: distance || 0,
            duration: durationInSeconds,
          }),
        })
      } catch (error) {
        console.error('Error recording podcast listen:', error)
      }
    }
  }

  const handlePauseRun = () => {
    setIsRunning(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  const getRunProgressPercentage = () => {
    return Math.min((elapsedTime / runGoal) * 100, 100)
  }

  return (
    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 min-h-screen p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Back Navigation */}
        <div className="p-4">
          <button
            className="flex items-center text-indigo-600 hover:text-indigo-800"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2" size={20} />
            Back
          </button>
        </div>
        {/* Podcast Section */}
        <div className="relative">
          {podcast.imageUrl && (
            <Image
              src={podcast.imageUrl}
              alt={podcast.title}
              width={400}
              height={400}
              className="w-full h-64 object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
            <h2 className="text-2xl font-bold text-white mb-1">
              {podcast.title}
            </h2>
            <p className="text-sm text-gray-300">
              Released on {podcast.releaseDate}
            </p>
          </div>
        </div>
        {/* Spotify Embed Player */}
        <div className="p-6">
          <iframe
            src={`https://open.spotify.com/embed/episode/${podcast.id}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="rounded-lg"
          ></iframe>
        </div>

        {/* Running Section */}
        <div className="bg-gray-50 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Clock className="text-indigo-600 mr-2" size={20} />
              <span className="text-2xl font-semibold text-gray-800">
                {formatTime(elapsedTime)}
              </span>
            </div>
            <div className="flex items-center">
              <MapPin className="text-indigo-600 mr-2" size={20} />
              <span className="text-2xl font-semibold text-gray-800">
                {inputType === 'miles'
                  ? `${inputValue} miles`
                  : formatTime(runGoal)}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${getRunProgressPercentage()}%` }}
            ></div>
          </div>
          <button
            className={`w-full py-3 rounded-lg text-lg font-semibold text-white transition-colors ${
              isRunning
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
            onClick={isRunning ? handlePauseRun : handleStartRun}
          >
            {isRunning ? 'Pause Run' : 'Start Run'}
          </button>
        </div>
      </div>
    </div>
  )
}
