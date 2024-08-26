'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, Headphones } from 'lucide-react'
import Link from 'next/link'

interface Podcast {
  id: number;
  title: string;
  published: Date;
  description: string;
  showName: string;
  publisher: string;
  episodeDuration: number;
  audio: {
    src: string;
    type: string;
  };
}

export default function RunningPodcastSuggester() {
  const [inputType, setInputType] = useState<'time' | 'distance'>('time')
  const [inputValue, setInputValue] = useState('')
  const [suggestedPodcasts, setSuggestedPodcasts] = useState<Podcast[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const calculateDuration = (value: string, type: 'time' | 'distance'): number => {
    const numValue = parseFloat(value)
    if (type === 'time') {
      return numValue * 60 * 1000 // Convert minutes to milliseconds
    } else {
      // Assuming average running pace of 10 minutes per mile
      return Math.round(numValue * 10 * 60 * 1000) // Convert miles to milliseconds
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setIsSubmitted(true)

    const duration = calculateDuration(inputValue, inputType)

    try {
      const response = await fetch(`/api/spotify?duration=${duration}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (Array.isArray(data)) {
        setSuggestedPodcasts(data.map(item => ({
          id: item.id || Math.random(),
          title: item.episodeName,
          published: new Date(item.published || Date.now()),
          description: item.description || '',
          showName: item.showName,
          publisher: item.publisher,
          episodeDuration: item.episodeDuration,
          audio: {
            src: item.episodeUrl,
            type: 'audio/mpeg',
          }
        })))
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (err) {
      setError(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  function EpisodeEntry({ episode }: { episode: Podcast }) {
    return (
      <article className="py-10 sm:py-12">
        <div className="flex flex-col items-start">
          <h2 className="mt-2 text-lg font-bold text-slate-900">
            <Link href={episode.audio.src}>{episode.title}</Link>
          </h2>
          <time
            dateTime={episode.published.toISOString()}
            className="order-first font-mono text-sm leading-7 text-slate-500"
          >
            {episode.published.toLocaleDateString()}
          </time>
          <p className="mt-1 text-base leading-7 text-slate-700">
            {episode.showName} • {episode.publisher}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm font-bold leading-6 text-pink-500">
              <Clock className="inline-block w-4 h-4 mr-1" />
              {Math.round(episode.episodeDuration / 60000)} min
            </span>
            <span
              aria-hidden="true"
              className="text-sm font-bold text-slate-400"
            >
              /
            </span>
            <Link
              href={episode.audio.src}
              className="flex items-center text-sm font-bold leading-6 text-pink-500 hover:text-pink-700 active:text-pink-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              Listen
            </Link>
          </div>
        </div>
      </article>
    )
  }

  return (
    <section className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center space-x-4">
          <RadioGroup 
            defaultValue="time" 
            onValueChange={(value: 'time' | 'distance') => setInputType(value)} 
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="time" id="time" />
              <Label htmlFor="time" className="font-medium">Minutes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="distance" id="distance" />
              <Label htmlFor="distance" className="font-medium">Miles</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex space-x-4">
          <Input 
            type="number" 
            placeholder={inputType === 'time' ? 'Enter minutes' : 'Enter miles'} 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            min="1"
            step={inputType === 'time' ? '1' : '0.1'}
            required
            className="text-lg flex-grow"
            aria-label={inputType === 'time' ? 'Run duration in minutes' : 'Run distance in miles'}
          />
          <Button 
            type="submit" 
            disabled={isLoading} 
            className={`w-auto ${isLoading ? 'bg-gray-400 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Finding...' : 'Find Podcasts'}
          </Button>
        </div>
      </form>
      
      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-md text-center" role="alert">
          {error}
        </div>
      )}
      
      {suggestedPodcasts.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold mb-4">Suggested Podcasts</h4>
          <div className="divide-y divide-slate-100">
            {suggestedPodcasts.map((podcast) => (
              <EpisodeEntry key={podcast.id} episode={podcast} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}