'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock } from 'lucide-react'
import Image from 'next/image'

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
  thumbnail: string;
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
      return numValue * 60 * 1000
    } else {
      return Math.round(numValue * 10 * 60 * 1000)
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
      console.log("Raw API response:", data);
      if (Array.isArray(data)) {
        const podcasts = data.map(item => ({
          id: item.id || Math.random(),
          title: item.name || item.episodeName,
          published: new Date(item.release_date || item.published || Date.now()),
          description: item.description || '',
          showName: item.show?.name || item.showName,
          publisher: item.show?.publisher || item.publisher,
          episodeDuration: item.duration_ms || item.episodeDuration,
          audio: {
            src: item.audio_preview_url || item.episodeUrl,
            type: 'audio/mpeg',
          },
          thumbnail: item.images?.[0]?.url || item.thumbnailUrl || '/default-podcast-thumbnail.jpg',
        }))
        console.log("Processed podcasts:", podcasts)
        setSuggestedPodcasts(podcasts)
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
    const [isPlaying, setIsPlaying] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null)

    const togglePlay = () => {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch(error => {
            console.error("Error playing audio:", error);
          });
        }
        setIsPlaying(!isPlaying);
      }
    }

    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-16 h-16 relative">
              <Image
                src={episode.thumbnail}
                alt={`${episode.title} thumbnail`}
                width={64}
                height={64}
                className="rounded-md object-cover"
                onError={() => console.error("Image load error for URL:", episode.thumbnail)}
              />
            </div>
            <div className="flex-grow">
              <h2 className="text-lg font-bold text-slate-900">
                {episode.title}
              </h2>
              <p className="text-sm text-slate-500">
                {episode.showName}
              </p>
              <div className="flex items-center mt-2">
                <Clock className="w-4 h-4 mr-1 text-slate-400" />
                <span className="text-sm text-slate-500">
                  {Math.round(episode.episodeDuration / 60000)} min
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={togglePlay}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
          </div>
          <audio 
            ref={audioRef} 
            src={episode.audio.src} 
            preload="metadata"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg border border-gray-200">
      <h1 className="text-3xl font-bold mb-2">Perfect Podcasts for Your Run</h1>
      <p className="text-slate-600 mb-6">
        Find episodes that match your exact running time. No more unfinished stories or awkward pauses.
      </p>
      
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
          />
          <Button 
            type="submit" 
            disabled={isLoading}
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
          <h4 className="text-xl font-semibold mb-4">Suggested Podcasts</h4>
          <div className="space-y-4">
            {suggestedPodcasts.map((podcast) => (
              <EpisodeEntry key={podcast.id} episode={podcast} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}