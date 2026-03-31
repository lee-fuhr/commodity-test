import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

interface PendingResult {
  id: string
  status: 'processing'
  url: string
  createdAt: string
}

interface ErrorResult {
  id: string
  status: 'error'
  url: string
  error: string
  errorHint?: string
  createdAt: string
}

interface CompleteResult {
  id: string
  status: 'complete'
  url: string
  companyName: string
  headline: string
  subheadline: string
  commodityScore: number
  costEstimate: number
  costAssumptions: {
    averageDealValue: number
    annualDeals: number
    lossRate: number
    lossRateLabel: string
  }
  diagnosis: string
  detectedPhrases: Array<{
    phrase: string
    weight: number
    category: string
    location: string
    context: string
  }>
  differentiationSignals: Array<{
    type: string
    value: string
    strength: number
    location: string
  }>
  fixes: Array<{
    number: number
    originalPhrase: string
    location: string
    context: string
    whyBad: string
    suggestions: Array<{ text: string; approach: string }>
    whyBetter: string
  }>
  scrapeMethod: string
  contentQuality: string
  industry: string
  createdAt: string
}

// Legacy results (pre-async) don't have a status field
interface LegacyResult {
  id: string
  url: string
  companyName: string
  commodityScore: number
  [key: string]: unknown
}

type StoredResult = PendingResult | ErrorResult | CompleteResult | LegacyResult

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

    const result = await kv.get<StoredResult>(`result:${id}`)

    if (!result) {
      return NextResponse.json(
        { error: 'Result not found or expired' },
        { status: 404 }
      )
    }

    // Handle legacy results that don't have a status field
    // (stored before the async architecture change)
    if (!('status' in result) || result.status === undefined) {
      return NextResponse.json({ ...result, status: 'complete' })
    }

    // Return the result with its current status
    // Client uses status to determine behavior:
    //   'processing' -> keep polling
    //   'complete'   -> show results
    //   'error'      -> show error
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching result:', error)
    return NextResponse.json(
      { error: 'Failed to fetch result' },
      { status: 500 }
    )
  }
}
