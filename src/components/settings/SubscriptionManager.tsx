'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, TrendingUp, Check } from 'lucide-react';

interface SubscriptionManagerProps {
  currentTier?: 'growth' | 'scale';
}

export default function SubscriptionManager({ currentTier = 'growth' }: SubscriptionManagerProps) {
  const [loading, setLoading] = useState(false);

  const tiers = [
    {
      id: 'growth',
      name: 'Growth',
      price: 'Pay per job',
      fee: '10% platform fee',
      features: [
        'Basic lead access',
        'Standard bidding tools',
        'Email support',
        'Basic analytics'
      ],
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'scale',
      name: 'Scale',
      price: '$250/month',
      fee: '7% platform fee',
      features: [
        'Priority lead access',
        'Advanced AI tools (Alex, Rex)',
        'Priority support',
        'Advanced analytics',
        'Lead generation tools',
        'Market intelligence'
      ],
      icon: Crown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const handleUpgrade = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Subscription Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tiers.map((tier) => {
            const isCurrentTier = tier.id === currentTier;
            const isRecommended = tier.id === 'scale';
            
            return (
              <div
                key={tier.id}
                className={`relative border-2 rounded-lg p-6 ${
                  isCurrentTier 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                } ${isRecommended ? 'ring-2 ring-purple-200' : ''}`}
              >
                {isRecommended && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600">
                    Recommended
                  </Badge>
                )}
                
                {isCurrentTier && (
                  <Badge className="absolute -top-3 right-4 bg-primary">
                    Current Plan
                  </Badge>
                )}

                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${tier.bgColor} mb-4`}>
                  <tier.icon className={`h-6 w-6 ${tier.color}`} />
                </div>

                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-foreground">{tier.price}</p>
                  <p className="text-sm text-muted-foreground">{tier.fee}</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentTier ? (
                  <Button disabled className="w-full">
                    Current Plan
                  </Button>
                ) : tier.id === 'scale' ? (
                  <Button 
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? 'Processing...' : 'Upgrade to Scale'}
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled
                  >
                    Downgrade
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Current Usage */}
        <div className="bg-muted rounded-lg p-4">
          <h4 className="font-medium mb-3">This Month's Usage</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">8</p>
              <p className="text-sm text-muted-foreground">Bids Submitted</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">$245</p>
              <p className="text-sm text-muted-foreground">Platform Fees</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">3</p>
              <p className="text-sm text-muted-foreground">Projects Won</p>
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Billing Information</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Next billing date: February 1, 2024</p>
            <p>Payment method: •••• 4242 (Visa)</p>
          </div>
          <Button variant="outline" size="sm" className="mt-2">
            Update Payment Method
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
