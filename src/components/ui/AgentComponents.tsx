'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BRAND } from '@/lib/brand';
import { useAgentUI, type AgentAction } from '@/hooks/useAgentUI';

// Alex Cost Breakdown Component
interface AlexCostBreakdownProps {
  data: Record<string, unknown>;
  actions?: AgentAction[];
}

export function AlexCostBreakdown({ data, actions }: AlexCostBreakdownProps) {
  const { executeAction } = useAgentUI();

  const handleActionClick = async (actionType: string) => {
    await executeAction('alex-cost-breakdown', actionType, data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Breakdown Analysis</CardTitle>
        <CardDescription>Alex&apos;s detailed project cost assessment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            Alex Cost Breakdown Component
            {data && <pre className="text-xs mt-4">{JSON.stringify(data, null, 2)}</pre>}
          </div>
          {actions && (
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <Button 
                  key={index} 
                  variant={action.style === 'primary' ? 'default' : 'outline'}
                  onClick={() => handleActionClick(action.type)}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Rex Lead Dashboard Component
interface RexLeadDashboardProps {
  data: Record<string, unknown>;
  actions?: AgentAction[];
}

export function RexLeadDashboard({ data, actions }: RexLeadDashboardProps) {
  const { executeAction } = useAgentUI();

  const handleActionClick = async (actionType: string) => {
    await executeAction('rex-lead-dashboard', actionType, data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Generation Dashboard</CardTitle>
        <CardDescription>Rex&apos;s market intelligence and lead analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            Rex Lead Dashboard Component
            {data && <pre className="text-xs mt-4">{JSON.stringify(data, null, 2)}</pre>}
          </div>
          {actions && (
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <Button 
                  key={index} 
                  variant={action.style === 'primary' ? 'default' : 'outline'}
                  onClick={() => handleActionClick(action.type)}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Lexi Onboarding Component
interface LexiOnboardingProps {
  data: Record<string, unknown>;
  actions?: AgentAction[];
}

export function LexiOnboarding({ data, actions }: LexiOnboardingProps) {
  const { executeAction } = useAgentUI();

  const handleActionClick = async (actionType: string) => {
    await executeAction('lexi-onboarding', actionType, data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Onboarding Progress</CardTitle>
        <CardDescription>Lexi&apos;s guided setup assistance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            Lexi Onboarding Component
            {data && <pre className="text-xs mt-4">{JSON.stringify(data, null, 2)}</pre>}
          </div>
          {actions && (
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <Button 
                  key={index} 
                  variant={action.style === 'primary' ? 'default' : 'outline'}
                  onClick={() => handleActionClick(action.type)}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Upgrade Prompt Component
interface UpgradePromptProps {
  data: Record<string, unknown>;
  actions?: AgentAction[];
}

export function UpgradePrompt({ data, actions }: UpgradePromptProps) {
  const { handleUpgradeAction } = useAgentUI();

  const handleActionClick = async (actionType: string) => {
    await handleUpgradeAction(actionType);
  };

  return (
    <Alert>
      <AlertDescription>
        <div className="space-y-4">
          <div className="text-center py-4">
            <h3 className="font-semibold mb-2">Upgrade Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This feature is available on the Scale tier
            </p>
            {data && <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>}
          </div>
          {actions && (
            <div className="flex gap-2 justify-center">
              {actions.map((action, index) => (
                <Button 
                  key={index} 
                  variant={action.style === 'primary' ? 'default' : 'outline'}
                  style={action.style === 'primary' ? { backgroundColor: BRAND.colors.primary } : {}}
                  onClick={() => handleActionClick(action.type)}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// System Message Component
interface SystemMessageProps {
  message: string;
  data?: Record<string, unknown>;
  icon?: React.ElementType;
}

export function SystemMessage({ message, data, icon: Icon }: SystemMessageProps) {
  return (
    <Alert className="my-4">
      <AlertDescription>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" />}
            <p className="text-sm">{message}</p>
          </div>
          {data && <pre className="text-xs text-muted-foreground">{JSON.stringify(data, null, 2)}</pre>}
        </div>
      </AlertDescription>
    </Alert>
  );
}
