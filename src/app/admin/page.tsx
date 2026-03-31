'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { VERSION } from '@/lib/version'
import { ScanLogTable } from './components/ScanLogTable'
import type { ScanEntry } from './components/ScanLogTable'
import { VoteStats } from './components/VoteStats'
import type { VoteStatsData } from './components/VoteStats'
import { IndustryChart, INDUSTRY_COLORS } from './components/IndustryChart'
import { GuideEmailList, ResultEmailList, ContactList } from './components/EmailList'
import type { GuideEmail, ResultEmail, ContactSubmission } from './components/EmailList'

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
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<StatsData | null>(null)
  const [activeTab, setActiveTab] = useState<'scans' | 'guide' | 'resultEmails' | 'contacts' | 'votes' | 'settings'>('scans')
  const [showIgnored, setShowIgnored] = useState(false)
  const [voteStats, setVoteStats] = useState<VoteStatsData | null>(null)
  const [recategorizing, setRecategorizing] = useState(false)
  const [recategorizeResult, setRecategorizeResult] = useState<{ message: string; changes: Array<{ id: string; url?: string; from: string; to: string }> } | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('commodity-admin-key')
    if (saved) {
      setPassword(saved)
      fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${saved}` } })
        .then(res => {
          if (res.ok) {
            res.json().then(statsData => {
              setData(statsData)
              setAuthenticated(true)
              fetch('/api/vote').then(vRes => { if (vRes.ok) vRes.json().then(setVoteStats) })
            })
          } else {
            localStorage.removeItem('commodity-admin-key')
          }
        })
        .catch(() => { /* Network error — keep saved key */ })
    }
  }, [])

  const fetchVotes = async () => {
    try {
      const res = await fetch('/api/vote')
      if (res.ok) setVoteStats(await res.json())
    } catch (e) {
      console.error('Failed to fetch votes:', e)
    }
  }

  const refresh = async () => {
    if (!password) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${password}` } })
      if (res.ok) setData(await res.json())
      await fetchVotes()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authenticated || !password) return
    const interval = setInterval(refresh, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [authenticated, password])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${password}` } })
      if (res.status === 401) {
        setError('Invalid password')
        localStorage.removeItem('commodity-admin-key')
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error('Failed to fetch')
      setData(await res.json())
      setAuthenticated(true)
      localStorage.setItem('commodity-admin-key', password)
      fetchVotes()
    } catch {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const performAction = async (action: string, params: Record<string, string>) => {
    try {
      const res = await fetch('/api/admin/stats', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${password}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params })
      })
      if (res.ok) await refresh()
    } catch (e) {
      console.error('Action failed:', e)
    }
  }

  const toggleIgnore = (type: string, timestamp: string, currentlyIgnored: boolean) =>
    performAction(currentlyIgnored ? 'unignore' : 'ignore', { type, timestamp })

  const toggleIgnoreIP = (ip: string, currentlyIgnored: boolean) =>
    performAction(currentlyIgnored ? 'unignore-ip' : 'ignore-ip', { ip })

  const deleteRecord = (type: string, timestamp: string) => {
    if (confirm('Delete this record? (It will be hidden from stats)'))
      performAction('delete', { type, timestamp })
  }

  const setIndustry = async (resultId: string, newIndustry: string) => {
    try {
      const res = await fetch('/api/admin/stats', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${password}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set-industry', resultId, newIndustry })
      })
      if (res.ok) refresh()
    } catch (err) {
      console.error('Failed to set industry:', err)
    }
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-6 text-center">Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
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
          <p className="text-[var(--muted-foreground)] text-xs mt-4 text-center">Password is your ADMIN_API_KEY from Vercel</p>
          <p className="text-[var(--muted-foreground)] text-[10px] mt-6 text-center opacity-50">v{VERSION}</p>
        </div>
      </main>
    )
  }

  if (!data) return null

  const ignoredIPSet = new Set(data.ignoredIPs)
  const visibleScans = showIgnored ? data.recentScans : data.recentScans.filter(s => !s.ignored)
  const visibleGuide = showIgnored ? data.guideEmails : data.guideEmails.filter(g => !g.ignored)
  const visibleResults = showIgnored ? data.resultEmails : data.resultEmails.filter(r => !r.ignored)
  const visibleContacts = showIgnored ? data.contactSubmissions : data.contactSubmissions.filter(c => !c.ignored)

  return (
    <main className="min-h-screen bg-[var(--background)] py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              Commodity Test Admin <span className="text-sm font-normal text-[var(--muted-foreground)]">v{VERSION}</span>
            </h1>
            <p className="text-[var(--muted-foreground)] text-sm">Last updated: {formatDate(data.summary.lastUpdated)}</p>
          </div>
          <div className="flex gap-3 items-center">
            <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] cursor-pointer">
              <input type="checkbox" checked={showIgnored} onChange={(e) => setShowIgnored(e.target.checked)} className="w-4 h-4" />
              Show ignored
            </label>
            <button onClick={refresh} disabled={loading} className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] text-sm hover:bg-[var(--border)] disabled:opacity-50">
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link href="/" className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] text-sm hover:bg-[var(--border)]">← Back to site</Link>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { value: visibleScans.length, label: 'Sites analyzed' },
            { value: visibleGuide.length, label: 'Guide downloads' },
            { value: visibleResults.length, label: 'Report saves' },
            { value: visibleContacts.length, label: 'Contact forms' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-[var(--muted)] p-4">
              <p className="text-3xl font-semibold text-[var(--foreground)]">{value}</p>
              <p className="text-[var(--muted-foreground)] text-sm">{label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <IndustryChart scans={visibleScans} industryColors={INDUSTRY_COLORS} />

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-[var(--border)] overflow-x-auto">
          {(['scans', 'guide', 'resultEmails', 'contacts', 'votes', 'settings'] as const).map(tab => (
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
              {tab === 'votes' && `Votes (${voteStats?.totalVotes || 0})`}
              {tab === 'settings' && `Settings`}
            </button>
          ))}
        </div>

        {activeTab === 'scans' && (
          <ScanLogTable
            scans={visibleScans}
            ignoredIPSet={ignoredIPSet}
            onToggleIgnore={toggleIgnore}
            onToggleIgnoreIP={toggleIgnoreIP}
            onDelete={deleteRecord}
            onSetIndustry={setIndustry}
          />
        )}

        {activeTab === 'guide' && (
          <GuideEmailList entries={visibleGuide} onToggleIgnore={toggleIgnore} onDelete={deleteRecord} />
        )}

        {activeTab === 'resultEmails' && (
          <ResultEmailList entries={visibleResults} onToggleIgnore={toggleIgnore} onDelete={deleteRecord} />
        )}

        {activeTab === 'contacts' && (
          <ContactList entries={visibleContacts} onToggleIgnore={toggleIgnore} onDelete={deleteRecord} />
        )}

        {activeTab === 'votes' && <VoteStats voteStats={voteStats} />}

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
                      <button onClick={() => toggleIgnoreIP(ip, true)} className="text-green-400 hover:text-green-300 text-sm">Unignore</button>
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
                <li>• <strong>Delete</strong> is the same as ignore (KV lists don&apos;t support true deletion)</li>
                <li>• Toggle &quot;Show ignored&quot; to see hidden records (they appear faded)</li>
                <li>• Click the eye icon to unignore any record</li>
              </ul>
            </div>

            <div className="bg-[var(--muted)] p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Recategorize industries</h3>
              <p className="text-[var(--muted-foreground)] text-sm mb-4">
                Re-scrapes all URLs and re-runs industry detection. Takes ~30 seconds for 25 results.
              </p>
              <button
                onClick={async () => {
                  setRecategorizing(true)
                  setRecategorizeResult(null)
                  try {
                    const res = await fetch('/api/admin/stats', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${password}` },
                      body: JSON.stringify({ action: 'recategorize' }),
                    })
                    const resData = await res.json()
                    if (res.ok) {
                      setRecategorizeResult(resData)
                      refresh()
                    } else {
                      setError(resData.error || 'Failed to recategorize')
                    }
                  } catch {
                    setError('Failed to recategorize')
                  } finally {
                    setRecategorizing(false)
                  }
                }}
                disabled={recategorizing}
                className="bg-[var(--accent)] text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {recategorizing ? 'Recategorizing...' : 'Recategorize all results'}
              </button>
              {recategorizeResult && (
                <div className="mt-4 p-4 bg-[var(--background)] border border-[var(--border)]">
                  <p className="text-[var(--foreground)] font-medium mb-2">{recategorizeResult.message}</p>
                  {recategorizeResult.changes.length > 0 && (
                    <div className="space-y-1 text-sm">
                      {recategorizeResult.changes.slice(0, 20).map((change, i) => (
                        <div key={i} className="text-[var(--muted-foreground)]">
                          <span className="truncate max-w-[200px] inline-block align-bottom">{change.url || change.id.slice(0, 8)}</span>: <span className="text-red-400">{change.from}</span> → <span className="text-green-400">{change.to}</span>
                        </div>
                      ))}
                      {recategorizeResult.changes.length > 20 && (
                        <p className="text-[var(--muted-foreground)]">...and {recategorizeResult.changes.length - 20} more</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
