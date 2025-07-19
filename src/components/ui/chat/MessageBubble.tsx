'use client';

import { memo } from 'react';
import { Message, AgentType, AGENT_CONFIG } from '../UnifiedChatInterface';
import { cn } from '@/lib/utils';
import { Bot, User, Loader2 } from 'lucide-react';
import { AlexCostBreakdown, RexLeadDashboard, LexiOnboarding } from '@/components/ui/AgentComponents';

interface MessageBubbleProps {
  message: Message;
  isLoading: boolean;
}

const renderUIAssets = (message: Message) => {
    if (!message.ui_assets) return null;

    const { type, data } = message.ui_assets;

    // Use sophisticated existing components for proper UI asset rendering
    switch (type) {
      case 'alex_cost_breakdown':
      case 'alex_timeline_chart':
      case 'alex_material_calculator':
      case 'alex_competitive_analysis':
        // Use the sophisticated AlexCostBreakdown component
        try {
          return <AlexCostBreakdown data={data as {
            project_title: string;
            total_estimate: number;
            confidence_level: 'high' | 'medium' | 'low';
            breakdown: {
              labor: number;
              materials: number;
              permits: number;
              overhead: number;
              profit: number;
            };
            timeline: {
              start: string;
              end: string;
              duration: string;
            };
            risk_factors: string[];
            materials_list?: Array<{
              category: string;
              items: Array<{
                name: string;
                quantity: number;
                unit_cost: number;
                supplier: string;
              }>;
            }>;
          }} />;
        } catch (error) {
          console.warn('Error rendering Alex component:', error);
          return (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-green-600 rounded text-white text-xs flex items-center justify-center">💰</div>
                <span className="font-medium text-green-600">Cost Analysis</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Cost analysis data available
              </div>
            </div>
          );
        }
      
      case 'rex_lead_dashboard':
        // Use the sophisticated RexLeadDashboard component
        try {
          return <RexLeadDashboard data={data as {
            summary: {
              total_leads: number;
              qualified_leads: number;
              conversion_rate: number;
              average_lead_value: number;
              total_pipeline_value: number;
              search_sessions_used: number;
              search_sessions_remaining: number;
            };
            geographic_breakdown: Array<{
              area: string;
              count: number;
              avgValue: number;
              competition: 'low' | 'medium' | 'high';
            }>;
            trending_problems: Array<{
              felix_id: number;
              name: string;
              growth: string;
              season: string;
            }>;
            source_performance: Array<{
              source: string;
              leads: number;
              quality_score: number;
              conversion_rate: number;
            }>;
          }} />;
        } catch (error) {
          console.warn('Error rendering Rex component:', error);
          return (
            <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-secondary rounded text-white text-xs flex items-center justify-center">🔍</div>
                <span className="font-medium text-secondary">Lead Dashboard</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Lead research data available
              </div>
            </div>
          );
        }
      
      case 'lexi_onboarding':
        // Use the sophisticated LexiOnboarding component
        try {
          return <LexiOnboarding data={data as {
            overall_progress: number;
            current_step: string;
            steps_completed: string[];
            felix_services: {
              selected: number[];
              recommended: number[];
              categories: Array<{
                id: number;
                name: string;
                difficulty: string;
                avg_value: number;
              }>;
              tier_limit: number;
            };
            profile_score: number;
            estimated_time_remaining: number;
            benefits_unlocked: string[];
          }} />;
        } catch (error) {
          console.warn('Error rendering Lexi component:', error);
          return (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-primary rounded text-white text-xs flex items-center justify-center">💫</div>
                <span className="font-medium text-primary">Onboarding Guide</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Onboarding guidance available
              </div>
            </div>
          );
        }
      
      case 'upgrade_prompt':
        return (
          <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-primary rounded text-white text-xs flex items-center justify-center">⚡</div>
              <span className="font-medium text-primary">Upgrade Available</span>
            </div>
            <div className="text-sm">
              Unlock advanced features with Scale tier
            </div>
          </div>
        );
      
      case 'system_message':
        return (
          <div className="p-3 bg-muted/50 rounded border text-sm">
            <p className="text-muted-foreground">
              {typeof data === 'object' && data && 'message' in data 
                ? String(data.message) 
                : 'System message'}
            </p>
          </div>
        );
      
      default:
        return (
          <div className="p-3 bg-muted/50 rounded border text-sm">
            <p className="text-muted-foreground">
              Unknown component type: {type}
            </p>
          </div>
        );
    }
};

export const MessageBubble = memo(function MessageBubble({ message, isLoading }: MessageBubbleProps) {
  const { role, content, timestamp, agentType, ui_assets } = message;
  const isUser = role === 'user';
  const agentConfig = agentType ? AGENT_CONFIG[agentType] : null;

  return (
    <div className={cn("flex items-start gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white",
          agentConfig ? agentConfig.color : "bg-gray-500"
        )}>
          {agentConfig ? agentConfig.avatar : <Bot size={20} />}
        </div>
      )}

      <div className={cn(
        "max-w-[85%] rounded-2xl p-3.5",
        isUser ? "bg-primary text-primary-foreground" : "bg-card border"
      )}>
        <div className="whitespace-pre-wrap text-sm">{content}</div>
        
        {ui_assets && (
            <div className="mt-3 border-t pt-3">
                {renderUIAssets(message)}
            </div>
        )}

        {isLoading && role === 'assistant' && (
            <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
            </div>
        )}

        <div className={cn(
          "text-xs mt-2",
          isUser ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
          <User size={20} />
        </div>
      )}
    </div>
  );
});
