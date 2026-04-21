export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1TMSZzGgFLISItFOmYnpewEP',
    name: 'Readiness Review',
    description: 'Existing docs; expert review against all 110 requirements.',
    price: 12500.00,
    currency: 'usd',
    mode: 'payment'
  },
  {
    priceId: 'price_1TMSdPGgFLISItFO33dVhDwu',
    name: 'Gap Assessment & Evidence Roadmap',
    description: 'Full requirement-level gaps, prioritized POA&M, evidence roadmap.',
    price: 22500.00,
    currency: 'usd',
    mode: 'payment'
  },
  {
    priceId: 'price_1TMSh0GgFLISItFOGwKcmQB0',
    name: 'Readiness Build-Out (Lvl 2)',
    description: 'One firm drives SSP, evidence packaging, mock interview prep.',
    price: 32500.00,
    currency: 'usd',
    mode: 'payment'
  },
  {
    priceId: 'price_1TMSWQGgFLISItFODtMv7CDz',
    name: 'Pre-Assessment Review',
    description: 'Controls exist; needs disciplined review before self-assessment inputs are finalized.',
    price: 7500.00,
    currency: 'usd',
    mode: 'payment'
  },
  {
    priceId: 'price_1TMSbKGgFLISItFO94D6jQsT',
    name: 'Guided Readiness',
    description: 'Needs working sessions, evidence cleanup, structured prep before submission.',
    price: 12500.00,
    currency: 'usd',
    mode: 'payment'
  },
  {
    priceId: 'price_1TMSf6GgFLISItFOagQCQd5j',
    name: 'Readiness Build-Out (Lvl 1)',
    description: 'Needs drafting support, narrative help, and hands-on project leadership.',
    price: 18500.00,
    currency: 'usd',
    mode: 'payment'
  },
];
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