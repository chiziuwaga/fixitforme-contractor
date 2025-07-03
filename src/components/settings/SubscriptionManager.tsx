'use client';

import { useSubscription, type SubscriptionTier } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// This is the new, re-skinned SubscriptionManager component.
// It is now a purely presentational component.
// All logic has been moved to the `useSubscription` hook.

interface SubscriptionManagerProps {
  currentTier?: SubscriptionTier;
}

export default function SubscriptionManager({ currentTier = 'growth' }: SubscriptionManagerProps) {
  const {
    tiers,
    loading,
    handleUpgrade,
    handleDowngrade,
    isCurrentPlan
  } = useSubscription(currentTier);

  const handleTierAction = (tierId: string) => {
    if (tierId === 'scale' && currentTier === 'growth') {
      handleUpgrade('scale');
    } else if (tierId === 'growth' && currentTier === 'scale') {
      handleDowngrade('growth');
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tiers.map((tier) => {
          const isCurrentTierPlan = isCurrentPlan(tier.id);
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
                onClick={() => handleTierAction(tier.id)}
                disabled={isCurrentTierPlan || loading}
                className={cn(
                  "mt-8 w-full",
                  isRecommended ? "bg-accent hover:bg-accent/90" : "",
                  isCurrentTierPlan ? "bg-muted text-muted-foreground cursor-default" : ""
                )}
              >
                {loading && (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                    <span className="ml-2">Processing...</span>
                  </div>
                )}
                {!loading && (isCurrentTierPlan ? 'Current Plan' : tier.cta)}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
