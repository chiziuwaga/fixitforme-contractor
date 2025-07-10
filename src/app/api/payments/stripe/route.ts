import Stripe from 'stripe';
import { NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase';

// Lazy initialization function
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil', // Use the latest stable version
    typescript: true,
  });
}

function getWebhookSecret() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }
  return process.env.STRIPE_WEBHOOK_SECRET;
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  if (!supabaseAdmin) {
    console.error('supabaseAdmin not available for subscription update');
    return;
  }
  
  const customerId = subscription.customer as string;
  const isScaleTier = subscription.items.data.some(
    (item) => item.price.id === process.env.STRIPE_SCALE_PRICE_ID
  );
  const tier = isScaleTier ? 'scale' : 'growth';

  const { error } = await supabaseAdmin
    .from('contractor_profiles')
    .update({ tier: tier, stripe_customer_id: customerId })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Supabase error updating subscription:', error);
  }
}

async function handleSuccessfulInvoice(invoice: Stripe.Invoice) {
  if (!invoice.customer || !supabaseAdmin) {
    console.log("Invoice doesn't have customer or supabaseAdmin not available, skipping");
    return;
  }

  const { data: profile } = await supabaseAdmin
    .from('contractor_profiles')
    .select('id')
    .eq('stripe_customer_id', invoice.customer as string)
    .single();

  if (!profile) {
    console.error('Could not find contractor profile for successful invoice');
    return;
  }

  const chargeId = (invoice as unknown as Record<string, unknown>).charge as string || null;

  const { error } = await supabaseAdmin.from('transactions').insert({
    contractor_id: profile.id,
    amount: invoice.amount_paid / 100,
    type: 'subscription',
    status: 'succeeded',
    stripe_charge_id: chargeId,
  });

  if (error) {
    console.error('Supabase error creating transaction:', error);
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    const webhookSecret = getWebhookSecret();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`❌ Webhook signature verification failed: ${errorMessage}`);
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  console.log('✅ Stripe Webhook Received:', event.type);

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await handleSubscriptionChange(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.billing_reason === 'subscription_create' || invoice.billing_reason === 'subscription_cycle') {
          await handleSuccessfulInvoice(invoice);
      }
      break;
    case 'invoice.payment_failed':
      console.warn('Invoice payment failed:', (event.data.object as Stripe.Invoice).id);
      break;
    default:
      console.warn(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
