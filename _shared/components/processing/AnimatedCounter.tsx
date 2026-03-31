'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * Animated counter that smoothly transitions between values
 *
 * @param value - The target number to count to
 * @param className - Optional CSS class for styling
 * @param duration - Animation duration in milliseconds (default: 500)
 */
interface AnimatedCounterProps {
  value: number
  className?: string
  duration?: number
}

export function AnimatedCounter({
  value,
  className,
  duration = 500
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValue = useRef(0)

  useEffect(() => {
    const start = prevValue.current
    const end = value
    const startTime = Date.now()
    let animationFrameId: number

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + (end - start) * eased)

      setDisplayValue(current)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        prevValue.current = end
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [value, duration])

  return <span className={className}>{displayValue}</span>
}
