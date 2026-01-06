'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Footer } from '@/components/Footer'

export default function TestPage() {
  const [testId] = useState('test-demo-123')

  const testUrls = [
    { label: 'High commodity (generic manufacturing)', url: 'acmeindustrial.com' },
    { label: 'Medium commodity (some differentiation)', url: 'precisionpartsco.com' },
    { label: 'Low commodity (well-positioned)', url: 'specializedwidgets.com' },
  ]

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <section className="px-4 md:px-8 lg:px-12 py-12 border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[var(--accent)] text-sm font-bold mb-2 tracking-wider">COMMODITY TEST</p>
          <h1 className="text-display text-4xl md:text-6xl mb-4">
            QA <span className="text-[var(--accent)]">dashboard</span>
          </h1>
          <p className="text-body text-lg mb-6">
            Test all pages and flows
          </p>
          <Link href="/" className="text-[var(--accent)] hover:underline">
            ← Back to landing page
          </Link>
        </div>
      </section>

      {/* Page Flow */}
      <section className="px-4 md:px-8 lg:px-12 py-12 bg-[var(--muted)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-section text-2xl mb-6">Page flow</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link
              href="/"
              className="bg-[var(--background)] p-6 border-l-4 border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
            >
              <p className="text-[var(--accent)] text-sm font-bold mb-2">1. HOME</p>
              <p className="text-[var(--foreground)] font-semibold mb-1">Landing page</p>
              <p className="text-body text-sm">Enter website URL</p>
            </Link>

            <Link
              href="/processing?url=https://example.com"
              className="bg-[var(--background)] p-6 border-l-4 border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
            >
              <p className="text-[var(--accent)] text-sm font-bold mb-2">2. PROCESSING</p>
              <p className="text-[var(--foreground)] font-semibold mb-1">Analysis progress</p>
              <p className="text-body text-sm">3-stage animation</p>
            </Link>

            <Link
              href={`/r/${testId}`}
              className="bg-[var(--background)] p-6 border-l-4 border-[var(--success)] hover:bg-[var(--success)]/10 transition-colors"
            >
              <p className="text-[var(--success)] text-sm font-bold mb-2">3. RESULTS</p>
              <p className="text-[var(--foreground)] font-semibold mb-1">Full analysis</p>
              <p className="text-body text-sm">Commodity score + fixes</p>
            </Link>

            <Link
              href="/sample"
              className="bg-[var(--background)] p-6 border-l-4 border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
            >
              <p className="text-[var(--accent)] text-sm font-bold mb-2">4. SAMPLE</p>
              <p className="text-[var(--foreground)] font-semibold mb-1">Sample results</p>
              <p className="text-body text-sm">Pre-built demo analysis</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Additional Pages */}
      <section className="px-4 md:px-8 lg:px-12 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-section text-2xl mb-6">Additional pages</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link
              href="/examples"
              className="bg-[var(--muted)] p-6 border-l-4 border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
            >
              <p className="text-[var(--foreground)] font-semibold mb-1">Before/after examples</p>
              <p className="text-body text-sm">Success stories</p>
            </Link>

            <Link
              href="/how-it-works"
              className="bg-[var(--muted)] p-6 border-l-4 border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
            >
              <p className="text-[var(--foreground)] font-semibold mb-1">How it works</p>
              <p className="text-body text-sm">Methodology explained</p>
            </Link>

            <Link
              href="/pricing"
              className="bg-[var(--muted)] p-6 border-l-4 border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
            >
              <p className="text-[var(--foreground)] font-semibold mb-1">Pricing</p>
              <p className="text-body text-sm">Tiers and packages</p>
            </Link>

            <Link
              href="/guide"
              className="bg-[var(--muted)] p-6 border-l-4 border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
            >
              <p className="text-[var(--foreground)] font-semibold mb-1">DIY guide</p>
              <p className="text-body text-sm">Downloadable resource</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Test URLs */}
      <section className="px-4 md:px-8 lg:px-12 py-12 bg-[var(--muted)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-section text-2xl mb-6">Test URLs to analyze</h2>
          <p className="text-body text-sm mb-4">
            Paste these into the homepage form to test different scenarios:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {testUrls.map((item, index) => (
              <div key={index} className="bg-[var(--background)] p-6 border-l-4 border-[var(--accent)]">
                <p className="text-[var(--accent)] text-sm font-semibold mb-2">{item.label}</p>
                <code className="text-[var(--foreground)] text-sm font-mono">{item.url}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QA Checklist */}
      <section className="px-4 md:px-8 lg:px-12 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-section text-2xl mb-6">QA checklist</h2>
          <div className="bg-[var(--muted)] p-6 border-2 border-[var(--border)]">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 text-body text-sm">
                <label className="flex items-center gap-3 cursor-pointer hover:text-[var(--accent)]">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Landing page loads, URL input validates</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:text-[var(--accent)]">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Form accepts URLs with or without https://</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:text-[var(--accent)]">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Processing page shows 3-stage animation</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:text-[var(--accent)]">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Results page shows commodity score</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:text-[var(--accent)]">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Annual cost estimate displays correctly</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:text-[var(--accent)]">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Side-by-side competitor comparison works</span>
                </label>
              </div>
              <div className="space-y-2 text-body text-sm">
                <label className="flex items-center gap-3 cursor-pointer hover:text-[var(--accent)]">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>3 fixes show with before/after examples</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:text-[var(--accent)]">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Share card generates correctly</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:text-[var(--accent)]">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Email forward pre-fills correctly</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:text-[var(--accent)]">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>CTA links to pricing/contact work</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:text-[var(--accent)]">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Mobile responsive on all pages</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:text-[var(--accent)]">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Results URL is shareable/persistent</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Known Limitations */}
      <section className="px-4 md:px-8 lg:px-12 py-12 bg-[var(--muted)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-section text-2xl mb-6">Known limitations (demo mode)</h2>
          <div className="bg-[var(--warning)]/10 border-2 border-[var(--warning)]/30 p-6">
            <ul className="list-disc list-inside space-y-2 text-body text-sm">
              <li>URL scraping may fail on some sites (CORS, authentication)</li>
              <li>Competitor discovery uses fallback library when Google API unavailable</li>
              <li>Results require Vercel KV for persistence</li>
              <li>Share card generation requires Puppeteer (Vercel serverless)</li>
              <li>Claude API required for analysis (check .env)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
