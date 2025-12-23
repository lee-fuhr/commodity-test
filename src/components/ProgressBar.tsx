'use client'

interface ProgressBarProps {
  progress: number // 0-100
  stage: number // 1-4
  timeRemaining?: number // seconds
}

const stages = [
  { label: 'Scanning', message: 'Reading your homepage copy...' },
  { label: 'Analyzing', message: 'Running commodity pattern detection...' },
  { label: 'Comparing', message: 'Pulling competitor homepages...' },
  { label: 'Diagnosing', message: 'Calculating your Commodity Score...' },
]

export function ProgressBar({ progress, stage, timeRemaining }: ProgressBarProps) {
  const currentStage = stages[Math.min(stage - 1, stages.length - 1)]

  return (
    <div className="w-full max-w-[600px] space-y-4">
      {/* Progress bar */}
      <div className="relative">
        <div className="h-2 bg-brand-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-400 to-accent-500 rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Progress info */}
      <div className="flex justify-between text-sm text-brand-500">
        <span>
          {timeRemaining !== undefined && timeRemaining > 0
            ? `~${timeRemaining} seconds remaining`
            : 'Almost done...'
          }
        </span>
        <span className="font-semibold">{progress}%</span>
      </div>

      {/* Status message */}
      <div className="text-center pt-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-brand-900 animate-fade-in">
          {currentStage.label}...
        </h2>
        <p className="text-brand-500 mt-2 animate-fade-in">
          {currentStage.message}
        </p>
      </div>
    </div>
  )
}
