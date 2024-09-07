'use client'

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
} from 'lucide-react'

export function AppDashboardPage() {
  const weekData = [
    { day: 'Mon', distance: 5.2, duration: '45:30', podcasts: 2, pace: '8:45' },
    { day: 'Tue', distance: 3.8, duration: '32:15', podcasts: 1, pace: '8:30' },
    { day: 'Wed', distance: 6.1, duration: '52:45', podcasts: 3, pace: '8:39' },
    { day: 'Thu', distance: 4.5, duration: '38:20', podcasts: 2, pace: '8:31' },
    { day: 'Fri', distance: 3.2, duration: '28:10', podcasts: 1, pace: '8:48' },
    {
      day: 'Sat',
      distance: 7.5,
      duration: '1:05:00',
      podcasts: 4,
      pace: '8:40',
    },
    { day: 'Sun', distance: 5.0, duration: '43:15', podcasts: 2, pace: '8:39' },
  ]

  const maxDistance = Math.max(...weekData.map((day) => day.distance))

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
            <div className="text-2xl font-bold">45.7 hrs</div>
            <p className="text-xs text-muted-foreground">
              +2.5 hrs from last week
            </p>
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
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+12 from last week</p>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Pace</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8:24 /mi</div>
            <p className="text-xs text-muted-foreground">
              -0:15 from last week
            </p>
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
            <p className="text-xs text-muted-foreground">+5% from last week</p>
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
                      {day.distance} mi
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
