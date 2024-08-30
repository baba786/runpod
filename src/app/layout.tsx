import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PodPace - Perfect Podcasts for Your Run',
  description: 'Find episodes that match your exact running time. No more unfinished stories or awkward pauses.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex justify-center items-center min-h-screen`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}