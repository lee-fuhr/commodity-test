'use client'

export interface GuideEmail {
  email: string
  firstName: string | null
  timestamp: string
  source: string
  ignored?: boolean
}

export interface ContactSubmission {
  name: string
  email: string
  message: string
  timestamp: string
  ignored?: boolean
}

export interface ResultEmail {
  email: string
  resultId: string
  companyName: string
  timestamp: string
  resultUrl?: string
  ignored?: boolean
}

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

interface GuideListProps {
  entries: GuideEmail[]
  onToggleIgnore: (type: string, timestamp: string, currentlyIgnored: boolean) => void
  onDelete: (type: string, timestamp: string) => void
}

export function GuideEmailList({ entries, onToggleIgnore, onDelete }: GuideListProps) {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => downloadCSV(
            entries.filter(g => !g.ignored).map(g => ({
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
            {entries.map((lead, i) => (
              <tr key={i} className={`border-b border-[var(--border)] hover:bg-[var(--muted)]/50 ${lead.ignored ? 'opacity-40' : ''}`}>
                <td className="py-3 px-2 text-[var(--muted-foreground)]">{formatDate(lead.timestamp)}</td>
                <td className={`py-3 px-2 text-[var(--foreground)] ${lead.ignored ? 'line-through' : ''}`}>{lead.email}</td>
                <td className="py-3 px-2 text-[var(--muted-foreground)]">{lead.firstName || '—'}</td>
                <td className="py-3 px-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onToggleIgnore('guide', lead.timestamp, !!lead.ignored)}
                      className={`p-1.5 rounded hover:bg-[var(--muted)] ${lead.ignored ? 'text-green-400' : 'text-yellow-400'}`}
                      title={lead.ignored ? 'Unignore' : 'Ignore'}
                    >
                      {lead.ignored ? <UnignoreIcon /> : <IgnoreIcon />}
                    </button>
                    <button
                      onClick={() => onDelete('guide', lead.timestamp)}
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
        {entries.length === 0 && (
          <p className="text-[var(--muted-foreground)] text-center py-8">No guide downloads yet</p>
        )}
      </div>
    </div>
  )
}

interface ResultEmailListProps {
  entries: ResultEmail[]
  onToggleIgnore: (type: string, timestamp: string, currentlyIgnored: boolean) => void
  onDelete: (type: string, timestamp: string) => void
}

export function ResultEmailList({ entries, onToggleIgnore, onDelete }: ResultEmailListProps) {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => downloadCSV(
            entries.filter(r => !r.ignored).map(r => ({
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
            {entries.map((re, i) => (
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
                      onClick={() => onToggleIgnore('result', re.timestamp, !!re.ignored)}
                      className={`p-1.5 rounded hover:bg-[var(--muted)] ${re.ignored ? 'text-green-400' : 'text-yellow-400'}`}
                      title={re.ignored ? 'Unignore' : 'Ignore'}
                    >
                      {re.ignored ? <UnignoreIcon /> : <IgnoreIcon />}
                    </button>
                    <button
                      onClick={() => onDelete('result', re.timestamp)}
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
        {entries.length === 0 && (
          <p className="text-[var(--muted-foreground)] text-center py-8">No result saves yet</p>
        )}
      </div>
    </div>
  )
}

interface ContactListProps {
  entries: ContactSubmission[]
  onToggleIgnore: (type: string, timestamp: string, currentlyIgnored: boolean) => void
  onDelete: (type: string, timestamp: string) => void
}

export function ContactList({ entries, onToggleIgnore, onDelete }: ContactListProps) {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => downloadCSV(
            entries.filter(c => !c.ignored).map(c => ({
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
        {entries.map((contact, i) => (
          <div key={i} className={`bg-[var(--muted)] p-4 ${contact.ignored ? 'opacity-40' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className={`text-[var(--foreground)] font-medium ${contact.ignored ? 'line-through' : ''}`}>{contact.name}</p>
                <p className="text-[var(--accent)] text-sm">{contact.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[var(--muted-foreground)] text-xs">{formatDate(contact.timestamp)}</p>
                <button
                  onClick={() => onToggleIgnore('contact', contact.timestamp, !!contact.ignored)}
                  className={`p-1.5 rounded hover:bg-[var(--background)] ${contact.ignored ? 'text-green-400' : 'text-yellow-400'}`}
                  title={contact.ignored ? 'Unignore' : 'Ignore'}
                >
                  {contact.ignored ? <UnignoreIcon /> : <IgnoreIcon />}
                </button>
                <button
                  onClick={() => onDelete('contact', contact.timestamp)}
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
        {entries.length === 0 && (
          <p className="text-[var(--muted-foreground)] text-center py-8">No contact submissions yet</p>
        )}
      </div>
    </div>
  )
}
