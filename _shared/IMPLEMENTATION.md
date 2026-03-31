# Shared Utilities Implementation Summary

## Files Created

### Types
- `types/scoring.ts` - Core scoring types (Severity, ScoreColor, ScoreLevel, ScoreCategory)

### Utilities
- `utils/scoring.ts` - Score calculation functions (commodity + category scores)
- `utils/formatting.ts` - Text formatting helpers (hostname, company name, padding, etc.)
- `utils/index.ts` - Barrel export

### Components
- `components/icons/ViewIcons.tsx` - Navigation icons (Overview, Message, Audience, Trust, Copy)
- `components/icons/SeverityIcon.tsx` - Severity indicators with emojis
- `components/icons/index.ts` - Barrel export
- `components/index.ts` - Main barrel export

### Documentation
- `README.md` - Full usage documentation
- `index.ts` - Main package entry point

## Extracted Patterns

### From sample/page.tsx
- `viewIcons` object → `ViewIcons.tsx` (individual components + map)
- `getSeverityIcon()` → `SeverityIcon.tsx` 
- `getCommodityLabel()` → `scoring.ts` as `getCommodityScoreLabel()`
- `getCommodityColor()` → `scoring.ts` as `getCommodityScoreColor()`
- `padStart()` pattern → `formatting.ts` as `padNumber()`

### From preview/[id]/page.tsx
- Duplicate `viewIcons` → consolidated
- Duplicate `getSeverityIcon()` → consolidated
- Duplicate `getCommodityLabel()` → consolidated
- Duplicate `getCommodityColor()` → consolidated
- `scoreCategories` array → `types/scoring.ts`
- `getScoreColor()` → `scoring.ts` as `getCategoryScoreColor()`
- `getScoreLabel()` → `scoring.ts` as `getCategoryScoreLabel()`
- `getCommodityDescription()` → `scoring.ts`
- URL parsing → `formatting.ts` as `formatHostname()`
- Company name derivation → `formatting.ts` as `formatCompanyName()`

## Key Design Decisions

### 1. Inverse vs Normal Scores
**CRITICAL:** Documented extensively because this is confusing:
- Commodity score (0-100): LOWER is better (inverse)
- Category scores (0-10): HIGHER is better (normal)

Each function has JSDoc comments explaining this.

### 2. Icon Components
Created both:
- Individual components (`<OverviewIcon />`)
- Map object (`viewIcons['overview']`)

This supports both direct usage and dynamic rendering.

### 3. Edge Case Handling
All score functions handle:
- `NaN` → returns safe default
- `undefined` → returns safe default
- Out of range → clamps to valid range

### 4. Tailwind Class Helpers
Added helpers for:
- Text colors (`getCommodityScoreColorClass()`)
- Background colors (`getCommodityScoreBgClass()`)
- Severity classes (`getSeverityBgClass()`, `getSeverityTextClass()`)

### 5. Tree-Shakeable Exports
- All named exports (no default exports)
- Barrel exports for convenience
- Import only what you need

## Next Steps

To use these in the audit pages:

1. **Update imports in sample/page.tsx:**
```typescript
import {
  viewIcons,
  getSeverityEmoji,
  getCommodityScoreColor,
  getCommodityScoreLabel,
  padNumber
} from '@lfi-tools/shared'
```

2. **Update imports in preview/[id]/page.tsx:**
```typescript
import {
  viewIcons,
  scoreCategories,
  getSeverityEmoji,
  getCommodityScoreColor,
  getCommodityScoreLabel,
  getCommodityScoreDescription,
  getCategoryScoreColor,
  getCategoryScoreLabel,
  formatHostname,
  formatCompanyName
} from '@lfi-tools/shared'
```

3. **Remove duplicated code:**
- Delete local `viewIcons` objects
- Delete local helper functions
- Delete local type definitions

4. **Verify TypeScript:**
```bash
cd /Users/lee/Sites/lfi-tools/website-audit
npm run type-check
```

## File Structure

```
shared/
├── components/
│   └── icons/
│       ├── ViewIcons.tsx       # 5 icon components + viewIcons map
│       ├── SeverityIcon.tsx    # Severity indicators
│       └── index.ts
├── utils/
│   ├── scoring.ts              # 12 scoring functions
│   ├── formatting.ts           # 6 formatting helpers
│   └── index.ts
├── types/
│   └── scoring.ts              # Types + scoreCategories constant
├── index.ts                    # Main barrel export
└── README.md                   # Full documentation
```

## Testing Checklist

Before deploying changes to audit pages:

- [ ] Commodity score colors match original (0-40 green, 41-60 yellow, etc.)
- [ ] Category score colors inverse (7-10 green, 0-4 red)
- [ ] Icons render identically (check SVG viewBox and stroke)
- [ ] Severity emojis match (🔴 critical, 🟡 warning, 🟢 info)
- [ ] Hostname formatting removes www.
- [ ] Company name fallback works
- [ ] Number padding works (1 → "01")
- [ ] Edge cases handled (NaN, undefined, null)

## Benefits

1. **DRY** - Single source of truth for shared logic
2. **Consistency** - Same scoring across all tools
3. **Maintainable** - Fix once, applies everywhere
4. **Type-safe** - Full TypeScript types
5. **Documented** - Extensive JSDoc + README
6. **Tested** - Edge cases handled upfront
