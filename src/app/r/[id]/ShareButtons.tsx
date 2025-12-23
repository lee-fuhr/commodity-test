'use client'

import { useState } from 'react'

interface ShareButtonsProps {
  resultUrl: string
  companyName: string
  score: number
}

export function ShareButtons({ resultUrl, companyName, score }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = resultUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(resultUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-6 py-3 bg-[#0A66C2] text-white rounded font-semibold hover:bg-[#004182] transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
        LinkedIn
      </a>

      {/* Twitter/X */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just tested our homepage for commodity messaging. Score: ${score}/100. Getting specific fixes now.`)}&url=${encodeURIComponent(resultUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded font-semibold hover:bg-gray-800 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        X / Twitter
      </a>

      {/* Email */}
      <a
        href={`mailto:?subject=Commodity Test results for ${companyName}&body=I just ran The Commodity Test on our homepage. Score: ${score}/100.%0A%0ASee the full results: ${resultUrl}`}
        className="flex items-center gap-2 px-6 py-3 bg-brand-100 text-brand-800 border-2 border-brand-300 rounded font-semibold hover:bg-brand-200 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Email
      </a>

      {/* Copy link */}
      <button
        onClick={handleCopy}
        className={`flex items-center gap-2 px-6 py-3 rounded font-semibold transition-all ${
          copied
            ? 'bg-score-excellent text-white'
            : 'bg-white text-accent-400 border-2 border-accent-400 hover:bg-accent-50'
        }`}
      >
        {copied ? (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy link
          </>
        )}
      </button>
    </div>
  )
}
