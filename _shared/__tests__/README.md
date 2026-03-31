# Shared Component Tests

Comprehensive unit tests for LFI tools monorepo shared components and utilities.

## Test Structure

```
shared/__tests__/
├── setup.ts                              # Global test setup and mocks
├── utils/
│   ├── scoring.test.ts                   # Score calculation functions
│   └── formatting.test.ts                # Text formatting helpers
├── components/
│   ├── processing/
│   │   ├── AnimatedCounter.test.tsx      # Counter animation component
│   │   ├── ProcessingProgress.test.tsx   # Progress bar component
│   │   ├── ProcessingStatus.test.tsx     # Status message display
│   │   ├── ProcessingChecklist.test.tsx  # Dynamic checklist component
│   │   └── ProcessingPage.test.tsx       # Full processing page (API polling, states)
│   ├── layout/
│   │   ├── SidebarNav.test.tsx           # Dark sidebar navigation
│   │   ├── LockedFindings.test.tsx       # Paywall/teaser component
│   │   └── AuditLayout.test.tsx          # Main audit layout wrapper
│   └── icons/
│       └── ViewIcons.test.tsx            # View navigation icons
```

## Test Coverage

### Utils Tests (2 files, 50+ tests)

**scoring.test.ts** - Tests for two different score systems:
- Commodity score (INVERSE: 0-100, lower is better)
  - Color/level mapping
  - Label generation
  - Description text
  - Tailwind class generation
  - NaN/edge case handling
- Category scores (NORMAL: 0-10, higher is better)
  - Color/level mapping
  - Label generation
  - Tailwind class generation

**formatting.test.ts** - Text formatting utilities:
- `formatHostname()` - URL parsing, www removal
- `formatCompanyName()` - Site title or hostname derivation
- `padNumber()` - Zero padding
- `truncateText()` - Smart truncation with ellipsis
- `formatDate()` - Date formatting
- `capitalize()` - First letter capitalization

### Component Tests (9 files, 150+ tests)

**Processing Components:**
- AnimatedCounter - Animation behavior, value transitions
- ProcessingProgress - Progress bar rendering, percentage clamping
- ProcessingStatus - Status-specific displays (crawling, analyzing)
- ProcessingChecklist - Dynamic checkmarks based on progress
- ProcessingPage - Full integration: API polling, states (pending/crawling/analyzing/complete/failed), error handling, enrichment fields

**Layout Components:**
- SidebarNav - Navigation rendering, lock states, PDF button, view switching
- LockedFindings - Paywall, teaser finding display, unlock CTA
- AuditLayout - Layout composition, scroll behavior, responsive design

**Icon Components:**
- ViewIcons - All 5 icon types, consistency checks, dynamic rendering

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test scoring.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Testing Philosophy

1. **Test behavior, not implementation** - Focus on what users see/do
2. **Test edge cases** - Boundary values, null/undefined, NaN, errors
3. **Mock external dependencies** - fetch, router, window methods
4. **Clear test names** - Describe expected behavior in plain English
5. **Meaningful assertions** - Use Testing Library best practices

## Key Testing Patterns

### Commodity Score (INVERSE)
```typescript
// 0-40 = green (excellent)
// 41-60 = yellow (moderate)
// 61-80 = orange (poor)
// 81-100 = red (critical)
```

### Category Score (NORMAL)
```typescript
// 7-10 = excellent
// 5-6 = moderate
// 0-4 = poor
```

### Async Component Testing
```typescript
// ProcessingPage polls API
await waitFor(() => {
  expect(screen.getByText('Results ready!')).toBeInTheDocument()
})
```

### User Event Testing
```typescript
const user = userEvent.setup()
await user.click(button)
expect(mockCallback).toHaveBeenCalled()
```

## Mocks Configured

- `next/navigation` - useRouter, useParams, useSearchParams, usePathname
- `global.fetch` - API calls
- `window.scrollTo` - Layout scroll behavior
- `requestAnimationFrame` - Animation testing
- `Date.now` - Consistent timing

## Common Test Utilities

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
```

## Notes

- All tests use Jest + React Testing Library
- Setup file (`setup.ts`) runs before all tests
- Mocks are reset before each test via `beforeEach()`
- Tests focus on user-facing behavior over implementation details
- Tests are comprehensive but maintainable (not brittle)
