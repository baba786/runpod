import RunningPodcastSuggester from '@/components/RunningPodcastSuggester'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <h1 className="text-5xl font-bold mb-6 text-center text-gray-900">
          Perfect Podcasts for Your Run
        </h1>
        <p className="text-xl mb-10 text-center text-gray-600 max-w-2xl">
          Find episodes that match your exact running time. No more unfinished stories or awkward pauses.
        </p>
        
        <RunningPodcastSuggester />
        
        <footer className="mt-16 text-center text-gray-500">
          <p>&copy; 2024 PodPace. Sync your stride with your stories!</p>
        </footer>
      </div>
    </main>
  )
}