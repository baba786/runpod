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
