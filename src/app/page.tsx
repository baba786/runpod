// src/app/page.tsx

'use client'

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  FormEvent,
  ChangeEvent,
} from 'react'
import { Waveform } from '@/components/Waveform'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AuthModal } from '@/components/AuthModal'
import { AppDashboardPage } from '@/components/app-dashboard-page'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSession } from '@/components/SessionProvider'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { Podcast } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { session, user, isLoading } = useSession()
  const router = useRouter()
  const [inputType, setInputType] = useState<'minutes' | 'hours' | 'miles'>(
    'minutes'
  )
  const [inputValue, setInputValue] = useState('')
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [isLoadingPodcasts, setIsLoadingPodcasts] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  )
  const [activeView, setActiveView] = useState<'search' | 'dashboard'>('search')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsSidebarOpen(true)
    }
  }, [])

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleTypeChange = useCallback(
    (value: 'minutes' | 'hours' | 'miles') => {
      setInputType(value)
      if (inputRef.current) {
        inputRef.current.focus()
      }
    },
    []
  )

  // Move removeDuplicates outside of handleSubmit
  const removeDuplicates = (podcasts: Podcast[]) => {
    const uniquePodcastsMap = new Map()
    podcasts.forEach((podcast) => {
      uniquePodcastsMap.set(podcast.id, podcast)
    })
    return Array.from(uniquePodcastsMap.values())
  }

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setIsLoadingPodcasts(true)
      setError(null)
      setHasSearched(true)
      setPodcasts([]) // Reset podcasts state before fetching new data

      const durationValue = parseFloat(inputValue)
      if (isNaN(durationValue) || durationValue <= 0) {
        setError('Please enter a valid number greater than zero.')
        setIsLoadingPodcasts(false)
        return
      }

      let durationInMilliseconds

      if (inputType === 'minutes') {
        durationInMilliseconds = durationValue * 60 * 1000
      } else if (inputType === 'hours') {
        durationInMilliseconds = durationValue * 60 * 60 * 1000
      } else if (inputType === 'miles') {
        const minutesPerMile = 10 // Adjust as needed
        durationInMilliseconds = durationValue * minutesPerMile * 60 * 1000
      }

      try {
        const response = await fetch(
          `/api/spotify?duration=${durationInMilliseconds}`
        )

        let data
        try {
          data = await response.json()
        } catch (jsonError) {
          throw new Error('Failed to parse server response.')
        }

        if (!response.ok) {
          throw new Error(
            data?.error || `HTTP error! status: ${response.status}`
          )
        }

        // Map the data and remove duplicates
        const podcastsData = data.podcasts.map((podcast: any) => ({
          id: podcast.id,
          title: podcast.title,
          description: podcast.description,
          embedUrl: podcast.embedUrl,
          duration: podcast.duration,
          imageUrl: podcast.imageUrl,
          releaseDate: podcast.releaseDate,
          episodeUrl: podcast.episodeUrl,
        }))

        const uniquePodcasts = removeDuplicates(podcastsData)

        setPodcasts(uniquePodcasts)
      } catch (err) {
        console.error('Spotify API Error:', err)
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        )
      } finally {
        setIsLoadingPodcasts(false)
      }
    },
    [inputValue, inputType]
  )

  const handleSignOut = useCallback(async () => {
    const supabase = createClientComponentClient()
    await supabase.auth.signOut()
    // No need to setSession(null); session will update via onAuthStateChange
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800 text-foreground">
      <Sidebar
        session={session}
        user={user}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeView={activeView}
        setActiveView={setActiveView}
        handleSignOut={handleSignOut}
      />
      <div className="flex-grow flex flex-col min-h-screen">
        <header className="w-full relative h-24 sm:h-28 md:h-32 lg:h-36">
          <div className="absolute inset-0">
            <Waveform className="w-full h-full" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-full px-4 flex justify-between items-start pt-4">
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
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {!session && !isLoading && <AuthModal />}
            </div>
          </div>
        </header>
        <main className="flex-grow flex flex-col items-center justify-start px-4 py-8 relative z-10">
          {session && activeView === 'dashboard' ? (
            <AppDashboardPage />
          ) : (
            <>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-center leading-tight">
                Perfect Podcasts for{' '}
                <span className="text-blue-500">Your Run</span>
              </h1>
              <p className="text-lg md:text-xl mb-10 text-center text-gray-700 dark:text-gray-300 max-w-2xl">
                Find episodes that match your exact running time. No more
                unfinished stories or awkward pauses.
              </p>
              <div className="flex flex-wrap justify-center items-center space-x-4 mb-8">
                <label className="flex items-center text-lg md:text-xl">
                  <input
                    type="radio"
                    name="inputType"
                    value="minutes"
                    checked={inputType === 'minutes'}
                    onChange={() => handleTypeChange('minutes')}
                    className="mr-2"
                  />
                  Minutes
                </label>
                <label className="flex items-center text-lg md:text-xl">
                  <input
                    type="radio"
                    name="inputType"
                    value="hours"
                    checked={inputType === 'hours'}
                    onChange={() => handleTypeChange('hours')}
                    className="mr-2"
                  />
                  Hours
                </label>
                <label className="flex items-center text-lg md:text-xl">
                  <input
                    type="radio"
                    name="inputType"
                    value="miles"
                    checked={inputType === 'miles'}
                    onChange={() => handleTypeChange('miles')}
                    className="mr-2"
                  />
                  Miles
                </label>
              </div>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  ref={inputRef}
                  className="border border-gray-300 dark:border-gray-600 p-3 rounded-md w-64 md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter ${inputType}`}
                />
                <Button
                  type="submit"
                  className={`px-6 py-3 text-lg md:text-xl w-full sm:w-auto bg-blue-500 hover:bg-blue-600 ${
                    isLoadingPodcasts ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isLoadingPodcasts}
                >
                  {isLoadingPodcasts ? 'Searching...' : 'Find Podcast'}
                </Button>
              </form>
              {error && <div className="text-red-500 mt-4">{error}</div>}
              {podcasts.length > 0 && (
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                  {podcasts.map((podcast) => (
                    <Link
                      key={podcast.id}
                      href={{
                        pathname: `/podcast/${podcast.id}`,
                        query: {
                          inputType: inputType,
                          inputValue: inputValue,
                        },
                      }}
                      passHref
                    >
                      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transform transition hover:scale-105 hover:shadow-2xl cursor-pointer">
                        <div className="relative">
                          <img
                            src={podcast.imageUrl}
                            alt={podcast.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 text-xs rounded">
                            {Math.floor(podcast.duration / 60000)} min
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="bg-black bg-opacity-50 rounded-full p-4">
                              <svg
                                className="w-8 h-8 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6 4a1 1 0 011.707-.707l6 6a1 1 0 010 1.414l-6 6A1 1 0 016 16V4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                          <h2 className="text-xl font-semibold mb-2">
                            {podcast.title}
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">
                            {podcast.description.slice(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {hasSearched &&
                podcasts.length === 0 &&
                !isLoadingPodcasts &&
                !error && (
                  <div className="mt-8 text-lg">
                    No podcasts found for the specified duration.
                  </div>
                )}
            </>
          )}
        </main>
        <footer className="p-4 text-center text-sm text-gray-600 dark:text-gray-300">
          © 2024 PodPace. Sync your stride with your stories!
        </footer>
      </div>
    </div>
  )
}
