/**
 * Advanced Agent Orchestration System
 * Implements "@" mention protocol with intelligent routing and context management
 */

import { AgentType } from '@/components/EnhancedChatWindow';

export interface OrchestrationContext {
  currentAgent?: AgentType;
  activeChats: AgentType[];
  userMessage: string;
  conversationHistory: Array<{
    agent: AgentType;
    message: string;
    timestamp: Date;
  }>;
  contractorProfile?: {
    services: number[];
    location: string;
    tier: 'growth' | 'scale';
  };
}

export interface OrchestrationResult {
  targetAgent: AgentType;
  reason: string;
  shouldOpenNewChat: boolean;
  preprocessedMessage: string;
  context: string;
}

export class LexiOrchestrator {
  private static instance: LexiOrchestrator;
  
  static getInstance(): LexiOrchestrator {
    if (!LexiOrchestrator.instance) {
      LexiOrchestrator.instance = new LexiOrchestrator();
    }
    return LexiOrchestrator.instance;
  }

  /**
   * Main orchestration method - analyzes user input and routes to appropriate agent
   */
  orchestrate(context: OrchestrationContext): OrchestrationResult {
    const { userMessage, currentAgent, activeChats, conversationHistory } = context;

    // 1. Check for explicit @ mentions first
    const explicitMention = this.parseExplicitMention(userMessage);
    if (explicitMention) {
      return {
        targetAgent: explicitMention.agent,
        reason: `Explicit @${explicitMention.agent} mention detected`,
        shouldOpenNewChat: !activeChats.includes(explicitMention.agent),
        preprocessedMessage: explicitMention.cleanMessage,
        context: `User explicitly requested ${explicitMention.agent}`,
      };
    }

    // 2. Analyze message content for intelligent routing
    const intentAnalysis = this.analyzeIntent(userMessage);
    
    // 3. Apply context-aware routing logic
    const routingDecision = this.makeRoutingDecision(intentAnalysis, context);

    return routingDecision;
  }

  /**
   * Parse explicit @ mentions from user message
   */
  private parseExplicitMention(message: string): { agent: AgentType; cleanMessage: string } | null {
    const mentionPattern = /@(lexi|alex|rex)\b/i;
    const match = message.match(mentionPattern);
    
    if (match) {
      const agent = match[1].toLowerCase() as AgentType;
      const cleanMessage = message.replace(mentionPattern, '').trim();
      
      return { agent, cleanMessage };
    }
    
    return null;
  }

  /**
   * Analyze user message intent using keyword analysis and NLP patterns
   */
  private analyzeIntent(message: string): {
    primaryIntent: 'onboarding' | 'bidding' | 'leads' | 'general';
    confidence: number;
    keywords: string[];
    urgency: 'low' | 'medium' | 'high';
  } {
    const lowerMessage = message.toLowerCase();
    
    // Agent-specific keyword mappings with weights
    const keywordMaps = {
      lexi: {
        keywords: [
          'onboard', 'getting started', 'setup', 'profile', 'new', 'help me start',
          'configure', 'how to', 'explain', 'guide', 'tier', 'upgrade', 'features',
          'platform', 'account', 'settings', 'limits', 'subscription'
        ],
        weight: 1.0
      },
      alex: {
        keywords: [
          'bid', 'price', 'cost', 'estimate', 'quote', 'material', 'labor',
          'calculate', 'breakdown', 'pricing', 'project cost', 'how much',
          'budget', 'expense', 'fee', 'rate', 'charge'
        ],
        weight: 1.0
      },
      rex: {
        keywords: [
          'lead', 'search', 'generate', 'opportunities', 'find work', 'jobs',
          'clients', 'projects', 'contract', 'hire', 'gig', 'work available'
        ],
        weight: 1.0
      }
    };

    // Calculate intent scores
    const scores = {
      onboarding: this.calculateIntentScore(lowerMessage, keywordMaps.lexi.keywords),
      bidding: this.calculateIntentScore(lowerMessage, keywordMaps.alex.keywords),
      leads: this.calculateIntentScore(lowerMessage, keywordMaps.rex.keywords),
    };

    // Determine primary intent
    const maxScore = Math.max(...Object.values(scores));
    const primaryIntent = maxScore > 0.3 
      ? (Object.keys(scores) as Array<keyof typeof scores>).find(key => scores[key] === maxScore)!
      : 'general';

    // Detect urgency indicators
    const urgencyKeywords = ['urgent', 'asap', 'immediately', 'emergency', 'rush', 'quick'];
    const urgency = urgencyKeywords.some(keyword => lowerMessage.includes(keyword)) ? 'high' : 'medium';

    return {
      primaryIntent: primaryIntent as 'onboarding' | 'bidding' | 'leads' | 'general',
      confidence: maxScore,
      keywords: this.extractMatchingKeywords(lowerMessage, keywordMaps),
      urgency,
    };
  }

  /**
   * Calculate intent score based on keyword matching
   */
  private calculateIntentScore(message: string, keywords: string[]): number {
    let score = 0;
    const messageWords = message.split(/\s+/);
    
    keywords.forEach(keyword => {
      if (message.includes(keyword)) {
        // Exact phrase match gets higher score
        score += 0.8;
      } else {
        // Check for partial word matches
        const keywordWords = keyword.split(/\s+/);
        const matchCount = keywordWords.filter(word => 
          messageWords.some(msgWord => msgWord.includes(word))
        ).length;
        score += (matchCount / keywordWords.length) * 0.3;
      }
    });

    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Extract all matching keywords from message
   */
  private extractMatchingKeywords(message: string, keywordMaps: any): string[] {
    const matches: string[] = [];
    
    Object.values(keywordMaps).forEach((map: any) => {
      map.keywords.forEach((keyword: string) => {
        if (message.includes(keyword)) {
          matches.push(keyword);
        }
      });
    });

    return matches;
  }

  /**
   * Make final routing decision based on intent analysis and context
   */
  private makeRoutingDecision(
    intentAnalysis: ReturnType<typeof this.analyzeIntent>,
    context: OrchestrationContext
  ): OrchestrationResult {
    const { primaryIntent, confidence, keywords, urgency } = intentAnalysis;
    const { currentAgent, activeChats, conversationHistory } = context;

    // High confidence routing
    if (confidence > 0.6) {
      const agentMap = {
        onboarding: 'lexi' as const,
        bidding: 'alex' as const,
        leads: 'rex' as const,
        general: 'lexi' as const,
      };

      const targetAgent = agentMap[primaryIntent];
      
      return {
        targetAgent,
        reason: `High confidence (${Math.round(confidence * 100)}%) ${primaryIntent} intent detected`,
        shouldOpenNewChat: !activeChats.includes(targetAgent),
        preprocessedMessage: context.userMessage,
        context: `Intent: ${primaryIntent}, Keywords: ${keywords.join(', ')}`,
      };
    }

    // Context-based fallback routing
    if (currentAgent && activeChats.includes(currentAgent)) {
      return {
        targetAgent: currentAgent,
        reason: 'Continuing current conversation context',
        shouldOpenNewChat: false,
        preprocessedMessage: context.userMessage,
        context: `Maintaining conversation with ${currentAgent}`,
      };
    }

    // Recent conversation context
    if (conversationHistory.length > 0) {
      const recentAgent = conversationHistory[conversationHistory.length - 1].agent;
      if (activeChats.includes(recentAgent)) {
        return {
          targetAgent: recentAgent,
          reason: 'Following recent conversation thread',
          shouldOpenNewChat: false,
          preprocessedMessage: context.userMessage,
          context: `Continuing with recently active ${recentAgent}`,
        };
      }
    }

    // Default to Lexi for general queries
    return {
      targetAgent: 'lexi',
      reason: 'Default routing to onboarding agent',
      shouldOpenNewChat: !activeChats.includes('lexi'),
      preprocessedMessage: context.userMessage,
      context: 'General inquiry or unclear intent',
    };
  }

  /**
   * Generate contextual system message for the target agent
   */
  generateContextualPrompt(
    result: OrchestrationResult,
    originalContext: OrchestrationContext
  ): string {
    const { targetAgent, reason, context } = result;
    const { contractorProfile } = originalContext;

    const basePrompt = `[ORCHESTRATION CONTEXT] ${reason}. ${context}.`;
    
    if (targetAgent === 'lexi') {
      return `${basePrompt} User may need guidance on platform features, onboarding, or general assistance. Profile completion: ${contractorProfile ? 'Available' : 'Incomplete'}.`;
    }
    
    if (targetAgent === 'alex') {
      return `${basePrompt} User is requesting bidding assistance or cost analysis. Services: ${contractorProfile?.services?.join(', ') || 'Not set'}. Location: ${contractorProfile?.location || 'Not set'}.`;
    }
    
    if (targetAgent === 'rex') {
      return `${basePrompt} User wants lead generation or market insights. Territory: ${contractorProfile?.location || 'Not set'}. Tier: ${contractorProfile?.tier || 'growth'}.`;
    }

    return basePrompt;
  }

  /**
   * Check if user has permission to use target agent
   */
  validateAgentAccess(
    targetAgent: AgentType,
    contractorProfile?: OrchestrationContext['contractorProfile']
  ): { hasAccess: boolean; reason?: string } {
    // Lexi is always available
    if (targetAgent === 'lexi') {
      return { hasAccess: true };
    }

    // Alex and Rex require Scale tier
    if ((targetAgent === 'alex' || targetAgent === 'rex') && contractorProfile?.tier !== 'scale') {
      return {
        hasAccess: false,
        reason: `@${targetAgent} requires Scale tier subscription. Current tier: ${contractorProfile?.tier || 'growth'}`,
      };
    }

    return { hasAccess: true };
  }
}

/**
 * Global orchestration function for use in components
 */
export const orchestrateMessage = (context: OrchestrationContext): OrchestrationResult => {
  const orchestrator = LexiOrchestrator.getInstance();
  return orchestrator.orchestrate(context);
};

/**
 * Helper function to create orchestration context
 */
export const createOrchestrationContext = (
  userMessage: string,
  currentAgent?: AgentType,
  activeChats: AgentType[] = [],
  conversationHistory: OrchestrationContext['conversationHistory'] = [],
  contractorProfile?: OrchestrationContext['contractorProfile']
): OrchestrationContext => ({
  userMessage,
  currentAgent,
  activeChats,
  conversationHistory,
  contractorProfile,
});
