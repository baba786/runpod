// src/components/AppDashboardPage.tsx

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
  MapPin,
  Clock,
} from 'lucide-react'
import { AuthModal } from '@/components/AuthModal'
import { useSession } from '@/components/SessionProvider'

interface ProgressData {
  day: string
  podcasts: number
  distance: number
  duration: number
}

export function AppDashboardPage() {
  const { session, user, isLoading } = useSession()
  const [weekData, setWeekData] = useState<ProgressData[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPodcasts, setTotalPodcasts] = useState(0)
  const [avgPodcastsPerDay, setAvgPodcastsPerDay] = useState(0)
  const [totalDistance, setTotalDistance] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)

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
        distance: item.distance || 0,
        duration: item.duration || 0,
      }))

      setWeekData(processedData)

      const totalPods = processedData.reduce(
        (acc, curr) => acc + curr.podcasts,
        0
      )
      setTotalPodcasts(totalPods)
      setAvgPodcastsPerDay(totalPods / processedData.length)

      const totalDist = processedData.reduce(
        (acc, curr) => acc + curr.distance,
        0
      )
      const totalDur = processedData.reduce(
        (acc, curr) => acc + curr.duration,
        0
      )
      setTotalDistance(totalDist)
      setTotalDuration(totalDur)
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
        <AuthModal />
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

  const maxPodcasts = Math.max(...weekData.map((day) => day.podcasts), 1)
  const maxDistance = Math.max(...weekData.map((day) => day.distance), 1)
  const maxDuration = Math.max(...weekData.map((day) => day.duration), 1)

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Running Dashboard</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Podcasts Listened
            </CardTitle>
            <Headphones className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPodcasts}</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Distance Run
            </CardTitle>
            <MapPin className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDistance.toFixed(2)} miles
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Duration
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(totalDuration / 3600)}h{' '}
              {Math.floor((totalDuration % 3600) / 60)}m
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Podcasts per Day
            </CardTitle>
            <BarChart2 className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgPodcastsPerDay.toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
                Weekly Podcast Progress
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weekData.map((day) => (
                <div key={day.day} className="relative">
                  <div className="flex items-center mb-2">
                    <div className="w-12 text-sm font-medium">{day.day}</div>
                    <div
                      className="h-4 bg-blue-500 rounded"
                      style={{
                        width: `${(day.podcasts / maxPodcasts) * 100}%`,
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

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-500" />
                Weekly Distance Progress
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weekData.map((day) => (
                <div key={day.day} className="relative">
                  <div className="flex items-center mb-2">
                    <div className="w-12 text-sm font-medium">{day.day}</div>
                    <div
                      className="h-4 bg-green-500 rounded"
                      style={{
                        width: `${(day.distance / maxDistance) * 100}%`,
                      }}
                    ></div>
                    <div className="ml-2 text-sm font-medium">
                      {day.distance.toFixed(2)} miles
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-yellow-500" />
                Weekly Duration Progress
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weekData.map((day) => (
                <div key={day.day} className="relative">
                  <div className="flex items-center mb-2">
                    <div className="w-12 text-sm font-medium">{day.day}</div>
                    <div
                      className="h-4 bg-yellow-500 rounded"
                      style={{
                        width: `${(day.duration / maxDuration) * 100}%`,
                      }}
                    ></div>
                    <div className="ml-2 text-sm font-medium">
                      {Math.floor(day.duration / 3600)}h{' '}
                      {Math.floor((day.duration % 3600) / 60)}m
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Radio className="h-5 w-5 mr-2 text-purple-500" />
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
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100"
                >
                  <Headphones className="h-4 w-4 mr-2 text-gray-500" />
                  <div className="flex-1 text-sm">{podcast}</div>
                  <div className="text-xs text-gray-500 mr-2">
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

      <Card className="mt-8 bg-white shadow-lg">
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
                    className="flex items-center p-2 rounded-lg hover:bg-gray-100"
                  >
                    <Play className="h-4 w-4 mr-2 text-gray-500" />
                    <div className="flex-1">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.duration}</div>
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
