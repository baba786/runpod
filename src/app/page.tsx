import RunningPodcastSuggester from '@/components/RunningPodcastSuggester'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <h1 className="text-6xl font-bold mb-4 text-center text-gray-900">
          Podcasts <span className="text-blue-600">that fit your run</span>
        </h1>
        <p className="text-xl mb-12 text-center text-gray-600 max-w-2xl">
          No more unfinished episodes or awkward pauses. Find podcasts that match your exact running time, every time.
        </p>
        
        <RunningPodcastSuggester />
        
        <footer className="mt-16 text-center text-gray-500">
          <p>&copy; 2024 PodPace. Sync your stride with your stories!</p>
        </footer>
      </div>
    </main>
  )
}