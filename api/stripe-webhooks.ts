import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const signature = req.headers['stripe-signature'];
  if (!signature) {
    console.warn('[stripe-webhook] Missing stripe-signature header');
    return res.status(400).json({ error: 'Missing signature' });
  }

  let rawBody: Buffer;
  try {
    rawBody = await getRawBody(req);
  } catch (err) {
    console.error('[stripe-webhook] Failed to read request body:', err);
    return res.status(400).json({ error: 'Failed to read request body' });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.warn('[stripe-webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  console.info(JSON.stringify({
    event: event.type,
    eventId: event.id,
    timestamp: new Date().toISOString(),
  }));

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== 'paid') {
      console.info('[stripe-webhook] Session not yet paid, skipping:', session.id);
      return res.status(200).json({ received: true });
    }

    const priceIds = session.metadata?.price_ids ?? 'unknown';
    const kickoffCents = session.metadata?.kickoff_amount_cents ?? 'unknown';
    const customerEmail = session.customer_details?.email ?? 'unknown';
    const customerName = session.customer_details?.name ?? 'unknown';
    const customerPhone = session.customer_details?.phone ?? 'unknown';

    console.info(JSON.stringify({
      event: 'payment_confirmed',
      sessionId: session.id,
      paymentIntentId: session.payment_intent,
      customerEmail,
      customerName,
      customerPhone,
      priceIds,
      kickoffAmountCents: kickoffCents,
      amountTotal: session.amount_total,
      currency: session.currency,
      timestamp: new Date().toISOString(),
    }));

  }

  return res.status(200).json({ received: true });
}