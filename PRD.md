# The Commodity Test - Product Requirements Document

**Last updated:** 2025-12-31
**Version:** 1.0.0
**Status:** Production

---

## Overview

FREE website messaging analyzer. Enter your URL, get your commodity score in 60 seconds. Lead generation tool that funnels to $18K messaging framework service.

Target customers: Manufacturers and contractors at $2M-10M revenue who need to differentiate but don't know they have a messaging problem yet.

---

## User Flow

```
Landing page (/)
  → Enter URL
  → Processing page (/processing?id=X)
    → Quick scan (60 seconds)
  → Results page (/r/[id])
    → Commodity score (big reveal)
    → 3-5 example issues
    → Share results publicly
    → CTA to full $18K service or $400 website audit
```

---

## Pages

### Landing (`/`)
- Hero: "Does your website sound like everyone else?"
- The problem: Generic messaging kills differentiation
- Enter URL + scan button
- FREE - no credit card
- How it works
- Example scores
- FAQ

**Uses shared:**
- None (custom landing page)

**Custom:**
- URLInput component
- ExampleScores showcase

### Processing (`/processing?id=X`)
- Fast scan (60 second target)
- Progress bar
- Simple checklist:
  - Reading homepage
  - Scanning for commodity phrases
  - Calculating your score
- No optional fields (keep it simple for lead gen)

**Uses shared:**
- ✓ ProcessingPage (simplified variant)
- ✓ ProcessingProgress
- ✓ ProcessingChecklist (3 items only)
- ✓ AnimatedCounter (for phrase count)

**Custom:**
- Fast scan optimized flow (homepage only, not full site)

### Results (`/r/[id]`)
- Shareable public URL (no paywall)
- Big commodity score reveal
- Score explanation
- 3-5 example issues from their site
- CTA to:
  - Full website audit ($400)
  - Messaging framework service ($18K)
- Social share buttons
- "Scan another site" CTA

**Uses shared:**
- ✗ AuditLayout (simpler single-page layout, no sidebar)
- ✓ ScoreModal (score breakdown)
- ✓ getCommodityScore* functions

**Custom:**
- SinglePageResults layout (no sidebar nav)
- ShareButtons (LinkedIn, Twitter, copy link)
- SimpleFindingCard (just phrase + issue, no rewrite)
- CTASection (upgrade paths)

### Sample (`/sample`)
- Pre-populated score
- Shows what results look like
- "Test your site" CTA

**Uses shared:**
- Same as results page

**Custom:**
- Hardcoded sample data

### How It Works (`/how-it-works`)
- Explanation page
- What we scan
- How scoring works
- Methodology transparency

**Uses shared:**
- None

**Custom:**
- Marketing content page

### Examples (`/examples`)
- Gallery of real scores
- Industry breakdowns
- "Test yours" CTA

**Uses shared:**
- None

**Custom:**
- Examples gallery

---

## Shared Component Matrix

| Component | Used | Customization |
|-----------|------|---------------|
| ProcessingPage | ✓ | Simplified variant (homepage only, 60 sec target) |
| AuditLayout | ✗ | Using single-page layout instead |
| SidebarNav | ✗ | N/A |
| LockedFindings | ✗ | N/A (no paywall) |
| ScoreModal | ✓ | Using as-is |
| AnimatedCounter | ✓ | For phrase count |
| viewIcons | ✗ | N/A |
| ProcessingProgress | ✓ | Using as-is |
| ProcessingStatus | ✓ | Using as-is |
| ProcessingChecklist | ✓ | 3 items only |
| getCommodityScore* | ✓ | Same scoring system |
| formatHostname | ✓ | Using as-is |

---

## Tool-Specific Components

### Custom Components Needed

1. **SinglePageResults**
   - No sidebar navigation
   - Single scrolling page
   - Big score reveal at top
   - Issues below
   - CTAs throughout

2. **ShareButtons**
   - LinkedIn share
   - Twitter share
   - Copy link
   - Track shares (analytics)

3. **SimpleFindingCard**
   - Shows problematic phrase
   - Issue explanation
   - NO rewrite (that's paid)
   - Location on site

4. **CTASection**
   - Two upgrade paths:
     - $400 website audit (DIY)
     - $18K messaging framework (done-for-you)
   - Clear differentiation

5. **ExampleScores**
   - Gallery of example scores
   - Industry breakdown
   - "Test yours" CTAs

---

## Scoring System

**Uses commodity score (0-100, inverse - lower is better)**

Same as website-audit:
- 0-40: Well differentiated (green)
- 41-60: Needs work (yellow)
- 61-80: Highly generic (orange)
- 81-100: Commodity territory (red)

**Analysis is FAST (60 seconds):**
- Homepage only (not full site)
- Focus on hero, headline, value prop
- Flag top 3-5 commodity phrases
- Quick score calculation

---

## Integration Notes

**Shared library version:** 1.0.0

**Estimated integration:** 6-8 hours
- Integrate ProcessingPage simplified variant: 2h
- Use shared commodity scoring: 1h
- Build ShareButtons component: 2h
- Build CTASection with upgrade paths: 2h
- Testing and cleanup: 2h

**Dependencies:**
- None - simplest tool
- May need ProcessingPage "fast scan" variant added to shared library

---

## API Endpoints

### POST `/api/analyze`
**Input:** `{ url: string }`
**Output:** `{ success: boolean, analysisId: string, error?: string }`

Starts homepage analysis (fast scan).

### GET `/api/analyze?id={id}`
**Output:**
```json
{
  "success": boolean,
  "analysis": {
    "status": "pending|scanning|analyzing|complete|failed",
    "progress": number,
    "message": string,
    "phrasesFound": number
  }
}
```

Polls for analysis progress.

### GET `/api/results/[id]` or `/r/[id]`
**Output:** Public results (shareable)

Returns commodity score + example issues.

---

## Lead Generation Strategy

**Goal:** Generate leads for $18K messaging framework service

**Funnel:**
1. FREE commodity test (awareness)
2. See their score (problem recognition)
3. Two upgrade paths:
   - DIY: $400 website audit
   - DFY: $18K messaging framework

**No paywall** - results are public and shareable
- Builds trust through transparency
- Viral potential (people share bad scores)
- Low friction entry point

**Email capture:**
- Optional: "Email me my results"
- NOT required to see results
- Used for follow-up nurture

---

## Changelog

### 1.0.0 (2025-12-31)
- Initial PRD documenting integration with shared component library
- Defined single-page results layout (no sidebar)
- Established fast scan strategy (homepage only, 60 sec)
- Documented lead gen funnel to $18K service
