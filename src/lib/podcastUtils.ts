import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function logPodcastActivity(podcastId: string, duration: number) {
  const supabase = createClientComponentClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    const { error } = await supabase.from('user_progress').insert({
      user_id: session.user.id,
      podcast_id: podcastId,
      duration: duration,
      date: new Date().toISOString(),
    })

    if (error) {
      console.error('Error logging podcast activity:', error)
    }
  }
}
