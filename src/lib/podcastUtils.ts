export async function logPodcastActivity(podcastId: string, duration: number) {
  try {
    const response = await fetch('/api/log-podcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ podcastId, duration }),
    })
    if (!response.ok) {
      throw new Error('Failed to log podcast activity')
    }
  } catch (error) {
    console.error('Error logging podcast activity:', error)
  }
}
