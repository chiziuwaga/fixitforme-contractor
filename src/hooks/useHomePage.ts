'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useHomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Authentication check and redirect logic
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          router.push('/contractor/dashboard')
          return
        }
        setLoading(false)
      } catch (error) {
        console.error('Auth check error:', error)
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user)
          router.push('/contractor/dashboard')
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  // Navigation handlers
  const navigateToLogin = () => {
    router.push('/login')
  }

  const navigateToOnboarding = () => {
    router.push('/contractor/onboarding')
  }

  const navigateToDashboard = () => {
    router.push('/contractor/dashboard')
  }

  // Email link handler for mobile users
  const sendEmailLink = async () => {
    try {
      // TODO: Implement email link functionality
      const response = await fetch('/api/auth/send-email-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: window.location.origin + '/login',
        }),
      })

      if (response.ok) {
        // Show success message
        alert('Link sent! Check your email.')
      } else {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      console.error('Email link error:', error)
      alert('Failed to send email link. Please try again.')
    }
  }

  return {
    // State
    user,
    loading,
    isMobile,
    
    // Actions
    navigateToLogin,
    navigateToOnboarding,
    navigateToDashboard,
    sendEmailLink,
  }
}
