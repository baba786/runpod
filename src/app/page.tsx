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
        
        <section className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Perfect Length, Perfect Run</h2>
          <RunningPodcastSuggester />
        </section>
        
        <footer className="mt-16 text-center text-gray-500">
          <p>&copy; 2024 PodPace. Sync your stride with your stories!</p>
        </footer>
      </div>
    </main>
  )
}