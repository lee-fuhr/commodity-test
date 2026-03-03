# Ops Notes

## Debugging History

### 2026-01-07: Site down - "Application error" on production

**Symptoms:**
- Browser showed "Application error: a client-side exception has occurred"
- Console showed CSP errors blocking JS bundles AND 500 errors from /api/analyze

**Root causes (two issues):**
1. CSP was blocking scripts (fixed by adding CSP headers in next.config.js)
2. ANTHROPIC_API_KEY in Vercel had trailing whitespace/newline - caused "Connection error"

**Fix:**
- Added CSP headers to next.config.js (merged PR)
- Fixed API key in Vercel: Settings → Environment Variables → edited ANTHROPIC_API_KEY to remove trailing whitespace
- Redeployed

**Lesson:** When copying API keys into Vercel, watch for trailing spaces/newlines. The error message "Connection error" is misleading - it's actually an auth failure.

---

## Vercel Deployment Notes

- Deployments take ~45 seconds
- After changing environment variables, you MUST redeploy for changes to take effect
- Check Vercel Logs tab to see actual server errors (not just browser console)
- The "Last used" column on Anthropic API keys page helps verify which key is actually being used

### 2026-03-02: vercel.json function path fix

**Issue:**
- `vercel.json` used path `src/app/api/analyze/route.ts` but Next.js app router requires `app/api/analyze/route.ts` (without `src/` prefix)
- This means the `maxDuration: 120` setting was NOT being applied to the analyze function
- The function was running on whatever Vercel's default timeout is for the plan tier
- Additionally, `maxDuration: 120` exceeds hobby plan's 60s cap

**Fix:**
- Changed path from `src/app/api/analyze/route.ts` to `app/api/analyze/route.ts`
- Set `maxDuration: 60` (hobby plan maximum)
- Also fixed stale CSP `connect-src` reference from `*.supabase.co` to `*.upstash.io`
- Fixed URL parsing safety in processing page

**Deploy needed:** Yes - redeploy for vercel.json and next.config.js changes to take effect.

---

## Version Numbers

- `package.json` version and `src/lib/version.ts` VERSION are separate
- Footer displays VERSION from src/lib/version.ts (currently 0.18.21)
- Keep them in sync manually when releasing
