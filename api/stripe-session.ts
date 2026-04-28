import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'https://qss-checkout.vercel.app';

function setCORSHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const SERVICE_CATALOG: Record<string, { name: string; description: string; includes: string[]; price: number }> = {
  'price_1TMSWQGgFLISItFODtMv7CDz': {
    name: 'Pre-Assessment Review',
    description: 'Controls exist; needs disciplined review before self-assessment inputs are finalized.',
    includes: [
      'Review of existing policy and procedure documentation',
      'Control-by-control gap identification against CMMC Level 1 practices',
      'Written findings report with prioritized remediation items',
      'One-hour debrief call with your team',
    ],
    price: 7500,
  },
  'price_1TMSbKGgFLISItFO94D6jQsT': {
    name: 'Guided Readiness',
    description: 'Needs working sessions, evidence cleanup, structured prep before submission.',
    includes: [
      'Everything in Pre-Assessment Review',
      'Up to 4 structured working sessions with your team',
      'Evidence organization and labeling guidance',
      'Draft self-assessment narrative support',
      'Final readiness confirmation memo',
    ],
    price: 12500,
  },
  'price_1TMSf6GgFLISItFOagQCQd5j': {
    name: 'Readiness Build-Out (Lvl 1)',
    description: 'Needs drafting support, narrative help, and hands-on project leadership.',
    includes: [
      'Everything in Guided Readiness',
      'Full policy and procedure drafting for missing documentation',
      'Hands-on project management through remediation',
      'Evidence package assembly and review',
      'Mock self-assessment walkthrough before submission',
    ],
    price: 18500,
  },
  'price_1TMSZzGgFLISItFOmYnpewEP': {
    name: 'Readiness Review',
    description: 'Existing docs; expert review against all 110 requirements.',
    includes: [
      'Review of existing documentation against all 110 CMMC Level 2 practices',
      'Requirement-level gap analysis with evidence mapping',
      'Written findings report with risk ratings',
      'One-hour debrief call with your team',
    ],
    price: 12500,
  },
  'price_1TMSdPGgFLISItFO33dVhDwu': {
    name: 'Gap Assessment & Evidence Roadmap',
    description: 'Full requirement-level gaps, prioritized POA&M, evidence roadmap.',
    includes: [
      'Everything in Readiness Review',
      'Prioritized Plan of Action & Milestones (POA&M)',
      'Detailed evidence roadmap per requirement',
      'Up to 3 working sessions to walk through findings',
      'Remediation timeline and resource recommendations',
    ],
    price: 22500,
  },
  'price_1TMSh0GgFLISItFOGwKcmQB0': {
    name: 'Readiness Build-Out (Lvl 2)',
    description: 'One firm drives SSP, evidence packaging, mock interview prep.',
    includes: [
      'Everything in Gap Assessment & Evidence Roadmap',
      'Full System Security Plan (SSP) drafting',
      'End-to-end evidence packaging and organization',
      'Mock C3PAO interview preparation',
      'Hands-on project management through full assessment readiness',
    ],
    price: 32500,
  },
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
    const services = priceIds.map((id) => SERVICE_CATALOG[id] ?? { name: id, description: '', includes: [], price: 0 });
    const kickoffCents = parseInt(session.metadata?.kickoff_amount_cents ?? '0', 10);
    const contractTotal = services.reduce((sum, s) => sum + s.price, 0);

    function getPaymentSchedule(total: number) {
      if (total < 10000) {
        return [
          { label: 'Due at Kickoff (50%)', amount: total * 0.5 },
          { label: 'Due at Final Delivery (50%)', amount: total * 0.5 },
        ];
      } else if (total <= 25000) {
        return [
          { label: 'Due at Kickoff (40%)', amount: total * 0.4 },
          { label: 'Due at Midpoint (40%)', amount: total * 0.4 },
          { label: 'Due at Final Readout (20%)', amount: total * 0.2 },
        ];
      } else {
        return [
          { label: 'Due at Kickoff (40%)', amount: total * 0.4 },
          { label: 'Due at Document Package Delivery (30%)', amount: total * 0.3 },
          { label: 'Due at Final Readiness Review (30%)', amount: total * 0.3 },
        ];
      }
    }

    return res.status(200).json({
      customerName: session.customer_details?.name ?? '',
      customerEmail: session.customer_details?.email ?? '',
      amountPaid: kickoffCents / 100,
      services,
      contractTotal,
      paymentSchedule: getPaymentSchedule(contractTotal),
      sessionId: session.id,
      createdAt: session.created,
    });
  } catch (err: any) {
    console.error('[stripe-session] Error:', err.message);
    return res.status(500).json({ error: 'Could not retrieve session details.' });
  }
}