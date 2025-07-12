"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Crown, Lock, Check, X } from "lucide-react"
import { toast } from "sonner"

interface MockUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function MockUpgradeModal({ isOpen, onClose, onSuccess }: MockUpgradeModalProps) {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"phone" | "password">("phone")

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) {
      toast.error("Please enter your phone number")
      return
    }
    setStep("password")
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.endsWith("-felixscale")) {
      toast.error("Invalid upgrade password. Password must end with '-felixscale'")
      return
    }
    
    setLoading(true)
    
    // Simulate upgrade process
    setTimeout(() => {
      toast.success("Successfully upgraded to Scale tier! 🎉")
      onSuccess()
      onClose()
      setLoading(false)
      setStep("phone")
      setPhone("")
      setPassword("")
    }, 2000)
  }

  const handleBack = () => {
    setStep("phone")
    setPassword("")
  }

  const handleClose = () => {
    onClose()
    setStep("phone")
    setPhone("")
    setPassword("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Demo Upgrade to Scale
          </DialogTitle>
          <DialogDescription>
            {step === "phone" 
              ? "Join FixItForMe Scale tier to unlock advanced contractor features and reduced platform fees."
              : "Complete your upgrade with the demo password."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upgrade Benefits */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Scale Tier Benefits</h4>
            <div className="space-y-1 text-sm text-yellow-700">
              <div className="flex items-center gap-2">
                <Check className="h-3 w-3" />
                <span>4% platform fee (vs 6% Growth)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3 w-3" />
                <span>50 monthly bids (vs 10 Growth)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3 w-3" />
                <span>Rex lead generation access</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3 w-3" />
                <span>Alex advanced bidding tools</span>
              </div>
            </div>
          </div>

          {step === "phone" ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="demo-phone">Phone Number</Label>
                <Input
                  id="demo-phone"
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Continue
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="demo-password">Upgrade Password</Label>
                <Input
                  id="demo-password"
                  type="password"
                  placeholder="Enter password ending with -felixscale"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="text-xs text-muted-foreground">
                  <Lock className="h-3 w-3 inline mr-1" />
                  Try: "demo-felixscale"
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Upgrading..." : "Upgrade Now"}
                </Button>
              </div>
            </form>
          )}

          {/* Demo Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Badge variant="outline" className="text-blue-600 border-blue-300">DEMO</Badge>
              <span>This is a demo upgrade. Use password: "demo-felixscale"</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
