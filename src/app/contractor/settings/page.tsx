"use client"

import type React from "react"
import { SettingsIcon, User, FileText, CreditCard, type LucideIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileEditor from "@/components/settings/ProfileEditor"
import DocumentUploader from "@/components/settings/DocumentUploader"
import { DocumentViewer } from "@/components/settings/DocumentViewer"
import SubscriptionManager from "@/components/settings/SubscriptionManager"

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
    <div className="p-6 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-base text-muted-foreground mt-1">
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
            <div className="space-y-6">
              <tab.component />
              {tab.value === "documents" && <DocumentViewer />}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
