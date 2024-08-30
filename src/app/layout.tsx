import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";

export const metadata: Metadata = {
  title: "Running Podcast Suggester",
  description: "Find the perfect podcast for your run",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  // Add any other viewport properties you need
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.className} antialiased`}>
      <body className="min-h-screen flex flex-col">
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}