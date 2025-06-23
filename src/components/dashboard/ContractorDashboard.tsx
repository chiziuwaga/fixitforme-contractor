'use client';

import { useState } from 'react';
import {
  AppShell,
  Burger,
  Group,
  Text,
  NavLink,
  Badge,
  Avatar,
  Menu,
  ActionIcon,
  Flex,
  Stack,
  Card,
  Grid,
  Title,
  Button,
  Container
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconDashboard,
  IconUser,
  IconFileText,
  IconBell,
  IconSettings,
  IconLogout,
  IconChevronDown,
  IconPlus,
  IconMessage
} from '@tabler/icons-react';
import { EnhancedChatManager } from '@/components/chat/EnhancedChatManager';
import LeadFeed from '@/components/dashboard/LeadFeed';
import QuickStats from '@/components/dashboard/QuickStats';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function ContractorDashboard({ children }: DashboardLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [chatManagerOpen, setChatManagerOpen] = useState(true);
  // Mock contractor data - replace with actual data fetching
  const contractor = {
    id: 'mock-contractor-id',
    name: 'John Smith',
    tier: 'Growth',
    avatar: null,
    unreadNotifications: 3
  };

  const navigationItems = [
    { 
      icon: IconDashboard, 
      label: 'Dashboard', 
      value: 'dashboard',
      description: 'Overview and metrics'
    },
    { 
      icon: IconFileText, 
      label: 'My Bids', 
      value: 'bids',
      description: 'Active and past proposals',
      badge: '5'
    },
    { 
      icon: IconUser, 
      label: 'Profile', 
      value: 'profile',
      description: 'Business information'
    },
    { 
      icon: IconSettings, 
      label: 'Settings', 
      value: 'settings',
      description: 'Account preferences'
    }
  ];

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <Stack gap="lg">
            <Group justify="space-between">
              <div>
                <Title order={1}>Dashboard</Title>
                <Text c="dimmed">Welcome back, {contractor.name}!</Text>
              </div>
              <Button 
                leftSection={<IconPlus size={16} />}
                onClick={() => setChatManagerOpen(true)}
              >
                New Chat
              </Button>
            </Group>
              <QuickStats contractorId={contractor.id} />
            
            <Grid>
              <Grid.Col span={8}>
                <LeadFeed contractorId={contractor.id} />
              </Grid.Col>
              <Grid.Col span={4}>
                <Card withBorder>
                  <Card.Section p="md" withBorder>
                    <Group justify="space-between">
                      <Text fw={600}>Recent Activity</Text>
                      <Badge variant="light" color="blue">Live</Badge>
                    </Group>
                  </Card.Section>
                  <Card.Section p="md">
                    <Stack gap="sm">
                      <Text size="sm">
                        📊 Alex analyzed 3 bids today
                      </Text>
                      <Text size="sm">
                        🔍 Rex found 12 new leads
                      </Text>
                      <Text size="sm">
                        🎯 Profile 85% complete
                      </Text>
                    </Stack>
                  </Card.Section>
                </Card>
              </Grid.Col>
            </Grid>
          </Stack>
        );
      case 'bids':
        return (
          <Stack gap="lg">
            <Title order={1}>My Bids</Title>
            <Text c="dimmed" ta="center" py="xl">
              Bid management interface will be implemented here
            </Text>
          </Stack>
        );
      case 'profile':
        return (
          <Stack gap="lg">
            <Title order={1}>Profile</Title>
            <Text c="dimmed" ta="center" py="xl">
              Profile management interface will be implemented here
            </Text>
          </Stack>
        );
      case 'settings':
        return (
          <Stack gap="lg">
            <Title order={1}>Settings</Title>
            <Text c="dimmed" ta="center" py="xl">
              Settings interface will be implemented here
            </Text>
          </Stack>
        );
      default:
        return children;
    }
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Text size="lg" fw={700} c="blue">
              FixItForMe
            </Text>
            <Badge variant="outline" color="blue" size="sm">
              Contractor
            </Badge>
          </Group>

          <Group>
            <ActionIcon variant="light" color="blue" size="lg">
              <IconBell size={18} />
              {contractor.unreadNotifications > 0 && (
                <Badge
                  size="xs"
                  variant="filled"
                  color="red"
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    minWidth: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {contractor.unreadNotifications}
                </Badge>
              )}
            </ActionIcon>

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Group style={{ cursor: 'pointer' }}>
                  <Avatar size="sm" />
                  <div>
                    <Text size="sm" fw={500}>{contractor.name}</Text>
                    <Text size="xs" c="dimmed">{contractor.tier} Tier</Text>
                  </div>
                  <IconChevronDown size={14} />
                </Group>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item leftSection={<IconUser size={14} />}>
                  Profile
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={14} />}>
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconLogout size={14} />} color="red">
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="sm">
            Navigation
          </Text>
          {navigationItems.map((item) => (
            <NavLink
              key={item.value}
              active={activeSection === item.value}
              label={item.label}
              description={item.description}
              leftSection={<item.icon size="1rem" />}
              rightSection={
                item.badge ? (
                  <Badge size="xs" variant="filled" color="red">
                    {item.badge}
                  </Badge>
                ) : null
              }
              onClick={() => setActiveSection(item.value)}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl">
          {/* Chat-centric layout: 70% chat, 30% content */}
          <Grid gutter="lg">
            <Grid.Col span={chatManagerOpen ? 8 : 12}>
              {renderMainContent()}
            </Grid.Col>
            
            {chatManagerOpen && (
              <Grid.Col span={4}>
                <Card withBorder h="calc(100vh - 120px)" style={{ position: 'sticky', top: 20 }}>
                  <Card.Section p="sm" withBorder>
                    <Group justify="space-between">
                      <Group>
                        <IconMessage size={16} />
                        <Text fw={600} size="sm">AI Assistants</Text>
                      </Group>
                      <ActionIcon 
                        variant="subtle" 
                        size="sm"
                        onClick={() => setChatManagerOpen(false)}
                      >
                        ×
                      </ActionIcon>
                    </Group>
                  </Card.Section>
                  
                  <Card.Section style={{ flex: 1, overflow: 'hidden' }}>
                    <EnhancedChatManager />
                  </Card.Section>
                </Card>
              </Grid.Col>
            )}
          </Grid>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
