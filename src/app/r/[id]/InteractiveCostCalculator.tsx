'use client'

import { useState, useRef, useEffect } from 'react'

interface CostAssumptions {
  averageDealValue: number
  annualDeals: number
  lossRate: number
  lossRateLabel: string
}

interface Props {
  initialAssumptions: CostAssumptions
  industryContext: string
}

// Truly inline editable number - no layout shift
function EditableNumber({
  value,
  onChange,
  prefix = '',
  suffix = '',
  label,
  formatAsK = true
}: {
  value: number
  onChange: (val: number) => void
  prefix?: string
  suffix?: string
  label: string
  formatAsK?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const spanRef = useRef<HTMLSpanElement>(null)

  const displayNumber = formatAsK && value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toString()

  const handleClick = () => {
    setIsEditing(true)
  }

  useEffect(() => {
    if (isEditing && spanRef.current) {
      // Select all text in the editable span
      const range = document.createRange()
      range.selectNodeContents(spanRef.current)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      spanRef.current.focus()
    }
  }, [isEditing])

  const handleBlur = () => {
    if (spanRef.current) {
      const text = spanRef.current.innerText.replace(/[^0-9kK]/g, '')
      let parsed: number

      // Handle "12K" or "12k" format
      if (text.toLowerCase().endsWith('k')) {
        parsed = parseInt(text.slice(0, -1), 10) * 1000
      } else {
        parsed = parseInt(text, 10)
      }

      if (!isNaN(parsed) && parsed > 0) {
        onChange(parsed)
      } else {
        // Reset to original value if invalid
        spanRef.current.innerText = displayNumber
      }
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      spanRef.current?.blur()
    } else if (e.key === 'Escape') {
      if (spanRef.current) {
        spanRef.current.innerText = displayNumber
      }
      setIsEditing(false)
    }
  }

  return (
    <div
      className="bg-black/20 px-3 sm:px-4 py-2 sm:py-3 min-w-[80px] sm:min-w-[100px] cursor-pointer hover:bg-black/30 transition-colors group"
      onClick={!isEditing ? handleClick : undefined}
      title="Click to edit"
    >
      <p className="text-xl sm:text-2xl md:text-3xl font-display text-white group-hover:text-blue-200 transition-colors">
        {prefix}
        <span
          ref={spanRef}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`outline-none ${isEditing ? 'bg-white/10 px-1 rounded' : ''}`}
          style={{ minWidth: '2ch', display: 'inline-block' }}
        >
          {displayNumber}
        </span>
        {suffix}
      </p>
      <p className="text-[10px] sm:text-xs text-white/70">{label}</p>
    </div>
  )
}

// Truly inline editable percent
function EditablePercent({
  value,
  onChange,
  label
}: {
  value: number
  onChange: (val: number) => void
  label: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const spanRef = useRef<HTMLSpanElement>(null)

  const displayNumber = Math.round(value * 100).toString()

  const handleClick = () => {
    setIsEditing(true)
  }

  useEffect(() => {
    if (isEditing && spanRef.current) {
      const range = document.createRange()
      range.selectNodeContents(spanRef.current)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      spanRef.current.focus()
    }
  }, [isEditing])

  const handleBlur = () => {
    if (spanRef.current) {
      const text = spanRef.current.innerText.replace(/[^0-9]/g, '')
      const parsed = parseInt(text, 10)

      if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
        onChange(parsed / 100)
      } else {
        spanRef.current.innerText = displayNumber
      }
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      spanRef.current?.blur()
    } else if (e.key === 'Escape') {
      if (spanRef.current) {
        spanRef.current.innerText = displayNumber
      }
      setIsEditing(false)
    }
  }

  return (
    <div
      className="bg-black/20 px-3 sm:px-4 py-2 sm:py-3 min-w-[60px] sm:min-w-[80px] cursor-pointer hover:bg-black/30 transition-colors group"
      onClick={!isEditing ? handleClick : undefined}
      title="Click to edit"
    >
      <p className="text-xl sm:text-2xl md:text-3xl font-display text-white group-hover:text-blue-200 transition-colors">
        <span
          ref={spanRef}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`outline-none ${isEditing ? 'bg-white/10 px-1 rounded' : ''}`}
          style={{ minWidth: '1ch', display: 'inline-block' }}
        >
          {displayNumber}
        </span>
        %
      </p>
      <p className="text-[10px] sm:text-xs text-white/70">{label}</p>
    </div>
  )
}

export function InteractiveCostCalculator({ initialAssumptions }: Props) {
  const [dealValue, setDealValue] = useState(initialAssumptions.averageDealValue)
  const [deals, setDeals] = useState(initialAssumptions.annualDeals)
  const [lossRate, setLossRate] = useState(initialAssumptions.lossRate)

  const annualLoss = Math.round(dealValue * deals * lossRate)
  const roi = Math.round((annualLoss / 2 / 18000) * 100)
  const roiDollars = Math.round(annualLoss / 2 / 1000)
  const paybackMonths = annualLoss > 0 ? Math.ceil(18000 / (annualLoss / 2 / 12)) : 0

  return (
    <div className="bg-black/20 p-4 sm:p-6 md:p-8 mt-8 max-w-2xl mx-auto">
      <h3 className="text-lg sm:text-xl font-semibold text-blue-200 mb-2">Show your work</h3>
      <p className="text-white/80 text-xs sm:text-sm mb-6">
        How much revenue walks out the door when prospects can&apos;t tell you apart from competitors?
      </p>

      {/* The calculation as a readable equation */}
      <div className="text-white mb-6">
        {/* Desktop: horizontal flow */}
        <div className="hidden sm:flex flex-wrap items-center justify-center gap-2 md:gap-4 text-center">
          <EditableNumber
            value={dealValue}
            onChange={setDealValue}
            prefix="$"
            label="avg deal"
          />
          <span className="text-xl sm:text-2xl text-white/70">×</span>
          <EditableNumber
            value={deals}
            onChange={setDeals}
            label="deals/yr"
            formatAsK={false}
          />
          <span className="text-xl sm:text-2xl text-white/70">×</span>
          <EditablePercent
            value={lossRate}
            onChange={setLossRate}
            label="loss rate"
          />
          <span className="text-xl sm:text-2xl text-white/70">=</span>
          <div className="bg-white/10 px-3 sm:px-4 py-2 sm:py-3 min-w-[100px] sm:min-w-[120px] border-2 border-white/30">
            <p className="text-xl sm:text-2xl md:text-3xl font-display text-white">${(annualLoss / 1000).toFixed(0)}K</p>
            <p className="text-[10px] sm:text-xs text-white/70">annual loss</p>
          </div>
        </div>
        {/* Mobile: stacked layout with tap-to-edit */}
        <div className="sm:hidden space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <EditableNumber
              value={dealValue}
              onChange={setDealValue}
              prefix="$"
              label="avg deal"
            />
            <EditableNumber
              value={deals}
              onChange={setDeals}
              label="deals/yr"
              formatAsK={false}
            />
            <EditablePercent
              value={lossRate}
              onChange={setLossRate}
              label="loss rate"
            />
          </div>
          <div className="flex justify-center">
            <div className="bg-white/10 px-4 py-2 border-2 border-white/30 text-center">
              <p className="text-2xl font-display text-white">${(annualLoss / 1000).toFixed(0)}K</p>
              <p className="text-[10px] text-white/70">annual loss</p>
            </div>
          </div>
        </div>
      </div>

      {/* ROI calculation */}
      <div className="border-t border-white/20 pt-6">
        <h3 className="text-lg sm:text-xl font-semibold text-blue-200 mb-2">If you fix it</h3>
        <p className="text-white/80 text-xs sm:text-sm mb-4">
          A Core Site rebuild runs $18K. Keep just half the deals you&apos;d otherwise lose, and here&apos;s your return:
        </p>
        {/* Desktop: horizontal flow */}
        <div className="hidden sm:flex flex-wrap items-center justify-center gap-2 md:gap-4 text-center text-white mb-4">
          <div className="bg-black/20 px-3 sm:px-4 py-2 sm:py-3">
            <p className="text-xl sm:text-2xl md:text-3xl font-display text-white">${(annualLoss / 1000).toFixed(0)}K</p>
            <p className="text-[10px] sm:text-xs text-white/70">annual loss</p>
          </div>
          <span className="text-xl sm:text-2xl text-white/70">×</span>
          <div className="bg-black/20 px-3 sm:px-4 py-2 sm:py-3">
            <p className="text-xl sm:text-2xl md:text-3xl font-display text-white">50%</p>
            <p className="text-[10px] sm:text-xs text-white/70">conservative</p>
          </div>
          <span className="text-xl sm:text-2xl text-white/70">÷</span>
          <div className="bg-black/20 px-3 sm:px-4 py-2 sm:py-3">
            <p className="text-xl sm:text-2xl md:text-3xl font-display text-white">$18K</p>
            <p className="text-[10px] sm:text-xs text-white/70">investment</p>
          </div>
          <span className="text-xl sm:text-2xl text-white/70">=</span>
          <div className="bg-green-500/20 px-3 sm:px-4 py-2 sm:py-3 border-2 border-green-400/40">
            <p className="text-xl sm:text-2xl md:text-3xl font-display text-green-200">{roi}%</p>
            <p className="text-sm sm:text-lg font-display text-green-200">(${roiDollars}K)</p>
            <p className="text-[10px] sm:text-xs text-green-200/80">first-year ROI</p>
          </div>
        </div>
        {/* Mobile: stacked layout */}
        <div className="sm:hidden space-y-3 mb-4">
          <div className="grid grid-cols-3 gap-2 text-center text-white">
            <div className="bg-black/20 px-2 py-2">
              <p className="text-lg font-display">${(annualLoss / 1000).toFixed(0)}K</p>
              <p className="text-[10px] text-white/70">annual loss</p>
            </div>
            <div className="bg-black/20 px-2 py-2">
              <p className="text-lg font-display">50%</p>
              <p className="text-[10px] text-white/70">conservative</p>
            </div>
            <div className="bg-black/20 px-2 py-2">
              <p className="text-lg font-display">$18K</p>
              <p className="text-[10px] text-white/70">investment</p>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="bg-green-500/20 px-4 py-2 border-2 border-green-400/40 text-center">
              <p className="text-2xl font-display text-green-200">{roi}%</p>
              <p className="text-base font-display text-green-200">(${roiDollars}K)</p>
              <p className="text-[10px] text-green-200/80">first-year ROI</p>
            </div>
          </div>
        </div>
        <p className="text-center text-white text-sm sm:text-base">
          <strong>Payback period:</strong>{' '}
          {paybackMonths > 0 ? (
            <>
              {paybackMonths} {paybackMonths === 1 ? 'month' : 'months'}
            </>
          ) : '—'}
        </p>
        <p className="text-xs sm:text-sm text-[var(--accent-foreground)] opacity-80 mt-4 text-center">
          Core site rebuild: $18K. <a href="/pricing" className="underline hover:text-[var(--accent-foreground)]">See all options →</a>
        </p>
      </div>
    </div>
  )
}
