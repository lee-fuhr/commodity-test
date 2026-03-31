/**
 * Processing Page Components
 *
 * Reusable components for building processing/status pages across LFI tools.
 * Extracted from the website-audit processing page implementation.
 *
 * Usage example:
 * ```tsx
 * import { ProcessingPage } from '@/shared/components/processing'
 *
 * <ProcessingPage
 *   analysisId={id}
 *   progress={progress}
 *   status={status}
 *   message={message}
 *   apiEndpoint="/api/analyze"
 *   onComplete={(id) => router.push(`/results/${id}`)}
 *   onError={(error) => console.error(error)}
 *   checklistItems={[
 *     { label: 'Step 1', progressThreshold: 10 },
 *     { label: 'Step 2', progressThreshold: 50 },
 *   ]}
 * />
 * ```
 */

export { ProcessingPage } from './ProcessingPage'
export { ProcessingProgress } from './ProcessingProgress'
export { ProcessingStatus } from './ProcessingStatus'
export { ProcessingChecklist } from './ProcessingChecklist'
export { AnimatedCounter } from './AnimatedCounter'

export type { ProcessingPageProps, ChecklistItem } from './ProcessingPage'
