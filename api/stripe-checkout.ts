import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const ALLOWED_ORIGIN = 'https://qss-checkout.vercel.app';

const ALLOWED_PRICE_IDS = new Set([
  'price_1TMSh0GgFLISItFOGwKcmQB0',
  'price_1TMSf6GgFLISItFOagQCQd5j',
  'price_1TMSdPGgFLISItFO33dVhDwu',
  'price_1TMSbKGgFLISItFO94D6jQsT',
  'price_1TMSZzGgFLISItFOmYnpewEP',
  'price_1TMSWQGgFLISItFODtMv7CDz',
]);

// ── COMPLIANCE FIX: IP-based rate limiter (PCI Req 6.4.1) ────────────────────
// 10 checkout attempts per IP per 60 seconds.
// Upstash Redis persists counts across all serverless function instances,
// which in-memory maps cannot do.
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

  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? 'unknown';

  // ── COMPLIANCE FIX: Enforce rate limit before any processing ─────────────────
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);
  if (!success) {
    console.warn('[stripe-checkout] Rate limit exceeded:', { ip, limit, reset });
    res.setHeader('Retry-After', String(Math.ceil((reset - Date.now()) / 1000)));
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment and try again.',
    });
  }

  try {
    const { price_ids, mode } = req.body;

    if (!Array.isArray(price_ids) || price_ids.length === 0) {
      return res.status(400).json({ error: 'At least one service must be selected.' });
    }

    const invalidIds = price_ids.filter((id: unknown) => !ALLOWED_PRICE_IDS.has(id));
    if (invalidIds.length > 0) {
      console.warn('[stripe-checkout] Blocked invalid price IDs:', { invalidIds, ip });
      return res.status(400).json({ error: 'Invalid selection. Please refresh and try again.' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: mode || 'payment',
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      line_items: price_ids.map((priceId: string) => ({
        price: priceId,
        quantity: 1,
      })),
      success_url: 'https://qss-checkout.vercel.app/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://qss-checkout.vercel.app/checkout',
    });

    console.info(JSON.stringify({
      event: 'checkout_session_created',
      sessionId: session.id,
      priceIds: price_ids,
      ip,
      remaining, // log remaining quota for this IP
      timestamp: new Date().toISOString(),
    }));

    res.status(200).json({ url: session.url });

  } catch (error: any) {
    console.error('[stripe-checkout] Stripe error:', error);
    res.status(500).json({ error: 'Failed to create checkout session. Please try again.' });
  }
}