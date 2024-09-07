'use client'

import React, { useState, useEffect } from 'react'
import { Waveform } from '@/components/Waveform'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AuthModal } from '@/components/AuthModal'
import {
  Clock,
  Loader2,
  UserCircle,
  Home as HomeIcon,
  Settings,
  BarChart,
  Menu,
  X,
} from 'lucide-react'
import { useSession } from '@/components/SessionProvider'
import { supabase } from '@/lib/supabase'
import { AppDashboardPage } from '@/components/app-dashboard-page'

interface Podcast {
  id: string
  title: string
  embedUrl: string
  duration: number
}

export default function Home() {
  const session = useSession()
  const [inputType, setInputType] = useState<'minutes' | 'hours' | 'miles'>(
    'minutes'
  )
  const [inputValue, setInputValue] = useState('')
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Initial check

    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
      const response = await fetch(
        `/api/spotify?duration=${durationInMilliseconds}`
      )
      const data = await response.json()

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const Sidebar = () => (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden ${
          isSidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={toggleSidebar}
      ></div>
      <div
        className={`bg-white dark:bg-gray-900 fixed top-0 left-0 bottom-0 z-50 w-64 transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:h-screen overflow-y-auto`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 lg:hidden"
              onClick={toggleSidebar}
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="flex flex-col items-center mb-8 mt-12 lg:mt-0">
              <UserCircle className="h-20 w-20 text-blue-500 mb-2" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {session?.user?.user_metadata?.name || session?.user?.email}
              </h2>
            </div>
            <nav>
              <ul className="space-y-2">
                <li>
                  <Button variant="ghost" className="w-full justify-start">
                    <HomeIcon className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" className="w-full justify-start">
                    <BarChart className="mr-2 h-4 w-4" />
                    Stats
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800 text-foreground">
      {session && <Sidebar />}
      <div className="flex-grow flex flex-col min-h-screen">
        <header className="w-full relative h-20">
          <div className="absolute inset-0">
            <Waveform className="w-full h-full" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-full px-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {session && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                  onClick={toggleSidebar}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowDashboard(!showDashboard)}
              >
                {showDashboard ? 'Show Podcast Finder' : 'Show Dashboard'}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              {!session && <AuthModal />}
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="flex-grow flex flex-col items-center justify-start p-4 pt-24">
          {showDashboard ? (
            <AppDashboardPage />
          ) : (
            <div className="w-full max-w-3xl space-y-10 px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-center animate-fade-in-down text-gray-900 dark:text-white">
                Perfect Podcasts for{' '}
                <span className="text-blue-500">Your Run</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 text-center">
                Find episodes that match your exact running time. No more
                unfinished stories or awkward pauses.
              </p>
              <Card className="border border-blue-200 dark:border-blue-800 shadow-md bg-white dark:bg-gray-800">
                <CardContent className="p-4 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <RadioGroup
                      defaultValue="minutes"
                      onValueChange={handleTypeChange}
                      className="flex flex-wrap justify-center gap-4"
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
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
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
                        className="bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 w-full sm:w-auto"
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
                  <CardContent className="p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                      Suggested Podcasts
                    </h2>
                    <ScrollArea className="h-[400px] sm:h-[500px]">
                      <div className="space-y-4 sm:space-y-6">
                        {podcasts.map((podcast) => (
                          <div
                            key={podcast.id}
                            className="bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
                          >
                            <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 dark:text-gray-100">
                              {podcast.title}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                              <Clock className="mr-2 h-4 w-4" />
                              {Math.floor(podcast.duration / 60000)} minutes
                            </div>
                            <div className="aspect-w-16 aspect-h-9">
                              <iframe
                                src={podcast.embedUrl}
                                width="100%"
                                height="152"
                                frameBorder="0"
                                allowFullScreen
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                title={`Spotify embed: ${podcast.title}`}
                                className="w-full h-full"
                              ></iframe>
                            </div>
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
          )}
        </main>
        <footer className="p-4 text-center text-sm text-gray-600 dark:text-gray-300">
          © 2024 PodPace. Sync your stride with your stories!
        </footer>
      </div>
    </div>
  )
}
