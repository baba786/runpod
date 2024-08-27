'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Remove this line:
// import { Progress } from "@/components/ui/progress";

interface Podcast {
  id: string;
  title: string;
  description: string;
  duration: number;
  episodeUrl: string;
  // ... any other properties you need
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function EpisodeEntry({ episode }: { episode: Podcast }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateProgress = () => {
        setProgress((audio.currentTime / audio.duration) * 100);
      };
      audio.addEventListener('timeupdate', updateProgress);
      return () => audio.removeEventListener('timeupdate', updateProgress);
    }
  }, []);

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader>
        <CardTitle>{episode.title}</CardTitle>
        <CardDescription>{formatDuration(episode.duration)}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{episode.description}</p>
        <Button onClick={togglePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <progress value={progress} max="100" className="w-full" />
      </CardContent>
      <audio 
        ref={audioRef} 
        src={episode.episodeUrl} 
        preload="metadata"
      />
    </Card>
  );
}

export default function RunningPodcastSuggester() {
  const [inputType, setInputType] = useState('minutes');
  const [inputValue, setInputValue] = useState('');
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInputType(e.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSubmitted(true);

    const durationValue = parseFloat(inputValue);
    const durationInMilliseconds = durationValue * (inputType === 'minutes' ? 60 * 1000 : 10 * 60 * 1000);

    try {
      const response = await fetch(`/api/spotify?duration=${durationInMilliseconds}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${data.error?.message || 'Unknown error'}`);
      }

      console.log("Raw Spotify API response:", JSON.stringify(data, null, 2));

      const episodes = Array.isArray(data) ? data : (data?.episodes?.items || []);

      console.log("Processed podcasts:", episodes);

      const processedEpisodes = episodes.map((item: any) => ({
        id: item.id,
        title: item.name,
        description: item.description,
        duration: item.duration_ms / 1000, // Convert ms to seconds
        episodeUrl: item.audio_preview_url || item.external_urls.spotify,
      }));

      setPodcasts(processedEpisodes);
    } catch (err) {
      console.error("Spotify API Error:", err);
      setError(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg border border-gray-200">
      <h1 className="text-3xl font-bold mb-2">Perfect Podcasts for Your Run</h1>
      <p className="text-slate-600 mb-6">
        Find episodes that match your exact running time. No more unfinished stories or awkward pauses.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center space-x-4">
          <select value={inputType} onChange={handleTypeChange}>
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
          </select>
        </div>
        <div className="flex space-x-4">
          <Input 
            type="number" 
            placeholder={inputType === 'time' ? 'Enter minutes' : 'Enter miles'} 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            min="1"
            step={inputType === 'time' ? '1' : '0.1'}
            required
            className="text-lg flex-grow"
          />
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Finding...' : 'Find Podcasts'}
          </Button>
        </div>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-md text-center" role="alert">
          {error}
        </div>
      )}

      {podcasts.length > 0 && (
        <div className="mt-8">
          <h4 className="text-xl font-semibold mb-4">Suggested Podcasts</h4>
          <div className="space-y-4">
            {podcasts.map((podcast) => (
              <EpisodeEntry key={podcast.id} episode={podcast} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}