'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, Headphones } from 'lucide-react'

interface Podcast {
  showName: string;
  publisher: string;
  images: { url: string }[];
  showUrl: string;
  episodeName: string;
  episodeUrl: string;
  episodeDuration: number;
  embedUrl: string;
}

export default function RunningPodcastSuggester() {
  const [inputType, setInputType] = useState<'time' | 'distance'>('time')
  const [inputValue, setInputValue] = useState('')
  const [suggestedPodcasts, setSuggestedPodcasts] = useState<Podcast[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    const duration = calculateDuration(inputValue, inputType)

    try {
      const response = await fetch(`/api/spotify?duration=${duration}`)
      if (!response.ok) {
        throw new Error('Failed to fetch podcasts')
      }
      const data = await response.json()
      if (Array.isArray(data)) {
        setSuggestedPodcasts(data)
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (err) {
      setError('An error occurred while fetching podcast suggestions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Find Your Running Podcast</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <p className="text-lg text-center text-muted-foreground">Enter your run details to get podcast suggestions</p>
            </div>
            <RadioGroup 
              defaultValue="time" 
              onValueChange={(value: 'time' | 'distance') => setInputType(value)} 
              className="flex justify-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="time" id="time" />
                <Label htmlFor="time" className="font-medium">Time (minutes)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="distance" id="distance" />
                <Label htmlFor="distance" className="font-medium">Distance (miles)</Label>
              </div>
            </RadioGroup>
            <div className="flex space-x-2">
              <Input 
                type="number" 
                placeholder={inputType === 'time' ? 'Enter minutes' : 'Enter miles'} 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                min="1"
                step={inputType === 'time' ? '1' : '0.1'}
                required
                className="flex-grow text-lg"
              />
              <Button type="submit" disabled={isLoading} className="w-32">
                {isLoading ? 'Loading...' : 'Suggest'}
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
              <h3 className="text-2xl font-semibold text-center mb-6">Suggested Podcasts</h3>
              <div className="space-y-6">
                {suggestedPodcasts.map((podcast, index) => (
                  <div key={index}>
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{podcast.showName}</h4>
                          <p className="text-sm text-muted-foreground">{podcast.publisher}</p>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {Math.round(podcast.episodeDuration / 60000)} min
                        </div>
                      </div>
                      <iframe 
                        src={podcast.embedUrl} 
                        width="100%" 
                        height="152" 
                        frameBorder="0" 
                        allowTransparency={true} 
                        allow="encrypted-media"
                        title={`Spotify embed for ${podcast.episodeName}`}
                      ></iframe>
                    </div>
                    {index < suggestedPodcasts.length - 1 && (
                      <hr className="border-t border-gray-200 my-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}