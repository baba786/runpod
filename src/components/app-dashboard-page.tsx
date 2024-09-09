'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Headphones,
  Play,
  Radio,
  BarChart2,
  Zap,
  Heart,
  Loader2,
} from 'lucide-react'
import { AuthModal } from '@/components/AuthModal'
import { useSession } from '@/components/SessionProvider'

interface ProgressData {
  day: string
  podcasts: number
}

export function AppDashboardPage() {
  const { session, user, isLoading } = useSession()
  const [weekData, setWeekData] = useState<ProgressData[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPodcasts, setTotalPodcasts] = useState(0)
  const [avgPodcastsPerDay, setAvgPodcastsPerDay] = useState(0)

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
        podcasts: item.podcasts || 0,
      }))

      setWeekData(processedData)

      const totalPods = processedData.reduce(
        (acc, curr) => acc + curr.podcasts,
        0
      )
      setTotalPodcasts(totalPods)
      setAvgPodcastsPerDay(totalPods / processedData.length)
    } catch (err) {
      console.error('Error fetching user progress:', err)
      setError('Failed to fetch user progress')
    } finally {
      setIsDataLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (!isLoading && session) {
      fetchUserProgress()
    }
  }, [isLoading, session, fetchUserProgress])

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

  const cardColors = [
    'bg-gradient-to-br from-green-400 to-green-600',
    'bg-gradient-to-br from-blue-400 to-blue-600',
    'bg-gradient-to-br from-yellow-400 to-yellow-600',
    'bg-gradient-to-br from-red-400 to-red-600',
  ]

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 min-h-screen py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Podcast Dashboard
      </h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Total Podcasts Listened',
            value: totalPodcasts,
            icon: Headphones,
          },
          {
            title: 'Avg. Podcasts per Day',
            value: avgPodcastsPerDay.toFixed(1),
            icon: BarChart2,
          },
          { title: 'Streak', value: '5 days', icon: Zap },
          { title: 'Listening Score', value: '85%', icon: Heart },
        ].map((item, index) => (
          <Card
            key={item.title}
            className={`${cardColors[index]} text-white shadow-lg`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
                Weekly Podcast Progress
              </span>
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
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
                      className="h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded"
                      style={{
                        width: `${(day.podcasts / Math.max(...weekData.map((d) => d.podcasts))) * 100}%`,
                      }}
                    ></div>
                    <div className="ml-2 text-sm font-medium">
                      {day.podcasts} podcasts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 shadow-xl">
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
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <Headphones className="h-4 w-4 mr-2 text-green-500" />
                  <div className="flex-1 text-sm">{podcast}</div>
                  <div className="text-xs text-muted-foreground mr-2">
                    {['45:30', '32:15', '52:45'][index]}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2 bg-green-500 text-white hover:bg-green-600"
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-8 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Play className="h-5 w-5 mr-2 text-purple-500" />
              My Playlists
            </span>
            <Button
              variant="outline"
              size="sm"
              className="bg-purple-500 text-white hover:bg-purple-600"
            >
              New Playlist
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="long-run" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger
                value="long-run"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                Long Run
              </TabsTrigger>
              <TabsTrigger
                value="speed-work"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                Speed Work
              </TabsTrigger>
              <TabsTrigger
                value="recovery"
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                Recovery
              </TabsTrigger>
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
                    className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <Play className="h-4 w-4 mr-2 text-purple-500" />
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
