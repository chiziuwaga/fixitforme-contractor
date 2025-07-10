"use client"

import type { ReactNode } from "react"
import { NotificationCenter, NotificationProvider } from "@/components/ui/NotificationCenter"
import { ConcurrentExecutionProvider } from "@/components/ui/ConcurrentExecutionManager"

interface AppSystemWrapperProps {
  children: ReactNode
}

/**
 * Internal wrapper that contains the notification center with hooks
 */
function NotificationWrapper() {
  return <NotificationCenter />
}

/**
 * Client-side wrapper that provides notification and execution management
 * context to the entire app. This includes:
 * - NotificationCenter for centralized notification management
 * - ConcurrentExecutionProvider for tracking agent execution limits
 */
export function AppSystemWrapper({ children }: AppSystemWrapperProps) {
  return (
    <ConcurrentExecutionProvider>
      <NotificationProvider>
        {children}
        <NotificationWrapper />
      </NotificationProvider>
    </ConcurrentExecutionProvider>
  )
}
