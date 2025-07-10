"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type AuthStep = "phone" | "otp"

export function useAuth() {
  const router = useRouter()
  const [step, setStep] = useState<AuthStep>("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formattedPhoneNumber = `+1${phoneNumber.replace(/\D/g, "")}`

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhoneNumber,
    })

    if (error) {
      setError(error.message)
      console.error("SMS send error:", error)
    } else {
      setStep("otp")
    }
    setLoading(false)
  }

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formattedPhoneNumber = `+1${phoneNumber.replace(/\D/g, "")}`

    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      phone: formattedPhoneNumber,
      token: otp,
      type: "sms",
    })

    if (error) {
      setError(error.message)
      console.error("OTP verification error:", error)
    } else if (session) {
      router.push("/")
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
