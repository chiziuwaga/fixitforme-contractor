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

      // --- CRITICAL SESSION FIX START ---
      // The backend has confirmed the OTP is valid.
      // Now, we use the official Supabase client to verify and create the session.
      const { createClient } = await import('@/lib/supabase-client');
      const supabase = createClient();

      console.log('[AUTH] Backend OTP check passed. Verifying with client to create session...');
      
      const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms' // Use 'sms' type for phone verification
      });

      if (sessionError) {
        console.error('Supabase client session error:', sessionError);
        toast.error("Login Failed", { description: sessionError.message });
        setLoading(false);
        return; // Stop if session cannot be created
      }

      if (!sessionData.session) {
        console.error('Supabase client verification failed: No session returned.');
        toast.error("Login Failed", { description: "Could not establish a user session. Please try again." });
        setLoading(false);
        return; // Stop if session is null
      }
      
      console.log('[AUTH] Client session established successfully.');
      // --- CRITICAL SESSION FIX END ---

      // Check for secret upgrade success
      if (data.secret_upgrade) {
        toast.success("🎉 Secret Scale Tier Upgrade Activated!", { 
          description: "You've been upgraded to Scale tier with premium features!",
          duration: 5000
        });
      } else {
        toast.success("Successfully logged in!");
      }
      
      // Small delay to ensure UI updates before redirect
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
      
      // Show success message 
      toast.success("WhatsApp OTP sent!", { 
        description: "Check WhatsApp for your 6-digit verification code"
      });
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
