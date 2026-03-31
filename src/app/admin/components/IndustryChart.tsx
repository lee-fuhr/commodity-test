'use client'

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

function ScoreDistribution({ scans }: { scans: ScanEntry[] }) {
  const scansWithScores = scans.filter(s => typeof s.score === 'number' && !isNaN(s.score))

  if (scansWithScores.length === 0) {
    return (
      <div className="bg-[var(--muted)] p-4 mb-6">
        <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Score distribution</h3>
        <p className="text-xs text-[var(--muted-foreground)]">No scans with scores yet</p>
      </div>
    )
  }

  const sorted = [...scansWithScores].sort((a, b) => a.score - b.score)

  return (
    <div className="bg-[var(--muted)] p-4 mb-6">
      <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Score distribution</h3>
      <div className="relative h-20 mb-2">
        {sorted.map((scan, idx) => {
          const left = (scan.score / 100) * 100
          const sameScoreIndex = sorted.slice(0, idx).filter(s => Math.abs(s.score - scan.score) < 3).length
          const bottom = 4 + (sameScoreIndex * 14)

          return (
            <a
              key={`${scan.timestamp}-${idx}`}
              href={scan.resultUrl || `/r/${scan.resultId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute w-3 h-3 rounded-full cursor-pointer hover:scale-150 transition-transform z-10 hover:z-50 group/dot"
              style={{
                left: `${left}%`,
                bottom: `${Math.min(bottom, 64)}px`,
                backgroundColor: INDUSTRY_COLORS[scan.industry] || INDUSTRY_COLORS.general,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[var(--background)] border border-[var(--border)] px-2 py-1.5 rounded text-xs opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-lg">
                <div className="font-medium text-[var(--foreground)]">{scan.companyName}</div>
                <div className="text-[var(--muted-foreground)]">Score: {scan.score} • {scan.industry}</div>
              </div>
            </a>
          )
        })}
      </div>
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

function ScansPerDay({ scans }: { scans: ScanEntry[] }) {
  const today = new Date()
  const days: { date: string; label: string; count: number }[] = []

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    days.push({ date: dateStr, label, count: 0 })
  }

  scans.forEach(s => {
    const scanDate = s.timestamp.slice(0, 10)
    const day = days.find(d => d.date === scanDate)
    if (day) day.count++
  })

  const maxCount = Math.max(...days.map(d => d.count), 1)
  const totalScans = days.reduce((sum, d) => sum + d.count, 0)

  if (totalScans === 0) {
    return (
      <div className="bg-[var(--muted)] p-4 mb-6">
        <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Scans per day</h3>
        <p className="text-xs text-[var(--muted-foreground)]">No scans in the last 14 days</p>
      </div>
    )
  }

  const firstDataIndex = days.findIndex(d => d.count > 0)
  const visibleDays = firstDataIndex > 0 ? days.slice(Math.max(0, firstDataIndex - 1)) : days

  return (
    <div className="bg-[var(--muted)] p-4 mb-6">
      <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">
        Scans per day <span className="text-[var(--muted-foreground)] font-normal">({totalScans} total)</span>
      </h3>
      <div className="flex items-end gap-1 h-20">
        {visibleDays.map((day) => {
          const height = (day.count / maxCount) * 100
          return (
            <div key={day.date} className="flex-1 h-full flex flex-col items-center justify-end group relative">
              <div
                className="w-full bg-[var(--accent)] rounded-t transition-all"
                style={{ height: `${height}%`, minHeight: day.count > 0 ? '4px' : '0' }}
              />
              {day.count > 0 && (
                <div className="absolute bottom-full mb-1 bg-[var(--background)] border border-[var(--border)] px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {day.count} scan{day.count !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-[9px] text-[var(--muted-foreground)] mt-1">
        {visibleDays.filter((_, i) => i % Math.ceil(visibleDays.length / 7) === 0 || i === visibleDays.length - 1).map(day => (
          <span key={day.date}>{day.label}</span>
        ))}
      </div>
    </div>
  )
}

interface Props {
  scans: ScanEntry[]
  industryColors: Record<string, string>
}

export function IndustryChart({ scans, industryColors }: Props) {
  return (
    <>
      <ScansPerDay scans={scans} />
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <IndustryBreakdown scans={scans} />
        <ScoreDistribution scans={scans} />
      </div>
      {/* Industry color legend */}
      <div className="bg-[var(--muted)] p-4 mb-6">
        <h3 className="text-sm font-medium text-[var(--foreground)] mb-3">Industry color legend</h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(industryColors).map(([industry, color]) => (
            <div key={industry} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
              <span className="text-sm text-[var(--muted-foreground)] capitalize">{industry}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export { INDUSTRY_COLORS }
