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
        minHeight: '100vh' 
      }}
    >
      <Container size="lg">
        <motion.div variants={itemVariants}>
          <Title 
            order={1} 
            mb="xl" 
            style={{ 
              fontSize: '2rem', 
              fontWeight: 700, 
              color: BRAND.colors.text.primary 
            }}
          >
            Settings
          </Title>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="profile" variant="pills" orientation="vertical">
            <Tabs.List>
              <Tabs.Tab 
                value="profile" 
                leftSection={<IconUserCircle size={20} />}
                style={{ color: BRAND.colors.text.primary }}
              >
                Profile
              </Tabs.Tab>
              <Tabs.Tab 
                value="subscription" 
                leftSection={<IconCreditCard size={20} />}
                style={{ color: BRAND.colors.text.primary }}
              >
                Subscription & Billing
              </Tabs.Tab>
              <Tabs.Tab 
                value="documents" 
                leftSection={<IconFileText size={20} />}
                style={{ color: BRAND.colors.text.primary }}
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
