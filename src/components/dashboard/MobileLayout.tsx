"use client"

import { ReactNode } from "react"
import { MobileDashboard } from "./MobileDashboard"
import { useIsMobile } from "@/hooks/use-mobile"

interface MobileLayoutProps {
  children: ReactNode
  fallbackToMobile?: boolean
}

export function MobileLayout({ children, fallbackToMobile = false }: MobileLayoutProps) {
  const isMobile = useIsMobile()
  
  // For mobile devices, show mobile-optimized dashboard unless explicitly requesting full version
  if (isMobile && fallbackToMobile) {
    return <MobileDashboard />
  }
  
  // For desktop or when full version is requested, show the regular layout
  return <>{children}</>
}
