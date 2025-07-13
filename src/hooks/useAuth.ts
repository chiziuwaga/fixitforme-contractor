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

  const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const phone = `+1${phoneNumber.replace(/\D/g, "")}`;
      
      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setStep("otp");
      toast.success("Verification code sent!", { 
        description: data.demo ? `Demo code: ${data.hint?.split(': ')[1]}` : "Check your phone for the 6-digit code"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send code';
      setError(errorMessage);
      toast.error("Failed to send code", { description: errorMessage });
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const phone = `+1${phoneNumber.replace(/\D/g, "")}`;
      
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
      const phone = `+1${phoneNumber.replace(/\D/g, "")}`;
      
      const response = await fetch('/api/send-whatsapp-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (!response.ok) {
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
    handlePhoneSubmit,
    handleOtpSubmit,
    handleWhatsAppSend,
    goBack,
  };
}
