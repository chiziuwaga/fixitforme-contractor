'use client';

import { useState, useEffect } from 'react';
import { Paper, Group, Text, Progress, Button, Avatar, ThemeIcon, Stack, rem } from '@mantine/core';
import { IconX, IconClock, IconSearch, IconCalculator } from '@tabler/icons-react';
import { BRAND } from '@/lib/brand';

export interface AgentExecutionState {
  id: string;
  agent: 'alex' | 'rex';
  status: 'analyzing' | 'calculating' | 'researching' | 'searching' | 'filtering' | 'categorizing' | 'finalizing';
  progress: number; // 0-100
  current_task: string;
  estimated_time?: string;
  sources_checked?: string[];
  leads_found?: number;
  quality_score?: number;
}

interface AgentWorkingIndicatorProps {
  state: AgentExecutionState;
  onCancel?: () => void;
  compact?: boolean;
  className?: string;
}

const agentConfig = {
  alex: {
    name: 'Alex the Assessor',
    color: BRAND.colors.agents.alex,
    icon: IconCalculator,
    avatar: '👨‍💼',
    description: 'Analyzing project requirements and costs'
  },
  rex: {
    name: 'Rex the Retriever',
    color: BRAND.colors.agents.rex,
    icon: IconSearch,
    avatar: '🔍',
    description: 'Searching for qualified leads'
  }
};

const statusMessages: Record<'alex' | 'rex', Record<string, string>> = {
  alex: {
    analyzing: "Analyzing project requirements and scope...",
    researching: "Researching current material costs...", 
    calculating: "Calculating labor and overhead estimates...",
    finalizing: "Finalizing cost breakdown and timeline..."
  },
  rex: {
    searching: "Searching multiple lead sources...",
    filtering: "Filtering spam and low-quality posts...", 
    analyzing: "Analyzing lead quality and budget fit...",
    categorizing: "Categorizing leads with Felix framework..."
  }
};

export function AgentWorkingIndicator({ state, onCancel, compact = false, className }: AgentWorkingIndicatorProps) {
  const [elapsed, setElapsed] = useState(0);
  const agent = agentConfig[state.agent];
  const IconComponent = agent.icon;

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <Paper 
        p="sm" 
        radius="md" 
        withBorder 
        className={`agent-working ${className}`}
        style={{ 
          background: `linear-gradient(135deg, ${agent.color}15, ${agent.color}08)`,
          borderColor: `${agent.color}40`
        }}
      >
        <Group gap="sm">
          <ThemeIcon 
            size="lg" 
            radius="xl" 
            variant="light" 
            color={agent.color}
            className="pulse-working"
          >
            <IconComponent size={16} />
          </ThemeIcon>
          
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500} c={agent.color}>
              {agent.name} is working...
            </Text>
            <Progress 
              value={state.progress} 
              size="xs" 
              color={agent.color}
              animated
              className="progress-bar-animated"
            />
          </div>
          
          <Text size="xs" c="dimmed">
            {state.progress}%
          </Text>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper 
      p="lg" 
      radius="lg" 
      withBorder 
      shadow="md"
      className={`agent-working ${className}`}
      style={{ 
        background: `linear-gradient(135deg, ${agent.color}10, ${agent.color}05)`,
        borderColor: `${agent.color}30`
      }}
    >
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Group gap="md">
            <Avatar 
              size="lg" 
              radius="xl"
              style={{ 
                background: `linear-gradient(135deg, ${agent.color}, ${agent.color}dd)`,
                fontSize: rem(24)
              }}
              className="pulse-working"
            >
              {agent.avatar}
            </Avatar>
            
            <div>
              <Text fw={600} size="lg" c={agent.color}>
                {agent.name}
              </Text>
              <Text size="sm" c="dimmed">
                {agent.description}
              </Text>
            </div>
          </Group>

          {onCancel && (
            <Button 
              variant="subtle" 
              size="sm" 
              color="gray"
              leftSection={<IconX size={14} />}
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </Group>

        {/* Progress */}
        <div>
          <Group justify="space-between" mb="xs">            <Text size="sm" fw={500}>
              {statusMessages[state.agent][state.status] || state.current_task}
            </Text>
            <Text size="sm" c="dimmed">
              {state.progress}%
            </Text>
          </Group>
          
          <Progress 
            value={state.progress} 
            size="lg" 
            color={agent.color}
            animated
            className="progress-bar-animated"
          />
        </div>

        {/* Details */}
        <Group justify="space-between">
          <Group gap="md">
            <Group gap="xs">
              <IconClock size={14} />
              <Text size="xs" c="dimmed">
                {formatElapsed(elapsed)}
              </Text>
            </Group>
            
            {state.estimated_time && (
              <Text size="xs" c="dimmed">
                Est. {state.estimated_time}
              </Text>
            )}
          </Group>

          {/* Agent-specific metrics */}
          {state.agent === 'rex' && (
            <Group gap="md">
              {state.leads_found !== undefined && (
                <Text size="xs" c="dimmed">
                  {state.leads_found} leads found
                </Text>
              )}
              {state.sources_checked && (
                <Text size="xs" c="dimmed">
                  {state.sources_checked.length} sources checked
                </Text>
              )}
            </Group>
          )}
        </Group>
      </Stack>
    </Paper>
  );
}

// CSS to be added to global styles
const agentWorkingStyles = `
.agent-working {
  animation: pulse-working 2s ease-in-out infinite;
}

@keyframes pulse-working {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1); 
  }
  50% { 
    opacity: 0.95; 
    transform: scale(1.02); 
  }
}

.progress-bar-animated .mantine-Progress-bar {
  background: linear-gradient(90deg, 
    var(--mantine-color-blue-6) 0%, 
    var(--mantine-color-cyan-5) 50%, 
    var(--mantine-color-blue-6) 100%
  );
  background-size: 200px 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}

.pulse-working {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(30, 64, 175, 0.4);
  }
  50% { 
    box-shadow: 0 0 0 8px rgba(30, 64, 175, 0);
  }
}
`;

export { agentWorkingStyles };
