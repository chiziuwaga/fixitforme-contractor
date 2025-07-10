import type React from "react"
import { AppSystemWrapper } from "@/components/AppSystemWrapper"
import { EnhancedChatManager } from "@/components/EnhancedChatManager"
import { AppLayout } from "@/components/layout/AppLayout"

export default function ContractorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppSystemWrapper>
      <AppLayout>{children}</AppLayout>
      <EnhancedChatManager />
    </AppSystemWrapper>
  )
}
