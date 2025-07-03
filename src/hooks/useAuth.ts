'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export interface AuthState {
  step: 'phone' | 'verification'
  phone: string
  verificationCode: string
  error: string | null
  isSubmitting: boolean
}

export function useAuth() {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    step: 'phone',
    phone: '',
    verificationCode: '',
    error: null,
    isSubmitting: false,
  })

  // Format phone number for display
  const formatPhoneNumber = (value: string): string => {
    const cleaned = ('' + value).replace(/\D/g, '')
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/)
    if (!match) return value
    const parts = [match[1], match[2], match[3]].filter(Boolean)
    let formatted = parts.join('')
    if (parts.length > 1) {
      formatted = `(${parts[0]}) ${parts[1]}`
      if (parts[2]) {
        formatted += `-${parts[2]}`
      }
    } else if (parts.length > 0) {
      formatted = `(${parts[0]}`
    }
    return formatted
  }

  // Update phone number with formatting
  const updatePhone = (value: string) => {
    const formatted = formatPhoneNumber(value)
    setAuthState(prev => ({ 
      ...prev, 
      phone: formatted, 
      error: null 
    }))
  }

  // Update verification code
  const updateVerificationCode = (value: string) => {
    // Only allow digits and limit to 6 characters
    const cleaned = value.replace(/\D/g, '').slice(0, 6)
    setAuthState(prev => ({ 
      ...prev, 
      verificationCode: cleaned, 
      error: null 
    }))
  }

  // Send SMS verification code
  const sendVerificationCode = async (): Promise<boolean> => {
    if (authState.phone.replace(/\D/g, '').length !== 10) {
      setAuthState(prev => ({ 
        ...prev, 
        error: 'A valid 10-digit phone number is required.' 
      }))
      return false
    }

    setAuthState(prev => ({ ...prev, isSubmitting: true, error: null }))
    
    try {
      // TODO: Replace with actual Supabase SMS auth
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: authState.phone.replace(/\D/g, '') 
        }),
      })

      if (response.ok) {
        setAuthState(prev => ({ 
          ...prev, 
          step: 'verification', 
          isSubmitting: false 
        }))
        
        toast.success('Verification Code Sent', {
          description: `A 6-digit code was sent to ${authState.phone}.`,
          duration: 5000,
        })
        return true
      } else {
        throw new Error('Failed to send verification code')
      }
    } catch (error) {
      console.error('SMS send error:', error)
      setAuthState(prev => ({
        ...prev,
        isSubmitting: false,
        error: 'Failed to send code. Please check the number and try again.',
      }))
      return false
    }
  }

  // Verify SMS code and authenticate
  const verifyCode = async (): Promise<boolean> => {
    if (authState.verificationCode.length !== 6) {
      setAuthState(prev => ({ 
        ...prev, 
        error: 'The 6-digit code is required.' 
      }))
      return false
    }

    setAuthState(prev => ({ ...prev, isSubmitting: true, error: null }))
    
    try {
      // TODO: Replace with actual Supabase auth verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const response = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: authState.phone.replace(/\D/g, ''),
          code: authState.verificationCode,
        }),
      })

      if (response.ok) {
        toast.success('Login Successful!', {
          description: 'Welcome back. Redirecting to your dashboard...',
          duration: 3000,
        })
        
        // Redirect after short delay
        setTimeout(() => {
          router.push('/contractor/dashboard')
        }, 1500)
        
        return true
      } else {
        throw new Error('Invalid verification code')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setAuthState(prev => ({
        ...prev,
        isSubmitting: false,
        error: 'Invalid or expired code. Please request a new one.',
      }))
      return false
    }
  }

  // Test mode login (for development)
  const testModeLogin = () => {
    toast.info('Redirecting in Test Mode...', {
      description: 'Accessing the dashboard with a test account.',
    })
    setTimeout(() => {
      router.push('/contractor/dashboard')
    }, 1000)
  }

  // Reset to phone step
  const resetToPhone = () => {
    setAuthState(prev => ({
      ...prev,
      step: 'phone',
      verificationCode: '',
      error: null,
    }))
  }

  // Clear error
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }))
  }

  // Form submission handlers
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendVerificationCode()
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await verifyCode()
  }

  return {
    // State
    authState,
    
    // Actions
    updatePhone,
    updateVerificationCode,
    sendVerificationCode,
    verifyCode,
    testModeLogin,
    resetToPhone,
    clearError,
    handlePhoneSubmit,
    handleVerificationSubmit,
    
    // Utilities
    formatPhoneNumber,
  }
}
