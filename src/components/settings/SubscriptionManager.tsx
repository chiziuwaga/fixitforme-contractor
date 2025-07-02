'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionManagerProps {
  currentTier?: 'growth' | 'scale';
}

export default function SubscriptionManager({ currentTier = 'growth' }: SubscriptionManagerProps) {
  const [loading, setLoading] = useState(false);

  const tiers = [
    {
      name: 'Growth',
      id: 'tier-growth',
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
      id: 'tier-scale',
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

  const handleUpgrade = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tiers.map((tier) => {
          const isCurrentPlan = tier.id === currentTier;
          const isRecommended = tier.isRecommended;
          return (
            <div
              key={tier.id}
              className={cn(
                'relative flex flex-col rounded-2xl border p-8 shadow-sm',
                { 'border-muted': !isRecommended },
                { 'ring-2 ring-accent': isRecommended }
              )}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-accent hover:bg-accent/90">
                    Recommended
                  </Badge>
                </div>
              )}
              <h3 className="text-lg font-semibold leading-7">{tier.name}</h3>
              <p className="mt-4 flex items-baseline gap-x-2">
                <span className="text-4xl font-bold tracking-tight">
                  {tier.price.monthly}
                </span>
                {tier.name === 'Growth' && <span className="text-sm text-muted-foreground">/ successful bid fee</span>}
                {tier.name === 'Scale' && <span className="text-sm text-muted-foreground">/ month</span>}
              </p>
              <p className="mt-6 text-base leading-7 text-muted-foreground">{tier.description}</p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 xl:mt-10">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleUpgrade()}
                disabled={isCurrentPlan || loading}
                className={cn(
                  "mt-8 w-full",
                  isRecommended ? "bg-accent hover:bg-accent/90" : "",
                  isCurrentPlan ? "bg-muted text-muted-foreground cursor-default" : ""
                )}
              >
                {loading && (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                    <span className="ml-2">Processing...</span>
                  </div>
                )}
                {isCurrentPlan ? 'Current Plan' : tier.cta}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  );
}
