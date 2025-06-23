'use client';

import { useState } from 'react';
import { 
  ActionIcon, 
  Indicator, 
  Drawer, 
  Stack, 
  Text, 
  Group, 
  Badge, 
  Button, 
  Divider,
  Paper,
  ScrollArea,
  Title,
  ThemeIcon
} from '@mantine/core';
import { 
  IconBell, 
  IconX, 
  IconCheck, 
  IconAlertTriangle, 
  IconInfoCircle,
  IconSettings,
  IconCreditCard 
} from '@tabler/icons-react';
import { AgentWorkingIndicator, AgentExecutionState } from './AgentWorkingIndicator';
import { useExecutionManager } from './ConcurrentExecutionManager';
import { BRAND } from '@/lib/brand';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'agent' | 'system' | 'payment';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onActionClick?: (notification: Notification) => void;
}

const notificationIcons = {
  info: { icon: IconInfoCircle, color: 'blue' },
  success: { icon: IconCheck, color: 'green' },
  warning: { icon: IconAlertTriangle, color: 'yellow' },
  error: { icon: IconX, color: 'red' },
  agent: { icon: IconBell, color: 'blue' },
  system: { icon: IconSettings, color: 'gray' },
  payment: { icon: IconCreditCard, color: 'green' }
};

function NotificationItem({ 
  notification, 
  onDismiss, 
  onMarkAsRead, 
  onActionClick 
}: { 
  notification: Notification;
  onDismiss: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onActionClick?: (notification: Notification) => void;
}) {
  const config = notificationIcons[notification.type];
  const IconComponent = config.icon;

  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick(notification);
    }
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Paper
      p="md"
      withBorder
      radius="md"
      style={{
        backgroundColor: notification.read ? 'transparent' : 'var(--mantine-color-blue-0)',
        borderColor: notification.read ? 'var(--mantine-color-gray-3)' : 'var(--mantine-color-blue-3)'
      }}
    >
      <Group align="flex-start" gap="md">
        <ThemeIcon
          size="lg"
          radius="xl"
          variant="light"
          color={config.color}
        >
          <IconComponent size={16} />
        </ThemeIcon>
        
        <div style={{ flex: 1 }}>
          <Group justify="space-between" align="flex-start" mb="xs">
            <Text fw={500} size="sm" lineClamp={1}>
              {notification.title}
            </Text>
            <Group gap="xs">
              {!notification.read && (
                <Badge size="xs" color="blue" variant="filled">
                  New
                </Badge>
              )}
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                onClick={() => onDismiss(notification.id)}
              >
                <IconX size={12} />
              </ActionIcon>
            </Group>
          </Group>
          
          <Text size="sm" c="dimmed" mb="xs">
            {notification.message}
          </Text>
          
          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">
              {notification.timestamp.toLocaleTimeString()}
            </Text>
            
            {notification.actionUrl && notification.actionLabel && (
              <Button
                size="xs"
                variant="light"
                onClick={handleActionClick}
              >
                {notification.actionLabel}
              </Button>
            )}
          </Group>
        </div>
      </Group>
    </Paper>
  );
}

export function NotificationCenter({ 
  notifications, 
  onDismiss, 
  onMarkAsRead, 
  onClearAll,
  onActionClick 
}: NotificationCenterProps) {
  const [opened, setOpened] = useState(false);
  const { activeSessions, cancelExecution } = useExecutionManager();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const totalNotifications = unreadCount + activeSessions.length;

  const handleClearAll = () => {
    onClearAll();
    setOpened(false);
  };

  return (
    <>
      <Indicator 
        inline 
        label={totalNotifications} 
        size={16} 
        disabled={totalNotifications === 0}
        color="red"
      >
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={() => setOpened(true)}
          style={{
            color: totalNotifications > 0 ? BRAND.colors.primary : undefined
          }}
        >
          <IconBell size={20} />
        </ActionIcon>
      </Indicator>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <Group justify="space-between" w="100%">
            <Title order={4}>Notifications</Title>
            {(notifications.length > 0 || activeSessions.length > 0) && (
              <Button
                variant="subtle"
                size="xs"
                onClick={handleClearAll}
              >
                Clear All
              </Button>
            )}
          </Group>
        }
        position="right"
        size="lg"
        padding="md"
      >
        <ScrollArea style={{ height: 'calc(100vh - 120px)' }}>
          <Stack gap="md">
            {/* Active Agent Executions */}
            {activeSessions.length > 0 && (
              <>
                <Group justify="space-between">
                  <Text fw={500} c={BRAND.colors.agents.alex}>
                    Active AI Operations
                  </Text>
                  <Badge color="blue" variant="light">
                    {activeSessions.length}/2
                  </Badge>
                </Group>
                
                {activeSessions.map(session => (
                  <AgentWorkingIndicator
                    key={session.id}
                    state={{
                      id: session.id,
                      agent: session.agent,
                      status: 'analyzing', // Default status
                      progress: session.progress,
                      current_task: session.current_task
                    } as AgentExecutionState}
                    onCancel={() => cancelExecution(session.id)}
                    compact
                  />
                ))}
                
                {activeSessions.length > 0 && notifications.length > 0 && (
                  <Divider />
                )}
              </>
            )}

            {/* Regular Notifications */}
            {notifications.length > 0 ? (
              <>
                <Group justify="space-between">
                  <Text fw={500}>Recent Notifications</Text>
                  <Badge color="gray" variant="light">
                    {unreadCount} unread
                  </Badge>
                </Group>
                
                {notifications
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onDismiss={onDismiss}
                      onMarkAsRead={onMarkAsRead}
                      onActionClick={onActionClick}
                    />
                  ))
                }
              </>
            ) : activeSessions.length === 0 ? (
              <Paper p="xl" radius="md" style={{ textAlign: 'center' }}>
                <ThemeIcon
                  size="xl"
                  radius="xl"
                  variant="light"
                  color="gray"
                  mx="auto"
                  mb="md"
                >
                  <IconBell size={24} />
                </ThemeIcon>
                <Text c="dimmed">No notifications</Text>                <Text size="sm" c="dimmed">
                  You&apos;re all caught up!
                </Text>
              </Paper>
            ) : null}
          </Stack>
        </ScrollArea>
      </Drawer>
    </>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    markAsRead,
    clearAll
  };
}
