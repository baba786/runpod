import RunningPodcastSuggester from '@/components/RunningPodcastSuggester'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Our Running App</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Find Your Perfect Running Podcast</h2>
        <RunningPodcastSuggester />
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Other Features</h2>
        {/* Add your other home page components or content here */}
        <p>Explore more features of our running app...</p>
      </section>
    </main>
  )
}