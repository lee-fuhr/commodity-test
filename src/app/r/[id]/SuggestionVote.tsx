'use client'

import { useState, useEffect } from 'react'

interface SuggestionVoteProps {
  resultId: string
  fixNumber: number
  suggestionIndex: number
  approach: string
  originalPhrase: string
  suggestionText: string
  children: React.ReactNode
}

type VoteState = 'none' | 'up' | 'down'

export function SuggestionVote({
  resultId,
  fixNumber,
  suggestionIndex,
  approach,
  originalPhrase,
  suggestionText,
  children,
}: SuggestionVoteProps) {
  const [vote, setVote] = useState<VoteState>('none')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Storage key for this specific suggestion
  const storageKey = `vote:${resultId}:${fixNumber}:${suggestionIndex}`

  // Load saved vote on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved === 'up' || saved === 'down') {
      setVote(saved)
    }
  }, [storageKey])

  const handleVote = async (newVote: 'up' | 'down') => {
    // If clicking same vote, do nothing (vote is locked in)
    if (vote === newVote) return

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultId,
          fixNumber,
          suggestionIndex,
          vote: newVote,
          approach,
          originalPhrase,
          suggestionText,
        }),
      })

      if (res.ok) {
        setVote(newVote)
        localStorage.setItem(storageKey, newVote)
      }
    } catch (err) {
      console.error('Vote failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(suggestionText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Visual styles based on vote state
  const containerStyles = vote === 'down'
    ? 'opacity-50'
    : vote === 'up'
    ? 'bg-green-500/10'
    : ''

  const textStyles = vote === 'up' ? 'font-semibold' : ''

  return (
    <div className={`flex gap-2 transition-all duration-200 ${containerStyles}`}>
      {/* Action buttons - left side, stacked vertically: up, copy, down */}
      <div className="flex flex-col gap-0.5 pt-3">
        <button
          onClick={() => handleVote('up')}
          disabled={isSubmitting || vote !== 'none'}
          className={`p-1 rounded transition-all ${
            vote === 'up'
              ? 'bg-green-500/20 text-green-400'
              : vote === 'none'
              ? 'text-[var(--muted-foreground)] hover:bg-green-500/10 hover:text-green-400'
              : 'opacity-30 cursor-default'
          } ${isSubmitting ? 'opacity-50' : ''}`}
          title="This suggestion is helpful"
          aria-label="Vote up"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
        </button>
        <button
          onClick={handleCopy}
          className="p-1 rounded transition-all text-[var(--muted-foreground)] hover:bg-[var(--accent)]/20 hover:text-[var(--accent)]"
          title="Copy to clipboard"
          aria-label="Copy suggestion"
        >
          {copied ? (
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
        <button
          onClick={() => handleVote('down')}
          disabled={isSubmitting || vote !== 'none'}
          className={`p-1 rounded transition-all ${
            vote === 'down'
              ? 'bg-red-500/20 text-red-400'
              : vote === 'none'
              ? 'text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-400'
              : 'opacity-30 cursor-default'
          } ${isSubmitting ? 'opacity-50' : ''}`}
          title="This suggestion isn't helpful"
          aria-label="Vote down"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
          </svg>
        </button>
      </div>

      {/* Content wrapper with vote-dependent styling */}
      <div className={`flex-1 ${textStyles}`}>
        {children}
      </div>
    </div>
  )
}
