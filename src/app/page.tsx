import RunningPodcastSuggester from '@/components/RunningPodcastSuggester'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <h1 className="text-6xl font-bold mb-4 text-center text-gray-900">
          Podcasts <span className="text-blue-600">made for running</span>
        </h1>
        <p className="text-xl mb-12 text-center text-gray-600 max-w-2xl">
          Find the perfect audio companion for every run. Personalized recommendations based on your pace and preferences.
        </p>
        
        <section className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Discover Your Running Soundtrack</h2>
          <RunningPodcastSuggester />
        </section>
        
        <div className="mt-16 text-center">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Trusted by runners from</h3>
          <div className="flex justify-center space-x-8">
            {/* Replace with actual logos or names of running clubs/brands */}
            <span className="text-gray-400">Running Club A</span>
            <span className="text-gray-400">Brand B</span>
            <span className="text-gray-400">Fitness App C</span>
          </div>
        </div>
        
        <footer className="mt-16 text-center text-gray-500">
          <p>&copy; 2023 PodPace. Lace up, plug in, and run on!</p>
        </footer>
      </div>
    </main>
  )
}