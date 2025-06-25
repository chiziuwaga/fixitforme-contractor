'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button, Card, Text, Badge, Loader } from '@mantine/core';
import { useUser } from '@/providers/UserProvider';
import { supabase } from '@/lib/supabase';

// Make sure to add your Stripe publishable key to your .env.local file
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const plans = {
  growth: {
    name: 'Growth Tier',
    price: 'Free',
    features: ['6% Platform Fee', '10 Bids / Month', 'Limited Agent Access'],
  },
  scale: {
    name: 'Scale Tier',
    price: '$250/month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID, // Add this to your .env.local
    features: ['4% Platform Fee', '50 Bids / Month', 'Full Agent Access'],
  },
};

export default function SubscriptionManager() {
  const [loading, setLoading] = useState(true);
  const [currentTier, setCurrentTier] = useState('growth');
  const { user } = useUser();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('contractor_profiles')
          .select('tier')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setCurrentTier(data.tier);
        }
        if (error) {
            console.error("Error fetching profile tier", error);
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleCheckout = async () => {
    if (!user || !plans.scale.priceId) return;
    setLoading(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: { id: plans.scale.priceId },
          user_id: user.id,
        }),
      });

      const { sessionId, error } = await response.json();
      if(error) {
        console.error(error.message);
        return;
      }

      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }

    setLoading(false);
  };

  if (loading && !user) {
    return <Loader />;
  }

  return (
    <Card withBorder radius="md" p="xl">
        <Badge size="lg">Current Plan: {plans[currentTier as keyof typeof plans].name}</Badge>
        <Text fz="lg" fw={500} mt="md">
            {plans[currentTier as keyof typeof plans].name}
        </Text>
        <Text fz="sm" c="dimmed" mt="sm">
            {plans[currentTier as keyof typeof plans].price}
        </Text>

        {currentTier === 'growth' && (
            <Button onClick={handleCheckout} fullWidth mt="xl" loading={loading}>
                Upgrade to Scale Tier
            </Button>
        )}

        {currentTier === 'scale' && (
            <Text mt="xl" c="teal" fw={500}>You are on the top tier!</Text>
        )}
    </Card>
  );
}
