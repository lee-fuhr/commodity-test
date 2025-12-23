import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'The Commodity Test - Does your website sound like everyone else\'s?',
  description: 'Free tool that analyzes your homepage messaging, shows how you compare to competitors, and gives you 3 specific fixes. 30 seconds, no email required.',
  openGraph: {
    title: 'The Commodity Test',
    description: 'Does your website sound like everyone else\'s? Find out in 30 seconds.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Changa+One:ital@0;1&family=Changa:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
