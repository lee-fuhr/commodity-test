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
- [ ] Update route.ts to use new modules
- [ ] Test locally
- [ ] Deploy to Vercel
- [ ] Configure ScrapingBee API key
- [ ] Run QA swarm iteration 1
- [ ] Fix issues from iteration 1
- [ ] Run QA swarm iteration 2
- [ ] Fix issues from iteration 2
- [ ] Run QA swarm iteration 3
- [ ] Fix issues from iteration 3
- [ ] Run QA swarm iteration 4
- [ ] Fix issues from iteration 4
- [ ] Run QA swarm iteration 5
- [ ] Final verification

---

## Rollback Plan

If things go wrong, revert to commit before these changes. The original route.ts is intact until we replace it.
