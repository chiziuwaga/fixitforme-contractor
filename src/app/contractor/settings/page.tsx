'use client';

import { Tabs, Container, Title } from '@mantine/core';
import { IconUserCircle, IconCreditCard, IconFileText } from '@tabler/icons-react';
import SubscriptionManager from '@/components/settings/SubscriptionManager';
import ProfileEditor from '@/components/settings/ProfileEditor';
import DocumentUploader from '@/components/settings/DocumentUploader';
import { BRAND } from '@/lib/brand';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';

export default function SettingsPage() {
  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
      style={{ 
        padding: '2rem', 
        backgroundColor: BRAND.colors.background.secondary, 
        minHeight: 'calc(100vh - var(--app-shell-header-height, 0px))' 
      }}
    >
      <Container size="lg">
        <motion.div variants={itemVariants}>
          <Title 
            order={1} 
            mb="xl" 
            style={{ 
              fontFamily: BRAND.typography.fontFamily.sans.join(','), 
              fontWeight: BRAND.typography.fontWeight.bold, 
              color: BRAND.colors.text.primary 
            }}
          >
            Settings
          </Title>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Tabs 
            defaultValue="profile" 
            variant="pills" 
            orientation="vertical"
            styles={{
              tab: {
                color: BRAND.colors.text.primary,
                fontSize: BRAND.typography.fontSize.sm,
                padding: `1rem 1.5rem`,
                borderRadius: BRAND.borderRadius.lg,
                '&[data-active]': {
                  backgroundColor: BRAND.colors.primary,
                  color: BRAND.colors.text.inverse,
                },
                '&[data-active] .mantine-Tabs-tabSection': {
                  color: BRAND.colors.text.inverse,
                },
              },
              panel: {
                backgroundColor: BRAND.colors.background.primary,
                padding: '2rem',
                borderRadius: BRAND.borderRadius.lg,
                boxShadow: BRAND.shadows.md,
              }
            }}
          >
            <Tabs.List>
              <Tabs.Tab 
                value="profile" 
                leftSection={<IconUserCircle size={20} />}
              >
                Profile
              </Tabs.Tab>
              <Tabs.Tab 
                value="subscription" 
                leftSection={<IconCreditCard size={20} />}
              >
                Subscription & Billing
              </Tabs.Tab>
              <Tabs.Tab 
                value="documents" 
                leftSection={<IconFileText size={20} />}
              >
                Documents & Verification
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="profile" pl="md">
              <ProfileEditor />
            </Tabs.Panel>

            <Tabs.Panel value="subscription" pl="md">
              <SubscriptionManager />
            </Tabs.Panel>

            <Tabs.Panel value="documents" pl="md">
              <DocumentUploader />
            </Tabs.Panel>
          </Tabs>
        </motion.div>
      </Container>
    </motion.div>
  );
}
