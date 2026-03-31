# LFI Shared Component Library

Reusable React components, utilities, and types for LFI tools (website-audit, proposal-analyzer, case-study-extractor, commodity-test, risk-translator, lfi-main).

## Installation

These components are designed for internal use across LFI tools. Import directly:

```typescript
import { ProcessingPage, AuditLayout, viewIcons } from '@/shared'
import { getCommodityScoreColor, formatHostname } from '@/shared/utils'
```

## Quick Start

```typescript
// Processing page with status polling
<ProcessingPage
  analysisId={id}
  apiEndpoint="/api/analyze"
  onComplete={(id) => router.push(`/results/${id}`)}
  onError={(err) => setError(err)}
  showLinkedInField
/>

// Audit layout with sidebar
<AuditLayout
  companyName="Acme Corp"
  hostname="acme.com"
  currentView={currentView}
  onViewChange={setCurrentView}
  views={views}
>
  {/* View content */}
</AuditLayout>

// Get commodity score color
const color = getCommodityScoreColor(74) // 'orange'
const label = getCommodityScoreLabel(74) // 'Highly generic'
```

## Components

### Processing Components
Status polling and progress visualization for long-running operations.

- **`ProcessingPage`** - Full processing screen with polling, progress, checklist, and completion states
- **`ProcessingProgress`** - Accessible progress bar with optional percentage
- **`ProcessingStatus`** - Status message display with optional current URL
- **`ProcessingChecklist`** - Dynamic checklist that updates based on progress thresholds
- **`AnimatedCounter`** - Smooth number animation for metrics

### Layout Components
Audit report layouts with navigation.

- **`AuditLayout`** - Main layout wrapper with sidebar navigation
- **`SidebarNav`** - Dark sidebar with view navigation, company info, and optional CTAs
- **`ViewNavBar`** - Bottom navigation bar (mobile alternative)
- **`LockedFindings`** - Paywall component with teaser finding display
- **`ScoreModal`** - Score detail modal with category breakdown

### Icon Components
Navigation and status icons.

- **`viewIcons`** - Map of view icons keyed by ViewType
- **`OverviewIcon`** - Grid/dashboard icon
- **`MessageIcon`** - Chat bubble icon
- **`AudienceIcon`** - Target/bullseye icon
- **`TrustIcon`** - Shield with checkmark icon
- **`CopyIcon`** - Document/clipboard icon
- **`SeverityIcon`** - Issue severity indicator (🔴🟡🟢)
- **`getViewIcon(type, className)`** - Get icon component for view type

## Utilities

### Scoring (`shared/utils/scoring.ts`)

**CRITICAL: Two different scoring systems**

**1. Commodity Score (0-100, INVERSE - lower = better)**

| Score | Color | Label | Level |
|-------|-------|-------|-------|
| 0-40 | green | Well differentiated | excellent |
| 41-60 | yellow | Needs work | moderate |
| 61-80 | orange | Highly generic | poor |
| 81-100 | red | Commodity territory | critical |

**2. Category Scores (0-10, NORMAL - higher = better)**

| Score | Level | Label |
|-------|-------|-------|
| 7-10 | excellent | Strong |
| 5-6 | moderate | Needs work |
| 0-4 | poor | Critical gap |

**Functions:**
```typescript
// Commodity score (inverse)
getCommodityScoreColor(score: number): ScoreColor
getCommodityScoreLevel(score: number): ScoreLevel
getCommodityScoreLabel(score: number): string
getCommodityScoreDescription(score: number): string
getCommodityScoreColorClass(score: number): string
getCommodityScoreBgClass(score: number): string

// Category scores (normal)
getCategoryScoreColor(score: number): ScoreLevel
getCategoryScoreLabel(score: number): string
getCategoryScoreColorClass(score: number): string
getCategoryScoreBgClass(score: number): string
```

### Formatting (`shared/utils/formatting.ts`)

```typescript
formatHostname(url: string): string
// "https://www.acme.com" → "acme.com"

formatCompanyName(snapshot: { title?: string }, hostname: string): string
// Uses snapshot.title or derives from hostname

padNumber(num: number, digits?: number): string
// padNumber(7, 2) → "07"

truncateText(text: string, maxLength: number): string
// "Long text..." → "Long te..."

formatDate(date: Date | number | string): string
// "January 15, 2024"

capitalize(text: string): string
// "hello" → "Hello"
```

## Types

```typescript
import type {
  // Audit types
  ViewType,           // 'overview' | 'message' | 'audience' | 'trust' | 'copy'
  View,               // { id: ViewType, label: string, description?: string }
  TeaserFinding,      // Teaser finding for LockedFindings component
  ScoreCategory,      // Score category for ScoreModal

  // Scoring types
  Severity,           // 'critical' | 'warning' | 'info'
  ScoreColor,         // 'green' | 'yellow' | 'orange' | 'red'
  ScoreLevel,         // 'excellent' | 'moderate' | 'poor' | 'critical'

  // Processing types
  ChecklistItem,      // { label: string, progressThreshold: number }
  ProcessingPageProps // Full props interface for ProcessingPage
} from '@/shared'
```

## Component Architecture

### ProcessingPage Flow

```
User initiates analysis
       ↓
ProcessingPage polls API endpoint
       ↓
Updates: progress, status, message, itemCount
       ↓
Complete? → Show completion screen → onComplete(id)
Failed?   → Show error screen → onError(message)
       ↓
User clicks "Show results" → navigate to results
```

### AuditLayout Structure

```
┌─────────────────────────────────────┐
│ Optional Top Banner (sample/preview)│
├──────────┬──────────────────────────┤
│          │                          │
│ Sidebar  │  Main Content Area       │
│  - Logo  │  (your view content)     │
│  - Views │                          │
│  - CTA   │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

## Usage Examples

### Processing Page

```typescript
import { ProcessingPage, ChecklistItem } from '@/shared'

const checklistItems: ChecklistItem[] = [
  { label: 'Reading homepage', progressThreshold: 10 },
  { label: 'Scanning site pages', progressThreshold: 30 },
  { label: 'Analyzing messaging patterns', progressThreshold: 60 },
  { label: 'Scoring commoditization', progressThreshold: 85 },
  { label: 'Generating rewrites', progressThreshold: 95 }
]

<ProcessingPage
  analysisId={analysisId}
  progress={0}
  status="pending"
  message="Starting analysis..."
  apiEndpoint="/api/analyze/status"
  pollInterval={800}
  onComplete={(id) => router.push(`/results/${id}`)}
  onError={(err) => setError(err)}
  checklistItems={checklistItems}
  showLinkedInField
  title="Scanning your website"
  completionButtonText="Show me my results →"
/>
```

### Audit Layout with Locked Content

```typescript
import { AuditLayout, LockedFindings, viewIcons } from '@/shared'
import type { View, ViewType } from '@/shared'

const views: View[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'message', label: 'Message clarity' },
  { id: 'audience', label: 'Audience focus' },
  { id: 'trust', label: 'Trust signals' },
  { id: 'copy', label: 'Copy examples' }
]

function PreviewPage() {
  const [currentView, setCurrentView] = useState<ViewType>('overview')

  return (
    <AuditLayout
      companyName="Acme Construction"
      hostname="acmeconstruction.com"
      currentView={currentView}
      onViewChange={setCurrentView}
      views={views}
      isLocked={true}
      topBanner={<PreviewBanner />}
    >
      {/* Overview content */}
      {currentView === 'overview' && (
        <div>
          <h1>Commodity score: 74</h1>
          {/* ... */}
        </div>
      )}

      {/* Locked views */}
      {currentView !== 'overview' && (
        <LockedFindings
          onUnlock={() => router.push('/purchase')}
          showTeaser={true}
          teaserFinding={{
            phrase: "We offer quality service",
            problem: "Generic claim with no proof",
            rewrite: "We deliver 98% on-time completion in harsh Minnesota winters",
            location: "Homepage hero"
          }}
        />
      )}
    </AuditLayout>
  )
}
```

### Scoring Display

```typescript
import {
  getCommodityScoreColor,
  getCommodityScoreLabel,
  getCommodityScoreBgClass
} from '@/shared'

function ScoreCard({ score }: { score: number }) {
  const color = getCommodityScoreColor(score)
  const label = getCommodityScoreLabel(score)
  const bgClass = getCommodityScoreBgClass(score)

  return (
    <div className={`p-6 ${bgClass}`}>
      <div className="text-6xl font-bold text-center">
        {score}
      </div>
      <p className={`text-center text-${color}-600 font-semibold`}>
        {label}
      </p>
    </div>
  )
}
```

## Documentation

- **[Component API Reference](./docs/COMPONENTS.md)** - Detailed prop documentation for all components
- **[Migration Guide](./docs/MIGRATION.md)** - How to migrate existing pages to use shared components

## File Structure

```
shared/
├── components/
│   ├── processing/
│   │   ├── ProcessingPage.tsx      # Main processing screen
│   │   ├── ProcessingProgress.tsx  # Progress bar
│   │   ├── ProcessingStatus.tsx    # Status display
│   │   ├── ProcessingChecklist.tsx # Dynamic checklist
│   │   ├── AnimatedCounter.tsx     # Number animation
│   │   └── index.ts
│   ├── layout/
│   │   ├── AuditLayout.tsx         # Main layout wrapper
│   │   ├── SidebarNav.tsx          # Desktop sidebar
│   │   ├── ViewNavBar.tsx          # Mobile bottom nav
│   │   ├── LockedFindings.tsx      # Paywall component
│   │   ├── ScoreModal.tsx          # Score details
│   │   └── index.ts
│   └── icons/
│       ├── ViewIcons.tsx           # Navigation icons
│       ├── SeverityIcon.tsx        # Issue severity
│       └── index.ts
├── utils/
│   ├── scoring.ts                  # Score calculations
│   ├── formatting.ts               # Text formatting
│   └── index.ts
├── types/
│   ├── audit.ts                    # Audit types
│   └── scoring.ts                  # Scoring types
├── lib/                            # Legacy - Resend/Stripe
│   ├── email.ts
│   └── stripe.ts
├── docs/
│   ├── COMPONENTS.md               # Component API reference
│   └── MIGRATION.md                # Migration guide
├── __tests__/                      # Component tests
├── index.ts                        # Main barrel export
└── README.md                       # This file
```

## Development

### Adding New Utilities

1. Create function in appropriate `utils/*.ts` file
2. Add JSDoc comments explaining parameters and edge cases
3. Export from `utils/index.ts`
4. Add usage example to this README
5. Add type definitions to `types/` if needed

### Adding New Components

1. Create component in appropriate `components/*/` folder
2. Export from local `index.ts`
3. Add prop interface with JSDoc
4. Document in `docs/COMPONENTS.md`
5. Add usage example to this README

### Tree-Shaking

All exports are named exports to enable tree-shaking. Import only what you need:

```typescript
// Good - only imports what's used
import { formatHostname, padNumber } from '@/shared'

// Avoid - imports everything
import * as shared from '@/shared'
```

## Benefits

### Code Reduction

Shared components eliminate 70-80% of boilerplate code:

| Page Type | Before | After | Reduction |
|-----------|--------|-------|-----------|
| Sample page | 715 lines | ~150 lines | 79% |
| Preview page | 1017 lines | ~200 lines | 80% |
| Results page | 411 lines | ~150 lines | 64% |
| Processing page | 450 lines | ~80 lines | 82% |

### Consistency

- Single source of truth for UI patterns
- Consistent scoring logic across tools
- Unified navigation and layout
- Shared type definitions prevent drift

### Maintainability

- Update once, fix everywhere
- Centralized accessibility improvements
- Easy to add features (download PDF, etc.)
- Clear separation of concerns

## Environment Variables (Legacy)

For tools using the legacy `lib/email.ts` and `lib/stripe.ts`:

```bash
RESEND_API_KEY=re_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## Testing

Run component tests:

```bash
cd shared
npm test
```

## License

Internal use only - LFI Tools monorepo.
