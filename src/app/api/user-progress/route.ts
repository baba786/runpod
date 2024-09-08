import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    )
  }
}
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { date } = body

    // Check if an entry for this date already exists
    let { data: existingEntry, error: fetchError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('date', date)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    if (existingEntry) {
      // Update existing entry
      const { data, error } = await supabase
        .from('user_progress')
        .update({ podcasts: existingEntry.podcasts + 1 })
        .eq('id', existingEntry.id)
        .single()

      if (error) throw error
      return NextResponse.json(data)
    } else {
      // Create new entry
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: session.user.id,
          date,
          podcasts: 1,
        })
        .single()

      if (error) throw error
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error('Error recording podcast listen:', error)
    return NextResponse.json(
      { error: 'Failed to record podcast listen' },
      { status: 500 }
    )
  }
}
