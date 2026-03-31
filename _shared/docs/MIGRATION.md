# Migration Guide

How to migrate existing pages to use shared components for massive code reduction and consistency.

## Table of Contents

- [Overview](#overview)
- [Website-Audit Migration](#website-audit-migration)
  - [Processing Page](#processing-page-migration)
  - [Sample Page](#sample-page-migration)
  - [Preview Page](#preview-page-migration)
  - [Results Page](#results-page-migration)
- [General Patterns](#general-patterns)
- [Common Pitfalls](#common-pitfalls)
- [Testing Migration](#testing-migration)

---

## Overview

**Benefits of migration:**
- 70-80% code reduction per page
- Consistent UI/UX across all tools
- Single source of truth for scoring logic
- Easier maintenance (update once, fix everywhere)
- Better accessibility out of the box

**Migration strategy:**
1. Identify duplicated patterns in your page
2. Replace with shared component
3. Extract page-specific logic only
4. Test thoroughly

---

## Website-Audit Migration

### Processing Page Migration

**File:** `app/analyze/[id]/page.tsx`

#### Before (450 lines)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// All this custom polling logic...
const [progress, setProgress] = useState(0)
const [status, setStatus] = useState('pending')
const [message, setMessage] = useState('')
const [error, setError] = useState('')

useEffect(() => {
  const pollStatus = async () => {
    // 100+ lines of polling logic
  }
  pollStatus()
}, [analysisId])

// Custom progress bar component
function ProgressBar({ progress }: { progress: number }) {
  // ...
}

// Custom checklist component
function Checklist({ items, progress }: Props) {
  // ...
}

// 300+ lines of JSX
return (
  <main>
    {/* Custom layout */}
    {/* Custom progress UI */}
    {/* Custom checklist */}
    {/* Custom completion screen */}
  </main>
)
```

#### After (~80 lines)

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { ProcessingPage, ChecklistItem } from '@/shared'

const checklistItems: ChecklistItem[] = [
  { label: 'Reading homepage', progressThreshold: 10 },
  { label: 'Scanning site pages', progressThreshold: 30 },
  { label: 'Analyzing messaging patterns', progressThreshold: 60 },
  { label: 'Scoring commoditization', progressThreshold: 85 },
  { label: 'Generating rewrites', progressThreshold: 95 }
]

export default function AnalyzePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params

  return (
    <ProcessingPage
      analysisId={id}
      progress={0}
      status="pending"
      message="Starting analysis..."
      apiEndpoint="/api/analyze/status"
      pollInterval={800}
      onComplete={(id) => router.push(`/results/${id}`)}
      onError={(err) => {
        console.error('Analysis failed:', err)
      }}
      onRetry={() => router.push('/')}
      checklistItems={checklistItems}
      showLinkedInField
      itemsProcessedLabel="pages scanned"
      title="Scanning your website"
      completionTitle="Results ready!"
      completionButtonText="Show me my results →"
    />
  )
}
```

**Reduction:** 450 lines → 80 lines (82% reduction)

---

### Sample Page Migration

**File:** `app/sample/page.tsx`

#### Before (715 lines)

```typescript
'use client'

import { useState } from 'react'

// Duplicated code
const viewIcons = {
  overview: <svg>...</svg>,
  message: <svg>...</svg>,
  // ... 100+ lines
}

const views = [
  { id: 'overview', label: 'Overview' },
  // ...
]

function getCommodityScoreColor(score: number) {
  // Duplicated scoring logic
}

function formatHostname(url: string) {
  // Duplicated formatting
}

// Custom sidebar component
function Sidebar({ ... }) {
  // 200+ lines
}

// 300+ lines of view content
export default function SamplePage() {
  const [currentView, setCurrentView] = useState('overview')

  return (
    <main>
      <Sidebar ... />
      <div>
        {/* View content */}
      </div>
    </main>
  )
}
```

#### After (~150 lines)

```typescript
'use client'

import { useState } from 'react'
import {
  AuditLayout,
  getCommodityScoreColor,
  getCommodityScoreLabel,
  formatHostname
} from '@/shared'
import type { View, ViewType } from '@/shared'

const views: View[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'message', label: 'Message clarity' },
  { id: 'audience', label: 'Audience focus' },
  { id: 'trust', label: 'Trust signals' },
  { id: 'copy', label: 'Copy examples' }
]

export default function SamplePage() {
  const [currentView, setCurrentView] = useState<ViewType>('overview')

  // Sample data (just for demo)
  const commodityScore = 74
  const hostname = formatHostname('https://acmeconstruction.com')

  return (
    <AuditLayout
      companyName="Acme Construction"
      hostname={hostname}
      currentView={currentView}
      onViewChange={setCurrentView}
      views={views}
      isSample={true}
      topBanner={
        <div className="bg-yellow-100 py-3 px-6 text-center text-sm">
          <strong>Sample report</strong> - See what you&apos;ll get before entering your URL
        </div>
      }
    >
      {/* Overview view */}
      {currentView === 'overview' && (
        <div className="p-6">
          <h1>Your commodity score</h1>
          <div className="text-6xl font-bold">
            {commodityScore}
          </div>
          <p className={getCommodityScoreColorClass(commodityScore)}>
            {getCommodityScoreLabel(commodityScore)}
          </p>
          {/* Rest of overview content */}
        </div>
      )}

      {/* Other views */}
      {currentView === 'message' && <MessageView />}
      {currentView === 'audience' && <AudienceView />}
      {currentView === 'trust' && <TrustView />}
      {currentView === 'copy' && <CopyView />}
    </AuditLayout>
  )
}

// View components stay the same, just cleaner
function MessageView() {
  return <div className="p-6">{/* Message content */}</div>
}
```

**Reduction:** 715 lines → 150 lines (79% reduction)

---

### Preview Page Migration

**File:** `app/preview/[id]/page.tsx`

#### Before (1017 lines)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Duplicated everything from sample page PLUS:
// - Data fetching logic
// - Loading states
// - Error handling
// - Locked content logic
// - Teaser finding display

function LockedContent({ ... }) {
  // 150+ lines of custom paywall UI
}

export default function PreviewPage({ params }: { params: { id: string } }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState('overview')

  useEffect(() => {
    // Fetch analysis
  }, [params.id])

  if (loading) return <div>Loading...</div>

  return (
    <main>
      {/* Sidebar */}
      {/* Content with locked sections */}
    </main>
  )
}
```

#### After (~200 lines)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AuditLayout,
  LockedFindings,
  getCommodityScoreColor,
  getCommodityScoreLabel
} from '@/shared'
import type { View, ViewType, TeaserFinding } from '@/shared'

const views: View[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'message', label: 'Message clarity' },
  { id: 'audience', label: 'Audience focus' },
  { id: 'trust', label: 'Trust signals' },
  { id: 'copy', label: 'Copy examples' }
]

export default function PreviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<ViewType>('overview')
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch analysis data
  useEffect(() => {
    async function fetchAnalysis() {
      const res = await fetch(`/api/analyze?id=${params.id}`)
      const data = await res.json()
      setAnalysis(data.analysis)
      setLoading(false)
    }
    fetchAnalysis()
  }, [params.id])

  if (loading) return <div>Loading...</div>
  if (!analysis) return <div>Analysis not found</div>

  // Extract teaser finding (first finding from analysis)
  const teaserFinding: TeaserFinding | undefined = analysis.findings?.[0]
    ? {
        phrase: analysis.findings[0].phrase,
        problem: analysis.findings[0].problem,
        rewrite: analysis.findings[0].rewrite,
        location: analysis.findings[0].location
      }
    : undefined

  return (
    <AuditLayout
      companyName={analysis.companyName}
      hostname={analysis.hostname}
      currentView={currentView}
      onViewChange={setCurrentView}
      views={views}
      isLocked={true}
      topBanner={
        <div className="bg-blue-100 py-3 px-6 text-center text-sm">
          <strong>Free preview</strong> - Unlock full audit for $400
        </div>
      }
      sidebarBottomCta={
        <button
          onClick={() => router.push(`/purchase?id=${params.id}`)}
          className="w-full bg-white text-[var(--accent)] px-6 py-4 font-bold hover:opacity-90"
        >
          Unlock full audit — $400
        </button>
      }
    >
      {/* Overview - UNLOCKED */}
      {currentView === 'overview' && (
        <div className="p-6">
          <h1>Your commodity score</h1>
          <div className="text-6xl font-bold">
            {analysis.commodityScore}
          </div>
          <p className={getCommodityScoreColorClass(analysis.commodityScore)}>
            {getCommodityScoreLabel(analysis.commodityScore)}
          </p>
          {/* Show overview content */}
        </div>
      )}

      {/* All other views - LOCKED */}
      {currentView !== 'overview' && (
        <LockedFindings
          onUnlock={() => router.push(`/purchase?id=${params.id}`)}
          showTeaser={true}
          teaserFinding={teaserFinding}
          price={400}
        />
      )}
    </AuditLayout>
  )
}
```

**Reduction:** 1017 lines → 200 lines (80% reduction)

---

### Results Page Migration

**File:** `app/results/[id]/page.tsx`

#### Before (411 lines)

```typescript
'use client'

import { useEffect, useState } from 'react'

// Duplicated sidebar
// Duplicated scoring logic
// Duplicated view navigation
// Custom download PDF logic

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [analysis, setAnalysis] = useState(null)
  const [currentView, setCurrentView] = useState('overview')

  // Fetch logic
  // Download PDF logic

  return (
    <main>
      {/* Sidebar */}
      {/* Content */}
    </main>
  )
}
```

#### After (~150 lines)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { AuditLayout, getCommodityScoreColor } from '@/shared'
import type { View, ViewType } from '@/shared'

const views: View[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'message', label: 'Message clarity' },
  { id: 'audience', label: 'Audience focus' },
  { id: 'trust', label: 'Trust signals' },
  { id: 'copy', label: 'Copy examples' }
]

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [currentView, setCurrentView] = useState<ViewType>('overview')
  const [analysis, setAnalysis] = useState<any>(null)

  useEffect(() => {
    // Fetch analysis
  }, [params.id])

  if (!analysis) return <div>Loading...</div>

  return (
    <AuditLayout
      companyName={analysis.companyName}
      hostname={analysis.hostname}
      currentView={currentView}
      onViewChange={setCurrentView}
      views={views}
      showDownloadPdf
      onDownloadPdf={() => window.print()}
    >
      {/* All views unlocked */}
      {currentView === 'overview' && <OverviewView data={analysis} />}
      {currentView === 'message' && <MessageView data={analysis} />}
      {currentView === 'audience' && <AudienceView data={analysis} />}
      {currentView === 'trust' && <TrustView data={analysis} />}
      {currentView === 'copy' && <CopyView data={analysis} />}
    </AuditLayout>
  )
}
```

**Reduction:** 411 lines → 150 lines (64% reduction)

---

## General Patterns

### Pattern 1: Replace Custom Polling

**Before:**
```typescript
useEffect(() => {
  let isMounted = true
  const pollStatus = async () => {
    // 50+ lines of polling logic
  }
  pollStatus()
  return () => { isMounted = false }
}, [id])
```

**After:**
```typescript
<ProcessingPage
  analysisId={id}
  apiEndpoint="/api/status"
  onComplete={(id) => router.push(`/results/${id}`)}
  onError={(err) => setError(err)}
  // ... other props
/>
```

---

### Pattern 2: Replace Sidebar Navigation

**Before:**
```typescript
// 200+ lines of custom sidebar component
function Sidebar({ views, currentView, onChange }) {
  return (
    <nav className="fixed left-0 w-64 bg-dark">
      {/* Company name */}
      {/* View list */}
      {/* Lock icons */}
    </nav>
  )
}
```

**After:**
```typescript
<AuditLayout
  companyName="Acme"
  hostname="acme.com"
  currentView={currentView}
  onViewChange={setCurrentView}
  views={views}
  isLocked={!isPaid}
>
  {/* Content */}
</AuditLayout>
```

---

### Pattern 3: Replace Scoring Logic

**Before:**
```typescript
// Duplicated in every file
function getCommodityScoreColor(score: number) {
  if (score <= 40) return 'green'
  if (score <= 60) return 'yellow'
  if (score <= 80) return 'orange'
  return 'red'
}

function getCommodityScoreLabel(score: number) {
  if (score <= 40) return 'Well differentiated'
  // ... etc
}

// Use it
const color = getCommodityScoreColor(score)
const label = getCommodityScoreLabel(score)
```

**After:**
```typescript
import { getCommodityScoreColor, getCommodityScoreLabel } from '@/shared'

const color = getCommodityScoreColor(score)
const label = getCommodityScoreLabel(score)
```

---

### Pattern 4: Replace Locked Content

**Before:**
```typescript
// 100+ lines of custom paywall UI
function LockedSection({ onUnlock }) {
  return (
    <div className="border-dashed">
      <p>Content locked</p>
      <button onClick={onUnlock}>Unlock - $400</button>
    </div>
  )
}

// In page
{currentView !== 'overview' && (
  <LockedSection onUnlock={() => router.push('/purchase')} />
)}
```

**After:**
```typescript
import { LockedFindings } from '@/shared'

{currentView !== 'overview' && (
  <LockedFindings
    onUnlock={() => router.push('/purchase')}
    showTeaser={true}
    teaserFinding={analysis.findings[0]}
    price={400}
  />
)}
```

---

### Pattern 5: Replace View Icons

**Before:**
```typescript
// Duplicated in every file (100+ lines)
const viewIcons = {
  overview: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" />
      {/* ... */}
    </svg>
  ),
  message: <svg>...</svg>,
  // ... etc
}

// Use it
<div className="flex items-center gap-2">
  {viewIcons[view.id]}
  {view.label}
</div>
```

**After:**
```typescript
import { viewIcons } from '@/shared'

<div className="flex items-center gap-2">
  {viewIcons[view.id]}
  {view.label}
</div>
```

---

## Common Pitfalls

### Pitfall 1: Forgetting to Update Types

**Wrong:**
```typescript
const [currentView, setCurrentView] = useState('overview')
// Type is string, not ViewType
```

**Correct:**
```typescript
import type { ViewType } from '@/shared'

const [currentView, setCurrentView] = useState<ViewType>('overview')
```

---

### Pitfall 2: Duplicating Views Array

**Wrong:**
```typescript
// Defining views inline every time
<AuditLayout
  views={[
    { id: 'overview', label: 'Overview' },
    { id: 'message', label: 'Message' }
  ]}
/>
```

**Better:**
```typescript
// Define once at module level
const views: View[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'message', label: 'Message clarity' },
  // ...
]

<AuditLayout views={views} {...} />
```

---

### Pitfall 3: Not Handling Edge Cases

**Wrong:**
```typescript
const teaserFinding = analysis.findings[0]
// What if findings is empty?

<LockedFindings
  teaserFinding={teaserFinding}  // Could be undefined
/>
```

**Correct:**
```typescript
const teaserFinding: TeaserFinding | undefined =
  analysis.findings?.[0]
    ? {
        phrase: analysis.findings[0].phrase,
        problem: analysis.findings[0].problem,
        rewrite: analysis.findings[0].rewrite,
        location: analysis.findings[0].location
      }
    : undefined

<LockedFindings
  showTeaser={!!teaserFinding}
  teaserFinding={teaserFinding}
/>
```

---

### Pitfall 4: Incorrect Import Paths

**Wrong:**
```typescript
import { ProcessingPage } from '../../shared/components/processing'
import { getCommodityScoreColor } from '../../shared/utils/scoring'
```

**Correct:**
```typescript
import { ProcessingPage, getCommodityScoreColor } from '@/shared'
```

All exports are available from the barrel export at `@/shared`.

---

## Testing Migration

### Checklist

After migrating a page, verify:

- [ ] Page renders without errors
- [ ] Navigation works (view switching)
- [ ] Locked content shows correctly (if applicable)
- [ ] Scoring displays correct colors/labels
- [ ] Processing polling works (if applicable)
- [ ] Mobile responsive (sidebar hidden, content visible)
- [ ] Keyboard navigation works
- [ ] Print styles work (if results page)
- [ ] TypeScript has no errors
- [ ] No console warnings

### Visual Regression

Compare screenshots before/after migration:

```bash
# Before migration
npm run dev
# Visit page, take screenshot

# After migration
npm run dev
# Visit page, compare screenshot
```

### Functional Testing

Test user flows:

1. **Processing flow:**
   - Submit URL
   - Watch progress update
   - See completion screen
   - Navigate to results

2. **Preview flow:**
   - View overview (unlocked)
   - Try other views (locked)
   - Click unlock button

3. **Results flow:**
   - Switch between views
   - Download PDF
   - Check all content visible

---

## Migration Checklist

Use this checklist for each page:

### Pre-Migration
- [ ] Identify duplicated code (icons, scoring, navigation)
- [ ] Check if shared components cover your use case
- [ ] Review API response format (for ProcessingPage)
- [ ] Note any custom behaviors to preserve

### During Migration
- [ ] Import shared components
- [ ] Replace custom code with shared components
- [ ] Update state management (if needed)
- [ ] Fix TypeScript errors
- [ ] Test in browser

### Post-Migration
- [ ] Delete unused custom components
- [ ] Remove duplicated utility functions
- [ ] Update imports across affected files
- [ ] Run full test suite
- [ ] Check bundle size reduction

### Verification
- [ ] All features work as before
- [ ] UI matches previous design
- [ ] No regressions introduced
- [ ] Code is cleaner and more maintainable

---

## Estimated Time

| Page Type | Before (lines) | After (lines) | Est. Time |
|-----------|---------------|---------------|-----------|
| Processing | 450 | 80 | 30 min |
| Sample | 715 | 150 | 45 min |
| Preview | 1017 | 200 | 60 min |
| Results | 411 | 150 | 30 min |

**Total for website-audit:** ~3 hours for 70-80% code reduction

---

## Questions?

See:
- [Component API Reference](./COMPONENTS.md) for prop documentation
- [Main README](../README.md) for usage examples
- Component source files in `shared/components/` for implementation details
