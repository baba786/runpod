import RunningPodcastSuggester from '@/components/RunningPodcastSuggester'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-green-100">
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <h1 className="text-5xl font-bold mb-4 text-center text-blue-800">PodPace</h1>
        <p className="text-xl mb-8 text-center text-gray-700">Find the perfect podcast for your run</p>
        
        <div className="w-full max-w-4xl mb-12">
          <h2 className="text-3xl font-semibold mb-4 text-blue-700">How It Works</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Enter your run duration or distance</li>
            <li>Choose your preferred podcast genres</li>
            <li>Get personalized podcast recommendations</li>
            <li>Enjoy your run with the perfect audio companion</li>
          </ul>
        </div>
        
        <section className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-800">Find Your Running Podcast</h2>
          <RunningPodcastSuggester />
        </section>
        
        <footer className="mt-12 text-center text-gray-600">
          <p>&copy; 2023 PodPace. Lace up, plug in, and run on!</p>
        </footer>
      </div>
    </main>
  )
}