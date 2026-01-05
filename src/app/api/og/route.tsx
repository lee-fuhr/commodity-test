import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

function getScoreColor(score: number): string {
  if (score >= 85) return '#4ade80' // green-400
  if (score >= 70) return '#a3e635' // lime-400
  if (score >= 55) return '#facc15' // yellow-400
  if (score >= 40) return '#fb923c' // orange-400
  return '#f87171' // red-400
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Highly differentiated'
  if (score >= 70) return 'Well differentiated'
  if (score >= 55) return 'Moderately differentiated'
  if (score >= 40) return 'Weakly differentiated'
  return 'Undifferentiated'
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const company = searchParams.get('company')
  const scoreParam = searchParams.get('score')

  // If no company/score, render homepage OG image
  if (!company || !scoreParam) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0f172a',
            padding: '60px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <span
              style={{
                fontSize: '28px',
                color: '#94a3b8',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Free Tool
            </span>
          </div>

          {/* Main headline */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 800,
              color: '#f8fafc',
              marginBottom: '30px',
              lineHeight: 1.1,
            }}
          >
            The Commodity Test
          </div>

          {/* Subhead */}
          <div
            style={{
              fontSize: '36px',
              color: '#3b82f6',
              marginBottom: '40px',
              lineHeight: 1.3,
            }}
          >
            Does your website sound like everyone else&apos;s?
          </div>

          {/* Value prop */}
          <div
            style={{
              fontSize: '26px',
              color: '#94a3b8',
              lineHeight: 1.5,
              maxWidth: '900px',
            }}
          >
            Analyze your homepage messaging. See how you compare to competitors. Get 3 specific fixes. 30 seconds, no email required.
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '22px',
                color: '#64748b',
              }}
            >
              thecommoditytest.com
            </span>
            <span
              style={{
                fontSize: '20px',
                color: '#f8fafc',
                backgroundColor: '#3b82f6',
                padding: '12px 24px',
              }}
            >
              Find your blind spots
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }

  // Results page OG image
  const score = parseInt(scoreParam, 10)
  const scoreColor = getScoreColor(score)
  const scoreLabel = getScoreLabel(score)

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f172a',
          padding: '60px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <span
            style={{
              fontSize: '28px',
              color: '#94a3b8',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            The Commodity Test
          </span>
        </div>

        {/* Company name */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '20px',
            lineHeight: 1.2,
          }}
        >
          {company}
        </div>

        {/* Results label */}
        <div
          style={{
            fontSize: '24px',
            color: '#94a3b8',
            marginBottom: '40px',
          }}
        >
          Commodity Test Results
        </div>

        {/* Score display */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '20px',
          }}
        >
          <span
            style={{
              fontSize: '180px',
              fontWeight: 800,
              color: scoreColor,
              lineHeight: 1,
            }}
          >
            {score}
          </span>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontSize: '32px',
                color: scoreColor,
                fontWeight: 600,
              }}
            >
              {scoreLabel}
            </span>
            <span
              style={{
                fontSize: '20px',
                color: '#64748b',
                marginTop: '8px',
              }}
            >
              Higher is better. 100 = highly differentiated.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '22px',
              color: '#64748b',
            }}
          >
            thecommoditytest.com
          </span>
          <span
            style={{
              fontSize: '18px',
              color: '#3b82f6',
            }}
          >
            See your full analysis with specific fixes
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
