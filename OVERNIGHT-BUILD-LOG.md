# Commodity Test App - Overnight Build Log

**Date:** 2026-01-04
**Goal:** Fix 40% WAF blockage + Fix scoring to bell curve centered at 50

---

## Problems Being Fixed

### Problem 1: 40% of sites blocked by WAF/bot protection
**Root cause:** Basic `fetch` with simple user-agent gets blocked by Cloudflare, etc.
**Solution:** Multi-strategy scraper with fallback chain:
1. Direct fetch with browser-like headers (fastest)
2. ScrapingBee API (handles JS rendering, anti-bot, proxies)
3. Jina Reader API (free fallback, good for content extraction)

### Problem 2: Score 100 too common
**Root cause:** Scoring starts at 100 and subtracts for commodity phrases. If scraping fails or no phrases detected, score = 100 (backwards!)
**Solution:** Bell curve centered at 50:
- Base score = 50 (average B2B manufacturer)
- Subtract for commodity phrases (penalty)
- ADD for differentiation signals (bonus)
- Score 100 requires extraordinary proof (nearly impossible)

### Problem 3: No differentiation signal detection
**Root cause:** Only detecting BAD phrases, not GOOD signals
**Solution:** Added differentiation signal patterns:
- Specific stats (years, client counts, percentages)
- Proof points (awards, certifications, patents)
- Unique claims ("first to", "only company")
- Technical specifics (tolerances, specs)

---

## Files Created/Modified

### New Files

#### `/src/lib/scraper.ts`
Multi-strategy scraper with:
- `scrapeUrl(url)` - Main function with fallback chain
- `extractContent(html, url)` - Content extraction with quality assessment
- Content quality levels: 'excellent' | 'good' | 'minimal' | 'failed'
- SSRF protection (blocks private IPs)
- User-agent rotation
- Browser-like headers

#### `/src/lib/scoring.ts`
New scoring algorithm with:
- `detectCommodityPhrases(text)` - Find commodity language
- `detectDifferentiationSignals(text)` - Find proof points
- `calculateScore(phrases, signals, contentQuality)` - Bell curve scoring
- `generateDiagnosis(score, commodityCount, diffCount)` - Human-readable diagnosis
- `calculateCostEstimate(score)` - Business impact estimate

### To Be Modified

#### `/src/app/api/analyze/route.ts`
- Replace `fetchHomepage` with new scraper
- Replace `calculateCommodityScore` with new scoring
- Add differentiation signal detection
- Return error (not fake score) when scraping fails

---

## Environment Variables Required

```bash
# ScrapingBee (optional but recommended for anti-bot bypass)
SCRAPINGBEE_API_KEY=your_key_here

# Jina Reader (optional, has free tier)
JINA_API_KEY=your_key_here

# Required (already configured)
ANTHROPIC_API_KEY=existing_key
KV_REST_API_URL=existing_url
KV_REST_API_TOKEN=existing_token
```

---

## Scoring Distribution (Target)

| Score Range | Description | % of Sites |
|-------------|-------------|------------|
| 0-30 | Heavily commoditized | ~15% |
| 30-50 | Below average | ~35% |
| 50-70 | Above average | ~35% |
| 70-85 | Well differentiated | ~12% |
| 85-95 | Excellent | ~2.5% |
| 96-100 | Exceptional | ~0.5% |

Score of 100 requires:
- Zero commodity phrases
- 7+ differentiation signals
- At least one "unique" signal (first to, only company)
- Nearly impossible to achieve

---

## Testing Plan

After implementation complete:
1. Deploy to Vercel with env vars
2. Test 20 sites manually for WAF bypass
3. Run 20-agent QA swarm
4. Iterate 5x based on findings

---

## Progress

- [x] Create scraper.ts with multi-strategy fetching
- [x] Create scoring.ts with bell curve algorithm
- [x] Update route.ts to use new modules
- [x] Test locally - build passes
- [x] Deploy to Vercel - https://commodity-test-app.vercel.app
- [ ] **Configure ScrapingBee API key** (see instructions above)
- [x] Run QA swarm iteration 1
- [x] Fix issues from iteration 1 (minimal content penalty)
- [x] Run QA swarm iteration 2
- [x] Fix issues from iteration 2 (differentiation signal regex broadened)
- [ ] Run QA swarm iteration 3
- [ ] Fix issues from iteration 3
- [ ] Run QA swarm iteration 4
- [ ] Fix issues from iteration 4
- [ ] Run QA swarm iteration 5
- [ ] Final verification

---

## Initial Test Results (2026-01-04)

### Scoring Fix Verified ✅
| Site | Old Score | New Score | Content Quality |
|------|-----------|-----------|-----------------|
| McMaster | 100 | 45 | minimal |
| Bobcat | 100 | 47 | good |

Bell curve is working - scores near median instead of defaulting to 100.

### Bot Protection Still Blocking ⚠️
| Site | Issue | Needs |
|------|-------|-------|
| Caterpillar | HTTP 403 | ScrapingBee |
| Deere | Insufficient content | ScrapingBee (JS rendering) |

**ACTION NEEDED:** Add `SCRAPINGBEE_API_KEY` to Vercel environment variables.

### How to get ScrapingBee API key

1. **Sign up:** Go to https://www.scrapingbee.com/ and create account
2. **Free tier:** 1,000 API credits/month - enough for testing
3. **Get key:** Dashboard → API Key (copy it)
4. **Add to Vercel:**
   - Go to https://vercel.com/lee-fuhrs-projects/commodity-test/settings/environment-variables
   - Click "Add"
   - Name: `SCRAPINGBEE_API_KEY`
   - Value: (paste your key)
   - Environment: Production (and Preview if you want)
   - Click Save
5. **Redeploy:** Run `vercel --prod` or push a commit to trigger new deploy

**Cost:** Free tier is 1,000 credits/month. Each scrape = 1-25 credits depending on JS rendering + proxy needs. Should be plenty for initial testing.

---

## QA Iteration 1 Results (2026-01-04)

20-agent QA swarm identified critical issues:
1. **Scores clustering at 85-100** - Many sites with minimal content got score 100
2. **Template duplicate fixes** - Same "whyBad" text across different sites
3. **Static diagnosis** - All sites got "highly differentiated" even with commodity language

### Root Cause
When content quality was "minimal" and no phrases were detected, the system assumed "differentiated" instead of "insufficient data".

### Fixes Applied
1. When `contentQuality === 'minimal' && phrases === 0` → baseScore = 45 (not 50+bonus)
2. Differentiation bonus capped at 15 for minimal content (was 40)
3. Diagnosis now honestly says "We extracted limited content..."

### QA Iteration 2 Fix Verified ✅
| Site | Content Quality | Score | Detected Phrases | Result |
|------|-----------------|-------|------------------|--------|
| McMaster | minimal | 45 | 0 | Honest "limited content" diagnosis |
| 3M | excellent | 34 | 6 | "Below average" - detects "state-of-the-art", "innovative", "unparalleled" |

**Bell curve now working correctly.**

---

## Rollback Plan

If things go wrong, revert to commit before these changes. The original route.ts is intact until we replace it.
