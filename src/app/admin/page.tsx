'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ScanEntry {
  url: string
  resultId: string
  companyName: string
  score: number
  industry: string
  timestamp: string
  resultUrl?: string
}

interface GuideEmail {
  email: string
  firstName: string | null
  timestamp: string
  source: string
}

interface ContactSubmission {
  name: string
  email: string
  message: string
  timestamp: string
}

interface ResultEmail {
  email: string
  resultId: string
  companyName: string
  timestamp: string
  resultUrl?: string
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
        // Escape quotes and wrap in quotes if contains comma
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

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<StatsData | null>(null)
  const [activeTab, setActiveTab] = useState<'scans' | 'guide' | 'resultEmails' | 'contacts'>('scans')

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
          <div className="flex gap-3">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-[var(--border)]">
          <button
            onClick={() => setActiveTab('scans')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'scans'
                ? 'border-[var(--accent)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            Scans ({data.recentScans.length})
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'guide'
                ? 'border-[var(--accent)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            Guide ({data.guideEmails.length})
          </button>
          <button
            onClick={() => setActiveTab('resultEmails')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'resultEmails'
                ? 'border-[var(--accent)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            Saves ({data.resultEmails.length})
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'contacts'
                ? 'border-[var(--accent)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            Contacts ({data.contactSubmissions.length})
          </button>
        </div>

        {/* Scans tab */}
        {activeTab === 'scans' && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => downloadCSV(
                  data.recentScans.map(s => ({
                    date: formatDate(s.timestamp),
                    company: s.companyName,
                    url: s.url,
                    score: s.score,
                    industry: s.industry,
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
                    <th className="text-left py-3 px-2 text-[var(--muted-foreground)] font-medium">Score</th>
                    <th className="text-left py-3 px-2 text-[var(--muted-foreground)] font-medium">Industry</th>
                    <th className="text-left py-3 px-2 text-[var(--muted-foreground)] font-medium">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentScans.map((scan, i) => (
                    <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50">
                      <td className="py-3 px-2 text-[var(--muted-foreground)]">{formatDate(scan.timestamp)}</td>
                      <td className="py-3 px-2 text-[var(--foreground)]">
                        <div>{scan.companyName}</div>
                        <div className="text-xs text-[var(--muted-foreground)] truncate max-w-[200px]">{scan.url}</div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`font-semibold ${
                          scan.score >= 70 ? 'text-green-400' :
                          scan.score >= 55 ? 'text-yellow-400' :
                          scan.score >= 40 ? 'text-orange-400' : 'text-red-400'
                        }`}>{scan.score}</span>
                      </td>
                      <td className="py-3 px-2 text-[var(--muted-foreground)] capitalize">{scan.industry}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.recentScans.length === 0 && (
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
                  data.guideEmails.map(g => ({
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
                  </tr>
                </thead>
                <tbody>
                  {data.guideEmails.map((lead, i) => (
                    <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50">
                      <td className="py-3 px-2 text-[var(--muted-foreground)]">{formatDate(lead.timestamp)}</td>
                      <td className="py-3 px-2 text-[var(--foreground)]">{lead.email}</td>
                      <td className="py-3 px-2 text-[var(--muted-foreground)]">{lead.firstName || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.guideEmails.length === 0 && (
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
                  data.resultEmails.map(r => ({
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
                  </tr>
                </thead>
                <tbody>
                  {data.resultEmails.map((re, i) => (
                    <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50">
                      <td className="py-3 px-2 text-[var(--muted-foreground)]">{formatDate(re.timestamp)}</td>
                      <td className="py-3 px-2 text-[var(--foreground)]">{re.email}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.resultEmails.length === 0 && (
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
                  data.contactSubmissions.map(c => ({
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
              {data.contactSubmissions.map((contact, i) => (
                <div key={i} className="bg-[var(--muted)] p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[var(--foreground)] font-medium">{contact.name}</p>
                      <p className="text-[var(--accent)] text-sm">{contact.email}</p>
                    </div>
                    <p className="text-[var(--muted-foreground)] text-xs">{formatDate(contact.timestamp)}</p>
                  </div>
                  <p className="text-[var(--foreground)] text-sm whitespace-pre-wrap">{contact.message}</p>
                </div>
              ))}
              {data.contactSubmissions.length === 0 && (
                <p className="text-[var(--muted-foreground)] text-center py-8">No contact submissions yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
