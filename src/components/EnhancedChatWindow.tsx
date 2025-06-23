'use client';

import { useState, useRef, useEffect } from 'react';
import { Paper, Text, ScrollArea, TextInput, Avatar, Group, Stack, ActionIcon, Tooltip, Button } from '@mantine/core';
import { IconSend, IconMinus, IconX } from '@tabler/icons-react';
import { AlexCostBreakdown, RexLeadDashboard, LexiOnboarding, UpgradePrompt, SystemMessage } from '@/components/ui/AgentComponents';
import { 
  CostBreakdownChart, 
  LeadDistributionChart, 
  TimelineChart
} from '@/components/ui/Charts';
import { BRAND } from '@/lib/brand';

export type AgentType = 'lexi' | 'alex' | 'rex';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  agentType?: AgentType;
  ui_assets?: {
    type: string;
    data: Record<string, unknown>;
    render_hints?: {
      component: string;
      priority: 'high' | 'medium' | 'low';
      interactive: boolean;
    };
  };
  actions?: Array<{
    type: string;
    label: string;
    style: 'primary' | 'secondary' | 'outline';
  }>;
}

export interface ChatWindowProps {
  agentType: AgentType;
  isMinimized?: boolean;
  onMinimize: () => void;
  onClose: () => void;
  onSendMessage: (message: string, agentType: AgentType) => void;
  messages: Message[];
  isTyping?: boolean;
}

const AGENT_CONFIG = {
  lexi: {
    name: 'Lexi the Liaison',
    color: BRAND.colors.primary,
    avatar: '👩‍💼',
    description: 'Onboarding Guide',
  },
  alex: {
    name: 'Alex the Assessor',
    color: BRAND.colors.secondary,
    avatar: '📊',
    description: 'Bidding Assistant',
  },
  rex: {
    name: 'Rex the Retriever',
    color: BRAND.colors.accent,
    avatar: '🔍',
    description: 'Lead Generator',
  },
  system: {
    name: 'System',
    color: BRAND.colors.gray,
    avatar: '⚙️',
    description: 'System Notification',
 },
};

function GenerativeUIRenderer({ message }: { message: Message }) {
  const { ui_assets, actions } = message;

  if (!ui_assets) return null;

  const renderComponent = () => {
    switch (ui_assets.type) {
      case 'cost_breakdown':
        return (
          <AlexCostBreakdown 
            data={ui_assets.data as Parameters<typeof AlexCostBreakdown>[0]['data']} 
            actions={actions || []}
          />
        );
      
      case 'lead_dashboard':
        return (
          <RexLeadDashboard 
            data={ui_assets.data as Parameters<typeof RexLeadDashboard>[0]['data']} 
            actions={actions || []}
          />
        );
      
      case 'onboarding_progress':
        return (
          <LexiOnboarding 
            data={ui_assets.data as Parameters<typeof LexiOnboarding>[0]['data']} 
            actions={actions || []}
          />
        );      case 'upgrade_prompt':
        return (
          <UpgradePrompt 
            data={ui_assets.data as Parameters<typeof UpgradePrompt>[0]['data']}
          />
        );      case 'system_message':
        return (
          <SystemMessage 
            message={ui_assets.data.message as string}
            icon={ui_assets.data.icon as React.ElementType}
          />
        );      case 'cost_breakdown_chart':
        return (
          <CostBreakdownChart 
            {...(ui_assets.data as unknown as React.ComponentProps<typeof CostBreakdownChart>)}
          />
        );

      case 'lead_distribution_chart':
        return (
          <LeadDistributionChart 
            {...(ui_assets.data as unknown as React.ComponentProps<typeof LeadDistributionChart>)}
          />
        );

      case 'timeline_chart':
        return (
          <TimelineChart 
            {...(ui_assets.data as unknown as React.ComponentProps<typeof TimelineChart>)}
          />
        );
      
      default:
        return <div />; // Fallback for unknown types
    }
  };

  return (
    <Stack my="md">
        {renderComponent()}
        {actions && actions.length > 0 && (
            <Group mt="sm">
                {actions.map((action, i) => <Button key={i} variant={action.style || 'filled'}>{action.label}</Button>)}
            </Group>
        )}
    </Stack>
  );
}

export function ChatWindow({ 
    agentType, 
    isMinimized, 
    onMinimize, 
    onClose, 
    onSendMessage, 
    messages, 
    isTyping 
}: ChatWindowProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const config = AGENT_CONFIG[agentType];

  const handleLocalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue, agentType);
    setInputValue('');
  };

  useEffect(() => {
    // Scroll to bottom on new message
    if (viewport.current) {
      viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Paper 
        shadow="xl" 
        radius="lg" 
        withBorder 
        style={{
            height: isMinimized ? 'auto' : '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}
    >
      <Group justify="space-between" p="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', background: 'var(--mantine-color-gray-0)' }}>
        <Group>
          <Avatar size="md" color={config.color} style={{ color: 'white' }}>{config.avatar}</Avatar>
          <div>
            <Text fw={700}>{config.name}</Text>
            <Text size="xs" c="dimmed">{config.description}</Text>
          </div>
        </Group>
        <Group>
            <Tooltip label={isMinimized ? 'Expand' : 'Minimize'}>
                <ActionIcon variant="subtle" onClick={onMinimize}><IconMinus /></ActionIcon>
            </Tooltip>
            <Tooltip label="Close Chat">
                <ActionIcon variant="subtle" color="red" onClick={onClose}><IconX /></ActionIcon>
            </Tooltip>
        </Group>
      </Group>

      {!isMinimized && (
        <>
          <ScrollArea style={{ flex: 1 }} p="md" viewportRef={viewport}>
            <Stack gap="lg">
              {messages.map((message) => {
                const msgConfig = message.agentType ? AGENT_CONFIG[message.agentType] : AGENT_CONFIG.lexi; // Default to lexi for user/system
                const isUser = message.role === 'user';
                const isSystem = message.role === 'system';

                if (isSystem) {
                    return <SystemMessage key={message.id} message={message.content} />
                }

                return (
                  <Group key={message.id} gap="md" align="flex-start" wrap="nowrap">
                    {!isUser && (
                      <Avatar size="sm" color={msgConfig.color} style={{ color: 'white' }}>
                        {msgConfig.avatar}
                      </Avatar>
                    )}
                    <Paper 
                        p="md" 
                        radius="lg" 
                        withBorder
                        style={{
                            backgroundColor: isUser ? 'var(--mantine-color-blue-light)' : 'var(--mantine-color-gray-1)',
                            maxWidth: '85%',
                        }}
                    >
                      <Text size="sm">{message.content}</Text>
                      <GenerativeUIRenderer message={message} />
                    </Paper>
                    {isUser && (
                      <Avatar size="sm" color="gray">
                        U
                      </Avatar>
                    )}
                  </Group>
                );
              })}
              {isTyping && (
                <Group gap="md" align="flex-start" wrap="nowrap">
                    <Avatar size="sm" color={config.color} style={{ color: 'white' }}>{config.avatar}</Avatar>
                    <Text size="sm" c="dimmed">{config.name} is typing...</Text>
                </Group>
              )}
            </Stack>
          </ScrollArea>

          <Paper p="sm" withBorder style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
            <form onSubmit={handleLocalSubmit}>
                <TextInput
                    value={inputValue}
                    onChange={(event) => setInputValue(event.currentTarget.value)}
                    placeholder={`Message @${agentType}...`}
                    rightSection={
                        <ActionIcon type="submit" variant="filled" color={BRAND.colors.primary} radius="xl">
                            <IconSend size={16} />
                        </ActionIcon>
                    }
                />
            </form>
          </Paper>
        </>
      )}
    </Paper>
  );
}
