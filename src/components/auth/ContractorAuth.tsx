"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { MobileRedirect } from "./MobileRedirect"

export function ContractorAuth() {
  const { step, phoneNumber, setPhoneNumber, otp, setOtp, loading, error, handlePhoneSubmit, handleOtpSubmit, goBack } =
    useAuth()
  const [showMobileRedirect, setShowMobileRedirect] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // WhatsApp OTP handler - must be declared before any conditional returns
  const [waLoading, setWaLoading] = useState(false);
  const [waMsg, setWaMsg] = useState<string | null>(null);

  // Mobile detection with SSR safety
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth
        const userAgent = navigator.userAgent.toLowerCase()
        const isMobileDevice = width < 768 || /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
        setIsMobile(isMobileDevice)
        setShowMobileRedirect(isMobileDevice)
      }
    }
    
    // Delay initial check to ensure proper hydration
    const timer = setTimeout(checkMobile, 100)
    
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        checkMobile()
      }
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }
    
    return () => {
      clearTimeout(timer)
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  // If mobile and should show redirect
  if (showMobileRedirect && isMobile) {
    return <MobileRedirect onContinueAnyway={() => setShowMobileRedirect(false)} />
  }

  // WhatsApp OTP handler
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
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link 
            href="https://fixitforme.ai" 
            target="_blank"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm group"
          >
            <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Visit FixItForMe.ai
          </Link>
        </div>
        
        <Card>
          <CardHeader className="flex flex-col items-center">
            <Image 
              src="/logo.png" 
              alt="FixItForMe Logo" 
              width={80}
              height={80}
              className="mb-4 rounded-full shadow-sm" 
            />
            
            {step === "otp" && (
              <Button variant="ghost" size="sm" className="absolute left-4 top-4" onClick={goBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            <CardTitle className="text-2xl text-center">
              {step === "phone" ? "Contractor Login" : "Enter Code"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === "phone"
                ? "Enter your phone number to receive a login code via SMS or WhatsApp."
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
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send SMS Code"}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-center text-muted-foreground">
                    First time? Join our WhatsApp bot for instant notifications:
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('https://wa.me/+14155238886?text=join%20shine-native', '_blank')}
                  >
                    Join WhatsApp Bot
                  </Button>
                  <Button
                    type="button"
                    className="w-full"
                    disabled={loading || waLoading || !/^\+?1?\d{10,15}$/.test(phoneNumber)}
                    onClick={sendWhatsAppOtp}
                  >
                    {waLoading ? "Sending..." : "Send WhatsApp Code"}
                  </Button>
                </div>
              </div>
              {waMsg && (
                <div className="text-xs text-center mt-2 p-2 rounded bg-muted text-muted-foreground border">
                  {waMsg}
                </div>
              )}
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
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </Button>
            </form>
          )}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-center text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
