"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export function useAuth() {
  const router = useRouter()
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      phone: `+1${phoneNumber.replace(/\D/g, "")}`,
    })

    if (error) {
      setError(error.message)
      toast.error("Failed to send code", { description: error.message })
    } else {
      setStep("otp")
      toast.success("Verification code sent!")
    }
    setLoading(false)
  }

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      phone: `+1${phoneNumber.replace(/\D/g, "")}`,
      token: otp,
      type: "sms",
    })

    if (error) {
      setError(error.message)
      toast.error("Invalid verification code", { description: error.message })
    } else if (session) {
      toast.success("Successfully logged in!")
      router.push("/contractor/dashboard")
    }
    setLoading(false)
  }

  const goBack = () => {
    setStep("phone")
    setError(null)
    setOtp("")
  }

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
    goBack,
  }
}
