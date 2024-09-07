'use client'

import React, { useState } from 'react'
import { Waveform } from '@/components/Waveform'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AuthModal } from '@/components/AuthModal'
import { Clock, Loader2 } from 'lucide-react'

interface Podcast {
  id: string
  title: string
  embedUrl: string
  duration: number
}

export default function Home() {
  const [inputType, setInputType] = useState<'minutes' | 'hours' | 'miles'>(
    'minutes'
  )
  const [inputValue, setInputValue] = useState('')
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleTypeChange = (value: 'minutes' | 'hours' | 'miles') => {
    setInputType(value)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    const durationValue = parseFloat(inputValue)
    const durationInMilliseconds =
      inputType === 'miles'
        ? durationValue * 10 * 60 * 1000 // Assuming 10 minutes per mile
        : durationValue * (inputType === 'minutes' ? 60 * 1000 : 60 * 60 * 1000)

    try {
      console.log('Fetching data from Spotify API...')
      const response = await fetch(
        `/api/spotify?duration=${durationInMilliseconds}`
      )
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Received data:', JSON.stringify(data, null, 2))

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (typeof data !== 'object' || data === null) {
        throw new Error('Received data is not an object')
      }

      if (!('podcasts' in data) || !Array.isArray(data.podcasts)) {
        throw new Error('Received data does not contain a podcasts array')
      }

      setPodcasts(
        data.podcasts.map((podcast: any) => ({
          id: podcast.id,
          title: podcast.title,
          embedUrl: `https://open.spotify.com/embed/episode/${podcast.id}`,
          duration: podcast.duration,
        }))
      )
    } catch (err) {
      console.error('Spotify API Error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800 text-foreground">
      <header className="w-full relative">
        <Waveform className="w-full h-20" />
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <AuthModal />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-start p-4 pt-24">
        <div className="max-w-3xl w-full space-y-10">
          <h1 className="text-5xl font-bold text-center animate-fade-in-down text-gray-900 dark:text-white">
            Perfect Podcasts for <span className="text-blue-500">Your Run</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 text-center">
            Find episodes that match your exact running time. No more unfinished
            stories or awkward pauses.
          </p>
          <Card className="border border-blue-200 dark:border-blue-800 shadow-md bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <RadioGroup
                  defaultValue="minutes"
                  onValueChange={handleTypeChange}
                  className="flex justify-center space-x-4"
                >
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
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder={`Enter ${inputType}`}
                    value={inputValue}
                    onChange={handleInputChange}
                    min="1"
                    step="1"
                    required
                    className="flex-grow"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Finding...
                      </>
                    ) : (
                      'Find Podcasts'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {error && (
            <div
              className="p-4 bg-destructive/10 text-destructive rounded-md text-center"
              role="alert"
            >
              {error}
            </div>
          )}

          {podcasts.length > 0 && (
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Suggested Podcasts
                </h2>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-6">
                    {podcasts.map((podcast) => (
                      <div
                        key={podcast.id}
                        className="bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
                      >
                        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                          {podcast.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                          <Clock className="mr-2 h-4 w-4" />
                          {Math.floor(podcast.duration / 60000)} minutes
                        </div>
                        <iframe
                          src={podcast.embedUrl}
                          width="100%"
                          height="152"
                          frameBorder="0"
                          allowFullScreen
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          title={`Spotify embed: ${podcast.title}`}
                        ></iframe>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {hasSearched && !isLoading && podcasts.length === 0 && !error && (
            <p className="text-center mt-4 text-gray-600 dark:text-gray-300">
              No podcasts found. Try adjusting your search.
            </p>
          )}
        </div>
      </main>
      <footer className="p-4 text-center text-sm text-gray-600 dark:text-gray-300">
        © 2024 PodPace. Sync your stride with your stories!
      </footer>
    </div>
  )
}
