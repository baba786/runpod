'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogIn } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSession } from '@/components/SessionProvider'

const COOLDOWN_PERIOD = 5000 // 5 seconds

export function AuthModal({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
  const { session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [lastAttemptTime, setLastAttemptTime] = useState(0)

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleAuth = useCallback(
    async (event: React.FormEvent<HTMLFormElement>, isSignUp: boolean) => {
      event.preventDefault()
      const now = Date.now()
      if (now - lastAttemptTime < COOLDOWN_PERIOD) {
        setError('Please wait a moment before trying again.')
        return
      }
      setLastAttemptTime(now)
      setError(null)

      const supabase = createClientComponentClient()

      try {
        let result
        if (isSignUp) {
          result = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name },
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          })
        } else {
          result = await supabase.auth.signInWithPassword({ email, password })
        }

        if (result.error) throw result.error

        setIsOpen(false)
        if (onAuthSuccess) {
          onAuthSuccess()
        }
      } catch (err) {
        console.error('Auth error:', err)
        setError('Authentication failed. Please try again.')
      }
    },
    [email, password, name, lastAttemptTime, onAuthSuccess]
  )

  if (session) {
    return null // Don't render anything if the user is already logged in
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <LogIn className="h-4 w-4 mr-2" />
          Sign in
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Authentication
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Sign in to your account or create a new one.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={(e) => handleAuth(e, false)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  className="w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  className="w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={(e) => handleAuth(e, true)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  required
                  className="w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  className="w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  className="w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
