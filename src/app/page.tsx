import RunningPodcastSuggester from '@/components/RunningPodcastSuggester'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-center">Running Podcast Suggester</h1>
      
      <section className="w-full max-w-2xl mb-12">
        <RunningPodcastSuggester />
      </section>
          </main>
  )
}