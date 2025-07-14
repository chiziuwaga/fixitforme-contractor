"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  CreditCard, 
  Crown, 
  Loader2,
  X,
  Shield,
  CheckCircle
} from "lucide-react"

interface MockStripeUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgradeSuccess: () => void
}

export default function MockStripeUpgradeModal({ 
  isOpen, 
  onClose, 
  onUpgradeSuccess 
}: MockStripeUpgradeModalProps) {
  const [upgradeCode, setUpgradeCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvc, setCvc] = useState('')

  const handleSecretUpgrade = async () => {
    if (upgradeCode.toLowerCase() === 'felixscale') {
      setIsProcessing(true)
      
      try {
        // Mock API call to upgrade to Scale tier
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        toast.success("🎉 Secret Scale Tier Upgrade Activated!", {
          description: "You've been upgraded to Scale tier with premium features!",
          duration: 5000
        })
        
        onUpgradeSuccess()
        onClose()
      } catch {
        toast.error("Upgrade failed", {
          description: "Please try again later."
        })
      } finally {
        setIsProcessing(false)
      }
    } else {
      toast.error("Invalid upgrade code", {
        description: "Please check your code and try again."
      })
    }
  }

  const handleStripeUpgrade = async () => {
    if (!cardNumber || !expiryDate || !cvc) {
      toast.error("Please fill in all payment details")
      return
    }

    setIsProcessing(true)
    
    try {
      // Mock Stripe processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast.success("Upgrade successful!", {
        description: "Welcome to Scale tier!"
      })
      
      onUpgradeSuccess()
      onClose()
    } catch {
      toast.error("Payment failed", {
        description: "Please check your payment details."
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-xl relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Upgrade to Scale Tier</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Unlock premium features and reduced fees
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Pricing Display */}
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-3xl font-bold text-primary">$250/month</div>
            <div className="text-sm text-muted-foreground">+ 7% transaction fee</div>
            <Badge variant="secondary" className="mt-2">Save 33% on platform fees</Badge>
          </div>

          {/* Secret Upgrade Section */}
          <div className="space-y-3">
            <Label htmlFor="upgradeCode" className="text-sm font-medium">
              Upgrade Code (Optional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="upgradeCode"
                placeholder="Enter special code..."
                value={upgradeCode}
                onChange={(e) => setUpgradeCode(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSecretUpgrade}
                disabled={!upgradeCode || isProcessing}
                variant="outline"
                className="shrink-0"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              🔓 Have a special code? Enter it here for instant upgrade
            </p>
          </div>

          <Separator />

          {/* Mock Stripe Payment Form */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Secure Payment</span>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleStripeUpgrade}
              disabled={isProcessing}
              className="w-full bg-primary"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Subscribe to Scale ($250/month)
                </>
              )}
            </Button>
          </div>

          {/* Benefits Reminder */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              What you&apos;ll get:
            </h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• 33% lower platform fees (7% vs 10%)</li>
              <li>• Rex lead generation (10 searches/month)</li>
              <li>• Alex bidding assistance (unlimited)</li>
              <li>• Priority support & advanced analytics</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
