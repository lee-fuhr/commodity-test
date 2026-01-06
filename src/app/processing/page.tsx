'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { VERSION } from '@/lib/version'

const STAGES = [
  { label: 'Fetching your homepage', tease: null },
  { label: 'Scanning for commodity phrases', tease: '73% of manufacturing sites use the same 50 phrases' },
  { label: 'Analyzing messaging patterns', tease: 'When buyers can\'t tell you apart, they compare on price' },
  { label: 'Calculating your score', tease: 'Most manufacturers score 60-80 (commodity territory)' },
  { label: 'Generating specific fixes', tease: 'Not generic advice — fixes for YOUR copy' },
  { label: 'Preparing your report', tease: null },
]

function ProcessingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const url = searchParams.get('url')

  const [progress, setProgress] = useState(0)
  const [stageIndex, setStageIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [errorHint, setErrorHint] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)

  // Use ref to track if component is mounted and to store abort controller
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    if (!url) {
      router.push('/')
      return
    }

    // Simulate progress while API call runs
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + 1.5, 95)

        // Update stage based on progress
        if (newProgress >= 85) setStageIndex(5)
        else if (newProgress >= 70) setStageIndex(4)
        else if (newProgress >= 50) setStageIndex(3)
        else if (newProgress >= 30) setStageIndex(2)
        else if (newProgress >= 15) setStageIndex(1)

        return newProgress
      })
    }, 200)

    // Actual API call with abort controller
    const analyzeUrl = async () => {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
          signal: abortControllerRef.current.signal,
        })

        // Check if component is still mounted
        if (!isMountedRef.current) return

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          if (data.hint) {
            setErrorHint(data.hint)
          }
          if (data.rateLimited) {
            setIsRateLimited(true)
          }
          throw new Error(data.error || 'Something went wrong while analyzing that site.')
        }

        const data = await response.json()

        // Check again after parsing response
        if (!isMountedRef.current) return

        // Complete progress
        setProgress(100)
        setStageIndex(5)

        // Navigate to results
        setTimeout(() => {
          if (isMountedRef.current) {
            router.push(`/r/${data.id}`)
          }
        }, 500)
      } catch (err) {
        // Ignore abort errors (component unmounted)
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        // Only set error if component is still mounted
        if (isMountedRef.current) {
          const message = err instanceof Error ? err.message : 'Something went wrong'
          setError(message)
          console.error(err)
        }
      }
    }

    analyzeUrl()

    return () => {
      isMountedRef.current = false
      clearInterval(progressInterval)
      // Abort any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [url, router])

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-lg">
          <div className={`w-16 h-16 ${isRateLimited ? 'bg-amber-500/20' : 'bg-red-500/20'} rounded-full flex items-center justify-center mx-auto`}>
            {isRateLimited ? (
              <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <h1 className="text-section text-2xl text-[var(--foreground)]">
            {isRateLimited ? 'Slow down there' : 'Couldn\'t analyze that site'}
          </h1>
          <p className="text-body text-lg">{error}</p>
          {errorHint && (
            <p className="text-body text-sm text-[var(--muted-foreground)] bg-[var(--muted)] p-4 rounded">
              {errorHint}
            </p>
          )}
          {isRateLimited && (
            <p className="text-body text-sm text-[var(--muted-foreground)]">
              This tool is free, but we limit usage to keep it that way. Come back soon.
            </p>
          )}
          <div className="pt-2">
            <button
              onClick={() => router.push('/')}
              className="btn-kinetic"
            >
              {isRateLimited ? 'Back to home' : 'Try a different URL'}
            </button>
          </div>
        </div>
      </main>
    )
  }

  const currentStage = STAGES[stageIndex]
  const [displayedLabel, setDisplayedLabel] = useState(currentStage.label)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Crossfade effect when stage changes
  useEffect(() => {
    if (currentStage.label !== displayedLabel) {
      setIsTransitioning(true)
      const timeout = setTimeout(() => {
        setDisplayedLabel(currentStage.label)
        setIsTransitioning(false)
      }, 250) // Half of 500ms - fade out, then fade in
      return () => clearTimeout(timeout)
    }
  }, [currentStage.label, displayedLabel])

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl space-y-12">
        {/* Stage indicator */}
        <div className="text-center space-y-4">
          <p className="text-label text-[var(--accent)]">Analyzing</p>
          <h1
            className={`text-section text-3xl md:text-4xl text-[var(--foreground)] transition-opacity duration-[250ms] ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {displayedLabel}
          </h1>
        </div>

        {/* Progress bar */}
        <div className="space-y-4">
          <div className="h-2 bg-[var(--muted)] overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-body">{Math.round(progress)}%</span>
            <span className="text-body">
              {url ? new URL(url).hostname : ''}
            </span>
          </div>
        </div>

        {/* Stage teases */}
        {currentStage.tease && (
          <div className="bg-[var(--accent)]/10 border-l-4 border-[var(--accent)] p-6 animate-pulse">
            <p className="text-body text-lg text-[var(--foreground)]">
              <span className="text-[var(--accent)] font-semibold">Did you know?</span>{' '}
              {currentStage.tease}
            </p>
          </div>
        )}

        {/* Stage dots */}
        <div className="flex justify-center gap-3">
          {STAGES.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx <= stageIndex
                  ? 'bg-[var(--accent)]'
                  : 'bg-[var(--muted)]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Footer - minimal for processing page */}
      <div className="absolute bottom-6 flex items-center gap-4 text-sm">
        <span className="text-[var(--background)] text-xs select-none">v{VERSION}</span>
        <span className="text-[var(--muted-foreground)]">
          <a href="https://leefuhr.com" className="text-[var(--accent)] hover:underline">Lee Fuhr Inc</a> · No email required
        </span>
        <Link href="/privacy" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Privacy</Link>
      </div>
    </main>
  )
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
      </main>
    }>
      <ProcessingContent />
    </Suspense>
  )
}
