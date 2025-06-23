import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getURL } from '@/lib/helpers';
import { supabaseAdmin } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { price, quantity = 1, metadata = {}, user_id } = req.body;

    try {
        const { data: profile, error } = await supabaseAdmin
            .from('contractor_profiles')
            .select('stripe_customer_id')
            .eq('user_id', user_id)
            .single();

        if (error || !profile) {
            throw new Error('Could not find or verify contractor profile.');
        }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        customer: profile.stripe_customer_id || undefined,
        line_items: [
          {
            price: price.id,
            quantity,
          },
        ],
        mode: 'subscription',
        success_url: `${getURL()}contractor/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${getURL()}contractor/settings`,
        metadata
      });

      res.status(200).json({ sessionId: session.id });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(err);
        res.status(500).json({ error: { statusCode: 500, message: errorMessage } });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
