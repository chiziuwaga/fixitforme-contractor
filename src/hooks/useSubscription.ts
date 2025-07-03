'use client';

import { useState } from 'react';

export type SubscriptionTier = 'growth' | 'scale';

export interface TierInfo {
  name: string;
  id: string;
  href: string;
  price: { monthly: string; annually: string };
  description: string;
  features: string[];
  isRecommended: boolean;
  cta: string;
  color: string;
  bgColor: string;
}

export const useSubscription = (currentTier: SubscriptionTier = 'growth') => {
  const [loading, setLoading] = useState(false);

  const tiers: TierInfo[] = [
    {
      name: 'Growth',
      id: 'growth',
      href: '#',
      price: { monthly: '10%', annually: '10%' },
      description: 'For contractors starting out, with essential tools to win bids.',
      features: [
        'Access to all leads',
        'Standard bidding tools',
        'Basic performance analytics',
        'Email support',
      ],
      isRecommended: false,
      cta: 'Downgrade to Growth',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      name: 'Scale',
      id: 'scale',
      href: '#',
      price: { monthly: '$250', annually: '$2400' },
      description: 'For established contractors aiming to scale their business.',
      features: [
        'Priority access to high-value leads',
        'Alex AI bidding assistant',
        'Advanced market & performance analytics',
        'Dedicated phone and chat support',
        'Automated follow-ups',
      ],
      isRecommended: true,
      cta: 'Upgrade to Scale',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
  ];

  const handleUpgrade = async (targetTier: SubscriptionTier) => {
    setLoading(true);
    try {
      // In real app, this would call Stripe API to handle subscription changes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Would update user's subscription tier in Supabase
      console.log(`Upgrading to ${targetTier} tier`);
      
    } catch (error) {
      console.error('Subscription update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async (targetTier: SubscriptionTier) => {
    setLoading(true);
    try {
      // In real app, this would call Stripe API to handle subscription changes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Would update user's subscription tier in Supabase
      console.log(`Downgrading to ${targetTier} tier`);
      
    } catch (error) {
      console.error('Subscription update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentPlan = (tierId: string) => {
    return tierId === currentTier;
  };

  const getCurrentTierInfo = () => {
    return tiers.find(tier => tier.id === currentTier);
  };

  return {
    tiers,
    loading,
    currentTier,
    handleUpgrade,
    handleDowngrade,
    isCurrentPlan,
    getCurrentTierInfo
  };
};
