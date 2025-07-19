/**
 * Nested Chat Context System
 * 
 * Implements the core chat-centric concept of contextual, nested conversations
 * for job-specific workspaces as outlined in the Chat_Centric_UI_Rationale.
 */

export type ChatContextType = 'main' | 'bid' | 'project' | 'lead';

export interface ChatContext {
  type: ChatContextType;
  contextId?: string; // job_id, bid_id, lead_id
  title: string;
  metadata: {
    project_name?: string;
    client_name?: string;
    lead_source?: string;
    estimated_value?: number;
    status?: 'active' | 'completed' | 'archived' | 'pending';
    created_date?: string;
    deadline?: string;
  };
}

export interface NestedConversation {
  id: string;
  agent: 'lexi' | 'alex' | 'rex';
  context: ChatContext;
  messages: unknown[]; // Will use existing Message type
  created_at: string;
  updated_at: string;
  is_active: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface ConversationGroup {
  title: string;
  conversations: NestedConversation[];
  type: ChatContextType;
  isExpanded: boolean;
}

/**
 * Creates a new bid-specific chat context when contractor pursues a lead
 */
export function createBidContext(leadData: {
  lead_id: string;
  project_name: string;
  client_name: string;
  estimated_value?: number;
}): ChatContext {
  return {
    type: 'bid',
    contextId: leadData.lead_id,
    title: `${leadData.project_name} - ${leadData.client_name}`,
    metadata: {
      project_name: leadData.project_name,
      client_name: leadData.client_name,
      estimated_value: leadData.estimated_value,
      status: 'active',
      created_date: new Date().toISOString(),
    }
  };
}

/**
 * Creates a new project context for ongoing work
 */
export function createProjectContext(projectData: {
  project_id: string;
  project_name: string;
  client_name: string;
}): ChatContext {
  return {
    type: 'project',
    contextId: projectData.project_id,
    title: `Active: ${projectData.project_name}`,
    metadata: {
      project_name: projectData.project_name,
      client_name: projectData.client_name,
      status: 'active',
      created_date: new Date().toISOString(),
    }
  };
}

/**
 * Groups conversations by context for sidebar organization
 */
export function groupConversationsByContext(conversations: NestedConversation[]): ConversationGroup[] {
  const groups: { [key: string]: ConversationGroup } = {
    main: {
      title: 'Main Chat',
      conversations: [],
      type: 'main',
      isExpanded: true
    },
    active_bids: {
      title: 'Active Bids',
      conversations: [],
      type: 'bid',
      isExpanded: true
    },
    projects: {
      title: 'Current Projects', 
      conversations: [],
      type: 'project',
      isExpanded: false
    },
    leads: {
      title: 'Lead Research',
      conversations: [],
      type: 'lead',
      isExpanded: false
    }
  };

  conversations.forEach(conv => {
    switch (conv.context.type) {
      case 'main':
        groups.main.conversations.push(conv);
        break;
      case 'bid':
        groups.active_bids.conversations.push(conv);
        break;
      case 'project':
        groups.projects.conversations.push(conv);
        break;
      case 'lead':
        groups.leads.conversations.push(conv);
        break;
    }
  });

  // Sort conversations by priority and recency
  Object.values(groups).forEach(group => {
    group.conversations.sort((a, b) => {
      // Priority first
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by recency
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  });

  return Object.values(groups).filter(group => group.conversations.length > 0);
}

/**
 * Workflow helpers for moving between contexts
 */
export const WorkflowActions = {
  /**
   * Rex finds a lead → User decides to pursue → Create Alex bid thread
   */
  startBidAnalysis: (leadData: {
    id: string;
    project_name?: string;
    client_name?: string;
    estimated_value?: number;
  }) => {
    const bidContext = createBidContext({
      lead_id: leadData.id,
      project_name: leadData.project_name || 'New Project',
      client_name: leadData.client_name || 'New Client',
      estimated_value: leadData.estimated_value
    });

    return {
      context: bidContext,
      agent: 'alex' as const,
      initialMessage: `I'll help you analyze this bid for ${bidContext.metadata.project_name}. Let me review the lead details and create a comprehensive assessment.`
    };
  },

  /**
   * Bid approved → Convert to active project context
   */
  convertToProject: (bidContext: ChatContext) => {
    if (bidContext.type !== 'bid') throw new Error('Can only convert bid contexts to projects');
    
    return createProjectContext({
      project_id: bidContext.contextId!,
      project_name: bidContext.metadata.project_name!,
      client_name: bidContext.metadata.client_name!
    });
  },

  /**
   * Return to main chat from any context
   */
  returnToMainChat: () => ({
    type: 'main' as ChatContextType,
    contextId: undefined,
    title: 'Main Chat',
    metadata: {}
  })
};

/**
 * Context-aware message routing
 */
export function getContextualWelcomeMessage(context: ChatContext, agent: 'lexi' | 'alex' | 'rex'): string {
  switch (context.type) {
    case 'bid':
      if (agent === 'alex') {
        return `I'm ready to help you analyze the bid for ${context.metadata.project_name}. I'll review the requirements, estimate costs, and help you create a competitive proposal.`;
      }
      break;
    case 'project':
      if (agent === 'alex') {
        return `Let's manage the ${context.metadata.project_name} project. I can help with progress tracking, change orders, and cost management.`;
      }
      break;
    case 'lead':
      if (agent === 'rex') {
        return `I'm researching leads for you. Let me know what type of projects you're interested in and I'll find the best opportunities.`;
      }
      break;
    case 'main':
      switch (agent) {
        case 'lexi':
          return "Welcome! I'm here to help with onboarding, platform guidance, and connecting you with the right specialists.";
        case 'alex':
          return "I'm Alex, your bidding and cost analysis expert. Ready to help with project assessments and proposals.";
        case 'rex':
          return "I'm Rex, your lead generation specialist. I'll help you find and research new business opportunities.";
      }
      break;
  }
  
  return `Hello! How can I help you today?`;
}
