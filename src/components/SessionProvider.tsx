'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const SessionContext = createContext<Session | null>(null)

export function SessionProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode
  initialSession: Session | null
}) {
  const [session, setSession] = useState<Session | null>(initialSession)

  useEffect(() => {
    console.log('SessionProvider: Initial session', initialSession)

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('SessionProvider: Got session from Supabase', session)
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('SessionProvider: Auth state changed', _event, session)
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [initialSession])

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const session = useContext(SessionContext)
  if (session === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return session
}
