/**
 * Conversational Error Handling System
 * 
 * Implements chat-centric error handling where all system errors are mediated
 * through Lexi as natural conversation, maintaining flow without jarring interruptions.
 */

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';
export type ErrorCategory = 'usage_limit' | 'technical' | 'permissions' | 'validation' | 'network';

export interface ConversationalError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  original_error: string;
  user_friendly_message: string;
  suggested_actions: Array<{
    label: string;
    action: string;
    primary?: boolean;
  }>;
  lexi_response: {
    message: string;
    tone: 'helpful' | 'apologetic' | 'encouraging' | 'informative';
    follow_up_questions?: string[];
  };
}

/**
 * Converts system errors into conversational Lexi responses
 */
export class ConversationalErrorHandler {
  /**
   * Main error mediation function - converts any system error to chat message
   */
  static mediateError(error: Error | string, context?: {
    agent?: string;
    action?: string;
    user_tier?: string;
  }): ConversationalError {
    const errorString = typeof error === 'string' ? error : error.message;
    
    // Detect error category and severity
    const { category, severity } = this.categorizeError(errorString);
    
    // Generate appropriate Lexi response based on error type
    const lexiResponse = this.generateLexiResponse(errorString, category, severity, context);
    
    return {
      id: `error_${Date.now()}`,
      category,
      severity,
      original_error: errorString,
      user_friendly_message: lexiResponse.user_message,
      suggested_actions: lexiResponse.actions,
      lexi_response: {
        message: lexiResponse.lexi_message,
        tone: lexiResponse.tone,
        follow_up_questions: lexiResponse.follow_ups
      }
    };
  }

  /**
   * Categorizes errors for appropriate handling
   */
  private static categorizeError(errorString: string): { category: ErrorCategory; severity: ErrorSeverity } {
    const lowerError = errorString.toLowerCase();
    
    // Usage limits
    if (lowerError.includes('limit') || lowerError.includes('quota') || lowerError.includes('exceeded')) {
      return { category: 'usage_limit', severity: 'warning' };
    }
    
    // Permission/tier issues
    if (lowerError.includes('premium') || lowerError.includes('scale') || lowerError.includes('permission')) {
      return { category: 'permissions', severity: 'info' };
    }
    
    // Network/API issues
    if (lowerError.includes('network') || lowerError.includes('timeout') || lowerError.includes('fetch')) {
      return { category: 'network', severity: 'error' };
    }
    
    // Validation errors
    if (lowerError.includes('invalid') || lowerError.includes('required') || lowerError.includes('format')) {
      return { category: 'validation', severity: 'warning' };
    }
    
    // Default to technical error
    return { category: 'technical', severity: 'error' };
  }

  /**
   * Generates contextual Lexi responses for different error types
   */
  private static generateLexiResponse(
    error: string, 
    category: ErrorCategory, 
    severity: ErrorSeverity,
    context?: { agent?: string; action?: string; user_tier?: string; }
  ) {
    switch (category) {
      case 'usage_limit':
        return this.handleUsageLimitError(error, context);
      case 'permissions':
        return this.handlePermissionError(error, context);
      case 'network':
        return this.handleNetworkError(error, context);
      case 'validation':
        return this.handleValidationError(error, context);
      default:
        return this.handleTechnicalError(error, context);
    }
  }

  /**
   * Handle usage limit errors conversationally
   */
  private static handleUsageLimitError(error: string, context?: { user_tier?: string }) {
    const isGrowthTier = context?.user_tier === 'growth';
    
    if (isGrowthTier) {
      return {
        user_message: "You've reached your daily usage limit",
        lexi_message: "I noticed you've hit your daily limit for AI agent interactions. As a Growth tier member, you have generous daily limits, but we want to make sure you can keep working! 🚀",
        tone: 'helpful' as const,
        actions: [
          { label: "Upgrade to Scale", action: "upgrade_tier", primary: true },
          { label: "View Usage Details", action: "show_usage" },
          { label: "Tips to Optimize", action: "show_tips" }
        ],
        follow_ups: [
          "Would you like me to show you what Scale tier includes?",
          "I can help you optimize your current usage patterns",
          "Should I notify you when your limit resets tomorrow?"
        ]
      };
    } else {
      return {
        user_message: "You've reached your usage limit",
        lexi_message: "I see you're making great use of our AI agents! You've reached your current limit, but don't worry - I can help you keep being productive. ✨",
        tone: 'encouraging' as const,
        actions: [
          { label: "View Scale Benefits", action: "show_scale_benefits", primary: true },
          { label: "Check Reset Time", action: "show_reset_time" }
        ],
        follow_ups: [
          "Would you like to explore Scale tier's unlimited features?",
          "I can show you when your limits reset"
        ]
      };
    }
  }

  /**
   * Handle permission/tier errors conversationally
   */
  private static handlePermissionError(error: string, context?: { agent?: string }) {
    const agent = context?.agent;
    const agentName = agent === 'alex' ? 'Alex the Assessor' : agent === 'rex' ? 'Rex the Retriever' : 'this agent';
    
    return {
      user_message: `${agentName} is a premium feature`,
      lexi_message: `I'd love to connect you with ${agentName}, but they're part of our Scale tier premium features. These agents provide incredibly powerful capabilities for serious contractors! 💼`,
      tone: 'helpful' as const,
      actions: [
        { label: "Upgrade to Scale", action: "upgrade_tier", primary: true },
        { label: "See What I Can Do", action: "show_lexi_capabilities" },
        { label: "Learn About Scale", action: "show_scale_info" }
      ],
      follow_ups: [
        "I can help you with many tasks while you consider upgrading",
        "Would you like to see what Scale tier includes?",
        "Should I show you how other contractors use premium agents?"
      ]
    };
  }

  /**
   * Handle network/connectivity errors conversationally
   */
  private static handleNetworkError(error: string, context?: { action?: string }) {
    return {
      user_message: "Connection issue detected",
      lexi_message: "Oops! I'm having trouble connecting to our servers right now. This happens sometimes, but I'm here to help you get back on track! 🔄",
      tone: 'apologetic' as const,
      actions: [
        { label: "Try Again", action: "retry_action", primary: true },
        { label: "Check Status", action: "show_system_status" },
        { label: "Work Offline", action: "enable_offline_mode" }
      ],
      follow_ups: [
        "Should I try that again for you?",
        "Would you like me to check if our systems are experiencing issues?",
        "I can help you work on other tasks while we wait for the connection"
      ]
    };
  }

  /**
   * Handle validation errors conversationally
   */
  private static handleValidationError(error: string, context?: { action?: string }) {
    return {
      user_message: "Something needs to be corrected",
      lexi_message: "I noticed there might be a small issue with the information provided. No worries - let's fix this together! 📝",
      tone: 'helpful' as const,
      actions: [
        { label: "Show Details", action: "show_validation_details", primary: true },
        { label: "Start Over", action: "reset_form" },
        { label: "Get Help", action: "show_help" }
      ],
      follow_ups: [
        "Would you like me to explain what needs to be corrected?",
        "Should I help you fill this out step by step?"
      ]
    };
  }

  /**
   * Handle general technical errors conversationally
   */
  private static handleTechnicalError(error: string, context?: { action?: string }) {
    return {
      user_message: "Something went wrong",
      lexi_message: "I encountered an unexpected issue, but don't worry! These things happen in any complex system. Let me help you get back to work quickly. 🛠️",
      tone: 'apologetic' as const,
      actions: [
        { label: "Try Again", action: "retry_action", primary: true },
        { label: "Report Issue", action: "report_bug" },
        { label: "Alternative Path", action: "show_alternatives" }
      ],
      follow_ups: [
        "Should I try a different approach?",
        "Would you like me to report this to our technical team?",
        "I can suggest alternative ways to accomplish what you need"
      ]
    };
  }
}

/**
 * Hook for integrating conversational error handling into React components
 */
export function useConversationalErrorHandler() {
  const handleError = (error: Error | string, context?: {
    agent?: string;
    action?: string;
    user_tier?: string;
  }) => {
    const conversationalError = ConversationalErrorHandler.mediateError(error, context);
    
    // This would integrate with the chat system to inject Lexi's response
    // as a natural chat message rather than a system notification
    return conversationalError;
  };

  return { handleError };
}

/**
 * Helper functions for common error scenarios
 */
export const ConversationalErrorHelpers = {
  /**
   * Creates a usage limit message that feels natural in conversation
   */
  createUsageLimitMessage: (currentUsage: number, limit: number, tier: string) => {
    const percentage = (currentUsage / limit) * 100;
    
    if (percentage >= 100) {
      return ConversationalErrorHandler.mediateError(
        "Daily usage limit exceeded", 
        { user_tier: tier }
      );
    } else if (percentage >= 80) {
      return {
        message: `You're at ${Math.round(percentage)}% of your daily limit. Would you like me to help you make the most of your remaining usage?`,
        tone: 'helpful' as const,
        actions: [
          { label: "Show Usage Tips", action: "show_usage_tips" },
          { label: "Upgrade to Scale", action: "upgrade_tier" }
        ]
      };
    }
    
    return null;
  },

  /**
   * Creates proactive guidance before users hit limits
   */
  createProactiveGuidance: (context: { upcoming_limit?: string; user_behavior?: string }) => {
    if (context.upcoming_limit) {
      return {
        message: "I notice you're approaching your daily limit. Let me suggest some ways to be most effective with your remaining usage! 💡",
        actions: [
          { label: "Optimize Current Session", action: "optimize_session" },
          { label: "Plan Tomorrow's Work", action: "plan_tomorrow" },
          { label: "Consider Scale Tier", action: "explore_scale" }
        ]
      };
    }
    
    return null;
  }
};
