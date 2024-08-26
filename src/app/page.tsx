import RunningPodcastSuggester from '@/components/RunningPodcastSuggester'
import { Waveform } from '@/components/Waveform'

export default function Home() {
  return (
    <main className="relative min-h-screen bg-white">
      <Waveform className="absolute left-0 top-0 h-20 w-full" />
      <div className="container mx-auto px-4 py-16 flex flex-col items-center relative z-10">
        <h1 className="text-5xl font-bold mb-6 text-center text-slate-900">
          Perfect Podcasts for <span className="text-blue-600">Your Run</span>
        </h1>
        <p className="text-xl mb-10 text-center text-slate-700 max-w-2xl">
          Find episodes that match your exact running time. No more unfinished stories or awkward pauses.
        </p>
        
        <RunningPodcastSuggester />
        
        <footer className="mt-16 text-center text-slate-500">
          <p>&copy; 2024 PodPace. Sync your stride with your stories!</p>
        </footer>
      </div>
    </main>
  )
}