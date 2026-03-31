'use client'

export interface VoteEntry {
  resultId: string
  fixNumber: number
  suggestionIndex: number
  vote: 'up' | 'down'
  approach: string
  originalPhrase: string
  suggestionText: string
  timestamp: string
}

export interface VoteStatsData {
  totalVotes: number
  recentVotes: VoteEntry[]
  approachStats: Record<string, { up: number; down: number; ratio: number }>
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

interface Props {
  voteStats: VoteStatsData | null
}

export function VoteStats({ voteStats }: Props) {
  return (
    <div className="space-y-6">
      {/* Approach effectiveness */}
      <div className="bg-[var(--muted)] p-6">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Approach effectiveness</h3>
        <p className="text-[var(--muted-foreground)] text-sm mb-4">
          Which suggestion approaches resonate with users? Higher ratio = more helpful.
        </p>
        {voteStats && Object.keys(voteStats.approachStats).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(voteStats.approachStats).map(([approach, stats]) => (
              <div key={approach} className="flex items-center gap-3">
                <span className="text-sm text-[var(--foreground)] w-40 truncate capitalize">{approach}</span>
                <div className="flex-1 h-6 bg-[var(--background)] rounded overflow-hidden flex">
                  <div
                    className="h-full bg-green-500/70"
                    style={{ width: `${stats.ratio}%` }}
                    title={`${stats.up} upvotes`}
                  />
                  <div
                    className="h-full bg-red-500/70"
                    style={{ width: `${100 - stats.ratio}%` }}
                    title={`${stats.down} downvotes`}
                  />
                </div>
                <span className="text-xs text-[var(--muted-foreground)] w-20 text-right">
                  {stats.ratio}% ({stats.up + stats.down})
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[var(--muted-foreground)] text-sm">No votes yet</p>
        )}
      </div>

      {/* Recent votes */}
      <div className="bg-[var(--muted)] p-6">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Recent votes</h3>
        {voteStats && voteStats.recentVotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2 px-2 text-[var(--muted-foreground)] font-medium">Date</th>
                  <th className="text-left py-2 px-2 text-[var(--muted-foreground)] font-medium">Vote</th>
                  <th className="text-left py-2 px-2 text-[var(--muted-foreground)] font-medium">Approach</th>
                  <th className="text-left py-2 px-2 text-[var(--muted-foreground)] font-medium">Original phrase</th>
                  <th className="text-left py-2 px-2 text-[var(--muted-foreground)] font-medium">Suggestion</th>
                </tr>
              </thead>
              <tbody>
                {voteStats.recentVotes.slice(0, 50).map((vote, i) => (
                  <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--background)]/50">
                    <td className="py-2 px-2 text-[var(--muted-foreground)] text-xs">{formatDate(vote.timestamp)}</td>
                    <td className="py-2 px-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${vote.vote === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {vote.vote === 'up' ? '👍' : '👎'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-[var(--foreground)] capitalize text-xs">{vote.approach}</td>
                    <td className="py-2 px-2 text-[var(--muted-foreground)] text-xs max-w-[200px] truncate">{vote.originalPhrase}</td>
                    <td className="py-2 px-2 text-[var(--foreground)] text-xs max-w-[300px] truncate">{vote.suggestionText}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {voteStats.recentVotes.length > 50 && (
              <p className="text-[var(--muted-foreground)] text-xs mt-2">Showing 50 of {voteStats.recentVotes.length} votes</p>
            )}
          </div>
        ) : (
          <p className="text-[var(--muted-foreground)] text-sm">No votes yet</p>
        )}
      </div>
    </div>
  )
}
