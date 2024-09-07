import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Podcast {
  id: string
  title: string
  description: string
  duration: number
  episodeUrl: string
  durationDifference: number
}

export default function SimplifiedPodcastRunnerView() {
  const [inputType, setInputType] = useState('minutes')
  const [inputValue, setInputValue] = useState('')
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [targetDuration, setTargetDuration] = useState<number | null>(null)

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

      if (!('targetDuration' in data) || !('podcasts' in data)) {
        throw new Error('Received data is missing expected properties')
      }

      if (typeof data.targetDuration !== 'number') {
        throw new Error('targetDuration is not a number')
      }

      if (!Array.isArray(data.podcasts)) {
        throw new Error('podcasts is not an array')
      }

      setTargetDuration(Math.round(data.targetDuration / 60000))
      setPodcasts(data.podcasts)
    } catch (err) {
      console.error('Spotify API Error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">
          Perfect Podcasts for Your Run
        </CardTitle>
        <CardDescription>
          Find episodes that match your exact running time. No more unfinished
          stories or awkward pauses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {targetDuration && (
          <Alert className="mt-6">
            <AlertDescription>
              Showing podcasts close to your target duration of {targetDuration}{' '}
              minutes
            </AlertDescription>
          </Alert>
        )}

        {podcasts.length > 0 && (
          <div className="mt-8">
            <h4 className="text-xl font-semibold mb-4">Suggested Podcasts</h4>
            <div className="space-y-6">
              {podcasts.map((podcast) => (
                <div key={podcast.id} className="border rounded-md p-4">
                  <h5 className="font-semibold mb-2">{podcast.title}</h5>
                  <p className="text-sm text-gray-600 mb-2">
                    Duration: {Math.round(podcast.duration / 60000)} minutes (
                    {podcast.durationDifference > 0 ? '+' : ''}
                    {Math.round(podcast.durationDifference / 60000)} minutes
                    from target)
                  </p>
                  <iframe
                    src={`https://open.spotify.com/embed/episode/${podcast.id}`}
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
          <p className="text-center mt-4 text-muted-foreground">
            No podcasts found. Try adjusting your search.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
