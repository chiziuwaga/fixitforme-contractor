"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

export function ContractorAuth() {
  const { step, phoneNumber, setPhoneNumber, otp, setOtp, loading, error, handlePhoneSubmit, handleOtpSubmit, goBack } =
    useAuth()

  // WhatsApp OTP handler
  const [waLoading, setWaLoading] = useState(false);
  const [waMsg, setWaMsg] = useState<string | null>(null);
  const sendWhatsAppOtp = async () => {
    setWaLoading(true);
    setWaMsg(null);
    try {
      const response = await fetch('/api/send-whatsapp-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      });
      if (response.ok) {
        setWaMsg('WhatsApp OTP sent! Check your WhatsApp.');
      } else {
        setWaMsg('Failed to send WhatsApp OTP.');
      }
    } catch {
      setWaMsg('Failed to send WhatsApp OTP.');
    }
    setWaLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center">
          <img src="/logo.png" alt="FixItForMe Logo" className="w-20 h-20 mb-2 rounded-full shadow-sm" />
          {/* Demo area links */}
          {step === "phone" && (
            <div className="w-full flex flex-col gap-2 mb-4">
              <Link
                href="/contractor/dashboard"
                className="block w-full rounded-lg border border-amber-400 bg-amber-50 text-amber-900 font-semibold py-2 text-center shadow-sm hover:bg-amber-100 transition"
                prefetch={false}
              >
                Demo: Growth Contractor Area
              </Link>
              <Link
                href="/contractor/onboarding"
                className="block w-full rounded-lg border border-green-700 bg-green-50 text-green-900 font-semibold py-2 text-center shadow-sm hover:bg-green-100 transition"
                prefetch={false}
              >
                Demo: Scale Contractor Area
              </Link>
            </div>
          )}
          {step === "otp" && (
            <Button variant="ghost" size="sm" className="absolute left-4 top-4" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle className="text-2xl text-center">{step === "phone" ? "Contractor Login" : "Enter Code"}</CardTitle>
          <CardDescription className="text-center">
            {step === "phone"
              ? "Enter your phone number to receive a login code."
              : `We sent a code to +1 ${phoneNumber}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full" loading={loading}>
                  Send Code
                </Button>
                <Button
                  type="button"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  loading={waLoading}
                  disabled={loading || waLoading || !/^\+?1?\d{10,15}$/.test(phoneNumber)}
                  onClick={sendWhatsAppOtp}
                >
                  Send WhatsApp OTP
                </Button>
              </div>
              {waMsg && <div className="text-xs text-center mt-2 text-muted-foreground">{waMsg}</div>}
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" loading={loading}>
                Verify & Login
              </Button>
            </form>
          )}
          {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
