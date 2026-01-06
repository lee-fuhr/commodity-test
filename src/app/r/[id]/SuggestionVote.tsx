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

  // Visual styles based on vote state
  const containerStyles = vote === 'down'
    ? 'opacity-50'
    : vote === 'up'
    ? 'ring-1 ring-green-500/30'
    : ''

  const textStyles = vote === 'up' ? 'font-semibold' : ''

  return (
    <div className={`flex gap-2 transition-all duration-200 ${containerStyles}`}>
      {/* Vote buttons - left side, stacked vertically */}
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
