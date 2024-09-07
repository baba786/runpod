import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { SessionProvider } from '@/components/SessionProvider'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Session } from '@supabase/supabase-js'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PodPace - Perfect Podcasts for Your Run',
  description:
    'Find episodes that match your exact running time. No more unfinished stories or awkward pauses.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session: Session | null = null

  try {
    const supabase = createServerComponentClient({ cookies })
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Error fetching session:', error.message)
    } else {
      session = data.session
      console.log(
        'Session fetched successfully:',
        session ? 'Authenticated' : 'Not authenticated'
      )
    }
  } catch (error) {
    console.error('Unexpected error in RootLayout:', error)
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <SessionProvider initialSession={session}>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
