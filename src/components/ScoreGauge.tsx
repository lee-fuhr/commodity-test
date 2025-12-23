'use client'

import { useEffect, useState } from 'react'

interface ScoreGaugeProps {
  score: number
  size?: number
  showAnimation?: boolean
}

function getScoreColor(score: number): string {
  if (score <= 40) return '#10B981' // excellent (low = good)
  if (score <= 60) return '#F59E0B' // good
  if (score <= 80) return '#F97316' // warning
  return '#EF4444' // critical
}

function getScoreLabel(score: number): string {
  if (score <= 40) return 'Differentiated'
  if (score <= 60) return 'Generic territory'
  if (score <= 80) return 'Commodity territory'
  return 'Invisible'
}

export function ScoreGauge({ score, size = 320, showAnimation = true }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(showAnimation ? 0 : score)
  const strokeWidth = 20
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference
  const color = getScoreColor(score)
  const label = getScoreLabel(score)

  useEffect(() => {
    if (!showAnimation) return

    const duration = 750
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(score * eased))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [score, showAnimation])

  return (
    <div className="flex flex-col items-center">
      {/* Gauge */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-100"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold leading-none"
            style={{ fontSize: size * 0.25, color }}
          >
            {animatedScore}
          </span>
          <span className="text-brand-500 text-sm mt-1">Commodity Score</span>
        </div>
      </div>

      {/* Label badge */}
      <div
        className="mt-4 px-4 py-2 rounded-full bg-white/90 backdrop-blur shadow-subtle flex items-center gap-2"
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-brand-700 font-medium">{label}</span>
      </div>
    </div>
  )
}
