'use client'

import { useState } from 'react'
import { Waveform } from '@/components/Waveform'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock } from 'lucide-react'

interface Podcast {
  id: string
  title: string
  embedUrl: string
  duration: number
}

export default function Home() {
  const [inputType, setInputType] = useState('minutes')
  const [inputValue, setInputValue] = useState('')
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

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
    setHasSearched(true)

    const durationValue = parseFloat(inputValue)
    const durationInMilliseconds = inputType === 'miles'
      ? durationValue * 10 * 60 * 1000  // Assuming 10 minutes per mile
      : durationValue * (inputType === 'minutes' ? 60 * 1000 : 60 * 60 * 1000)
      console.log(`Requesting podcasts for duration: ${durationInMilliseconds} ms`)

    try {
      const response = await fetch(`/api/spotify?duration=${durationInMilliseconds}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch podcasts')
      }

      setPodcasts(data.map((podcast: any) => ({
        id: podcast.id,
        title: podcast.title,
        embedUrl: `https://open.spotify.com/embed/episode/${podcast.id}`,
        duration: podcast.duration
      })))
    } catch (err) {
      console.error("Spotify API Error:", err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen bg-white">
      <Waveform className="absolute left-0 top-0 h-20 w-full" />
      <div className="container mx-auto px-4 py-16 flex flex-col items-center relative z-10">
        <h1 className="text-5xl font-bold mb-6 text-center text-slate-900">
          Perfect Podcasts for <span className="text-blue-600">Your Run</span>
        </h1>
        <p className="text-xl mb-10 text-center text-slate-700 max-w-2xl">
          Find episodes that match your exact running time. No more unfinished stories or awkward pauses.
        </p>
        
        <Card className="w-full max-w-3xl">
          <CardContent className="p-6">
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
                  className="bg-blue-400 text-white hover:bg-blue-500"
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
                <h2 className="text-2xl font-semibold mb-4">Suggested Podcasts</h2>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-6">
                    {podcasts.map((podcast) => (
                      <div key={podcast.id} className="bg-gray-50 rounded-lg shadow-md p-4">
                        <h3 className="font-semibold text-lg mb-2">{podcast.title}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
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
                        ></iframe>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {isLoading && <p className="text-center mt-4">Loading...</p>}
            {hasSearched && !isLoading && podcasts.length === 0 && !error && (
              <p className="text-center mt-4 text-slate-600">No podcasts found. Try adjusting your search.</p>
            )}
          </CardContent>
        </Card>
        
        <footer className="mt-16 text-center text-slate-500">
          <p>&copy; 2024 PodPace. Sync your stride with your stories!</p>
        </footer>
      </div>
    </main>
  )
}