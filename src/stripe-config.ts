export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1TMSh0GgFLISItFOGwKcmQB0',
    name: 'Readiness Build-Out',
    description: 'One firm drives SSP, evidence packaging, mock interview prep.',
    price: 13000.00,
    currency: 'usd',
    mode: 'payment'
  },
  {
    priceId: 'price_1TMSf6GgFLISItFOagQCQd5j',
    name: 'Readiness Build-Out',
    description: 'Needs drafting support, narrative help, and hands-on project leadership.',
    price: 7400.00,
    currency: 'usd',
    mode: 'payment'
  },
  {
    priceId: 'price_1TMSdPGgFLISItFO33dVhDwu',
    name: 'Gap Assessment & Evidence Roadmap',
    description: 'Full requirement-level gaps, prioritized POA&M, evidence roadmap.',
    price: 9000.00,
    currency: 'usd',
    mode: 'payment'
  },
  {
    priceId: 'price_1TMSbKGgFLISItFO94D6jQsT',
    name: 'Guided Readiness',
    description: 'Needs working sessions, evidence cleanup, structured prep before submission.',
    price: 5000.00,
    currency: 'usd',
    mode: 'payment'
  },
  {
    priceId: 'price_1TMSZzGgFLISItFOmYnpewEP',
    name: 'Readiness Review',
    description: 'Existing docs; expert review against all 110 requirements.',
    price: 5000.00,
    currency: 'usd',
    mode: 'payment'
  },
  {
    priceId: 'price_1TMSWQGgFLISItFODtMv7CDz',
    name: 'Pre-Assessment Review',
    description: 'Controls exist; needs disciplined review before self-assessment inputs are finalized.',
    price: 3750.00,
    currency: 'usd',
    mode: 'payment'
  }
];

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price);
}

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}