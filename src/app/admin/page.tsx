'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ScanEntry {
  url: string
  resultId: string
  companyName: string
  score: number
  industry: string
  ip?: string
  timestamp: string
  resultUrl?: string
  ignored?: boolean
}

interface GuideEmail {
  email: string
  firstName: string | null
  timestamp: string
  source: string
  ignored?: boolean
}

interface ContactSubmission {
  name: string
  email: string
  message: string
  timestamp: string
  ignored?: boolean
}

interface ResultEmail {
  email: string
  resultId: string
  companyName: string
  timestamp: string
  resultUrl?: string
  ignored?: boolean
}

interface StatsData {
  summary: {
    totalScans: number
    totalGuideEmails: number
    totalResultEmails: number
    totalContacts: number
    lastUpdated: string
  }
  recentScans: ScanEntry[]
  guideEmails: GuideEmail[]
  resultEmails: ResultEmail[]
  contactSubmissions: ContactSubmission[]
  ignoredIPs: string[]
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = String(row[h] ?? '')
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`
        }
        return val
      }).join(',')
    )
  ]
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Industry colors for charts
const INDUSTRY_COLORS: Record<string, string> = {
  manufacturing: '#3b82f6', // blue
  saas: '#8b5cf6', // purple
  services: '#10b981', // green
  construction: '#f59e0b', // amber
  distribution: '#06b6d4', // cyan
  healthcare: '#ec4899', // pink
  finance: '#6366f1', // indigo
  retail: '#f97316', // orange
  general: '#6b7280', // gray
}

// Icons
const IgnoreIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
)

const UnignoreIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

const RerunIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

// Industry breakdown bar chart
function IndustryBreakdown({ scans }: { scans: ScanEntry[] }) {
  const counts: Record<string, number> = {}
  scans.forEach(s => {
    const ind = s.industry || 'general'
    counts[ind] = (counts[ind] || 0) + 1
  })

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const max = Math.max(...sorted.map(([, c]) => c), 1)

  if (sorted.length === 0) return null

  return (
    <div className="bg-[var(--muted)] p-4 mb-6">
      <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Industry breakdown</h3>
      <div className="space-y-2">
        {sorted.map(([industry, count]) => (
          <div key={industry} className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)] w-24 capitalize truncate">{industry}</span>
            <div className="flex-1 h-4 bg-[var(--background)] rounded overflow-hidden">
              <div
                className="h-full rounded transition-all duration-300"
                style={{
                  width: `${(count / max) * 100}%`,
                  backgroundColor: INDUSTRY_COLORS[industry] || INDUSTRY_COLORS.general
                }}
              />
            </div>
            <span className="text-xs text-[var(--muted-foreground)] w-8 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Score distribution chart (dot plot - each scan is a dot)
function ScoreDistribution({ scans }: { scans: ScanEntry[] }) {
  // Filter to scans with valid scores
  const scansWithScores = scans.filter(s => typeof s.score === 'number' && !isNaN(s.score))

  if (scansWithScores.length === 0) {
    return (
      <div className="bg-[var(--muted)] p-4 mb-6">
        <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Score distribution</h3>
        <p className="text-xs text-[var(--muted-foreground)]">No scans with scores yet</p>
      </div>
    )
  }

  // Sort by score for consistent positioning
  const sorted = [...scansWithScores].sort((a, b) => a.score - b.score)

  return (
    <div className="bg-[var(--muted)] p-4 mb-6">
      <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Score distribution</h3>
      <div className="relative h-20 mb-2">
        {/* Dots */}
        {sorted.map((scan, idx) => {
          const left = (scan.score / 100) * 100
          // Stack dots at same score vertically
          const sameScoreIndex = sorted.slice(0, idx).filter(s => Math.abs(s.score - scan.score) < 3).length
          const bottom = 4 + (sameScoreIndex * 14)

          return (
            <a
              key={`${scan.timestamp}-${idx}`}
              href={scan.resultUrl || `/r/${scan.resultId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute w-3 h-3 rounded-full cursor-pointer hover:scale-150 transition-transform group"
              style={{
                left: `${left}%`,
                bottom: `${Math.min(bottom, 64)}px`,
                backgroundColor: INDUSTRY_COLORS[scan.industry] || INDUSTRY_COLORS.general,
                transform: 'translateX(-50%)',
              }}
              title={`${scan.companyName} (${scan.score}) - ${scan.industry}`}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[var(--background)] border border-[var(--border)] px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                <div className="font-medium text-[var(--foreground)]">{scan.companyName}</div>
                <div className="text-[var(--muted-foreground)]">Score: {scan.score} • {scan.industry}</div>
              </div>
            </a>
          )
        })}
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] border-t border-[var(--border)] pt-1">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
      <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] mt-1">
        <span>← Undifferentiated</span>
        <span>Differentiated →</span>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<StatsData | null>(null)
  const [activeTab, setActiveTab] = useState<'scans' | 'guide' | 'resultEmails' | 'contacts' | 'settings'>('scans')
  const [showIgnored, setShowIgnored] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${password}` }
      })

      if (res.status === 401) {
        setError('Invalid password')
        setLoading(false)
        return
      }

      if (!res.ok) {
        throw new Error('Failed to fetch')
      }

      const statsData = await res.json()
      setData(statsData)
      setAuthenticated(true)
    } catch {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    if (!password) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${password}` }
      })
      if (res.ok) {
        setData(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }

  const performAction = async (action: string, params: Record<string, string>) => {
    try {
      const res = await fetch('/api/admin/stats', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, ...params })
      })
      if (res.ok) {
        await refresh()
      }
    } catch (e) {
      console.error('Action failed:', e)
    }
  }

  const toggleIgnore = (type: string, timestamp: string, currentlyIgnored: boolean) => {
    performAction(currentlyIgnored ? 'unignore' : 'ignore', { type, timestamp })
  }

  const toggleIgnoreIP = (ip: string, currentlyIgnored: boolean) => {
    performAction(currentlyIgnored ? 'unignore-ip' : 'ignore-ip', { ip })
  }

  const deleteRecord = (type: string, timestamp: string) => {
    if (confirm('Delete this record? (It will be hidden from stats)')) {
      performAction('delete', { type, timestamp })
    }
  }

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const rerunScan = (url: string) => {
    // Go directly to processing page to run the analysis
    window.open(`/processing?url=${encodeURIComponent(url)}`, '_blank')
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-6 text-center">Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-[var(--accent)] text-[var(--accent-foreground)] font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'View stats'}
            </button>
          </form>
          <p className="text-[var(--muted-foreground)] text-xs mt-4 text-center">
            Password is your ADMIN_API_KEY from Vercel
          </p>
        </div>
      </main>
    )
  }

  if (!data) return null

  const ignoredIPSet = new Set(data.ignoredIPs)

  // Filter based on showIgnored toggle
  const visibleScans = showIgnored ? data.recentScans : data.recentScans.filter(s => !s.ignored)
  const visibleGuide = showIgnored ? data.guideEmails : data.guideEmails.filter(g => !g.ignored)
  const visibleResults = showIgnored ? data.resultEmails : data.resultEmails.filter(r => !r.ignored)
  const visibleContacts = showIgnored ? data.contactSubmissions : data.contactSubmissions.filter(c => !c.ignored)

  // Stats for charts (non-ignored only)
  const chartScans = data.recentScans.filter(s => !s.ignored)

  return (
    <main className="min-h-screen bg-[var(--background)] py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">Commodity Test Admin</h1>
            <p className="text-[var(--muted-foreground)] text-sm">
              Last updated: {formatDate(data.summary.lastUpdated)}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] cursor-pointer">
              <input
                type="checkbox"
                checked={showIgnored}
                onChange={(e) => setShowIgnored(e.target.checked)}
                className="w-4 h-4"
              />
              Show ignored
            </label>
            <button
              onClick={refresh}
              disabled={loading}
              className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] text-sm hover:bg-[var(--border)] disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link href="/" className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] text-sm hover:bg-[var(--border)]">
              ← Back to site
            </Link>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-[var(--muted)] p-4">
            <p className="text-3xl font-semibold text-[var(--foreground)]">{data.summary.totalScans}</p>
            <p className="text-[var(--muted-foreground)] text-sm">Sites analyzed</p>
          </div>
          <div className="bg-[var(--muted)] p-4">
            <p className="text-3xl font-semibold text-[var(--foreground)]">{data.summary.totalGuideEmails}</p>
            <p className="text-[var(--muted-foreground)] text-sm">Guide downloads</p>
          </div>
          <div className="bg-[var(--muted)] p-4">
            <p className="text-3xl font-semibold text-[var(--foreground)]">{data.summary.totalResultEmails}</p>
            <p className="text-[var(--muted-foreground)] text-sm">Report saves</p>
          </div>
          <div className="bg-[var(--muted)] p-4">
            <p className="text-3xl font-semibold text-[var(--foreground)]">{data.summary.totalContacts}</p>
            <p className="text-[var(--muted-foreground)] text-sm">Contact forms</p>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <IndustryBreakdown scans={chartScans} />
          <ScoreDistribution scans={chartScans} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-[var(--border)] overflow-x-auto">
          {(['scans', 'guide', 'resultEmails', 'contacts', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab
                  ? 'border-[var(--accent)] text-[var(--foreground)]'
                  : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {tab === 'scans' && `Scans (${visibleScans.length})`}
              {tab === 'guide' && `Guide (${visibleGuide.length})`}
              {tab === 'resultEmails' && `Saves (${visibleResults.length})`}
              {tab === 'contacts' && `Contacts (${visibleContacts.length})`}
              {tab === 'settings' && `Settings`}
            </button>
          ))}
        </div>

        {/* Scans tab */}
        {activeTab === 'scans' && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => downloadCSV(
                  visibleScans.filter(s => !s.ignored).map(s => ({
                    date: formatDate(s.timestamp),
                    company: s.companyName,
                    url: s.url,
                    score: s.score,
                    industry: s.industry,
                    ip: s.ip || '',
                    resultUrl: s.resultUrl || ''
                  })),
                  `commodity-test-scans-${new Date().toISOString().slice(0, 10)}.csv`
                )}
                className="px-3 py-1.5 bg-green-600 text-white text-sm hover:bg-green-700"
              >
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-2 text-[var(--muted-foreground)] font-medium">Date</th>
                    <th className="text-left py-3 px-2 text-[var(--muted-foreground)] font-medium">Company</th>
                    <th className="text-left py-3 px-2 text-[var(--muted-foreground)] font-medium">Industry</th>
                    <th className="text-left py-3 px-2 text-[var(--muted-foreground)] font-medium">IP</th>
                    <th className="text-left py-3 px-2 text-[var(--muted-foreground)] font-medium">Result</th>
                    <th className="text-right py-3 px-2 text-[var(--muted-foreground)] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleScans.map((scan, i) => (
                    <tr key={i} className={`border-b border-[var(--border)] hover:bg-[var(--muted)]/50 ${scan.ignored ? 'opacity-40' : ''}`}>
                      <td className="py-3 px-2 text-[var(--muted-foreground)]">{formatDate(scan.timestamp)}</td>
                      <td className="py-3 px-2 text-[var(--foreground)]">
                        <div className="flex items-center gap-2">
                          <span className={scan.ignored ? 'line-through' : ''}>{scan.companyName}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                            scan.score >= 70 ? 'bg-green-500/20 text-green-400' :
                            scan.score >= 55 ? 'bg-yellow-500/20 text-yellow-400' :
                            scan.score >= 40 ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'
                          }`}>{scan.score}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs text-[var(--muted-foreground)] truncate max-w-[200px]">{scan.url}</span>
                          <button
                            onClick={() => copyUrl(scan.url)}
                            className="p-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            title="Copy URL"
                          >
                            {copiedUrl === scan.url ? <CheckIcon /> : <CopyIcon />}
                          </button>
                          <button
                            onClick={() => rerunScan(scan.url)}
                            className="p-0.5 text-[var(--muted-foreground)] hover:text-[var(--accent)]"
                            title="Rerun analysis"
                          >
                            <RerunIcon />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className="text-xs px-2 py-0.5 rounded capitalize"
                          style={{
                            backgroundColor: `${INDUSTRY_COLORS[scan.industry] || INDUSTRY_COLORS.general}20`,
                            color: INDUSTRY_COLORS[scan.industry] || INDUSTRY_COLORS.general
                          }}
                        >
                          {scan.industry}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {scan.ip && (
                          <div className="flex items-center gap-1">
                            <span className={`text-xs font-mono ${ignoredIPSet.has(scan.ip) ? 'text-red-400 line-through' : 'text-[var(--muted-foreground)]'}`}>
                              {scan.ip}
                            </span>
                            <button
                              onClick={() => toggleIgnoreIP(scan.ip!, ignoredIPSet.has(scan.ip!))}
                              className={`p-1 rounded hover:bg-[var(--muted)] ${ignoredIPSet.has(scan.ip) ? 'text-green-400' : 'text-red-400'}`}
                              title={ignoredIPSet.has(scan.ip) ? 'Unignore this IP' : 'Ignore this IP'}
                            >
                              {ignoredIPSet.has(scan.ip) ? <UnignoreIcon /> : <IgnoreIcon />}
                            </button>
                          </div>
                        )}
                        {!scan.ip && <span className="text-[var(--muted-foreground)]">—</span>}
                      </td>
                      <td className="py-3 px-2">
                        {scan.resultUrl && (
                          <a
                            href={scan.resultUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--accent)] hover:underline"
                          >
                            View →
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleIgnore('scan', scan.timestamp, !!scan.ignored)}
                            className={`p-1.5 rounded hover:bg-[var(--muted)] ${scan.ignored ? 'text-green-400' : 'text-yellow-400'}`}
                            title={scan.ignored ? 'Unignore' : 'Ignore'}
                          >
                            {scan.ignored ? <UnignoreIcon /> : <IgnoreIcon />}
                          </button>
                          <button
                            onClick={() => deleteRecord('scan', scan.timestamp)}
                            className="p-1.5 rounded hover:bg-[var(--muted)] text-red-400"
                            title="Delete"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visibleScans.length === 0 && (
                <p className="text-[var(--muted-foreground)] text-center py-8">No scans yet</p>
              )}
            </div>
          </div>
        )}

        {/* Guide emails tab */}
        {activeTab === 'guide' && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => downloadCSV(
                  visibleGuide.filter(g => !g.ignored).map(g => ({
                    date: formatDate(g.timestamp),
                    email: g.email,
                    firstName: g.firstName || '',
                    source: g.source
                  })),
                  `commodity-test-guide-emails-${new Date().toISOString().slice(0, 10)}.csv`
                )}
                className="px-3 py-1.5 bg-green-600 text-white text-sm hover:bg-green-700"
              >
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-2 text-[var(--muted-foreground)] font-medium">Date</th>
                    <th className="text-left py-3 px-2 text-[var(--muted-foreground)] font-medium">Email</th>
                    <th className="text-left py-3 px-2 text-[var(--muted-foreground)] font-medium">Name</th>
                    <th className="text-right py-3 px-2 text-[var(--muted-foreground)] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleGuide.map((lead, i) => (
                    <tr key={i} className={`border-b border-[var(--border)] hover:bg-[var(--muted)]/50 ${lead.ignored ? 'opacity-40' : ''}`}>
                      <td className="py-3 px-2 text-[var(--muted-foreground)]">{formatDate(lead.timestamp)}</td>
                      <td className={`py-3 px-2 text-[var(--foreground)] ${lead.ignored ? 'line-through' : ''}`}>{lead.email}</td>
                      <td className="py-3 px-2 text-[var(--muted-foreground)]">{lead.firstName || '—'}</td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleIgnore('guide', lead.timestamp, !!lead.ignored)}
                            className={`p-1.5 rounded hover:bg-[var(--muted)] ${lead.ignored ? 'text-green-400' : 'text-yellow-400'}`}
                            title={lead.ignored ? 'Unignore' : 'Ignore'}
                          >
                            {lead.ignored ? <UnignoreIcon /> : <IgnoreIcon />}
                          </button>
                          <button
                            onClick={() => deleteRecord('guide', lead.timestamp)}
                            className="p-1.5 rounded hover:bg-[var(--muted)] text-red-400"
                            title="Delete"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visibleGuide.length === 0 && (
                <p className="text-[var(--muted-foreground)] text-center py-8">No guide downloads yet</p>
              )}
            </div>
          </div>
        )}

        {/* Result emails tab */}
        {activeTab === 'resultEmails' && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => downloadCSV(
                  visibleResults.filter(r => !r.ignored).map(r => ({
                    date: formatDate(r.timestamp),
                    email: r.email,
                    company: r.companyName,
                    resultUrl: r.resultUrl || ''
                  })),
                  `commodity-test-result-saves-${new Date().toISOString().slice(0, 10)}.csv`
                )}
                className="px-3 py-1.5 bg-green-600 text-white text-sm hover:bg-green-700"
              >
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-2 text-[var(--muted-foreground)] font-medium">Date</th>
                    <th className="text-left py-3 px-2 text-[var(--muted-foreground)] font-medium">Email</th>
                    <th className="text-left py-3 px-2 text-[var(--muted-foreground)] font-medium">Company</th>
                    <th className="text-left py-3 px-2 text-[var(--muted-foreground)] font-medium">Result</th>
                    <th className="text-right py-3 px-2 text-[var(--muted-foreground)] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleResults.map((re, i) => (
                    <tr key={i} className={`border-b border-[var(--border)] hover:bg-[var(--muted)]/50 ${re.ignored ? 'opacity-40' : ''}`}>
                      <td className="py-3 px-2 text-[var(--muted-foreground)]">{formatDate(re.timestamp)}</td>
                      <td className={`py-3 px-2 text-[var(--foreground)] ${re.ignored ? 'line-through' : ''}`}>{re.email}</td>
                      <td className="py-3 px-2 text-[var(--muted-foreground)]">{re.companyName}</td>
                      <td className="py-3 px-2">
                        {re.resultUrl && (
                          <a
                            href={re.resultUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--accent)] hover:underline"
                          >
                            View →
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleIgnore('result', re.timestamp, !!re.ignored)}
                            className={`p-1.5 rounded hover:bg-[var(--muted)] ${re.ignored ? 'text-green-400' : 'text-yellow-400'}`}
                            title={re.ignored ? 'Unignore' : 'Ignore'}
                          >
                            {re.ignored ? <UnignoreIcon /> : <IgnoreIcon />}
                          </button>
                          <button
                            onClick={() => deleteRecord('result', re.timestamp)}
                            className="p-1.5 rounded hover:bg-[var(--muted)] text-red-400"
                            title="Delete"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visibleResults.length === 0 && (
                <p className="text-[var(--muted-foreground)] text-center py-8">No result saves yet</p>
              )}
            </div>
          </div>
        )}

        {/* Contacts tab */}
        {activeTab === 'contacts' && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => downloadCSV(
                  visibleContacts.filter(c => !c.ignored).map(c => ({
                    date: formatDate(c.timestamp),
                    name: c.name,
                    email: c.email,
                    message: c.message
                  })),
                  `commodity-test-contacts-${new Date().toISOString().slice(0, 10)}.csv`
                )}
                className="px-3 py-1.5 bg-green-600 text-white text-sm hover:bg-green-700"
              >
                Export CSV
              </button>
            </div>
            <div className="space-y-4">
              {visibleContacts.map((contact, i) => (
                <div key={i} className={`bg-[var(--muted)] p-4 ${contact.ignored ? 'opacity-40' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className={`text-[var(--foreground)] font-medium ${contact.ignored ? 'line-through' : ''}`}>{contact.name}</p>
                      <p className="text-[var(--accent)] text-sm">{contact.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[var(--muted-foreground)] text-xs">{formatDate(contact.timestamp)}</p>
                      <button
                        onClick={() => toggleIgnore('contact', contact.timestamp, !!contact.ignored)}
                        className={`p-1.5 rounded hover:bg-[var(--background)] ${contact.ignored ? 'text-green-400' : 'text-yellow-400'}`}
                        title={contact.ignored ? 'Unignore' : 'Ignore'}
                      >
                        {contact.ignored ? <UnignoreIcon /> : <IgnoreIcon />}
                      </button>
                      <button
                        onClick={() => deleteRecord('contact', contact.timestamp)}
                        className="p-1.5 rounded hover:bg-[var(--background)] text-red-400"
                        title="Delete"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                  <p className="text-[var(--foreground)] text-sm whitespace-pre-wrap">{contact.message}</p>
                </div>
              ))}
              {visibleContacts.length === 0 && (
                <p className="text-[var(--muted-foreground)] text-center py-8">No contact submissions yet</p>
              )}
            </div>
          </div>
        )}

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-[var(--muted)] p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Ignored IPs</h3>
              <p className="text-[var(--muted-foreground)] text-sm mb-4">
                Records from these IPs are excluded from stats. Click the ignore icon next to any IP in the Scans tab to add it here.
              </p>
              {data.ignoredIPs.length > 0 ? (
                <div className="space-y-2">
                  {data.ignoredIPs.map((ip, i) => (
                    <div key={i} className="flex items-center justify-between bg-[var(--background)] p-3">
                      <code className="text-sm font-mono text-[var(--foreground)]">{ip}</code>
                      <button
                        onClick={() => toggleIgnoreIP(ip, true)}
                        className="text-green-400 hover:text-green-300 text-sm"
                      >
                        Unignore
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--muted-foreground)] text-sm">No IPs ignored yet</p>
              )}
            </div>

            <div className="bg-[var(--muted)] p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">How ignoring works</h3>
              <ul className="text-[var(--muted-foreground)] text-sm space-y-2">
                <li>• <strong>Ignore</strong> hides a record from stats but keeps it in the database</li>
                <li>• <strong>Ignore IP</strong> hides ALL records from that IP address</li>
                <li>• <strong>Delete</strong> is the same as ignore (KV lists don't support true deletion)</li>
                <li>• Toggle "Show ignored" to see hidden records (they appear faded)</li>
                <li>• Click the eye icon to unignore any record</li>
              </ul>
            </div>

            <div className="bg-[var(--muted)] p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Industry color legend</h3>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(INDUSTRY_COLORS).map(([industry, color]) => (
                  <div key={industry} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                    <span className="text-sm text-[var(--muted-foreground)] capitalize">{industry}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
