"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { useSubscription } from "@/hooks/useSubscription"
import { 
  CreditCard, 
  Crown, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  TrendingUp,
  Users,
  MessageSquare
} from "lucide-react"
import { TYPOGRAPHY, SPACING } from "@/lib/design-system"
import { cn } from "@/lib/utils"

export default function SubscriptionManager() {
  const { 
    subscription, 
    loading, 
    fetchingSubscription,
    handleUpgrade, 
    handleManageSubscription,
    TIER_CONFIGURATIONS
  } = useSubscription()
  
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgradeClick = async () => {
    setIsUpgrading(true)
    try {
      await handleUpgrade()
      toast.success("Redirecting to payment...")
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error("Failed to upgrade subscription")
    } finally {
      setIsUpgrading(false)
    }
  }

  if (loading || fetchingSubscription) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading subscription...</span>
        </CardContent>
      </Card>
    )
  }

  const isGrowthTier = subscription?.plan === "growth"
  const isScaleTier = subscription?.plan === "scale"

  return (
    <div className={cn("space-y-6", SPACING.component.lg)}>
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={cn(TYPOGRAPHY.heading.h2, "flex items-center")}>
                {isScaleTier ? (
                  <Crown className="h-6 w-6 mr-2 text-yellow-500" />
                ) : (
                  <TrendingUp className="h-6 w-6 mr-2 text-blue-500" />
                )}
                {subscription?.plan === "scale" ? "Scale" : "Growth"} Plan
              </CardTitle>
              <CardDescription>
                {isScaleTier 
                  ? "Premium features with reduced fees and priority support"
                  : "Essential features to get your business started"
                }
              </CardDescription>
            </div>
            <Badge variant={isScaleTier ? "default" : "secondary"} className="text-sm">
              {isScaleTier ? "PREMIUM" : "STANDARD"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className={SPACING.component.md}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4 mr-2" />
                Platform Fee
              </div>
              <div className="text-2xl font-bold">
                {isScaleTier ? "4%" : "6%"}
              </div>
              {isGrowthTier && (
                <div className="text-xs text-muted-foreground">
                  Save 33% with Scale
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                Monthly Bids
              </div>
              <div className="text-2xl font-bold">
                {isScaleTier ? "50" : "10"}
              </div>
              <div className="text-xs text-muted-foreground">
                Unlimited usage tracking coming soon
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4 mr-2" />
                AI Chats
              </div>
              <div className="text-2xl font-bold">
                {isScaleTier ? "30" : "10"}
              </div>
              <div className="text-xs text-muted-foreground">
                Unlimited usage tracking coming soon
              </div>
            </div>
          </div>

          {isScaleTier && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">
                  Monthly subscription: $250/month
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      {isGrowthTier && (
        <Card>
          <CardHeader>
            <CardTitle className={cn(TYPOGRAPHY.heading.h3, "flex items-center")}>
              <Zap className="h-5 w-5 mr-2" />
              Upgrade to Scale
            </CardTitle>
            <CardDescription>
              Unlock premium features and save on platform fees
            </CardDescription>
          </CardHeader>
          <CardContent className={SPACING.component.md}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Growth Plan */}
              <div className="space-y-4">
                <h4 className={cn(TYPOGRAPHY.heading.h4, "flex items-center")}>
                  <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                  Growth (Current)
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    6% platform fee
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    10 monthly bids
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    10 AI chat sessions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Basic support
                  </li>
                </ul>
              </div>

              {/* Scale Plan */}
              <div className="space-y-4 border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <h4 className={cn(TYPOGRAPHY.heading.h4, "flex items-center")}>
                  <Crown className="h-4 w-4 mr-2 text-yellow-600" />
                  Scale (Recommended)
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    4% platform fee (33% savings)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    50 monthly bids
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    30 AI chat sessions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Rex lead generation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Advanced analytics
                  </li>
                </ul>
                <div className="text-lg font-semibold text-yellow-800">
                  $250/month
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button 
                onClick={handleUpgradeClick} 
                disabled={isUpgrading}
                size="lg"
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {isUpgrading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Crown className="h-4 w-4" />
                )}
                <span className="ml-2">
                  {isUpgrading ? "Upgrading..." : "Upgrade to Scale"}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle className={TYPOGRAPHY.heading.h3}>Plan Features</CardTitle>
          <CardDescription>
            Features and limits for your current plan
          </CardDescription>
        </CardHeader>
        <CardContent className={SPACING.component.md}>
          <div className="space-y-4">
            <div className="flex justify-between py-2">
              <span>Platform Fee</span>
              <span className="font-semibold">{isScaleTier ? "4%" : "6%"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Monthly Bids</span>
              <span>{isScaleTier ? "50" : "10"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>AI Chat Sessions</span>
              <span>{isScaleTier ? "30" : "10"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Monthly Messages</span>
              <span>{isScaleTier ? "200" : "50"}</span>
            </div>
            {isScaleTier && (
              <div className="flex justify-between py-2">
                <span>Rex Lead Searches</span>
                <span>10</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card>
        <CardHeader>
          <CardTitle className={TYPOGRAPHY.heading.h3}>Account Management</CardTitle>
          <CardDescription>
            Manage your subscription and billing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className={SPACING.component.md}>
          <div className="space-y-4">
            {isScaleTier && (
              <>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Next Billing Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {subscription?.billing_period_end 
                        ? new Date(subscription.billing_period_end).toLocaleDateString()
                        : "Not available"
                      }
                    </p>
                  </div>
                  <Badge variant="outline">
                    $250.00
                  </Badge>
                </div>

                <Separator />
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1">
                <CreditCard className="h-4 w-4 mr-2" />
                Update Payment Method
              </Button>
              
              <Button variant="outline" className="flex-1">
                Download Invoice
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleManageSubscription}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                <span className="ml-2">
                  Manage Subscription
                </span>
              </Button>
            </div>

            {isScaleTier && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Scale Plan Benefits</p>
                    <p className="mt-1">
                      You&apos;re saving 33% on platform fees and have access to premium features 
                      including Rex lead generation and priority support.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
