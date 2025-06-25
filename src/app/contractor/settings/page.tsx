'use client';

import { Tabs } from '@mantine/core';
import { IconUserCircle, IconCreditCard, IconFileText } from '@tabler/icons-react';
import SubscriptionManager from '@/components/settings/SubscriptionManager';
import ProfileEditor from '@/components/settings/ProfileEditor';
import DocumentUploader from '@/components/settings/DocumentUploader';

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
        <Tabs defaultValue="profile" variant="pills" orientation="vertical">
          <Tabs.List>
            <Tabs.Tab value="profile" leftSection={<IconUserCircle size={20} />}>
              Profile
            </Tabs.Tab>
            <Tabs.Tab value="subscription" leftSection={<IconCreditCard size={20} />}>
              Subscription & Billing
            </Tabs.Tab>
            <Tabs.Tab value="documents" leftSection={<IconFileText size={20} />}>
              Documents & Verification
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="profile" className="pl-4">
            <ProfileEditor />
          </Tabs.Panel>

          <Tabs.Panel value="subscription" className="pl-4">
            <SubscriptionManager />
          </Tabs.Panel>

          <Tabs.Panel value="documents" className="pl-4">
            <DocumentUploader />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
}
