"use client"

import { useSubscription } from "@/hooks/useSubscription"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { SPACING } from "@/lib/design-system"

export default function SubscriptionManager() {
  const { loading, subscription, handleManageSubscription } = useSubscription()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription & Billing</CardTitle>
        <CardDescription>Manage your current plan and view billing history.</CardDescription>
      </CardHeader>
      <CardContent className={SPACING.component.md}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-4">
          <div>
            <h3 className="text-lg font-semibold">
              Current Plan: <span className="text-primary">{subscription.plan}</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              {subscription.status === "active" && subscription.billing_period_end
                ? `Renews on ${subscription.billing_period_end.toLocaleDateString()}`
                : "Your subscription is inactive."}
            </p>
          </div>
          <Badge variant={subscription.status === "active" ? "success" : "destructive"} className="capitalize">
            {subscription.status}
          </Badge>
        </div>
        <Button onClick={handleManageSubscription} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Manage Subscription & Billing
        </Button>
      </CardContent>
    </Card>
  )
}
