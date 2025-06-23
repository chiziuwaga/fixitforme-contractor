# Admin API Endpoints Documentation

This document defines all admin-side API endpoints for the FixItForMe Contractor Module. These endpoints are designed for administrative operations, contractor management, and system oversight.

---

## 🔐 Authentication & Security

All admin endpoints require:
- Valid admin authentication (separate from contractor auth)
- Admin-level permissions in Supabase RLS policies
- Rate limiting and audit logging

**Base URL:** `/api/admin/*`

---

## 👥 Contractor Management Endpoints

### **GET** `/api/admin/contractors`
**Purpose:** List and filter contractors with pagination
```typescript
Query Parameters:
- page?: number (default: 1)
- limit?: number (default: 20, max: 100)
- tier?: 'growth' | 'scale'
- status?: 'active' | 'pending' | 'suspended'
- search?: string (name, email, company)
- sort?: 'created_at' | 'last_active' | 'revenue'
- order?: 'asc' | 'desc'

Response:
{
  contractors: ContractorProfile[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    total_pages: number
  },
  filters_applied: object
}
```

### **GET** `/api/admin/contractors/{id}`
**Purpose:** Get detailed contractor information
```typescript
Response:
{
  profile: ContractorProfile,
  subscription: SubscriptionDetails,
  metrics: {
    total_bids: number,
    conversion_rate: number,
    avg_project_value: number,
    last_active: string,
    tier_start_date: string
  },
  recent_activity: Activity[],
  documents: Document[]
}
```

### **PUT** `/api/admin/contractors/{id}/status`
**Purpose:** Update contractor status (approve, suspend, activate)
```typescript
Body:
{
  status: 'active' | 'pending' | 'suspended',
  reason?: string,
  admin_notes?: string
}

Response:
{
  success: boolean,
  contractor: ContractorProfile,
  notification_sent: boolean
}
```

### **PUT** `/api/admin/contractors/{id}/tier`
**Purpose:** Manually adjust contractor tier (admin override)
```typescript
Body:
{
  new_tier: 'growth' | 'scale',
  reason: string,
  override_billing?: boolean,
  admin_notes?: string
}

Response:
{
  success: boolean,
  previous_tier: string,
  new_tier: string,
  billing_updated: boolean
}
```

---

## 💼 Document & Verification Management

### **GET** `/api/admin/documents/pending`
**Purpose:** Get documents requiring admin verification
```typescript
Query Parameters:
- type?: 'license' | 'insurance' | 'certification'
- contractor_id?: string
- priority?: 'high' | 'medium' | 'low'

Response:
{
  documents: {
    id: string,
    contractor_id: string,
    contractor_name: string,
    type: string,
    filename: string,
    uploaded_at: string,
    status: 'pending' | 'approved' | 'rejected',
    priority: string
  }[],
  count: number
}
```

### **PUT** `/api/admin/documents/{id}/verify`
**Purpose:** Approve or reject contractor documents
```typescript
Body:
{
  action: 'approve' | 'reject',
  admin_notes?: string,
  expiration_date?: string, // For licenses/insurance
  verification_details?: object
}

Response:
{
  success: boolean,
  document: Document,
  contractor_notified: boolean,
  status_updated: boolean
}
```

---

## 💰 Financial & Payment Management

### **GET** `/api/admin/payments/overview`
**Purpose:** Financial dashboard data
```typescript
Query Parameters:
- period?: 'day' | 'week' | 'month' | 'quarter' | 'year'
- start_date?: string
- end_date?: string

Response:
{
  summary: {
    total_revenue: number,
    platform_fees: number,
    contractor_payouts: number,
    active_subscriptions: number,
    churn_rate: number
  },
  tier_breakdown: {
    growth: { count: number, revenue: number },
    scale: { count: number, revenue: number }
  },
  trends: {
    revenue_trend: DataPoint[],
    subscription_trend: DataPoint[],
    churn_trend: DataPoint[]
  }
}
```

### **GET** `/api/admin/payments/transactions`
**Purpose:** Transaction history with filtering
```typescript
Query Parameters:
- contractor_id?: string
- type?: 'subscription' | 'platform_fee' | 'payout'
- status?: 'pending' | 'completed' | 'failed'
- amount_min?: number
- amount_max?: number
- page?: number
- limit?: number

Response:
{
  transactions: Transaction[],
  pagination: PaginationInfo,
  summary: {
    total_amount: number,
    count: number,
    avg_amount: number
  }
}
```

### **POST** `/api/admin/payments/refund`
**Purpose:** Process refunds for contractors
```typescript
Body:
{
  transaction_id: string,
  amount?: number, // Partial refund
  reason: string,
  admin_notes?: string
}

Response:
{
  success: boolean,
  refund_id: string,
  amount_refunded: number,
  contractor_notified: boolean
}
```

---

## 🎯 Lead & Job Management

### **GET** `/api/admin/leads/overview`
**Purpose:** Lead generation analytics
```typescript
Query Parameters:
- period?: 'day' | 'week' | 'month'
- source?: 'craigslist' | 'sams_gov' | 'referral'
- category?: string[] // Felix categories

Response:
{
  summary: {
    total_leads: number,
    qualified_leads: number,
    avg_quality_score: number,
    conversion_rate: number
  },
  by_source: SourceBreakdown[],
  by_category: CategoryBreakdown[],
  quality_metrics: QualityMetrics,
  rex_usage: {
    active_sessions: number,
    sessions_this_month: number,
    top_performing_contractors: ContractorMetric[]
  }
}
```

### **GET** `/api/admin/leads/quality-control`
**Purpose:** Leads flagged for quality review
```typescript
Query Parameters:
- flag_type?: 'spam' | 'low_quality' | 'duplicate'
- severity?: 'high' | 'medium' | 'low'
- unresolved?: boolean

Response:
{
  flagged_leads: {
    id: string,
    title: string,
    source: string,
    flag_type: string,
    flag_reason: string,
    flagged_at: string,
    contractor_id?: string,
    actions_available: string[]
  }[],
  count: number
}
```

### **PUT** `/api/admin/leads/{id}/moderate`
**Purpose:** Moderate flagged leads
```typescript
Body:
{
  action: 'approve' | 'remove' | 'edit',
  admin_notes?: string,
  updated_content?: Partial<Lead>
}

Response:
{
  success: boolean,
  lead: Lead,
  action_taken: string,
  contractors_notified: string[]
}
```

---

## 🤖 AI Agent Management

### **GET** `/api/admin/agents/performance`
**Purpose:** AI agent usage and performance metrics
```typescript
Query Parameters:
- agent?: 'lexi' | 'alex' | 'rex'
- period?: 'day' | 'week' | 'month'
- contractor_id?: string

Response:
{
  by_agent: {
    lexi: AgentMetrics,
    alex: AgentMetrics,
    rex: AgentMetrics
  },
  overall: {
    total_interactions: number,
    avg_response_time: number,
    success_rate: number,
    user_satisfaction: number
  },
  trending_issues: Issue[]
}
```

### **GET** `/api/admin/agents/conversations`
**Purpose:** Access agent conversations for quality review
```typescript
Query Parameters:
- agent?: 'lexi' | 'alex' | 'rex'
- contractor_id?: string
- flagged?: boolean
- rating?: 1 | 2 | 3 | 4 | 5
- page?: number

Response:
{
  conversations: {
    id: string,
    contractor_id: string,
    agent: string,
    started_at: string,
    message_count: number,
    rating?: number,
    flagged: boolean,
    last_message_preview: string
  }[],
  pagination: PaginationInfo
}
```

### **PUT** `/api/admin/agents/training`
**Purpose:** Update agent training data and prompts
```typescript
Body:
{
  agent: 'lexi' | 'alex' | 'rex',
  update_type: 'prompt' | 'training_data' | 'config',
  changes: object,
  reason: string,
  test_mode?: boolean
}

Response:
{
  success: boolean,
  agent: string,
  changes_applied: object,
  test_results?: object
}
```

---

## 📊 Analytics & Reporting

### **GET** `/api/admin/analytics/dashboard`
**Purpose:** Main admin dashboard metrics
```typescript
Query Parameters:
- period?: 'today' | 'week' | 'month' | 'quarter'

Response:
{
  key_metrics: {
    active_contractors: number,
    new_signups_period: number,
    total_revenue_period: number,
    avg_project_value: number,
    platform_health_score: number
  },
  growth_metrics: {
    contractor_growth_rate: number,
    revenue_growth_rate: number,
    tier_conversion_rate: number
  },
  alerts: SystemAlert[],
  quick_actions: QuickAction[]
}
```

### **POST** `/api/admin/analytics/custom-report`
**Purpose:** Generate custom reports
```typescript
Body:
{
  report_type: 'contractor' | 'financial' | 'agent' | 'lead',
  filters: object,
  metrics: string[],
  date_range: { start: string, end: string },
  format: 'json' | 'csv' | 'pdf'
}

Response:
{
  report_id: string,
  status: 'generating' | 'ready',
  download_url?: string,
  estimated_completion?: string
}
```

---

## 🔔 Notification & Alert Management

### **GET** `/api/admin/notifications/system`
**Purpose:** System-wide notifications and alerts
```typescript
Query Parameters:
- type?: 'error' | 'warning' | 'info' | 'critical'
- unread?: boolean
- source?: 'payment' | 'agent' | 'security' | 'performance'

Response:
{
  notifications: {
    id: string,
    type: string,
    title: string,
    message: string,
    source: string,
    created_at: string,
    read: boolean,
    action_required: boolean,
    action_url?: string
  }[],
  unread_count: number
}
```

### **POST** `/api/admin/notifications/broadcast`
**Purpose:** Send notifications to contractors
```typescript
Body:
{
  target: 'all' | 'tier' | 'specific',
  target_criteria?: object,
  notification: {
    title: string,
    message: string,
    type: 'info' | 'warning' | 'update',
    action_url?: string,
    expires_at?: string
  },
  channels: ('in_app' | 'email' | 'sms')[]
}

Response:
{
  success: boolean,
  notification_id: string,
  recipients_count: number,
  delivery_status: object
}
```

---

## 🔧 System Administration

### **GET** `/api/admin/system/health`
**Purpose:** System health and performance monitoring
```typescript
Response:
{
  status: 'healthy' | 'warning' | 'critical',
  services: {
    database: ServiceStatus,
    ai_agents: ServiceStatus,
    payment_system: ServiceStatus,
    notification_system: ServiceStatus
  },
  performance: {
    avg_response_time: number,
    error_rate: number,
    uptime_percentage: number
  },
  alerts: HealthAlert[]
}
```

### **POST** `/api/admin/system/maintenance`
**Purpose:** Schedule or trigger maintenance operations
```typescript
Body:
{
  operation: 'cache_clear' | 'db_cleanup' | 'log_rotation',
  scheduled_for?: string,
  maintenance_window?: number, // minutes
  notify_users?: boolean
}

Response:
{
  success: boolean,
  operation_id: string,
  scheduled_for: string,
  estimated_duration: number
}
```

---

## 📱 Thread-Based Notification Navigation

### **GET** `/api/admin/notifications/{id}/context`
**Purpose:** Get context for thread-based notifications
```typescript
Response:
{
  notification: Notification,
  thread_context: {
    type: 'chat' | 'bid' | 'document',
    thread_id: string,
    position: number, // Message/item position in thread
    contractor_id: string,
    navigation_url: string
  },
  related_items: RelatedItem[]
}
```

**Frontend Integration:**
- Clicking notification navigates to specific thread position
- Highlights relevant message/item for 3 seconds
- Provides context breadcrumbs for admin navigation

---

## 🔑 Required Environment Variables

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI & Reasoning
DEEPSEEK_API_KEY=
VERCEL_AI_SDK_TOKEN=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Communications
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Admin Authentication
ADMIN_JWT_SECRET=
ADMIN_AUTH_PROVIDER=

# Security
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Monitoring
SENTRY_DSN=
VERCEL_ANALYTICS_ID=
```

---

## 🛡️ Security Considerations

1. **Row Level Security (RLS)**: All admin endpoints enforce strict RLS policies
2. **Audit Logging**: All admin actions are logged with timestamps and admin identifiers
3. **Rate Limiting**: Aggressive rate limiting on admin endpoints to prevent abuse
4. **IP Whitelisting**: Admin access restricted to specific IP ranges
5. **Two-Factor Authentication**: Required for all admin accounts
6. **Session Management**: Short session timeouts with refresh token rotation
