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
  audioPreviewUrl: string; // Add this new property
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  const handleTypeChange = (value: string) => {
    setInputType(value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSubmitted(true);

    const durationValue = parseFloat(inputValue);
    const durationInMilliseconds = inputType === 'miles'
      ? durationValue * 10 * 60 * 1000  // Assuming 10 minutes per mile
      : durationValue * (inputType === 'minutes' ? 60 * 1000 : 60 * 60 * 1000);

    try {
      const response = await fetch(`/api/spotify?duration=${durationInMilliseconds}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${data.error?.message || 'Unknown error'}`);
      }

      console.log("Raw Spotify API response:", JSON.stringify(data, null, 2));

      const episodes = Array.isArray(data) ? data : (data?.episodes?.items || []);

      const processedEpisodes = episodes.map((item: any) => ({
        id: item.id || `unknown-${Math.random()}`,
        title: item.name || 'Untitled',
        description: item.description || 'No description available',
        duration: item.duration_ms ? Math.round(item.duration_ms / 1000) : 0,
        episodeUrl: item.external_urls?.spotify || '#',
        audioPreviewUrl: item.audio_preview_url || '', // Add this line
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
        <RadioGroup defaultValue="minutes" onValueChange={handleTypeChange} className="flex justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="minutes" id="minutes" />
            <Label htmlFor="minutes">Minutes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hours" id="hours" />
            <Label htmlFor="hours">Hours</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="miles" id="miles" />
            <Label htmlFor="miles">Miles</Label>
          </div>
        </RadioGroup>
        <div className="flex space-x-4">
          <Input 
            type="number" 
            placeholder={`Enter ${inputType}`}
            value={inputValue}
            onChange={handleInputChange}
            min="1"
            step="1"
            required
            className="text-lg flex-grow"
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded"
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
          <ul className="space-y-4">
            {podcasts.map((podcast) => (
              <li key={podcast.id} className="border-b pb-4">
                <h5 className="font-semibold">{podcast.title}</h5>
                <p className="text-sm text-gray-600">{formatDuration(podcast.duration)}</p>
                <p className="mt-2">{podcast.description}</p>
                {podcast.audioPreviewUrl && (
                  <audio controls className="mt-2 w-full">
                    <source src={podcast.audioPreviewUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
                {podcast.episodeUrl !== '#' ? (
                  <a href={podcast.episodeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Listen on Spotify
                  </a>
                ) : (
                  <span className="text-gray-500">Not available on Spotify</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}