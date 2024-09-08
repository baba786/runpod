'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Headphones,
  Play,
  Radio,
  Activity,
  BarChart2,
  Zap,
  Heart,
  Loader2,
} from 'lucide-react'
import { AuthModal } from '@/components/AuthModal'
import { useSession } from '@/components/SessionProvider'

interface ProgressData {
  day: string
  distance: number
  duration: string
  podcasts: number
  pace: string
}

export function AppDashboardPage() {
  const { session, user, isLoading } = useSession()
  const [weekData, setWeekData] = useState<ProgressData[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalRunTime, setTotalRunTime] = useState(0)
  const [totalPodcasts, setTotalPodcasts] = useState(0)
  const [avgPace, setAvgPace] = useState('')

  const fetchUserProgress = useCallback(async () => {
    setIsDataLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/user-progress', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      const processedData: ProgressData[] = data.map((item: any) => ({
        day: new Date(item.date).toLocaleString('en-US', { weekday: 'short' }),
        distance: item.distance || 0, // Assuming distance is not logged yet
        duration: formatDuration(item.duration),
        podcasts: 1, // Each entry represents one podcast session
        pace: '0:00', // Placeholder as we don't have distance data yet
      }))

      setWeekData(processedData)

      const totalTime = data.reduce(
        (acc: number, curr: any) => acc + curr.duration,
        0
      )
      const totalPods = data.length

      setTotalRunTime(totalTime)
      setTotalPodcasts(totalPods)
      setAvgPace('N/A')
    } catch (err) {
      console.error('Error fetching user progress:', err)
      setError('Failed to fetch user progress')
    } finally {
      setIsDataLoading(false)
    }
  }, [session]) // Added session as a dependency

  useEffect(() => {
    if (!isLoading && session) {
      fetchUserProgress()
    }
  }, [isLoading, session, fetchUserProgress])

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`
  }

  if (isLoading || isDataLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center mt-8">
        <p className="text-red-500">Please log in to view your dashboard</p>
        <AuthModal onAuthSuccess={() => setError(null)} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center mt-8">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchUserProgress} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  const maxDistance = Math.max(
    ...weekData.map((day: ProgressData) => day.distance)
  ) // Added type annotation for day

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Run Time
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(totalRunTime)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Podcasts Listened
            </CardTitle>
            <Headphones className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weekData.reduce((total, day) => total + (day.podcasts || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Pace</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPace} /mi</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Motivation Score
            </CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
                Weekly Progress
              </span>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {weekData.map((day) => (
                <div key={day.day} className="relative">
                  <div className="flex items-center mb-2">
                    <div className="w-12 text-sm font-medium">{day.day}</div>
                    <div
                      className="h-4 bg-blue-500 rounded"
                      style={{
                        width: `${(day.distance / maxDistance) * 100}%`,
                      }}
                    ></div>
                    <div className="ml-2 text-sm font-medium">
                      {day.distance.toFixed(1)} mi
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center text-xs text-muted-foreground space-x-4 ml-12">
                    <div className="flex items-center">
                      <Zap className="h-3 w-3 mr-1" />
                      {day.pace}/mi
                    </div>
                    <div className="flex items-center">
                      <Headphones className="h-3 w-3 mr-1" />
                      {day.podcasts} podcasts
                    </div>
                    <div>{day.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Radio className="h-5 w-5 mr-2 text-green-500" />
              Recommended Podcasts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                'Run with Hal',
                'The Running Podcast',
                'Marathon Training Academy',
              ].map((podcast, index) => (
                <div
                  key={podcast}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Headphones className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div className="flex-1 text-sm">{podcast}</div>
                  <div className="text-xs text-muted-foreground mr-2">
                    {['45:30', '32:15', '52:45'][index]}
                  </div>
                  <Button size="sm" variant="outline" className="ml-2">
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-8 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Play className="h-5 w-5 mr-2 text-blue-500" />
              My Playlists
            </span>
            <Button variant="outline" size="sm">
              New Playlist
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="long-run" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="long-run">Long Run</TabsTrigger>
              <TabsTrigger value="speed-work">Speed Work</TabsTrigger>
              <TabsTrigger value="recovery">Recovery</TabsTrigger>
            </TabsList>
            {['long-run', 'speed-work', 'recovery'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {[
                  {
                    title: 'The Joe Rogan Experience #1234',
                    duration: '2:15:30',
                  },
                  {
                    title: 'Hardcore History: Blueprint for Armageddon I',
                    duration: '3:07:20',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Play className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div className="flex-1">{item.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.duration}
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
