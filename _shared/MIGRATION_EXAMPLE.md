# Migration Example: Before & After

## Before (Duplicated in sample/page.tsx AND preview/[id]/page.tsx)

```typescript
// DUPLICATED in both files (84 lines of identical code)
const viewIcons: Record<ViewType, React.ReactNode> = {
  overview: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  // ... 4 more icons
}

// DUPLICATED helper functions
function getSeverityIcon(severity: string): string {
  switch (severity) {
    case 'critical': return '🔴'
    case 'warning': return '🟡'
    case 'info': return '🟢'
    default: return '⚪'
  }
}

function getCommodityLabel(score: number): string {
  if (score <= 40) return 'Well differentiated'
  if (score <= 60) return 'Needs work'
  if (score <= 80) return 'Highly generic'
  return 'Commodity territory'
}

function getCommodityColor(score: number): string {
  if (score <= 40) return 'green'
  if (score <= 60) return 'yellow'
  if (score <= 80) return 'orange'
  return 'red'
}
```

## After (Using Shared Utilities)

```typescript
import {
  viewIcons,
  getSeverityEmoji,
  getCommodityScoreColor,
  getCommodityScoreLabel,
  getCommodityScoreDescription,
  formatHostname,
  padNumber
} from '@lfi-tools/shared'

// Icons - just use the imported object
{viewIcons['overview']}

// Severity - cleaner name, better typing
{getSeverityEmoji(issue.severity)}

// Commodity score - consistent naming
const scoreColor = getCommodityScoreColor(commodityScore)
const scoreLabel = getCommodityScoreLabel(commodityScore)

// URL formatting - handles edge cases
const hostname = formatHostname(data.url)
```

## Lines of Code Reduction

### sample/page.tsx
- **Before:** 715 lines (including duplicated helpers)
- **After:** ~630 lines (85 lines removed)
- **Reduction:** 12%

### preview/[id]/page.tsx
- **Before:** 1,016 lines (including duplicated helpers)
- **After:** ~910 lines (106 lines removed)
- **Reduction:** 10%

### Total Codebase
- **Before:** 1,731 lines with duplication
- **After:** 1,540 lines + 350 lines in shared = 1,890 lines
- **Net Impact:** +159 lines, but...

## Why This Is Better (Despite More Total Lines)

1. **Single Source of Truth**
   - Bug fixes apply everywhere
   - No drift between implementations
   - Consistent behavior across tools

2. **Better Documentation**
   - JSDoc comments on every function
   - README with examples
   - Edge cases documented

3. **Type Safety**
   - Proper TypeScript types
   - Exported types for reuse
   - Enum-like types (ScoreColor, Severity)

4. **Edge Case Handling**
   - NaN/undefined handling
   - URL parsing errors
   - Out-of-range scores

5. **Future Tools**
   - Next tool gets instant access
   - No copy-paste bugs
   - Shared improvements

6. **Testing**
   - Test once, benefits all tools
   - Centralized test coverage
   - No duplicate test code

## Real Impact: The Inverse Score Bug Example

**Scenario:** Someone fixes the commodity score color thresholds

### Before (Duplicated Code)
```typescript
// In sample/page.tsx
function getCommodityColor(score: number): string {
  if (score <= 40) return 'green'   // Fixed here
  if (score <= 60) return 'yellow'
  if (score <= 80) return 'orange'
  return 'red'
}

// In preview/[id]/page.tsx (OOPS, forgot to update!)
function getCommodityColor(score: number): string {
  if (score <= 35) return 'green'   // OLD THRESHOLD
  if (score <= 60) return 'yellow'
  if (score <= 80) return 'orange'
  return 'red'
}
```

Result: **Inconsistent scoring across pages** 🐛

### After (Shared Code)
```typescript
// In shared/utils/scoring.ts
export function getCommodityScoreColor(score: number): ScoreColor {
  if (score <= 40) return 'green'   // Fixed ONCE
  if (score <= 60) return 'yellow'
  if (score <= 80) return 'orange'
  return 'red'
}
```

Result: **Consistent everywhere** ✅

## Migration Checklist

When you're ready to migrate the actual pages:

- [ ] Update imports in sample/page.tsx
- [ ] Remove duplicated `viewIcons` object
- [ ] Remove duplicated helper functions
- [ ] Update function calls to new names
- [ ] Test sample page renders correctly
- [ ] Update imports in preview/[id]/page.tsx  
- [ ] Remove duplicated code from preview page
- [ ] Test preview page renders correctly
- [ ] Run type-check: `npm run type-check`
- [ ] Run build: `npm run build`
- [ ] Visual regression test on both pages
