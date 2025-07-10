"use client"

import type React from "react"
import { SettingsIcon, User, FileText, CreditCard, type LucideIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileEditor from "@/components/settings/ProfileEditor"
import DocumentUploader from "@/components/settings/DocumentUploader"
import SubscriptionManager from "@/components/settings/SubscriptionManager"
import { TYPOGRAPHY, SPACING } from "@/lib/design-system"

interface SettingsTab {
  value: string
  label: string
  icon: LucideIcon
  component: React.ComponentType
}

const settingsTabs: SettingsTab[] = [
  {
    value: "profile",
    label: "Profile",
    icon: User,
    component: ProfileEditor,
  },
  {
    value: "documents",
    label: "Documents",
    icon: FileText,
    component: DocumentUploader,
  },
  {
    value: "subscription",
    label: "Subscription",
    icon: CreditCard,
    component: SubscriptionManager,
  },
]

export default function SettingsPage() {
  return (
    <div className={SPACING.component.xl}>
      <header className="mb-8">
        <h1 className={`${TYPOGRAPHY.heading.h1} flex items-center gap-3`}>
          <SettingsIcon className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className={`${TYPOGRAPHY.body.medium} text-muted-foreground mt-1`}>
          Manage your account, profile, and subscription settings.
        </p>
      </header>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          {settingsTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {settingsTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            <tab.component />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
