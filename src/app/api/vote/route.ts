import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

interface Vote {
  resultId: string
  fixNumber: number
  suggestionIndex: number
  vote: 'up' | 'down'
  approach: string
  originalPhrase: string
  suggestionText: string
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { resultId, fixNumber, suggestionIndex, vote, approach, originalPhrase, suggestionText } = body

    if (!resultId || fixNumber === undefined || suggestionIndex === undefined || !vote) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (vote !== 'up' && vote !== 'down') {
      return NextResponse.json({ error: 'Vote must be "up" or "down"' }, { status: 400 })
    }

    const voteEntry: Vote = {
      resultId,
      fixNumber,
      suggestionIndex,
      vote,
      approach: approach || 'unknown',
      originalPhrase: originalPhrase || '',
      suggestionText: suggestionText || '',
      timestamp: new Date().toISOString(),
    }

    // Store individual vote
    await kv.lpush('suggestion:votes', voteEntry)

    // Also aggregate by approach for quick analysis
    // Key: votes:approach:{approach}:{up|down}
    const approachKey = `votes:approach:${approach}:${vote}`
    await kv.incr(approachKey)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 })
  }
}

// GET endpoint for admin to see vote stats
export async function GET(request: NextRequest) {
  try {
    // Get recent votes (last 500)
    const recentVotes = await kv.lrange<Vote>('suggestion:votes', 0, 499)

    // Get approach aggregates
    const approaches = [
      'specific stats', 'social proof', 'unique process',
      'quantify it', 'add numbers', 'quantify the impact',
      'tell their story', 'describe the experience', 'cite the evidence',
      'show the process', 'name the innovation', 'claim the niche', 'find your only',
      'make a guarantee', 'stake something on it', 'publish the metrics',
      'say what you do', 'prove retention'
    ]

    const approachStats: Record<string, { up: number; down: number; ratio: number }> = {}

    for (const approach of approaches) {
      const up = await kv.get<number>(`votes:approach:${approach}:up`) || 0
      const down = await kv.get<number>(`votes:approach:${approach}:down`) || 0
      const total = up + down
      approachStats[approach] = {
        up,
        down,
        ratio: total > 0 ? Math.round((up / total) * 100) : 0
      }
    }

    // Sort by total votes for relevance
    const sortedApproaches = Object.entries(approachStats)
      .filter(([_, stats]) => stats.up + stats.down > 0)
      .sort((a, b) => (b[1].up + b[1].down) - (a[1].up + a[1].down))

    return NextResponse.json({
      totalVotes: recentVotes.length,
      recentVotes,
      approachStats: Object.fromEntries(sortedApproaches),
    })
  } catch (error) {
    console.error('Vote stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch vote stats' }, { status: 500 })
  }
}
