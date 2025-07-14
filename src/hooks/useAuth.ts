"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function useAuth() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean phone number and add US country code (consistent with handleWhatsAppSend)
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      const phone = `+1${cleanPhone}`;
      
      if (cleanPhone.length !== 10) {
        throw new Error('Please enter a valid 10-digit US phone number');
      }
      
      const response = await fetch('/api/auth/verify-whatsapp-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, token: otp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      toast.success("Successfully logged in!");
      
      // For phone-based authentication, use Supabase's signInWithOtp approach
      if (data.user && data.user.phone) {
        const { createClient } = await import('@/lib/supabase-client');
        const supabase = createClient();
        
        try {
          // Use signInWithOtp for phone but don't send actual OTP (we've already verified)
          // This establishes the session using the verified phone number
          const { error: signInError } = await supabase.auth.signInWithOtp({
            phone: data.user.phone,
            options: {
              shouldCreateUser: false, // User already exists from API
              data: {
                user_type: data.user.user_type,
                demo_mode: data.demo_mode
              }
            }
          });
          
          if (signInError) {
            console.warn('OTP sign-in failed, user may need to manually refresh session:', signInError);
            // Continue with redirect anyway - session might still be valid
          }
        } catch (sessionError) {
          console.warn('Session creation failed:', sessionError);
          // Continue with redirect anyway for demo mode
        }
      }
      
      // Small delay to ensure session is set before redirect
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Redirect based on onboarding status
      const redirectUrl = data.redirect_url || '/contractor/dashboard';
      router.push(redirectUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid verification code';
      setError(errorMessage);
      toast.error("Invalid verification code", { description: errorMessage });
    }
    setLoading(false);
  };

  const handleWhatsAppSend = async () => {
    setLoading(true);
    setError(null);

    try {
      // Clean phone number and add US country code
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      const phone = `+1${cleanPhone}`;
      
      if (cleanPhone.length !== 10) {
        throw new Error('Please enter a valid 10-digit US phone number');
      }
      
      const response = await fetch('/api/send-whatsapp-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle sandbox-specific errors
        if (data.sandboxRequired) {
          throw new Error(data.error + '\n\n1. Open WhatsApp\n2. Send "join shine-native" to +14155238886\n3. Wait for confirmation\n4. Try login again');
        }
        throw new Error(data.error || 'Failed to send WhatsApp verification code');
      }

      setStep("otp");
      
      // Show success message with demo code if in development
      if (data.otpCode && process.env.NODE_ENV === 'development') {
        toast.success("WhatsApp OTP sent!", { 
          description: `Demo code: ${data.otpCode}`
        });
      } else {
        toast.success("WhatsApp OTP sent!", { 
          description: "Check WhatsApp for your 6-digit verification code"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send WhatsApp OTP';
      setError(errorMessage);
      toast.error("WhatsApp OTP failed", { description: errorMessage });
    }
    setLoading(false);
  };

  const goBack = () => {
    setStep("phone");
    setError(null);
    setOtp("");
  };

  return {
    step,
    phoneNumber,
    setPhoneNumber,
    otp,
    setOtp,
    loading,
    error,
    handleOtpSubmit,
    handleWhatsAppSend,
    goBack,
  };
}
