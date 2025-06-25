'use client';

import { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { NotificationCenter, useNotifications } from '@/components/ui/NotificationCenter';
import { ConcurrentExecutionProvider } from '@/components/ui/ConcurrentExecutionManager';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

interface AppSystemWrapperProps {
  children: ReactNode;
}

/**
 * Internal wrapper that contains the notification center with hooks
 */
function NotificationWrapper() {
  const {
    notifications,
    dismissNotification,
    markAsRead,
    clearAll
  } = useNotifications();
  const handleActionClick = (action: { type: string; data?: unknown }) => {
    // Handle notification actions
    console.log('Notification action clicked:', action);
  };

  return (
    <NotificationCenter
      notifications={notifications}
      onDismiss={dismissNotification}
      onMarkAsRead={markAsRead}
      onClearAll={clearAll}
      onActionClick={handleActionClick}
    />
  );
}

/**
 * Client-side wrapper that provides notification and execution management
 * context to the entire app. This includes:
 * - MantineProvider for UI components
 * - NotificationCenter for centralized notification management
 * - ConcurrentExecutionProvider for tracking agent execution limits
 */
export function AppSystemWrapper({ children }: AppSystemWrapperProps) {
  return (
    <MantineProvider>
      <Notifications />
      <ConcurrentExecutionProvider>
        {children}
        <NotificationWrapper />
      </ConcurrentExecutionProvider>
    </MantineProvider>
  );
}
