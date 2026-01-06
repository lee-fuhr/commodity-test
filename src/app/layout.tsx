import type { Metadata } from 'next'
import '../styles/globals.css'
import FeedbackWidget from '@/components/FeedbackWidget'

export const metadata: Metadata = {
  title: 'The Commodity Test - Does your website sound like everyone else\'s?',
  description: 'Free tool that analyzes your homepage messaging, shows how you compare to competitors, and gives you 3 specific fixes. 30 seconds, no email required.',
  metadataBase: new URL('https://areyougeneric.com'),
  openGraph: {
    title: 'The Commodity Test',
    description: 'Does your website sound like everyone else\'s? Find out in 30 seconds.',
    type: 'website',
    url: 'https://areyougeneric.com',
    siteName: 'The Commodity Test',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'The Commodity Test - Find out if your website sounds like everyone else\'s',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Commodity Test',
    description: 'Does your website sound like everyone else\'s? Find out in 30 seconds.',
    images: ['/api/og'],
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
        <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600;700;800;900&family=Literata:opsz,wght@7..72,400;7..72,500;7..72,600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <script async src="https://plausible.io/js/pa-RmbAWjh_6HEly7NYF0uSJ.js"></script>
        <script dangerouslySetInnerHTML={{__html: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}} />
      </head>
      <body className="min-h-screen">
        {children}
        <FeedbackWidget toolName="Commodity Test" />
      </body>
    </html>
  )
}
