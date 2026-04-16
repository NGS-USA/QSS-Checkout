import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const ALLOWED_ORIGIN = 'https://qss-checkout.vercel.app';

// ── COMPLIANCE FIX: Server-side price ID allowlist (PCI Req 6.2.4) ────────────
// Only these exact Stripe price IDs may be submitted. Any other ID is rejected
// before Stripe is ever called. Keep in sync with src/stripe-config.ts.
const ALLOWED_PRICE_IDS = new Set([
  'price_1TMSh0GgFLISItFOGwKcmQB0',
  'price_1TMSf6GgFLISItFOagQCQd5j',
  'price_1TMSdPGgFLISItFO33dVhDwu',
  'price_1TMSbKGgFLISItFO94D6jQsT',
  'price_1TMSZzGgFLISItFOmYnpewEP',
  'price_1TMSWQGgFLISItFODtMv7CDz',
]);

function setCORSHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCORSHeaders(res);

  // ── COMPLIANCE FIX: Handle OPTIONS preflight (PCI Req 1.3) ──────────────────
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();

  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? 'unknown';

  try {
    const { price_ids, mode } = req.body;

    // ── COMPLIANCE FIX: Validate price IDs against allowlist (PCI Req 6.2.4) ──
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
      // Hardcoded server-side — never accepted from client (PCI Req 6.2.4)
      success_url: 'https://qss-checkout.vercel.app/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://qss-checkout.vercel.app/checkout',
    });

    // ── COMPLIANCE FIX: Structured audit log (PCI Req 10.2) ───────────────────
    console.info(JSON.stringify({
      event: 'checkout_session_created',
      sessionId: session.id,
      priceIds: price_ids,
      ip,
      timestamp: new Date().toISOString(),
    }));

    res.status(200).json({ url: session.url });

  } catch (error: any) {
    // ── COMPLIANCE FIX: Never leak internal Stripe error details to client ─────
    console.error('[stripe-checkout] Stripe error:', error);
    res.status(500).json({ error: 'Failed to create checkout session. Please try again.' });
  }
}