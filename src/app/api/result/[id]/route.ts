import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

interface AnalysisResult {
  url: string
  headline: string
  subheadline: string
  score: number
  fixes: Array<{
    number: number
    originalPhrase: string
    location: string
    context: string
    whyBad: string
    suggestions: Array<{ text: string; approach: string }>
    whyBetter: string
  }>
  analyzedAt: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Result ID is required' },
        { status: 400 }
      )
    }

    const result = await kv.get<AnalysisResult>(`result:${id}`)

    if (!result) {
      return NextResponse.json(
        { error: 'Result not found or expired' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching result:', error)
    return NextResponse.json(
      { error: 'Failed to fetch result' },
      { status: 500 }
    )
  }
}
