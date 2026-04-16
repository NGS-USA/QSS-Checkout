import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // CORS — restrict to your domain only
  res.setHeader('Access-Control-Allow-Origin', 'https://qss-checkout.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { price_ids, kickoff_amount, mode } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: mode || 'payment',

      // Collect name, company, email, phone
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },

      line_items: price_ids.map((priceId: string) => ({
        price: priceId,
        quantity: 1,
      })),

      // Hardcoded server-side — never accepted from client
      success_url: 'https://qss-checkout.vercel.app/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://qss-checkout.vercel.app/checkout',
    });

    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}