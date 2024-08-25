import RunningPodcastSuggester from '@/components/RunningPodcastSuggester'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-center">Welcome to Our Running App</h1>
      
      <section className="w-full max-w-2xl mb-12">
        <RunningPodcastSuggester />
      </section>
      
      <section className="w-full max-w-2xl text-center">
        <h2 className="text-2xl font-semibold mb-4">Other Features</h2>
        <p>Explore more features of our running app...</p>
      </section>
    </main>
  )
}