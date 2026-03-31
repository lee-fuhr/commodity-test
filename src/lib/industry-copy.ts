import type { DetectedIndustry } from './scoring'

export const INDUSTRY_COPY: Record<DetectedIndustry, { verticalNoun: string; verticalPlural: string; dealContext: string }> = {
  manufacturing: { verticalNoun: 'manufacturer', verticalPlural: 'manufacturers', dealContext: '$2M–$10M manufacturers' },
  distribution: { verticalNoun: 'distributor', verticalPlural: 'distributors', dealContext: 'industrial distributors' },
  saas: { verticalNoun: 'software company', verticalPlural: 'software companies', dealContext: 'B2B SaaS companies' },
  agency: { verticalNoun: 'agency', verticalPlural: 'agencies', dealContext: 'creative and digital agencies' },
  services: { verticalNoun: 'service business', verticalPlural: 'service businesses', dealContext: 'professional service firms' },
  construction: { verticalNoun: 'contractor', verticalPlural: 'contractors', dealContext: 'commercial contractors' },
  healthcare: { verticalNoun: 'healthcare provider', verticalPlural: 'healthcare providers', dealContext: 'healthcare organizations' },
  finance: { verticalNoun: 'financial firm', verticalPlural: 'financial firms', dealContext: 'financial services companies' },
  retail: { verticalNoun: 'retailer', verticalPlural: 'retailers', dealContext: 'retail brands' },
  general: { verticalNoun: 'business', verticalPlural: 'businesses', dealContext: 'B2B companies' }
}

export function getIndustryCopy(industry: DetectedIndustry): { verticalNoun: string; verticalPlural: string; dealContext: string } {
  return INDUSTRY_COPY[industry]
}
