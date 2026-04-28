import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'https://qss-checkout.vercel.app';

const ALLOWED_PRICE_IDS = new Set([
  'price_1TMSh0GgFLISItFOGwKcmQB0',
  'price_1TMSf6GgFLISItFOagQCQd5j',
  'price_1TMSdPGgFLISItFO33dVhDwu',
  'price_1TMSbKGgFLISItFO94D6jQsT',
  'price_1TMSZzGgFLISItFOmYnpewEP',
  'price_1TMSWQGgFLISItFODtMv7CDz',
]);

// ── Rate limiter ──────────────────────────────────────────────────────────────
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  prefix: 'rl:checkout',
});

function setCORSHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
  if (!ip) return res.status(400).json({ error: 'Unable to determine request origin.' });

  const { success, reset } = await ratelimit.limit(ip);
  if (!success) {
    console.warn('[stripe-checkout] Rate limit exceeded:', { ip });
    res.setHeader('Retry-After', String(Math.ceil((reset - Date.now()) / 1000)));
    return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
  }

  try {
    const { price_ids, kickoff_amount } = req.body;

    // ── Validate price IDs ────────────────────────────────────────────────────
    if (!Array.isArray(price_ids) || price_ids.length === 0) {
      return res.status(400).json({ error: 'At least one service must be selected.' });
    }

    const invalidIds = price_ids.filter((id: string) => !ALLOWED_PRICE_IDS.has(id));
    if (invalidIds.length > 0) {
      console.warn('[stripe-checkout] Blocked invalid price IDs:', { invalidIds, ip });
      return res.status(400).json({ error: 'Invalid selection. Please refresh and try again.' });
    }

    // kickoff_amount arrives in cents (already multiplied by 100 in CheckoutPage).
    // We validate it is a positive integer before passing to Stripe.
    if (!Number.isInteger(kickoff_amount) || kickoff_amount < 100) {
      return res.status(400).json({ error: 'Invalid kickoff amount.' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },


      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: kickoff_amount, // in cents, validated above
            product_data: {
              name: 'Project Kickoff Payment',
              description: `Kickoff installment for: ${price_ids.map((id: string) => {
                const names: Record<string, string> = {
                  'price_1TMSh0GgFLISItFOGwKcmQB0': 'Readiness Build-Out',
                  'price_1TMSf6GgFLISItFOagQCQd5j': 'Readiness Build-Out',
                  'price_1TMSdPGgFLISItFO33dVhDwu': 'Gap Assessment & Evidence Roadmap',
                  'price_1TMSbKGgFLISItFO94D6jQsT': 'Guided Readiness',
                  'price_1TMSZzGgFLISItFOmYnpewEP': 'Readiness Review',
                  'price_1TMSWQGgFLISItFODtMv7CDz': 'Pre-Assessment Review',
                };
                return names[id] ?? id;
              }).join(', ')}. Remaining milestones will be invoiced separately.`,
            },
          },
        },
      ],

      // Hardcoded server-side — never from client (PCI Req 6.2.4)
      success_url: 'https://qss-checkout.vercel.app/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://qss-checkout.vercel.app/checkout',

      // Store which services were purchased for onboarding/CRM use
      metadata: {
        price_ids: price_ids.join(','),
        kickoff_amount_cents: String(kickoff_amount),
      },
    });

    // ── Structured audit log (PCI Req 10.2) ───────────────────────────────────
    console.info(JSON.stringify({
      event: 'checkout_session_created',
      sessionId: session.id,
      priceIds: price_ids,
      kickoffAmountCents: kickoff_amount,
      ip,
      timestamp: new Date().toISOString(),
    }));

    res.status(200).json({ url: session.url });

  } catch (error: any) {
    console.error('[stripe-checkout] Stripe error:', error);
    res.status(500).json({ error: 'Failed to create checkout session. Please try again.' });
  }
}