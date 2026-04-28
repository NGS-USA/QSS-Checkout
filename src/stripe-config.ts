// v2
export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
  includes: string[];
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1TMSWQGgFLISItFODtMv7CDz',
    name: 'Pre-Assessment Review',
    description: 'Controls exist; needs disciplined review before self-assessment inputs are finalized.',
    price: 7500.00,
    currency: 'usd',
    mode: 'payment',
    includes: [
      'Review of existing policy and procedure documentation',
      'Control-by-control gap identification against CMMC Level 1 practices',
      'Written findings report with prioritized remediation items',
      'One-hour debrief call with your team',
    ]
  },
  {
    priceId: 'price_1TMSbKGgFLISItFO94D6jQsT',
    name: 'Guided Readiness',
    description: 'Needs working sessions, evidence cleanup, structured prep before submission.',
    price: 12500.00,
    currency: 'usd',
    mode: 'payment',
    includes: [
      'Everything in Pre-Assessment Review',
      'Up to 4 structured working sessions with your team',
      'Evidence organization and labeling guidance',
      'Draft self-assessment narrative support',
      'Final readiness confirmation memo',
    ]
  },
  {
    priceId: 'price_1TMSf6GgFLISItFOagQCQd5j',
    name: 'Readiness Build-Out (Lvl 1)',
    description: 'Needs drafting support, narrative help, and hands-on project leadership.',
    price: 18500.00,
    currency: 'usd',
    mode: 'payment',
    includes: [
      'Everything in Guided Readiness',
      'Full policy and procedure drafting for missing documentation',
      'Hands-on project management through remediation',
      'Evidence package assembly and review',
      'Mock self-assessment walkthrough before submission',
    ]
  },
  {
    priceId: 'price_1TMSZzGgFLISItFOmYnpewEP',
    name: 'Readiness Review',
    description: 'Existing docs; expert review against all 110 requirements.',
    price: 12500.00,
    currency: 'usd',
    mode: 'payment',
    includes: [
      'Review of existing documentation against all 110 CMMC Level 2 practices',
      'Requirement-level gap analysis with evidence mapping',
      'Written findings report with risk ratings',
      'One-hour debrief call with your team',
    ]
  },
  {
    priceId: 'price_1TMSdPGgFLISItFO33dVhDwu',
    name: 'Gap Assessment & Evidence Roadmap',
    description: 'Full requirement-level gaps, prioritized POA&M, evidence roadmap.',
    price: 22500.00,
    currency: 'usd',
    mode: 'payment',
    includes: [
      'Everything in Readiness Review',
      'Prioritized Plan of Action & Milestones (POA&M)',
      'Detailed evidence roadmap per requirement',
      'Up to 3 working sessions to walk through findings',
      'Remediation timeline and resource recommendations',
    ]
  },
  {
    priceId: 'price_1TMSh0GgFLISItFOGwKcmQB0',
    name: 'Readiness Build-Out (Lvl 2)',
    description: 'One firm drives SSP, evidence packaging, mock interview prep.',
    price: 32500.00,
    currency: 'usd',
    mode: 'payment',
    includes: [
      'Everything in Gap Assessment & Evidence Roadmap',
      'Full System Security Plan (SSP) drafting',
      'End-to-end evidence packaging and organization',
      'Mock C3PAO interview preparation',
      'Hands-on project management through full assessment readiness',
    ]
  },
];

export interface PaymentSchedule {
  label: string;
  percent: number;
  amount: number;
}

export function getPaymentSchedule(total: number): PaymentSchedule[] {
  if (total < 10000) {
    return [
      { label: 'Due at Kickoff (50%)', percent: 50, amount: total * 0.5 },
      { label: 'Due at Final Delivery (50%)', percent: 50, amount: total * 0.5 },
    ];
  } else if (total <= 25000) {
    return [
      { label: 'Due at Kickoff (40%)', percent: 40, amount: total * 0.4 },
      { label: 'Due at Midpoint (40%)', percent: 40, amount: total * 0.4 },
      { label: 'Due at Final Readout (20%)', percent: 20, amount: total * 0.2 },
    ];
  } else {
    return [
      { label: 'Due at Kickoff (40%)', percent: 40, amount: total * 0.4 },
      { label: 'Due at Document Package Delivery (30%)', percent: 30, amount: total * 0.3 },
      { label: 'Due at Final Readiness Review (30%)', percent: 30, amount: total * 0.3 },
    ];
  }
}

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price);
}

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}
