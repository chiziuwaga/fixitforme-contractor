"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth
      const isMobileDevice = width < 768 // Less than tablet size
      setIsMobile(isMobileDevice)
      setShowMobileRedirect(isMobileDevice)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // If mobile and should show redirect
  if (showMobileRedirect && isMobile) {
    return <MobileRedirect onContinueAnyway={() => setShowMobileRedirect(false)} />
  }

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-950 via-slate-950 to-purple-950 p-4">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative w-full max-w-sm">
        {/* Link to main site */}
        <div className="text-center mb-6">
          <Link 
            href="https://fixitforme.ai" 
            target="_blank"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm group"
          >
            <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Visit FixItForMe.ai
          </Link>
        </div>
        
        <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-2xl">
          <CardHeader className="flex flex-col items-center relative overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-50"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="FixItForMe Logo" 
                  className="w-20 h-20 mb-4 rounded-full shadow-lg ring-4 ring-white/50 hover:ring-blue-200 transition-all duration-300 hover:scale-105" 
                />
                {/* Animated rings */}
                <div className="absolute inset-0 rounded-full border-2 border-blue-300/30 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border border-purple-300/20 animate-pulse delay-500"></div>
              </div>
              
              {step === "otp" && (
                <Button variant="ghost" size="sm" className="absolute left-4 top-4 hover:bg-white/80" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              
              <CardTitle className="text-2xl text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {step === "phone" ? "Contractor Login" : "Enter Code"}
              </CardTitle>
              <CardDescription className="text-center text-slate-600">
                {step === "phone"
                  ? "Enter your phone number to receive a login code via SMS or WhatsApp."
                  : `We sent a code to +1 ${phoneNumber}.`}
              </CardDescription>
            </div>
          </CardHeader>
        <CardContent className="relative z-10">
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
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]" 
                  loading={loading}
                >
                  Send SMS Code
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400">Or</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-center text-slate-500">
                    First time? Join our WhatsApp bot for instant notifications:
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-green-500 text-green-700 hover:bg-green-50 transition-all duration-200"
                    onClick={() => window.open('https://wa.me/+14155238886?text=join%20FixItForMe', '_blank')}
                  >
                    Join WhatsApp Bot
                  </Button>
                  <Button
                    type="button"
                    className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-200 transform hover:scale-[1.02]"
                    loading={waLoading}
                    disabled={loading || waLoading || !/^\+?1?\d{10,15}$/.test(phoneNumber)}
                    onClick={sendWhatsAppOtp}
                  >
                    Send WhatsApp Code
                  </Button>
                </div>
              </div>
              {waMsg && (
                <div className="text-xs text-center mt-2 p-2 rounded bg-blue-50 text-blue-600 border border-blue-200">
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
                  className="text-center text-lg tracking-widest transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]" 
                loading={loading}
              >
                Verify & Login
              </Button>
            </form>
          )}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-center text-sm text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Decorative icons */}
      <div className="absolute bottom-8 left-8 opacity-20">
        <div className="flex items-center gap-2 text-white">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-300"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-700"></div>
        </div>
      </div>
      </div>
    </div>
  )
}
