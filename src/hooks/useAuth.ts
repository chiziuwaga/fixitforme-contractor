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

      // --- SIMPLE SESSION FIX START ---
      // Backend confirmed OTP is valid and user exists.
      // Now create a client-side session using Supabase's phone auth
      console.log('[AUTH] WhatsApp OTP verified successfully. Processing session...');
      
      // PURE WHATSAPP OTP - No Supabase phone provider needed
      // Our backend creates admin sessions and returns all necessary data
      
      if (data.user && data.session_data) {
        console.log('[AUTH] Setting up admin-generated session...');
        
        try {
          const { createClient } = await import('@/lib/supabase-client');
          const supabase = createClient();
          
          // Use the admin-generated session data to establish client session
          if (data.session_data.access_token) {
            // Set session using admin-generated tokens
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: data.session_data.access_token,
              refresh_token: data.session_data.refresh_token || data.session_data.access_token
            });
            
            if (setSessionError) {
              console.error('[AUTH] Session setup failed:', setSessionError);
              // Fallback: Store verified user data locally
              localStorage.setItem('whatsapp_verified_user', JSON.stringify(data.user));
            } else {
              console.log('[AUTH] Admin session established successfully');
            }
          } else {
            // Fallback: Store verified user data for manual session management
            localStorage.setItem('whatsapp_verified_user', JSON.stringify(data.user));
            console.log('[AUTH] User data stored for manual session management');
          }
        } catch (sessionError) {
          console.error('[AUTH] Session creation error:', sessionError);
          // Store user data as fallback
          localStorage.setItem('whatsapp_verified_user', JSON.stringify(data.user));
        }
      } else {
        console.log('[AUTH] Using user data without admin session...');
        // Store verified user data
        localStorage.setItem('whatsapp_verified_user', JSON.stringify(data.user));
      }
      
      console.log('[AUTH] WhatsApp authentication complete. Ready for redirect.');
      // --- PURE WHATSAPP OTP END ---

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
