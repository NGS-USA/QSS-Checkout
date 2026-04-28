// src/services-config.ts

export interface Service {
  id: string;
  name: string;
  description: string;
  category: 'assessment' | 'readiness' | 'review';
}

// Each service maps to one or more Stripe price IDs
export interface Bundle {
  priceIds: string[];
  name: string;
  description: string;
}

export const services: Service[] = [
  {
    id: 'gap-assessment',
    name: 'Gap Assessment & Evidence Roadmap',
    description: 'Identify where you stand against all 110 CMMC requirements. Receive a prioritized plan of action and a clear evidence roadmap.',
    category: 'assessment',
  },
  {
    id: 'pre-assessment-review',
    name: 'Pre-Assessment Review',
    description: 'Your controls are in place — you need a disciplined expert review before self-assessment inputs are finalized.',
    category: 'review',
  },
  {
    id: 'readiness-review',
    name: 'Readiness Review',
    description: 'You have existing documentation. Get an expert review against all 110 CMMC requirements.',
    category: 'review',
  },
  {
    id: 'guided-readiness',
    name: 'Guided Readiness',
    description: 'Working sessions, evidence cleanup, and structured preparation before your assessment submission.',
    category: 'readiness',
  },
  {
    id: 'readiness-buildup-lvl1',
    name: 'Full Readiness Build-Out (Level 1)',
    description: 'For FCI environments needing drafting support, narrative help, and hands-on project leadership.',
    category: 'readiness',
  },
  {
    id: 'readiness-buildup-lvl2',
    name: 'Full Readiness Build-Out (Level 2)',
    description: 'One firm drives your SSP, evidence packaging, and mock interview prep across all 110 requirements.',
    category: 'readiness',
  },
];

// Maps a combination of selected service IDs → the Stripe price IDs to pre-select
// The logic: each service maps directly to one package
export const serviceToPriceId: Record<string, string> = {
  'gap-assessment':         'price_1TMSdPGgFLISItFO33dVhDwu',
  'pre-assessment-review':  'price_1TMSWQGgFLISItFODtMv7CDz',
  'readiness-review':       'price_1TMSZzGgFLISItFOmYnpewEP',
  'guided-readiness':       'price_1TMSbKGgFLISItFO94D6jQsT',
  'readiness-buildup-lvl1': 'price_1TMSf6GgFLISItFOagQCQd5j',
  'readiness-buildup-lvl2': 'price_1TMSh0GgFLISItFOGwKcmQB0',
};

export function getSelectedPriceIds(selectedServiceIds: string[]): string[] {
  return selectedServiceIds
    .map((id) => serviceToPriceId[id])
    .filter(Boolean) as string[];
}