import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { tier, contractor_id } = await request.json();
    
    if (tier !== 'scale') {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Create or retrieve Stripe customer
    const supabase = createClient();
    
    const { data: contractor, error } = await supabase
      .from('contractor_profiles')
      .select('stripe_customer_id, email, business_name')
      .eq('id', contractor_id)
      .single();

    if (error || !contractor) {
      return NextResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }

    let customerId = contractor.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: contractor.email,
        name: contractor.business_name,
        metadata: {
          contractor_id: contractor_id,
        },
      });

      customerId = customer.id;

      // Update contractor with Stripe customer ID
      await supabase
        .from('contractor_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', contractor_id);
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'FixItForMe Scale Tier',
              description: 'Professional contractor platform with advanced features',
            },
            unit_amount: 25000, // $250 in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        contractor_id: contractor_id,
        tier: 'scale',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/contractor/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/contractor/settings?canceled=true`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
