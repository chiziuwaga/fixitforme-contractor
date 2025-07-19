/**
 * Enhanced Generative UI System
 * 
 * Implements proactive UI injection and contextual interactive components
 * that respond intelligently to conversation context and contractor workflows.
 */

export type UIComponentTrigger = 'time_based' | 'context_change' | 'user_action' | 'proactive' | 'response';

export interface GenerativeUIComponent {
  id: string;
  type: string;
  trigger: UIComponentTrigger;
  priority: 'high' | 'medium' | 'low';
  context_requirements?: {
    agent?: string;
    conversation_type?: string;
    user_tier?: string;
    project_stage?: string;
  };
  data: Record<string, unknown>;
  interactive: boolean;
  actions?: Array<{
    label: string;
    handler: string;
    style: 'primary' | 'secondary' | 'outline';
    confirmation?: string;
  }>;
  auto_dismiss?: {
    after_seconds?: number;
    after_interaction?: boolean;
  };
}

export interface ProactiveUIMessage {
  id: string;
  agent: 'lexi' | 'alex' | 'rex';
  message: string;
  ui_component?: GenerativeUIComponent;
  timing: {
    delay_ms?: number;
    trigger_condition: string;
  };
  context_data: Record<string, unknown>;
}

/**
 * Manages proactive UI injection based on conversation context
 */
export class ProactiveUIManager {
  private static triggerCallbacks: Map<string, (data: unknown) => void> = new Map();

  /**
   * Registers a callback for handling specific UI component triggers
   */
  static registerTrigger(componentType: string, callback: (data: unknown) => void) {
    this.triggerCallbacks.set(componentType, callback);
  }

  /**
   * Analyzes conversation context and suggests proactive UI components
   */
  static analyzeForProactiveUI(context: {
    conversation_history: Array<{ role: string; content: string; timestamp: string }>;
    current_agent: string;
    user_tier: string;
    active_projects?: number;
    time_since_last_action?: number;
  }): ProactiveUIMessage[] {
    const suggestions: ProactiveUIMessage[] = [];

    // Alex: Cost optimization suggestions during bid discussions
    if (context.current_agent === 'alex' && this.detectCostDiscussion(context.conversation_history)) {
      suggestions.push(this.createCostOptimizationUI(context));
    }

    // Rex: Lead quality scoring after lead presentation
    if (context.current_agent === 'rex' && this.detectLeadPresentation(context.conversation_history)) {
      suggestions.push(this.createLeadScoringUI(context));
    }

    // Lexi: Productivity tips for idle users
    if (context.time_since_last_action && context.time_since_last_action > 300000) { // 5 minutes
      suggestions.push(this.createProductivityTipUI(context));
    }

    // Tier-specific proactive suggestions
    if (context.user_tier === 'growth' && context.active_projects && context.active_projects > 2) {
      suggestions.push(this.createScaleUpgradeUI(context));
    }

    return suggestions.filter(s => s !== null);
  }

  /**
   * Creates interactive cost optimization UI for Alex
   */
  private static createCostOptimizationUI(context: any): ProactiveUIMessage {
    return {
      id: `cost_optimization_${Date.now()}`,
      agent: 'alex',
      message: "I've analyzed the project requirements and found some potential cost optimizations. Let me show you a breakdown:",
      ui_component: {
        id: `cost_breakdown_${Date.now()}`,
        type: 'alex_cost_optimizer',
        trigger: 'proactive',
        priority: 'high',
        data: {
          original_estimate: this.extractCostFromHistory(context.conversation_history),
          optimizations: [
            {
              category: 'Materials',
              potential_savings: 350,
              confidence: 'high',
              suggestion: 'Alternative supplier with 15% better pricing'
            },
            {
              category: 'Labor',
              potential_savings: 200,
              confidence: 'medium', 
              suggestion: 'Optimize scheduling to reduce overtime'
            }
          ],
          interactive_adjustments: true
        },
        interactive: true,
        actions: [
          { label: 'Apply Optimizations', handler: 'apply_cost_optimizations', style: 'primary' },
          { label: 'Customize', handler: 'customize_optimizations', style: 'secondary' },
          { label: 'Explain More', handler: 'explain_optimizations', style: 'outline' }
        ]
      },
      timing: {
        delay_ms: 2000,
        trigger_condition: 'cost_discussion_detected'
      },
      context_data: context
    };
  }

  /**
   * Creates lead scoring and qualification UI for Rex
   */
  private static createLeadScoringUI(context: any): ProactiveUIMessage {
    return {
      id: `lead_scoring_${Date.now()}`,
      agent: 'rex',
      message: "I've scored this lead based on your preferences and market data. Here's my analysis:",
      ui_component: {
        id: `lead_score_${Date.now()}`,
        type: 'rex_lead_scorer',
        trigger: 'proactive',
        priority: 'high',
        data: {
          overall_score: 8.5,
          score_breakdown: {
            budget_fit: 9,
            timeline_realistic: 8,
            location_preference: 9,
            project_complexity: 7,
            client_history: 8
          },
          recommendation: 'High priority - pursue immediately',
          next_steps: [
            'Review project details with Alex',
            'Prepare initial cost estimate',
            'Schedule client consultation'
          ],
          competitive_analysis: {
            estimated_competitors: 3,
            market_rate: '$15,000 - $18,000',
            win_probability: '75%'
          }
        },
        interactive: true,
        actions: [
          { label: 'Start Bid Analysis', handler: 'start_bid_with_alex', style: 'primary' },
          { label: 'Save for Later', handler: 'save_lead', style: 'secondary' },
          { label: 'Get More Leads', handler: 'find_similar_leads', style: 'outline' }
        ]
      },
      timing: {
        delay_ms: 1500,
        trigger_condition: 'lead_presentation_completed'
      },
      context_data: context
    };
  }

  /**
   * Creates productivity tip UI for idle users
   */
  private static createProductivityTipUI(context: any): ProactiveUIMessage {
    return {
      id: `productivity_tip_${Date.now()}`,
      agent: 'lexi',
      message: "I noticed you might be taking a break. Here are some quick wins you could tackle:",
      ui_component: {
        id: `productivity_tips_${Date.now()}`,
        type: 'lexi_productivity_helper',
        trigger: 'time_based',
        priority: 'medium',
        data: {
          suggestions: [
            {
              title: 'Update Your Profile',
              description: 'Complete your service areas for better lead matching',
              time_estimate: '3 minutes',
              impact: 'Better lead quality'
            },
            {
              title: 'Review Pending Bids',
              description: 'Check if any quotes need follow-up',
              time_estimate: '5 minutes',
              impact: 'Higher conversion rates'
            },
            {
              title: 'Explore Scale Features',
              description: 'See how premium agents could help your business',
              time_estimate: '2 minutes',
              impact: 'Increased efficiency'
            }
          ]
        },
        interactive: true,
        actions: [
          { label: 'Quick Setup', handler: 'start_quick_setup', style: 'primary' },
          { label: 'Review Bids', handler: 'show_pending_bids', style: 'secondary' },
          { label: 'Maybe Later', handler: 'dismiss_productivity_tips', style: 'outline' }
        ],
        auto_dismiss: {
          after_seconds: 30,
          after_interaction: true
        }
      },
      timing: {
        delay_ms: 0,
        trigger_condition: 'user_idle'
      },
      context_data: context
    };
  }

  /**
   * Creates Scale tier upgrade suggestion UI
   */
  private static createScaleUpgradeUI(context: any): ProactiveUIMessage {
    return {
      id: `scale_upgrade_${Date.now()}`,
      agent: 'lexi',
      message: "I see you're managing multiple projects! Scale tier could really streamline your workflow:",
      ui_component: {
        id: `scale_benefits_${Date.now()}`,
        type: 'lexi_scale_upgrade',
        trigger: 'context_change',
        priority: 'medium',
        data: {
          current_limitations: [
            'Managing multiple bids manually',
            'Limited daily AI interactions',
            'No advanced analytics'
          ],
          scale_benefits: [
            'Unlimited Alex cost analysis',
            'Rex lead automation',
            'Advanced project tracking',
            'Priority support'
          ],
          roi_estimate: {
            time_saved_per_week: '8 hours',
            additional_bids_per_month: '3-5',
            estimated_revenue_increase: '$2,400/month'
          }
        },
        interactive: true,
        actions: [
          { label: 'Start 7-Day Trial', handler: 'start_scale_trial', style: 'primary' },
          { label: 'Learn More', handler: 'show_scale_details', style: 'secondary' },
          { label: 'Not Now', handler: 'dismiss_upgrade', style: 'outline' }
        ]
      },
      timing: {
        delay_ms: 3000,
        trigger_condition: 'high_project_volume'
      },
      context_data: context
    };
  }

  // Helper methods for context detection
  private static detectCostDiscussion(history: Array<{ content: string }>): boolean {
    const recentMessages = history.slice(-5);
    const costKeywords = ['cost', 'price', 'estimate', 'budget', 'quote', 'material', 'labor'];
    
    return recentMessages.some(msg => 
      costKeywords.some(keyword => 
        msg.content.toLowerCase().includes(keyword)
      )
    );
  }

  private static detectLeadPresentation(history: Array<{ content: string }>): boolean {
    const recentMessages = history.slice(-3);
    const leadKeywords = ['lead', 'project', 'client', 'opportunity', 'found'];
    
    return recentMessages.some(msg => 
      leadKeywords.some(keyword => 
        msg.content.toLowerCase().includes(keyword)
      )
    );
  }

  private static extractCostFromHistory(history: Array<{ content: string }>): number {
    // Simple extraction - in real implementation would use more sophisticated parsing
    for (const msg of history.slice(-5)) {
      const match = msg.content.match(/\$([0-9,]+)/);
      if (match) {
        return parseInt(match[1].replace(',', ''));
      }
    }
    return 5000; // Default estimate
  }
}

/**
 * React hook for integrating proactive UI into chat components
 */
export function useProactiveUI(context: {
  conversation_history: Array<{ role: string; content: string; timestamp: string }>;
  current_agent: string;
  user_tier: string;
}) {
  const [pendingUIComponents, setPendingUIComponents] = React.useState<ProactiveUIMessage[]>([]);

  React.useEffect(() => {
    const checkForProactiveUI = () => {
      const suggestions = ProactiveUIManager.analyzeForProactiveUI({
        ...context,
        time_since_last_action: Date.now() - (localStorage.getItem('last_action_timestamp') ? parseInt(localStorage.getItem('last_action_timestamp')!) : Date.now())
      });

      if (suggestions.length > 0) {
        setPendingUIComponents(prev => [...prev, ...suggestions]);
      }
    };

    // Check periodically for proactive suggestions
    const interval = setInterval(checkForProactiveUI, 10000); // Every 10 seconds
    
    // Check immediately on context change
    checkForProactiveUI();

    return () => clearInterval(interval);
  }, [context.conversation_history.length, context.current_agent]);

  const dismissProactiveUI = (componentId: string) => {
    setPendingUIComponents(prev => prev.filter(ui => ui.id !== componentId));
  };

  return {
    pendingUIComponents,
    dismissProactiveUI
  };
}

// React import for TypeScript
import React from 'react';
