"use client"

// Force fresh deployment - phone number privacy fix
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
  const { step, phoneNumber, setPhoneNumber, otp, setOtp, loading, error, handleWhatsAppSend, handleOtpSubmit, goBack } =
    useAuth()
  const [showMobileRedirect, setShowMobileRedirect] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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
                ? "Enter your phone number to receive a verification code via WhatsApp."
                : `We sent a verification code to +1${phoneNumber.replace(/\D/g, "")} via WhatsApp.`}
            </CardDescription>
          </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    +1
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="5551234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    className="pl-12"
                    maxLength={10}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {phoneNumber && `Will send to: +1${phoneNumber.replace(/\D/g, "")}`}
                </p>
              </div>
              
              <div className="text-center space-y-4">
                {/* Step 1: Join the WhatsApp Bot */}
                <div className="p-4 bg-[hsl(120,28%,92%)] border border-[hsl(120,28%,80%)] rounded-lg">
                  <h3 className="font-medium text-[hsl(120,28%,20%)] mb-2">Step 1: Join Our WhatsApp Bot</h3>
                  <p className="text-sm text-[hsl(120,28%,25%)] mb-3">
                    First, join our WhatsApp bot to receive verification codes
                  </p>
                  <Button
                    type="button"
                    onClick={() => window.open(`https://wa.me/+14155238886?text=join%20shine-native`, '_blank')}
                    variant="outline"
                    className="w-full border-[hsl(120,28%,60%)] text-[hsl(120,28%,25%)] hover:bg-[hsl(120,28%,90%)]"
                  >
                    📱 Join WhatsApp Bot
                  </Button>
                  <p className="text-xs text-[hsl(120,28%,35%)] mt-2">
                    This will open WhatsApp with the message &ldquo;join shine-native&rdquo; ready to send
                  </p>
                </div>

                {/* Step 2: Send OTP via the Bot */}
                <div className="p-4 bg-[hsl(35,65%,93%)] border border-[hsl(35,65%,85%)] rounded-lg">
                  <h3 className="font-medium text-[hsl(35,65%,25%)] mb-2">Step 2: Get Verification Code</h3>
                  <p className="text-sm text-[hsl(35,65%,35%)] mb-3">
                    After joining the bot, click below to receive your verification code
                  </p>
                  <Button
                    type="button"
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                    onClick={handleWhatsAppSend}
                    disabled={!phoneNumber.trim() || loading}
                  >
                    {loading ? "Sending..." : "Send WhatsApp OTP"}
                  </Button>
                  <p className="text-xs text-[hsl(35,65%,45%)] mt-2">
                    The bot will send you a 6-digit verification code
                  </p>
                </div>
              </div>
            </div>
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
                <div className="text-center">
                  <p className="text-xs text-muted-foreground/60 cursor-help" title="Power users know the secret...">
                    🔓 Pro tip: Special codes unlock premium features
                  </p>
                </div>
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
