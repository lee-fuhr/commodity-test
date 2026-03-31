'use client'

/**
 * Processing checklist with dynamic checkmarks based on progress
 *
 * @param items - Array of checklist items with labels and progress thresholds
 * @param progress - Current progress value (0-100)
 * @param title - Checklist title (default: "WHAT WE'RE DOING")
 * @param subtitle - Optional subtitle/footer text
 */
interface ChecklistItem {
  label: string
  progressThreshold: number
}

interface ProcessingChecklistProps {
  items: ChecklistItem[]
  progress: number
  title?: string
  subtitle?: string
}

export function ProcessingChecklist({
  items,
  progress,
  title = "WHAT WE'RE DOING",
  subtitle
}: ProcessingChecklistProps) {
  return (
    <div className="bg-[var(--muted)] p-6 text-left rounded">
      {/* Title */}
      <p className="text-label mb-4">{title}</p>

      {/* Checklist items */}
      <ul className="space-y-2 text-body text-sm">
        {items.map((item, index) => {
          const isComplete = progress > item.progressThreshold

          return (
            <li key={index} className="flex items-center gap-2">
              <span
                className={
                  isComplete
                    ? 'text-[var(--success)]'
                    : 'text-[var(--muted-foreground)]'
                }
              >
                {isComplete ? '✓' : '○'}
              </span>
              {item.label}
            </li>
          )
        })}
      </ul>

      {/* Optional subtitle/footer */}
      {subtitle && (
        <p className="text-xs text-[var(--muted-foreground)] mt-4 pt-4 border-t border-[var(--border)]">
          {subtitle}
        </p>
      )}
    </div>
  )
}
