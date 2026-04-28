import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'https://qss-checkout.vercel.app';

function setCORSHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const SERVICE_NAMES: Record<string, string> = {
  'price_1TMSh0GgFLISItFOGwKcmQB0': 'Readiness Build-Out (Level 2)',
  'price_1TMSf6GgFLISItFOagQCQd5j': 'Readiness Build-Out (Level 1)',
  'price_1TMSdPGgFLISItFO33dVhDwu': 'Gap Assessment & Evidence Roadmap',
  'price_1TMSbKGgFLISItFO94D6jQsT': 'Guided Readiness',
  'price_1TMSZzGgFLISItFOmYnpewEP': 'Readiness Review',
  'price_1TMSWQGgFLISItFODtMv7CDz': 'Pre-Assessment Review',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCORSHeaders(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).end();

  const { session_id } = req.query;

  if (!session_id || typeof session_id !== 'string' || !session_id.startsWith('cs_')) {
    return res.status(400).json({ error: 'Invalid session ID.' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const priceIds = (session.metadata?.price_ids ?? '').split(',').filter(Boolean);
    const services = priceIds.map((id) => SERVICE_NAMES[id] ?? id);
    const kickoffCents = parseInt(session.metadata?.kickoff_amount_cents ?? '0', 10);

    return res.status(200).json({
      customerName: session.customer_details?.name ?? '',
      customerEmail: session.customer_details?.email ?? '',
      amountPaid: kickoffCents / 100,
      services,
      sessionId: session.id,
      createdAt: session.created,
    });
  } catch (err: any) {
    console.error('[stripe-session] Error:', err.message);
    return res.status(500).json({ error: 'Could not retrieve session details.' });
  }
}