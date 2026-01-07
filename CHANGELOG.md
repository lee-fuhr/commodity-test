# Changelog

## v0.14.1 - CSP fix
- Fixed Content Security Policy blocking JS bundles on production
- Added proper CSP headers in next.config.js allowing self, Plausible, Google Fonts, Supabase

## v0.12.0 - Lead capture + admin tools
- Admin dashboard: Full `/admin` page with password protection, tabbed views, CSV export
- Lead capture: Guide emails now stored in KV for future marketing
- Scan logging: Full URLs + result IDs + IP addresses logged (filter your own tests)
- Email results: "Save this report" lets visitors email themselves the link
- Calculator UX: True inline editing with K suffix visible but not editable, subtle borders on editable fields
- Quotemark: Inside gray box, subtle foreground color decoration
- Version: Select-to-reveal trick (same color as background, inverts on selection)
- Footer: Dynamic copyright year across all pages

## v0.11.0 - Interactive calculator + polish
- Interactive cost calculator: Click any number to customize your deal value, volume, and loss rate
- Quotemark graphic on quote blocks (visual clarity for "found on your site")
- CTA copy: "Hire me to do it for you" + "websites that win deals"

## v0.10.0 - Hardening for soft release
- Rate limiting: 10 req/hr, 50/day per IP via Vercel KV
- Dynamic OG images: `/api/og` generates social previews with company name + score
- Mobile responsive: Proper scaling for scores, calculation boxes, cards, touch targets
- Contact form: Upgraded to Resend + KV storage, honeypot spam protection
- Error messages: User-friendly, conversational, actionable
- Privacy/Terms: Styling consistency
- Version number in footer

## v0.9.0 - Score calibration
- More pessimistic adjectives (61 is now "Moderately", not "Well")
- Industry-aware cost estimates (SaaS = volume play, Construction = big deals)
- Thresholds: 85+ Highly, 70+ Well, 55+ Moderately, 40+ Weakly, <40 Undifferentiated

## v0.8.0 - Robustness
- Error page detection (don't analyze 404s, login walls)
- Better company name extraction (prioritize og:site_name)
- Industrial distribution industry detection
- QA fixes for company name and industry detection

## v0.7.0 - Bell curve scoring
- Complete scoring rewrite with statistical distribution
- Anti-bot scraping (ScrapingBee → Jina fallback chain)
- Results page improvements from feedback

## v0.6.0 - Deduplication
- Fixed duplicate fix detection
- Content similarity checking
- Template deduplication

## v0.5.0 - Phrase library
- Expanded commodity phrases: 60 → 140+
- Dark mode contrast fixes

## v0.4.0 - Initial release
- Core analysis functionality
- 9 industry categories
- Cost estimation
- Share functionality
