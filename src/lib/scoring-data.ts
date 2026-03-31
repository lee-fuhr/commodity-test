import type { DetectedIndustry } from './scoring'

// Commodity phrases with weights (higher = worse)
export const commodityPhrases = [
  // Vague quality claims (weight 3-7)
  { phrase: 'quality', weight: 4, category: 'vague-quality' },
  { phrase: 'high quality', weight: 5, category: 'vague-quality' },
  { phrase: 'highest quality', weight: 6, category: 'vague-quality' },
  { phrase: 'premium quality', weight: 5, category: 'vague-quality' },
  { phrase: 'quality products', weight: 5, category: 'vague-quality' },
  { phrase: 'quality service', weight: 5, category: 'vague-quality' },

  // Generic partnership claims (weight 4-7)
  { phrase: 'trusted partner', weight: 6, category: 'partnership' },
  { phrase: 'your partner', weight: 4, category: 'partnership' },
  { phrase: 'partner of choice', weight: 6, category: 'partnership' },
  { phrase: 'strategic partner', weight: 5, category: 'partnership' },

  // Leadership claims without proof (weight 5-8)
  { phrase: 'industry leader', weight: 7, category: 'leadership' },
  { phrase: 'industry leading', weight: 7, category: 'leadership' },
  { phrase: 'market leader', weight: 6, category: 'leadership' },
  { phrase: 'leading provider', weight: 6, category: 'leadership' },
  { phrase: 'leading manufacturer', weight: 6, category: 'leadership' },
  { phrase: 'global leader', weight: 7, category: 'leadership' },

  // Innovation without substance (weight 4-7)
  { phrase: 'innovative', weight: 5, category: 'innovation' },
  { phrase: 'innovative solutions', weight: 7, category: 'innovation' },
  { phrase: 'cutting edge', weight: 6, category: 'innovation' },
  { phrase: 'cutting-edge', weight: 6, category: 'innovation' },
  { phrase: 'state of the art', weight: 6, category: 'innovation' },
  { phrase: 'state-of-the-art', weight: 6, category: 'innovation' },

  // Solutions jargon (weight 3-6)
  { phrase: 'solutions', weight: 3, category: 'jargon' },
  { phrase: 'comprehensive solutions', weight: 5, category: 'jargon' },
  { phrase: 'complete solutions', weight: 5, category: 'jargon' },
  { phrase: 'turnkey solutions', weight: 5, category: 'jargon' },
  { phrase: 'end-to-end', weight: 4, category: 'jargon' },

  // Generic service claims (weight 3-5)
  { phrase: 'customer service', weight: 3, category: 'service' },
  { phrase: 'exceptional service', weight: 5, category: 'service' },
  { phrase: 'excellent service', weight: 5, category: 'service' },
  { phrase: 'customer satisfaction', weight: 4, category: 'service' },
  { phrase: 'dedicated team', weight: 4, category: 'service' },
  { phrase: 'experienced team', weight: 4, category: 'service' },

  // Empty value claims (weight 2-4)
  { phrase: 'value', weight: 2, category: 'value' },
  { phrase: 'best value', weight: 4, category: 'value' },
  { phrase: 'great value', weight: 4, category: 'value' },
  { phrase: 'added value', weight: 4, category: 'value' },
  { phrase: 'value-added', weight: 4, category: 'value' },

  // Experience claims without numbers (weight 3-4)
  { phrase: 'years of experience', weight: 3, category: 'experience' },
  { phrase: 'experienced', weight: 2, category: 'experience' },
  { phrase: 'expertise', weight: 3, category: 'experience' },

  // Trust without proof (weight 3-4)
  { phrase: 'trusted', weight: 3, category: 'trust' },
  { phrase: 'reliable', weight: 3, category: 'trust' },
  { phrase: 'dependable', weight: 3, category: 'trust' },

  // World-class claims (weight 5-7)
  { phrase: 'world class', weight: 6, category: 'hyperbole' },
  { phrase: 'world-class', weight: 6, category: 'hyperbole' },
  { phrase: 'best in class', weight: 6, category: 'hyperbole' },
  { phrase: 'best-in-class', weight: 6, category: 'hyperbole' },
  { phrase: 'unmatched', weight: 5, category: 'hyperbole' },
  { phrase: 'unparalleled', weight: 5, category: 'hyperbole' },

  // Commitment claims (weight 2-4)
  { phrase: 'committed to', weight: 3, category: 'commitment' },
  { phrase: 'dedicated to', weight: 3, category: 'commitment' },
  { phrase: 'focused on', weight: 2, category: 'commitment' },

  // Wide range claims (weight 3-5)
  { phrase: 'wide range', weight: 3, category: 'range' },
  { phrase: 'full range', weight: 3, category: 'range' },
  { phrase: 'one-stop shop', weight: 5, category: 'range' },
  { phrase: 'all your needs', weight: 4, category: 'range' },

  // Digital/tech buzzwords (weight 4-6)
  { phrase: 'digital transformation', weight: 6, category: 'buzzword' },
  { phrase: 'transform your business', weight: 5, category: 'buzzword' },
  { phrase: 'transformative', weight: 4, category: 'buzzword' },
  { phrase: 'next generation', weight: 4, category: 'buzzword' },
  { phrase: 'next-generation', weight: 4, category: 'buzzword' },
  { phrase: 'future-proof', weight: 5, category: 'buzzword' },
  { phrase: 'ai-powered', weight: 4, category: 'buzzword' },
  { phrase: 'ai powered', weight: 4, category: 'buzzword' },
  { phrase: 'powered by ai', weight: 4, category: 'buzzword' },

  // Scale claims (weight 3-5)
  { phrase: 'global scale', weight: 4, category: 'scale' },
  { phrase: 'enterprise-grade', weight: 4, category: 'scale' },
  { phrase: 'scalable', weight: 3, category: 'scale' },

  // Optimization jargon (weight 2-4)
  { phrase: 'optimize', weight: 3, category: 'optimize' },
  { phrase: 'streamline', weight: 3, category: 'optimize' },
  { phrase: 'maximize', weight: 3, category: 'optimize' },
  { phrase: 'improve efficiency', weight: 4, category: 'optimize' },

  // Integration jargon (weight 4-5)
  { phrase: 'ecosystem', weight: 4, category: 'ecosystem' },
  { phrase: 'seamless integration', weight: 5, category: 'ecosystem' },
  { phrase: 'integrated platform', weight: 4, category: 'ecosystem' },

  // Mission statements (weight 2-4)
  { phrase: 'our mission', weight: 3, category: 'mission' },
  { phrase: 'our vision', weight: 3, category: 'mission' },
  { phrase: 'we believe', weight: 2, category: 'mission' },
  { phrase: 'we strive', weight: 3, category: 'mission' },
  { phrase: 'empowering', weight: 3, category: 'mission' },

  // Results without proof (weight 4-5)
  { phrase: 'proven results', weight: 4, category: 'results' },
  { phrase: 'proven track record', weight: 5, category: 'results' },
  { phrase: 'track record', weight: 3, category: 'results' },

  // Custom claims (weight 2-3)
  { phrase: 'customized', weight: 3, category: 'custom' },
  { phrase: 'tailored', weight: 3, category: 'custom' },
  { phrase: 'personalized', weight: 3, category: 'custom' },

  // Business jargon (weight 2-4)
  { phrase: 'leverage', weight: 3, category: 'jargon' },
  { phrase: 'utilize', weight: 2, category: 'jargon' },
  { phrase: 'harness', weight: 3, category: 'jargon' },
  { phrase: 'drive growth', weight: 3, category: 'jargon' },
  { phrase: 'unlock potential', weight: 4, category: 'jargon' },
]

// Industry keywords for detection
export const INDUSTRY_KEYWORDS: Record<DetectedIndustry, string[]> = {
  manufacturing: ['manufacturing', 'manufacturer', 'machining', 'cnc', 'precision', 'fabrication', 'tooling', 'oem', 'supply chain', 'iso 9001', 'assembly', 'production', 'industrial', 'made in usa', 'made in the usa'],
  distribution: ['distributor', 'distribution', 'wholesale', 'mro', 'maintenance repair', 'industrial supplies', 'safety supplies', 'fasteners', 'electrical supplies', 'plumbing supplies', 'hvac supplies', 'ppe', 'safety equipment', 'bulk orders', 'ship same day', 'next day delivery', 'will call', 'local branch', 'stock', 'in stock', 'catalog', 'skus', 'part number', 'sku'],
  saas: ['software', 'saas', 'platform', 'cloud', 'api', 'integration', 'dashboard', 'subscription', 'deploy', 'onboarding', 'workflow', 'automation tool', 'work management', 'project management', 'crm', 'team collaboration', 'collaborate', 'workspace', 'app', 'sign up free', 'free trial', 'get started', 'pricing plans', 'per user', 'per month', 'per seat'],
  agency: ['agency', 'creative agency', 'digital agency', 'marketing agency', 'design agency', 'branding agency', 'web agency', 'advertising agency', 'full-service agency', 'boutique agency', 'our work', 'case studies', 'our clients', 'portfolio', 'we partner', 'brand strategy', 'creative direction', 'campaign', 'client roster', 'studio', 'creative studio', 'design studio'],
  services: ['consulting', 'service provider', 'professional services', 'advisory', 'consulting firm', 'managed services'],
  construction: ['construction', 'contractor', 'builder', 'building', 'jobsite', 'job site', 'renovation', 'commercial construction', 'general contractor', 'subcontractor', 'excavation', 'concrete', 'framing', 'roofing'],
  healthcare: ['healthcare', 'medical', 'patient', 'clinical', 'health', 'hospital', 'provider', 'hipaa', 'physician'],
  finance: ['financial', 'banking', 'investment', 'wealth', 'insurance', 'lending', 'mortgage', 'credit'],
  retail: ['shopping cart', 'add to cart', 'checkout', 'buy now', 'ecommerce', 'e-commerce', 'online store', 'free shipping', 'shop now', 'retail store', 'merchandise'],
  general: []
}

// Strong self-declarations that should override keyword counts in industry detection
export const INDUSTRY_STRONG_DECLARATIONS: Array<{ pattern: RegExp; industry: DetectedIndustry; bonus: number }> = [
  // Explicit agency mentions
  { pattern: /\b(we are|we're|as) an? agency\b/i, industry: 'agency', bonus: 20 },
  { pattern: /\b(digital|creative|marketing|design|branding|web|advertising|full-service) agency\b/i, industry: 'agency', bonus: 15 },
  { pattern: /\bagency (for|serving|helping)\b/i, industry: 'agency', bonus: 15 },
  { pattern: /\b(creative|design|digital) studio\b/i, industry: 'agency', bonus: 12 },

  // Service-based agency patterns (agencies that avoid the word "agency")
  { pattern: /\bteam of.{0,20}(developers?|designers?|engineers?)\b/i, industry: 'agency', bonus: 12 },
  { pattern: /\b(design|development|strategy).{0,10}(design|development|strategy).{0,10}(design|development|strategy)\b/i, industry: 'agency', bonus: 15 },
  { pattern: /\bwe (build|create|design|develop).{0,30}(for|with) (clients?|companies|organizations|teams|brands)\b/i, industry: 'agency', bonus: 15 },
  { pattern: /\bwe partner with.{0,30}(to|and) (build|create|design|develop|solve|craft)\b/i, industry: 'agency', bonus: 12 },
  { pattern: /\b(discover|strategy),?\s*(design|create),?\s*(develop|build|deliver)\b/i, industry: 'agency', bonus: 15 },
  { pattern: /\bfractional (cto|cmo|cdo|designer|developer)\b/i, industry: 'agency', bonus: 12 },
  { pattern: /\b(web|digital|front-?end|ux|ui).{0,10}(design|development).{0,10}(services?|specialists?|experts?|consultants?)\b/i, industry: 'agency', bonus: 10 },
  { pattern: /\bsolve.{0,20}(challenges?|problems?).{0,20}for.{0,20}(clients?|companies|organizations|brands)\b/i, industry: 'agency', bonus: 10 },

  // Studio and boutique patterns
  { pattern: /\b(web|design|development|digital).{0,15}studio\b/i, industry: 'agency', bonus: 12 },
  { pattern: /\bboutique.{0,15}(studio|firm|shop|consultancy)\b/i, industry: 'agency', bonus: 10 },
  { pattern: /\bboutique.{0,15}(web|design|development|digital)\b/i, industry: 'agency', bonus: 10 },

  // Partner patterns for agencies
  { pattern: /\b(web|design|development|digital).{0,10}partner\b/i, industry: 'agency', bonus: 10 },
  { pattern: /\byour.{0,10}(design|development|digital|web).{0,10}partner\b/i, industry: 'agency', bonus: 10 },

  // Custom software for clients (dev shops)
  { pattern: /\b(custom|bespoke).{0,10}(software|applications?|apps?|platforms?).{0,20}for.{0,20}(clients?|companies|firms|businesses)\b/i, industry: 'agency', bonus: 12 },
  { pattern: /\bwe build.{0,20}(websites?|apps?|applications?|platforms?|software)\b/i, industry: 'agency', bonus: 10 },

  // Freelancer/consultant patterns (solo practitioners doing agency-type work)
  { pattern: /\bfreelance.{0,10}(designer|developer|consultant|strategist)\b/i, industry: 'agency', bonus: 12 },
  { pattern: /\bindependent.{0,10}(designer|developer|consultant|strategist)\b/i, industry: 'agency', bonus: 10 },
  { pattern: /\b(available for|open to).{0,10}(hire|projects?|work|freelance)\b/i, industry: 'agency', bonus: 10 },
  { pattern: /\blet'?s?.{0,10}work together\b/i, industry: 'agency', bonus: 8 },
  { pattern: /\b(i work with|working with).{0,15}(clients?|companies|brands|startups)\b/i, industry: 'agency', bonus: 10 },
  { pattern: /\b(ux|ui|product|web|digital).{0,10}(designer|developer|strategist|consultant)\b/i, industry: 'agency', bonus: 8 },

  // Service-language patterns (what agencies DO vs what they ARE)
  { pattern: /\bwe build.{0,20}(websites?|sites|web).{0,15}(for|with)\b/i, industry: 'agency', bonus: 12 },
  { pattern: /\bdesign.{0,5}(and|&).{0,5}(build|development)\b/i, industry: 'agency', bonus: 10 },
  { pattern: /\b(cms|website|web).{0,10}(setup|platforms?).{0,15}(for|with).{0,10}(companies|clients|teams|businesses)\b/i, industry: 'agency', bonus: 10 },
  { pattern: /\bmarketing teams?\b.{0,20}(move|grow|scale)\b/i, industry: 'agency', bonus: 8 },
  { pattern: /\bnext-?generation.{0,10}(websites?|web|digital)\b/i, industry: 'agency', bonus: 8 },
]
