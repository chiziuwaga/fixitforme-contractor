"use client"

import UnifiedChatInterface from "@/components/ui/UnifiedChatInterface"
import { useUser } from "@/hooks/useUser"
import { DashboardEmptyState } from "@/components/ui/ResponsiveLexiOnboarding"

/**
 * Main Contractor Page - PURE Chat-Centric Interface
 * 
 * This page implements the "Chat is the App" philosophy following Vercel AI Chatbot patterns.
 * 
 * Key Principles:
 * - Chat occupies 95%+ of screen real estate
 * - All functionality accessible through AI agent conversations
 * - No separate pages for dashboard, leads, settings (all via chat threads)
 * - Thread-based navigation replaces traditional page routing
 * - Agents provide functionality: Lexi (onboarding/settings), Alex (bidding), Rex (leads)
 * - Settings/account accessible via top-right modal only
 */
export default function ContractorPage() {
  const { profile } = useUser()

  // Show Lexi intro if not onboarded (seamless chat-first onboarding)
  if (!profile?.onboarded) {
    return <DashboardEmptyState onboardingStep="not_started" />
  }

  // Main chat-centric interface - FULL SCREEN
  return (
    <UnifiedChatInterface 
      defaultAgent="lexi"
      className="h-full w-full"
      fullscreen={true}
    />
  )
}
