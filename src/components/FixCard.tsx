interface Fix {
  number: number
  originalPhrase: string
  location: string
  whyBad: string
  suggestion: string
  whyBetter: string
}

interface FixCardProps {
  fix: Fix
}

export function FixCard({ fix }: FixCardProps) {
  return (
    <div className="card-elevated border-accent-400 relative">
      {/* Fix number badge */}
      <div className="absolute -top-4 -left-4 w-10 h-10 bg-brand-800 text-white rounded-full flex items-center justify-center font-bold text-lg">
        {fix.number}
      </div>

      <div className="space-y-6 pt-2">
        {/* What's broken */}
        <div>
          <h4 className="text-sm font-semibold text-score-critical uppercase tracking-wide mb-2">
            What&apos;s broken
          </h4>
          <blockquote className="bg-red-50 border-l-4 border-score-critical p-4 rounded-r italic text-brand-700">
            &ldquo;{fix.originalPhrase}&rdquo;
          </blockquote>
          <p className="text-sm text-brand-500 mt-2">Found in: {fix.location}</p>
        </div>

        {/* Why it's commodity */}
        <div>
          <h4 className="text-sm font-semibold text-score-good uppercase tracking-wide mb-2">
            Why it&apos;s commodity
          </h4>
          <p className="text-brand-600">{fix.whyBad}</p>
        </div>

        {/* How to fix it */}
        <div>
          <h4 className="text-sm font-semibold text-score-excellent uppercase tracking-wide mb-2">
            How to fix it
          </h4>
          <p className="text-sm text-brand-500 mb-2">Try this instead:</p>
          <blockquote className="bg-emerald-50 border-l-4 border-score-excellent p-4 rounded-r italic text-brand-700">
            &ldquo;{fix.suggestion}&rdquo;
          </blockquote>
          <p className="text-brand-600 mt-3">{fix.whyBetter}</p>
        </div>
      </div>
    </div>
  )
}
