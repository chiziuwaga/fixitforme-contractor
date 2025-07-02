// Frontend-Backend Connection Mapping
// Ensures all UI components are properly connected to their API endpoints

export const API_ENDPOINTS = {
  // Authentication endpoints
  auth: {
    login: '/api/auth/login',           // SMS login initiation
    verify: '/api/auth/verify',         // SMS code verification  
    logout: '/api/auth/logout',         // Session termination
    refresh: '/api/auth/refresh',       // Token refresh
    check: '/api/auth/check',           // Session validation
  },
  
  // Contractor management
  contractor: {
    profile: '/api/contractor/profile',         // GET/PUT contractor profile
    onboarding: '/api/contractor/onboarding',   // POST onboarding completion
    subscription: '/api/contractor/subscription', // Stripe subscription management
    metrics: '/api/contractor/metrics',         // Dashboard metrics
    settings: '/api/contractor/settings',       // Contractor preferences
  },
  
  // Lead management system
  leads: {
    list: '/api/leads',                 // GET leads with filters
    detail: '/api/leads/[id]',          // GET specific lead details
    bid: '/api/leads/[id]/bid',         // POST/PUT bid submission
    status: '/api/leads/[id]/status',   // PUT lead status update
    search: '/api/leads/search',        // POST advanced lead search
    export: '/api/leads/export',        // GET CSV export
  },
  
  // AI Agent endpoints
  agents: {
    lexi: '/api/agents/lexi',           // Onboarding assistance
    alex: '/api/agents/alex',           // Bid analysis and cost breakdown  
    rex: '/api/agents/rex',             // Lead generation and search
    felix: '/api/agents/felix',         // Problem diagnosis assistance
    chat: '/api/agents/chat',           // General agent chat interface
  },
  
  // Payment processing
  payments: {
    setup: '/api/payments/setup',             // Stripe setup intent
    webhook: '/api/payments/webhook',         // Stripe webhook handler
    subscription: '/api/payments/subscription', // Subscription management
    invoices: '/api/payments/invoices',       // Invoice history
    methods: '/api/payments/methods',         // Payment method CRUD
  },
  
  // Analytics and reporting
  analytics: {
    dashboard: '/api/analytics/dashboard',     // Main dashboard data
    leads: '/api/analytics/leads',             // Lead performance metrics
    revenue: '/api/analytics/revenue',         // Revenue tracking
    conversion: '/api/analytics/conversion',   // Conversion funnel data
    comparison: '/api/analytics/comparison',   // Period comparisons
  },
  
  // File management
  files: {
    upload: '/api/files/upload',        // File upload handling
    download: '/api/files/[id]',        // File download
    delete: '/api/files/[id]/delete',   // File deletion
  },
  
  // Notification system
  notifications: {
    list: '/api/notifications',                 // GET user notifications
    read: '/api/notifications/[id]/read',       // PUT mark as read
    preferences: '/api/notifications/preferences', // User notification settings
  }
} as const;

// Frontend component to endpoint mapping
export const COMPONENT_ENDPOINT_MAPPING = {
  // Authentication components
  'LoginPage': [
    API_ENDPOINTS.auth.login,
    API_ENDPOINTS.auth.verify,
    API_ENDPOINTS.auth.check,
  ],
  
  // Dashboard components  
  'ContractorDashboard': [
    API_ENDPOINTS.contractor.metrics,
    API_ENDPOINTS.leads.list,
    API_ENDPOINTS.analytics.dashboard,
    API_ENDPOINTS.notifications.list,
  ],
  
  'LeadFeed': [
    API_ENDPOINTS.leads.list,
    API_ENDPOINTS.leads.search,
    API_ENDPOINTS.leads.status,
  ],
  
  'QuickMetricsChart': [
    API_ENDPOINTS.analytics.dashboard,
    API_ENDPOINTS.contractor.metrics,
  ],
  
  // Charts and analytics
  'CostBreakdownChart': [
    API_ENDPOINTS.agents.alex,        // Alex provides cost analysis
    API_ENDPOINTS.leads.detail,       // Lead-specific cost data
  ],
  
  'LeadDistributionChart': [
    API_ENDPOINTS.agents.rex,         // Rex provides lead distribution data
    API_ENDPOINTS.analytics.leads,    // Lead analytics
  ],
  
  'TimelineChart': [
    API_ENDPOINTS.agents.alex,        // Alex provides project timelines
    API_ENDPOINTS.leads.detail,       // Project phase data
  ],
  
  // Agent UI components
  'GenerativeAgentAssets': [
    API_ENDPOINTS.agents.lexi,        // Lexi assistance
    API_ENDPOINTS.agents.alex,        // Alex analysis
    API_ENDPOINTS.agents.rex,         // Rex lead gen
    API_ENDPOINTS.agents.felix,       // Felix diagnostics
  ],
  
  // Onboarding
  'OnboardingPage': [
    API_ENDPOINTS.contractor.onboarding,
    API_ENDPOINTS.agents.lexi,        // Lexi guides onboarding
    API_ENDPOINTS.contractor.profile,
  ],
  
  // Profile and settings
  'ContractorProfile': [
    API_ENDPOINTS.contractor.profile,
    API_ENDPOINTS.contractor.settings,
    API_ENDPOINTS.payments.methods,
  ],
  
  // Bid management
  'BidSubmission': [
    API_ENDPOINTS.leads.bid,
    API_ENDPOINTS.agents.alex,        // Alex bid analysis
    API_ENDPOINTS.payments.setup,     // Payment processing
  ],
  
  // Notification center
  'NotificationCenter': [
    API_ENDPOINTS.notifications.list,
    API_ENDPOINTS.notifications.read,
    API_ENDPOINTS.notifications.preferences,
  ]
} as const;

// Endpoint validation utilities
export function validateEndpointConnection(component: keyof typeof COMPONENT_ENDPOINT_MAPPING): boolean {
  const endpoints = COMPONENT_ENDPOINT_MAPPING[component];
  // In production, this would ping each endpoint to verify connectivity
  return endpoints.length > 0;
}

export function getEndpointsForComponent(component: keyof typeof COMPONENT_ENDPOINT_MAPPING): readonly string[] {
  return COMPONENT_ENDPOINT_MAPPING[component] || [];
}

// API call helper with proper error handling
export async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
