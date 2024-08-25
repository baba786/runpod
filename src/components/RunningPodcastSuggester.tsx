'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"

interface Podcast {
  title: string;
  duration: number;
}

const podcasts: Podcast[] = [
  { title: "Running Stories", duration: 20 },
  { title: "Tech Talk", duration: 30 },
  { title: "Science Hour", duration: 60 },
  { title: "History Unveiled", duration: 45 },
  { title: "Comedy Corner", duration: 15 },
  { title: "Music Musings", duration: 25 },
  { title: "Sports Recap", duration: 40 },
  { title: "Nature Narratives", duration: 35 },
]

export default function RunningPodcastSuggester() {
  const [inputType, setInputType] = useState<'time' | 'distance'>('time')
  const [inputValue, setInputValue] = useState('')
  const [suggestedPodcast, setSuggestedPodcast] = useState<Podcast | null>(null)

  const calculateDuration = (value: string, type: 'time' | 'distance'): number => {
    const numValue = parseFloat(value)
    if (type === 'time') {
      return numValue
    } else {
      return Math.round(numValue * 10)
    }
  }

  const suggestPodcast = (duration: number) => {
    const closestPodcast = podcasts.reduce((prev, curr) => 
      Math.abs(curr.duration - duration) < Math.abs(prev.duration - duration) ? curr : prev
    )
    setSuggestedPodcast(closestPodcast)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const duration = calculateDuration(inputValue, inputType)
    suggestPodcast(duration)
  }

  return (
    <div className="flex justify-center w-full">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-center">Find Your Running Podcast</h2>
              <p className="text-sm text-muted-foreground text-center">Enter your run details to get a podcast suggestion</p>
            </div>
            <RadioGroup 
              defaultValue="time" 
              onValueChange={(value: 'time' | 'distance') => setInputType(value)} 
              className="flex justify-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="time" id="time" />
                <Label htmlFor="time">Time (minutes)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="distance" id="distance" />
                <Label htmlFor="distance">Distance (miles)</Label>
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
                className="flex-grow"
              />
              <Button type="submit">Suggest</Button>
            </div>
          </form>
          {suggestedPodcast && (
            <div className="mt-6 p-4 bg-secondary rounded-md text-center">
              <p className="font-semibold">Suggested Podcast:</p>
              <p>{suggestedPodcast.title} ({suggestedPodcast.duration} min)</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}