'use client'

import { useState } from 'react'

export interface ScanEntry {
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

const INDUSTRY_COLORS: Record<string, string> = {
  manufacturing: '#3b82f6',
  saas: '#8b5cf6',
  agency: '#f43f5e',
  services: '#10b981',
  construction: '#eab308',
  distribution: '#06b6d4',
  healthcare: '#ec4899',
  finance: '#14b8a6',
  retail: '#f97316',
  general: '#6b7280',
}

const INDUSTRY_OPTIONS = [
  'manufacturing', 'distribution', 'saas', 'agency', 'services',
  'construction', 'healthcare', 'finance', 'retail', 'general',
] as const

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
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

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

interface Props {
  scans: ScanEntry[]
  ignoredIPSet: Set<string>
  onToggleIgnore: (type: string, timestamp: string, currentlyIgnored: boolean) => void
  onToggleIgnoreIP: (ip: string, currentlyIgnored: boolean) => void
  onDelete: (type: string, timestamp: string) => void
  onSetIndustry: (resultId: string, newIndustry: string) => void
}

export function ScanLogTable({
  scans,
  ignoredIPSet,
  onToggleIgnore,
  onToggleIgnoreIP,
  onDelete,
  onSetIndustry,
}: Props) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const rerunScan = (url: string) => {
    window.open(`/processing?url=${encodeURIComponent(url)}`, '_blank')
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => downloadCSV(
            scans.filter(s => !s.ignored).map(s => ({
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
            {scans.map((scan, i) => (
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
                    <a
                      href={scan.url.startsWith('http') ? scan.url : `https://${scan.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-0.5 text-[var(--muted-foreground)] hover:text-[var(--accent)]"
                      title="Open site"
                    >
                      <ExternalLinkIcon />
                    </a>
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
                  <select
                    value={scan.industry}
                    onChange={(e) => onSetIndustry(scan.resultId, e.target.value)}
                    className="text-xs px-2 py-1 rounded capitalize cursor-pointer border-0 outline-none"
                    style={{
                      backgroundColor: `${INDUSTRY_COLORS[scan.industry] || INDUSTRY_COLORS.general}20`,
                      color: INDUSTRY_COLORS[scan.industry] || INDUSTRY_COLORS.general
                    }}
                  >
                    {INDUSTRY_OPTIONS.map(ind => (
                      <option key={ind} value={ind} className="bg-[var(--background)] text-[var(--foreground)]">
                        {ind}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-2">
                  {scan.ip && (
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-mono ${ignoredIPSet.has(scan.ip) ? 'text-red-400 line-through' : 'text-[var(--muted-foreground)]'}`}>
                        {scan.ip}
                      </span>
                      <button
                        onClick={() => onToggleIgnoreIP(scan.ip!, ignoredIPSet.has(scan.ip!))}
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
                      onClick={() => onToggleIgnore('scan', scan.timestamp, !!scan.ignored)}
                      className={`p-1.5 rounded hover:bg-[var(--muted)] ${scan.ignored ? 'text-green-400' : 'text-yellow-400'}`}
                      title={scan.ignored ? 'Unignore' : 'Ignore'}
                    >
                      {scan.ignored ? <UnignoreIcon /> : <IgnoreIcon />}
                    </button>
                    <button
                      onClick={() => onDelete('scan', scan.timestamp)}
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
        {scans.length === 0 && (
          <p className="text-[var(--muted-foreground)] text-center py-8">No scans yet</p>
        )}
      </div>
    </div>
  )
}
