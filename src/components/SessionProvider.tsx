'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type SessionContextType = {
  session: Session | null
  user: User | null
  isLoading: boolean
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode
  initialSession: Session | null
}) {
  const [session, setSession] = useState<Session | null>(initialSession)
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    setIsLoading(true)
    console.log('SessionProvider: Initial session', initialSession)

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('SessionProvider: Got session from Supabase', session)
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('SessionProvider: Auth state changed', _event, session)
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [initialSession, supabase.auth])

  const value = {
    session,
    user,
    isLoading,
  }

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
