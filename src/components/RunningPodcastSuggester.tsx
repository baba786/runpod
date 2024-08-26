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
        setSuggestedPodcasts(data)
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (err) {
      setError(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold">Run & Listen</CardTitle>
          <p className="text-base md:text-lg text-muted-foreground mt-2">
            Find podcasts that match your run duration
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <p className="text-lg font-medium">How long will you run?</p>
          </div>
          <RadioGroup 
            defaultValue="time" 
            onValueChange={(value: 'time' | 'distance') => setInputType(value)} 
            className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="time" id="time" />
              <Label htmlFor="time" className="font-medium">Time</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="distance" id="distance" />
              <Label htmlFor="distance" className="font-medium">Distance</Label>
            </div>
          </RadioGroup>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Input 
              type="number" 
              placeholder={inputType === 'time' ? 'Enter minutes' : 'Enter miles'} 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              min="1"
              step={inputType === 'time' ? '1' : '0.1'}
              required
              className="text-base md:text-lg flex-grow"
              aria-label={inputType === 'time' ? 'Enter run duration in minutes' : 'Enter run distance in miles'}
            />
            <Button 
              type="submit" 
              disabled={isLoading} 
              className={`w-full sm:w-auto ${isLoading ? 'bg-gray-400 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Finding...' : 'Find Matching Podcasts'}
            </Button>
          </div>
          {error && (
            <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-md text-center" role="alert">
              {error}
            </div>
          )}
          {suggestedPodcasts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl md:text-2xl font-semibold mb-6">Suggested Podcasts</h3>
              <div className="space-y-6">
                {suggestedPodcasts.map((podcast, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-base md:text-lg">{podcast.showName}</h4>
                          <p className="text-sm text-muted-foreground flex items-center flex-wrap">
                            <span className="mr-2">{podcast.publisher}</span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {Math.round(podcast.episodeDuration / 60000)} min
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="aspect-w-16 aspect-h-9">
                        <iframe 
                          src={podcast.embedUrl} 
                          width="100%" 
                          height="152" 
                          frameBorder="0" 
                          allowTransparency={true} 
                          allow="encrypted-media"
                          title={`Spotify embed for ${podcast.episodeName}`}
                          className="w-full"
                        ></iframe>
                      </div>
                    </div>
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