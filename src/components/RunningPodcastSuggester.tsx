'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Podcast {
  id: string
  title: string
  embedUrl: string
}

export default function RunningPodcastSuggester() {
  const [inputType, setInputType] = useState('minutes')
  const [inputValue, setInputValue] = useState('')
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleTypeChange = (value: string) => {
    setInputType(value)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const durationValue = parseFloat(inputValue)
    const durationInMilliseconds = inputType === 'miles'
      ? durationValue * 10 * 60 * 1000  // Assuming 10 minutes per mile
      : durationValue * (inputType === 'minutes' ? 60 * 1000 : 60 * 60 * 1000)

    try {
      const response = await fetch(`/api/spotify?duration=${durationInMilliseconds}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch podcasts')
      }

      setPodcasts(data.map((podcast: any) => ({
        id: podcast.id,
        title: podcast.title,
        embedUrl: `https://open.spotify.com/embed/episode/${podcast.id}`
      })))
    } catch (err) {
      console.error("Spotify API Error:", err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Perfect Podcasts for Your Run</CardTitle>
        <CardDescription>
          Find episodes that match your exact running time. No more unfinished stories or awkward pauses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup defaultValue="minutes" onValueChange={handleTypeChange} className="flex justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="minutes" id="minutes" />
              <Label htmlFor="minutes">Minutes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hours" id="hours" />
              <Label htmlFor="hours">Hours</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="miles" id="miles" />
              <Label htmlFor="miles">Miles</Label>
            </div>
          </RadioGroup>
          <div className="flex space-x-4">
            <Input 
              type="number" 
              placeholder={`Enter ${inputType}`}
              value={inputValue}
              onChange={handleInputChange}
              min="1"
              step="1"
              required
              className="text-lg flex-grow"
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary text-primary-foreground"
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

        {podcasts.length > 0 && (
          <div className="mt-8">
            <h4 className="text-xl font-semibold mb-4">Suggested Podcasts</h4>
            <div className="space-y-6">
              {podcasts.map((podcast) => (
                <div key={podcast.id} className="border rounded-md p-4">
                  <h5 className="font-semibold mb-2">{podcast.title}</h5>
                  <iframe
                    src={podcast.embedUrl}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  ></iframe>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && <p className="text-center mt-4">Loading...</p>}
        {!isLoading && podcasts.length === 0 && !error && (
          <p className="text-center mt-4 text-muted-foreground">No podcasts found. Try adjusting your search.</p>
        )}
      </CardContent>
    </Card>
  )
}