# Component API Reference

Complete prop documentation for all shared components.

## Table of Contents

- [Processing Components](#processing-components)
  - [ProcessingPage](#processingpage)
  - [ProcessingProgress](#processingprogress)
  - [ProcessingStatus](#processingstatus)
  - [ProcessingChecklist](#processingchecklist)
  - [AnimatedCounter](#animatedcounter)
- [Layout Components](#layout-components)
  - [AuditLayout](#auditlayout)
  - [SidebarNav](#sidebarnav)
  - [LockedFindings](#lockedfindings)
  - [ScoreModal](#scoremodal)
- [Icon Components](#icon-components)
  - [ViewIcons](#viewicons)
  - [SeverityIcon](#severityicon)

---

## Processing Components

### ProcessingPage

Full-featured processing screen with status polling, progress visualization, optional enrichment fields, and completion states.

**Location:** `shared/components/processing/ProcessingPage.tsx`

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `analysisId` | `string` | Yes | - | Unique ID for this analysis (used in polling) |
| `progress` | `number` | Yes | - | Initial progress percentage (0-100) |
| `status` | `'pending' \| 'crawling' \| 'analyzing' \| 'complete' \| 'failed'` | Yes | - | Initial status |
| `message` | `string` | Yes | - | Initial status message |
| `apiEndpoint` | `string` | Yes | - | API endpoint to poll (e.g., `/api/analyze/status`) |
| `onComplete` | `(id: string) => void` | Yes | - | Called when analysis completes successfully |
| `onError` | `(error: string) => void` | Yes | - | Called on error or failure |
| `pollInterval` | `number` | No | `800` | Polling interval in milliseconds |
| `onRetry` | `() => void` | No | - | Called when user clicks retry on error screen. Default: navigate to `/` |
| `itemsProcessed` | `number` | No | `0` | Count of items processed (for counter display) |
| `itemsProcessedLabel` | `string` | No | `'pages scanned'` | Label for items counter |
| `currentUrl` | `string` | No | - | Current URL being processed (shown in status) |
| `processedItems` | `string[]` | No | `[]` | List of processed items (shown in scrollable list) |
| `processedItemsLabel` | `string` | No | `'PAGES FOUND'` | Label for processed items list |
| `showLinkedInField` | `boolean` | No | `false` | Show LinkedIn URL input field |
| `showCompetitorsField` | `boolean` | No | `false` | Show competitors field (disabled, upgrade prompt) |
| `showEmailField` | `boolean` | No | `false` | Show email input field |
| `checklistItems` | `ChecklistItem[]` | No | `[]` | Checklist items with progress thresholds |
| `title` | `string` | No | `'Scanning your website'` | Processing screen title |
| `subtitle` | `string` | No | `'This takes 1-2 minutes...'` | Processing screen subtitle |
| `completionTitle` | `string` | No | `'Results ready!'` | Completion screen title |
| `completionMessage` | `string` | No | Auto-generated | Completion screen message |
| `completionButtonText` | `string` | No | `'Show me my results →'` | Completion button text |
| `checklistTitle` | `string` | No | `"WHAT WE'RE DOING"` | Checklist section title |
| `checklistSubtitle` | `string` | No | - | Optional checklist subtitle |

#### State Management

The component automatically polls `apiEndpoint` with `?id={analysisId}` and expects responses in this format:

```typescript
{
  success: boolean
  analysis: {
    status: 'pending' | 'crawling' | 'analyzing' | 'complete' | 'failed'
    progress: number  // 0-100
    message: string
    currentUrl?: string
    pagesCrawled?: number
    pagesFound?: number
    crawledPages?: string[]
  }
  error?: string
}
```

The component updates its internal state based on polling responses and calls:
- `onComplete(analysisId)` when `status === 'complete'`
- `onError(error)` when `status === 'failed'` or API error

#### Checklist Items

```typescript
interface ChecklistItem {
  label: string              // Text to show
  progressThreshold: number  // Progress % when this item becomes active
}
```

Items are checked when progress exceeds their threshold.

#### Example

```typescript
<ProcessingPage
  analysisId="abc123"
  progress={0}
  status="pending"
  message="Starting analysis..."
  apiEndpoint="/api/analyze/status"
  pollInterval={800}
  onComplete={(id) => router.push(`/results/${id}`)}
  onError={(err) => {
    console.error(err)
    setError(err)
  }}
  checklistItems={[
    { label: 'Reading homepage', progressThreshold: 10 },
    { label: 'Scanning site pages', progressThreshold: 30 },
    { label: 'Analyzing messaging', progressThreshold: 60 },
    { label: 'Generating rewrites', progressThreshold: 85 }
  ]}
  showLinkedInField
  itemsProcessed={5}
  itemsProcessedLabel="pages scanned"
/>
```

---

### ProcessingProgress

Accessible progress bar with optional percentage display.

**Location:** `shared/components/processing/ProcessingProgress.tsx`

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `progress` | `number` | Yes | - | Progress percentage (0-100) |
| `showPercentage` | `boolean` | No | `false` | Show percentage text above bar |
| `className` | `string` | No | - | Additional CSS classes |

#### Example

```typescript
<ProcessingProgress
  progress={67}
  showPercentage={true}
/>
```

---

### ProcessingStatus

Status message display with optional current URL.

**Location:** `shared/components/processing/ProcessingStatus.tsx`

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `status` | `'pending' \| 'crawling' \| 'analyzing' \| 'complete' \| 'failed'` | Yes | - | Current status |
| `message` | `string` | Yes | - | Status message to display |
| `currentUrl` | `string` | No | - | Current URL being processed |
| `className` | `string` | No | - | Additional CSS classes |

#### Example

```typescript
<ProcessingStatus
  status="analyzing"
  message="Analyzing messaging patterns..."
  currentUrl="https://acme.com/about"
/>
```

---

### ProcessingChecklist

Dynamic checklist that checks items based on progress thresholds.

**Location:** `shared/components/processing/ProcessingChecklist.tsx`

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `items` | `ChecklistItem[]` | Yes | - | Checklist items with thresholds |
| `progress` | `number` | Yes | - | Current progress (0-100) |
| `title` | `string` | No | `"WHAT WE'RE DOING"` | Checklist title |
| `subtitle` | `string` | No | - | Optional subtitle |
| `className` | `string` | No | - | Additional CSS classes |

#### Example

```typescript
<ProcessingChecklist
  items={[
    { label: 'Reading homepage', progressThreshold: 10 },
    { label: 'Scanning pages', progressThreshold: 50 }
  ]}
  progress={60}
  title="PROGRESS"
/>
```

---

### AnimatedCounter

Smooth number animation for metrics.

**Location:** `shared/components/processing/AnimatedCounter.tsx`

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `number` | Yes | - | Target number to animate to |
| `duration` | `number` | No | `500` | Animation duration in ms |
| `className` | `string` | No | - | Additional CSS classes |

#### Example

```typescript
<AnimatedCounter
  value={42}
  duration={800}
  className="text-5xl font-bold"
/>
```

---

## Layout Components

### AuditLayout

Main layout wrapper with sidebar navigation, optional top banner, and responsive behavior.

**Location:** `shared/components/layout/AuditLayout.tsx`

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | - | Main content area |
| `companyName` | `string` | Yes | - | Company being audited (shown in sidebar) |
| `hostname` | `string` | Yes | - | Website hostname (shown in sidebar) |
| `currentView` | `ViewType` | Yes | - | Currently active view |
| `onViewChange` | `(view: ViewType) => void` | Yes | - | Called when user changes view |
| `views` | `View[]` | Yes | - | List of available views for navigation |
| `isLocked` | `boolean` | No | `false` | Show lock icons on non-overview views |
| `isSample` | `boolean` | No | `false` | Is this a sample report? |
| `showDownloadPdf` | `boolean` | No | `false` | Show download PDF button in sidebar |
| `onDownloadPdf` | `() => void` | No | - | Called when download PDF clicked |
| `topBanner` | `ReactNode` | No | - | Optional banner content (sample/preview notice) |
| `sidebarBottomCta` | `ReactNode` | No | - | Optional bottom CTA in sidebar |

#### ViewType

```typescript
type ViewType = 'overview' | 'message' | 'audience' | 'trust' | 'copy'
```

#### View

```typescript
interface View {
  id: ViewType
  label: string
  description?: string
}
```

#### Behavior

- Sidebar fixed on desktop (left, 256px wide)
- Sidebar hidden on mobile (use ViewNavBar for mobile)
- Scrolls to top on view change
- Top banner (if provided) is fixed at top

#### Example

```typescript
import { AuditLayout } from '@/shared'
import type { View, ViewType } from '@/shared'

const views: View[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'message', label: 'Message clarity' },
  { id: 'audience', label: 'Audience focus' },
  { id: 'trust', label: 'Trust signals' },
  { id: 'copy', label: 'Copy examples' }
]

function ReportPage() {
  const [currentView, setCurrentView] = useState<ViewType>('overview')

  return (
    <AuditLayout
      companyName="Acme Construction"
      hostname="acmeconstruction.com"
      currentView={currentView}
      onViewChange={setCurrentView}
      views={views}
      isLocked={!isPaid}
      topBanner={
        <div className="bg-yellow-100 p-3 text-center">
          Sample report
        </div>
      }
      sidebarBottomCta={
        <button onClick={handlePurchase}>
          Unlock full audit — $400
        </button>
      }
    >
      {/* View-specific content */}
      {currentView === 'overview' && <OverviewView />}
      {currentView === 'message' && <MessageView />}
    </AuditLayout>
  )
}
```

---

### SidebarNav

Dark sidebar navigation with company info, view list, and optional CTAs.

**Location:** `shared/components/layout/SidebarNav.tsx`

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `companyName` | `string` | Yes | - | Company name to display |
| `hostname` | `string` | Yes | - | Hostname to display |
| `views` | `View[]` | Yes | - | List of views |
| `currentView` | `ViewType` | Yes | - | Active view |
| `onViewChange` | `(view: ViewType) => void` | Yes | - | View change handler |
| `isLocked` | `boolean` | No | `false` | Show lock icons on nav items |
| `showDownloadPdf` | `boolean` | No | `false` | Show download PDF button |
| `onDownloadPdf` | `() => void` | No | - | Download PDF handler |
| `bottomCta` | `ReactNode` | No | - | Optional bottom CTA content |

#### Styling

- Dark background (`var(--accent)`)
- White text
- Fixed left sidebar (desktop only)
- Active view has white/20 background
- Hover states on all items

#### Example

```typescript
<SidebarNav
  companyName="Acme Corp"
  hostname="acme.com"
  views={views}
  currentView="overview"
  onViewChange={setView}
  isLocked={false}
  showDownloadPdf
  onDownloadPdf={() => window.print()}
  bottomCta={
    <button className="w-full bg-white text-black p-4">
      Purchase full audit
    </button>
  }
/>
```

---

### LockedFindings

Paywall component with optional teaser finding display.

**Location:** `shared/components/layout/LockedFindings.tsx`

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onUnlock` | `() => void` | Yes | - | Called when user clicks unlock button |
| `showTeaser` | `boolean` | No | `false` | Show a real teaser finding from analysis |
| `teaserFinding` | `TeaserFinding` | No | - | Teaser finding data |
| `price` | `number` | No | `400` | Price to display |

#### TeaserFinding

```typescript
interface TeaserFinding {
  phrase: string      // Original phrase from site
  problem: string     // Why it's a problem
  rewrite: string     // Suggested replacement
  location: string    // Where it was found
  pageUrl?: string    // Optional page URL
}
```

#### Layout

**With Teaser:**
- Shows real finding from user's site in green/red comparison
- Explains why it matters
- Notes that full audit has 15-20 rewrites
- Dashed border locked section below

**Without Teaser:**
- Just shows dashed border locked section
- Generic message about full audit

#### Example

```typescript
<LockedFindings
  onUnlock={() => router.push('/purchase')}
  showTeaser={true}
  teaserFinding={{
    phrase: "We offer quality service",
    problem: "Generic claim with no proof. Every competitor says this.",
    rewrite: "We deliver 98% on-time completion in harsh Minnesota winters",
    location: "Homepage hero",
    pageUrl: "https://acme.com"
  }}
  price={400}
/>
```

---

### ScoreModal

Modal dialog showing score category breakdown.

**Location:** `shared/components/layout/ScoreModal.tsx`

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | `boolean` | Yes | - | Whether modal is visible |
| `onClose` | `() => void` | Yes | - | Called when modal closes |
| `categories` | `ScoreCategory[]` | Yes | - | Score categories to display |
| `scores` | `Record<string, number>` | Yes | - | Scores keyed by category key |
| `title` | `string` | No | `'Score breakdown'` | Modal title |

#### ScoreCategory

```typescript
interface ScoreCategory {
  key: string        // Unique key (used to look up score)
  label: string      // Display label
  question: string   // Explanation of what this measures
}
```

#### Example

```typescript
const categories: ScoreCategory[] = [
  {
    key: 'specificity',
    label: 'Specificity',
    question: 'Do you show specific proof points instead of generic claims?'
  },
  {
    key: 'differentiation',
    label: 'Differentiation',
    question: 'Is it clear what makes you different from competitors?'
  }
]

const scores = {
  specificity: 4,
  differentiation: 7
}

<ScoreModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  categories={categories}
  scores={scores}
/>
```

---

## Icon Components

### ViewIcons

Navigation icons for audit views.

**Location:** `shared/components/icons/ViewIcons.tsx`

#### Exports

```typescript
// Individual icon components
export function OverviewIcon({ className }: { className?: string })
export function MessageIcon({ className }: { className?: string })
export function AudienceIcon({ className }: { className?: string })
export function TrustIcon({ className }: { className?: string })
export function CopyIcon({ className }: { className?: string })

// Map for dynamic rendering
export const viewIcons: Record<ViewType, ReactNode>

// Helper function
export function getViewIcon(type: ViewType, className?: string): ReactNode
```

#### Icon Styles

- Streamline-inspired design
- 1px stroke weight
- 24x24 viewBox
- Default size: `w-4 h-4` (16px)
- `currentColor` stroke for easy theming

#### Example

```typescript
import { OverviewIcon, MessageIcon, viewIcons, getViewIcon } from '@/shared'

// Individual component
<OverviewIcon className="w-6 h-6 text-blue-500" />

// From map (for dynamic rendering)
{viewIcons[currentView]}

// From helper function
{getViewIcon('message', 'w-5 h-5')}
```

---

### SeverityIcon

Issue severity indicator (colored emoji).

**Location:** `shared/components/icons/SeverityIcon.tsx`

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `severity` | `'critical' \| 'warning' \| 'info'` | Yes | - | Severity level |
| `className` | `string` | No | - | Additional CSS classes |

#### Emojis

- `critical` → 🔴
- `warning` → 🟡
- `info` → 🟢

#### Exports

```typescript
export function SeverityIcon({ severity, className }: Props)
export function getSeverityEmoji(severity: Severity): string
```

#### Example

```typescript
import { SeverityIcon, getSeverityEmoji } from '@/shared'

<SeverityIcon severity="critical" />

// Just get the emoji
const emoji = getSeverityEmoji('warning') // '🟡'
```

---

## Type Definitions

All types are exported from `@/shared`:

```typescript
import type {
  // Processing
  ChecklistItem,
  ProcessingPageProps,

  // Audit
  ViewType,
  View,
  TeaserFinding,
  ScoreCategory,

  // Scoring
  Severity,
  ScoreColor,
  ScoreLevel
} from '@/shared'
```

See main [README](../README.md) for full type definitions.

---

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- **ProcessingPage:** ARIA live regions for status updates, progress announcements
- **AuditLayout:** Keyboard navigation, ARIA current page indicators
- **SidebarNav:** Keyboard accessible, proper focus states, ARIA labels
- **LockedFindings:** Descriptive button labels with price
- **ProcessingProgress:** ARIA progressbar role with value/min/max

## Responsive Behavior

- **AuditLayout:** Sidebar hidden on mobile (`lg:block`)
- **SidebarNav:** Fixed desktop only, use ViewNavBar for mobile
- **ProcessingPage:** Stacked layout on mobile, grid on desktop
- **LockedFindings:** Side-by-side comparison on desktop, stacked on mobile

## Browser Support

All components work in:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Uses modern CSS features:
- CSS Grid
- Flexbox
- CSS Variables
- Custom Properties
