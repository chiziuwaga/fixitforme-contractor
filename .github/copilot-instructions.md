<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# FixItForMe Contractor Module - Comprehensive Development Guide

## 🚨 CRITICAL: UNIFIED CHAT INTERFACE INTEGRATION

### MANDATORY: Integration with Existing System
**The UnifiedChatInterface MUST integrate with existing sophisticated backend systems**

#### Current Sophisticated System Status
- **✅ PRODUCTION READY**: useChatProduction hook with full database persistence
- **✅ AGENT COORDINATION**: EnhancedChatManager with concurrent execution limits
- **✅ NOTIFICATION SYSTEM**: NotificationCenter for agent completion alerts
- **✅ UI ASSET RENDERING**: GenerativeUIRenderer for dynamic agent components
- **✅ MOBILE OPTIMIZATION**: MobileLexiChat with responsive design patterns

#### Integration Requirements (CRITICAL)
```typescript
const INTEGRATION_MANDATE = {
  // PRESERVE: All existing sophisticated functionality
  preservedSystems: [
    'useChatProduction', // Database persistence & agent coordination
    'EnhancedChatManager', // Floating chat windows & execution management
    'ConcurrentExecutionManager', // Premium agent limits & background processing
    'NotificationCenter', // Agent completion alerts & user feedback
    'GenerativeUIRenderer', // Dynamic UI asset rendering from JSON
    'MobileLexiChat' // Mobile-optimized chat experience
  ],
  
  // INTEGRATE: UnifiedChatInterface as primary UI layer
  integrationApproach: {
    backend: 'Use existing hooks and managers for all business logic',
    frontend: 'UnifiedChatInterface as modern three-panel UI shell',
    compatibility: 'Maintain backward compatibility with all existing components',
    mobileHarmony: 'Align responsive behavior with MobileLexiChat patterns'
  },
  
  // ENHANCE: Add Vercel-inspired improvements while preserving functionality
  enhancements: {
    threadGrouping: 'Add date-based conversation organization',
    sidebarManagement: 'Vercel-style collapse/expand animations',
    searchFiltering: 'Thread search and filtering capabilities',
    keyboardShortcuts: 'Professional keyboard navigation'
  }
}
```

#### Recursive Correction Protocol
```typescript
const RECURSIVE_CORRECTION = {
  step1: 'Identify existing sophisticated functionality',
  step2: 'Preserve all business logic in existing hooks/managers',
  step3: 'Update UnifiedChatInterface to consume existing APIs',
  step4: 'Maintain brand compliance and visual consistency',
  step5: 'Add enhancements without breaking existing features'
}
```

## 🚨 CRITICAL: DEPLOYMENT-READY AUTHENTICATION SYSTEM

### MANDATORY: WhatsApp Sandbox Production Authentication
**System is NOW production-ready with WhatsApp sandbox - NO demo codes exist.**

#### Authentication System Status (JULY 2025)
- **✅ PRODUCTION READY**: Pure WhatsApp sandbox authentication via Twilio
- **✅ DEMO CODES REMOVED**: All bypass codes (209741, 503913, 058732, 002231) permanently deleted
- **✅ SECRET UPGRADE IMPLEMENTED**: `-felixscale` suffix enables Scale tier upgrade (WhatsApp OTP + "-felixscale")
- **✅ BACKEND CLEAN**: No demo logic in verify-whatsapp-otp or send-whatsapp-otp APIs
- **✅ UI CLEAN**: Authentication flow uses only real WhatsApp OTP verification with subtle upgrade hint
- **✅ PHONE-NATIVE**: Direct phone authentication, no email conversion patterns
- **✅ MOCK UPGRADE ACTIVE**: Secret code suffix-based Scale tier upgrades for power users

### SECRET UPGRADE SYSTEM: `-felixscale` Code
**Power users can append `-felixscale` to their WhatsApp OTP for instant Scale tier upgrade.**

#### Secret Upgrade Flow (PRODUCTION ACTIVE)
```typescript
const SECRET_UPGRADE_FLOW = {
  trigger: "WhatsApp OTP + '-felixscale' suffix",
  example: "123456-felixscale", // If OTP is 123456
  
  // Backend Processing (verify-whatsapp-otp API)
  backend: {
    detection: "token.endsWith('-felixscale')",
    validation: "Strip suffix, verify actual OTP normally",
    upgrade: "Set subscription_tier: 'scale', status: 'active'",
    tracking: "Analytics: 'secret_upgrade_success' event"
  },
  
  // Frontend Experience
  frontend: {
    input: "Standard OTP input accepts suffix seamlessly",
    feedback: "🎉 Secret Scale Tier Upgrade Activated!",
    hint: "🔓 Pro tip: Special codes unlock premium features",
    redirect: "Normal onboarding/dashboard flow"
  },
  
  // Database Updates
  database: {
    contractor_profiles: {
      subscription_tier: "scale",
      subscription_status: "active", 
      tier_upgraded_at: "ISO timestamp",
      upgrade_method: "secret_code_felixscale"
    }
  }
}
```

#### Secret Upgrade Security Features
- **Subtle Discovery**: UI hint without revealing exact syntax
- **Seamless Integration**: No special API endpoints, works through normal OTP flow  
- **Proper Validation**: Still requires valid WhatsApp OTP before processing upgrade
- **Analytics Tracking**: Full event tracking for upgrade success/failure
- **Retroactive Upgrade**: Works for both new and existing contractors

## 🎨 **ENHANCED BRAND RATIONALE & EVOLUTION**

### **Brand Identity Psychology (Updated July 2025)**
**Forest Green excellence with conversational agent personalities**

#### **Agent Color Psychology System**
```typescript
const AGENT_PERSONALITIES = {
  lexi: {
    color: '#D4A574', // Felix Gold
    personality: 'Warm, welcoming guidance counselor',
    conversation_style: 'Encouraging, educational, step-by-step',
    branding_rationale: 'Gold standard of onboarding excellence'
  },
  rex: {
    color: '#1A2E1A', // Forest Green  
    personality: 'Professional, methodical researcher',
    conversation_style: 'Data-driven, analytical, reliable',
    branding_rationale: 'Stable growth and professional reliability'
  },
  alex: {
    color: '#22c55e', // Success Green
    personality: 'Precise, analytical cost expert',
    conversation_style: 'Detail-oriented, calculation-focused',
    branding_rationale: 'Successful bidding and profit optimization'
  }
}
```

#### **Brand Evolution Through Conversational AI**
- **Phase 1**: Static forms → **Phase 5**: Conversational onboarding with Lexi
- **Phase 2**: Basic chat → **Phase 5**: Multi-agent thread management
- **Phase 3**: Mobile PWA → **Current**: 8-breakpoint responsive conversations
- **Brand Core**: Professional contractor excellence through AI-guided workflows

### **Thread-First Brand Experience**
- **Conversation Continuity**: Brand reinforcement through persistent threads
- **Agent Personality Consistency**: Each interaction strengthens brand identity
- **Professional Growth**: From Growth tier → Scale tier through agent guidance

#### Agent Color Standards (STRICTLY ENFORCED)
```typescript
const AGENT_COLORS = {
  lexi: {
    bg: 'bg-primary/10',           // Felix Gold variants ONLY
    text: 'text-primary', 
    border: 'border-primary/20',
    focus: 'focus:border-primary/50 focus:ring-primary/20'
  },
  alex: {
    bg: 'bg-green-500/10',         // Success Green variants  
    text: 'text-green-600',
    border: 'border-green-500/20',
    focus: 'focus:border-green-500/50 focus:ring-green-500/20'
  },
  rex: {
    bg: 'bg-secondary/10',         // Forest Green variants ONLY
    text: 'text-secondary',
    border: 'border-secondary/20', 
    focus: 'focus:border-secondary/50 focus:ring-secondary/20'
  }
}
```

#### BANNED Color Patterns (Zero Tolerance)
- ❌ `blue-*` classes for Rex (must use `secondary`)
- ❌ `purple-*` classes for Lexi (must use `primary`) 
- ❌ `violet-*` classes (never use)
- ❌ Hardcoded hex colors bypassing CSS variables

#### Brand Identity Core Principles
1. **Rex the Retriever = Forest Green (`secondary`)** - Professional, reliable, methodical
2. **Lexi the Liaison = Felix Gold (`primary`)** - Warm, welcoming, guidance-focused
3. **Alex the Assessor = Success Green** - Analytical, precise, calculation-focused
4. **Felix the Fixer = Forest Green (`secondary`)** - Diagnostic, technical, problem-solving

### Logo & Favicon Standards
- **Logo**: `/public/logo.png` - Must be consistently referenced in all auth components
- **Favicon**: `/public/favicon.ico` - Must be properly configured in app metadata
- **Brand Assets**: Verify integration across all user-facing components

### Enhanced UI Component Hierarchy
1. **🥇 enhanced-ui.tsx** - Foundation component affecting ALL agent interactions
2. **🥈 Agent-specific components** - AgentMentionModal, AgentProgressIndicator, EnhancedChatWindow
3. **🥉 Chat interaction components** - ChatCards, ChatFileUpload, chat managers
4. **📄 Page-level components** - Authentication, dashboard, settings, onboarding

### Brand Compliance Validation Process
1. **Before ANY component edit**: Search for existing blue/purple violations
2. **Component-level validation**: Ensure agent colors match brand standards
3. **Cross-component consistency**: Verify color usage across related components
4. **Logo/favicon verification**: Check brand asset integration in user flows

# FixItForMe Contractor Module - Comprehensive Development Guide

## 🏗️ Project Architecture & Technical Stack

### Core Technologies
- **Frontend Framework:** Next.js 15 with App Router and React Server Components
- **Language:** TypeScript with strict type checking and comprehensive interfaces
- **Styling:** Tailwind CSS with semantic design tokens and shadcn/ui components
- **State Management:** Custom React hooks pattern with Context providers for global state
- **Database:** Supabase PostgreSQL with Row Level Security (RLS) and real-time subscriptions
- **Authentication:** Supabase Auth with SMS verification and JWT tokens
- **AI Integration:** Vercel AI SDK with streaming responses and Deepseek reasoning models
- **Payments:** Stripe integration with webhook handlers and tiered subscription management
- **Deployment:** Vercel with serverless functions and automatic builds
- **File Management:** Supabase Storage with secure file uploads and CDN delivery

## 🗄️ **DATABASE ARCHITECTURE STATUS (Phase 5C Complete)**

### **Enhanced Chat System (Production Ready)**
```sql
-- Thread Management Functions (Deployed)
✅ delete_chat_thread(thread_id, contractor_id)
✅ cleanup_excess_chat_threads(contractor_id, max_threads) 
✅ get_chat_thread_count(contractor_id)
✅ get_chat_threads_with_metadata(contractor_id)
✅ archive_chat_thread(thread_id, contractor_id)

-- Chat Persistence Tables (Active)
✅ chat_message_ui_assets - Agent-generated UI components
✅ chat_typing_indicators - Real-time agent typing status
✅ chat_followup_prompts - Contextual conversation prompts
```

### **Conversational Database Integration**
- **Thread Limits**: 10 threads per contractor (configurable)
- **Automatic Cleanup**: Oldest threads deleted when limit exceeded
- **Soft Archive**: Important conversations can be archived instead of deleted
- **Cross-Agent Context**: All agents access same conversation history
- **Real-Time Sync**: Live typing indicators and prompt suggestions

## 🧠 Brain/Skin Architecture (Core Principle)

### The Brain: Custom Hooks (`/src/hooks/*`)
**All business logic MUST live in custom React hooks. This is the core architectural principle.**

#### Authentication & User Management
- **`useAuth.ts`** - SMS authentication flow, phone verification, session management, login state
- **`useUser.ts`** - Global user context interface, contractor profile types, subscription data
- **`useProfile.ts`** - Contractor profile CRUD operations, validation, profile updates

#### Core Application Features  
- **`useDashboard.ts`** - Dashboard metrics aggregation, performance data, analytics calculations
- **`useLeads.ts`** - Lead fetching, filtering, sorting, bid management, lead status updates
- **`useOnboarding.ts`** - Step-by-step contractor setup, progress tracking, validation logic
- **`useChat.ts`** - Multi-agent chat coordination, message handling, conversation state
- **`useChatProduction.ts`** - Production chat system with database persistence and agent management

#### Business Operations
- **`useSubscription.ts`** - Stripe integration, tier management, payment processing, billing
- **`useDocumentUploader.ts`** - File upload logic, document validation, storage management
- **`useSettings.ts`** - Profile settings, notification preferences, account configuration

#### UI Coordination
- **`useAgentUI.ts`** - Agent component interactions, dynamic UI generation, agent responses
- **`useHomePage.ts`** - Landing page logic, mobile detection, navigation routing
- **`useResponsiveChart.ts`** - Chart responsive behavior, breakpoint management, D3 integration

### The Skin: Presentational Components
**All UI components MUST be purely presentational, consuming hooks for data and actions.**

#### Pages (100% Presentational)
- **`src/app/page.tsx`** - Landing page (consumes `useHomePage`)
- **`src/app/login/page.tsx`** - Authentication UI (consumes `useAuth`)  
- **`src/app/contractor/dashboard/page.tsx`** - Main dashboard (consumes `useDashboard`)
- **`src/app/contractor/onboarding/page.tsx`** - Setup flow (consumes `useOnboarding`)
- **`src/app/contractor/settings/page.tsx`** - Settings UI (consumes `useSettings`)

#### Components (100% Presentational)
- **`ProfileEditor.tsx`** - Profile editing UI (consumes `useProfile`)
- **`LeadFeed.tsx`** - Lead display and interaction (consumes `useLeads`)
- **`SubscriptionManager.tsx`** - Subscription management UI (consumes `useSubscription`)
- **`DocumentUploader.tsx`** - File upload interface (consumes `useDocumentUploader`)
- **`AgentComponents.tsx`** - Agent UI components (consumes `useAgentUI`)
- **`UnifiedChatInterface.tsx`** - Unified chat UI (consumes `useChatProduction`)

### Architectural Constraints (STRICTLY ENFORCED)
1. **No useState/useEffect in UI components** - All reactive state handled by hooks
2. **Props-driven components** - Components receive all data and functions from hooks via props  
3. **Single responsibility hooks** - Each hook manages one business domain
4. **Type safety throughout** - Comprehensive TypeScript interfaces for all hook returns
5. **Event handling only** - Components only handle UI events, no business logic

## 🤖 AI AGENT SYSTEM - CONVERSATIONAL ARCHITECTURE

### **Indie Dev Dan Inspired Conversational Agents**
**CRITICAL: All agents are fully conversational, NOT scripted bots**

#### **Agent Personas & Capabilities**
- **Lexi the Liaison** (`/src/app/api/agents/lexi/route.ts`) - Conversational onboarding guide, Felix Gold branding
- **Alex the Assessor** (`/src/app/api/agents/alex/route.ts`) - Conversational bidding assistant, Success Green branding  
- **Rex the Retriever** (`/src/app/api/agents/rex/route.ts`) - Conversational lead generation, Forest Green branding
- **Felix the Fixer** (referenced) - Conversational diagnostic agent for homeowner referrals

#### **Conversational Agent Architecture Principles**
- **Shared Context Access:** All agents can draw context from the same chat thread
- **Thread-Based Memory:** Persistent conversation history across agent interactions
- **Dynamic Agent Switching:** Users can switch agents within the same conversation
- **Real-Time Streaming:** All responses use Vercel AI SDK streaming
- **Thread Management:** Automatic cleanup when users reach thread limits (default: 10 threads)

#### **Thread Management System**
```typescript
// Thread deletion and management functions deployed
const THREAD_MANAGEMENT = {
  functions: [
    'delete_chat_thread(thread_id, contractor_id)',
    'cleanup_excess_chat_threads(contractor_id, max_threads)',
    'get_chat_thread_count(contractor_id)',
    'get_chat_threads_with_metadata(contractor_id)',
    'archive_chat_thread(thread_id, contractor_id)'
  ],
  default_limit: 10,
  cleanup_strategy: 'Delete oldest threads when limit exceeded',
  soft_delete: 'Archive option available for important conversations'
}
```

## 📁 Critical File Structure & Documentation

### Configuration & Setup
- **`package.json`** - Dependencies, scripts, Next.js 15 configuration
- **`tsconfig.json`** - TypeScript strict configuration with path mapping
- **`tailwind.config.ts`** - Design system tokens, semantic color variables
- **`next.config.ts`** - Next.js configuration, API routes, environment variables
- **`vercel.json`** - Deployment configuration, function settings

### Database & Authentication  
- **`/database/schema.sql`** - Complete PostgreSQL schema with RLS policies
- **`/database/deploy-schema.sql`** - Production deployment schema
- **`/src/lib/supabase.ts`** - Supabase client configuration and helpers

### Core Libraries & Utilities
- **`/src/lib/ai.ts`** - AI SDK configuration, streaming helpers, agent utilities
- **`/src/lib/brand.ts`** - Brand constants, design tokens, color system
- **`/src/lib/utils.ts`** - Utility functions, class name helpers, formatting
- **`/src/lib/motion.ts`** - Framer Motion variants, animation presets
- **`/src/lib/design-system.ts`** - Design system patterns, layout utilities

### Global Providers & Context
- **`/src/providers/UserProvider.tsx`** - Global user state management
- **`/src/components/ui/ConcurrentExecutionManager.tsx`** - Cross-cutting agent execution

### Documentation
- **`/docs/*`** - Comprehensive project documentation, architectural decisions
- **`BRAIN_SKIN_REFACTOR_COMPLETE.md`** - Detailed refactor documentation
- **`README.md`** - Project overview, setup instructions
- **`UNIFIED_CHAT_INTERFACE_SPECIFICATION.md`** - Unified chat interface requirements
- **`UNIFIED_CHAT_ALIGNMENT_ANALYSIS.md`** - Integration analysis and corrections

## 🎯 Development Workflow

### Hook-First Development Process
1. **Define business requirements** → Create custom hook with TypeScript interfaces
2. **Implement business logic** in hook with proper error handling and side effects  
3. **Create presentational component** that consumes the hook via props
4. **Component focuses solely** on rendering and user interaction, no business logic

### Testing Strategy
- **Unit test hooks** independently with mock data and API responses
- **Integration test components** with hook mocks and user interactions
- **E2E test** complete user workflows across pages and agent interactions

### Error Handling Patterns
- **Implement `handle_payment_failure`** and `handle_agent_error` functions in hooks
- **Use toast notifications** for user feedback on errors and success states
- **Graceful degradation** when APIs are unavailable or slow

## 💰 Business Logic & Payments

### Subscription Tiers
- **Growth Tier:** 10% transaction fee, 30/40/30 payout structure, basic features
- **Scale Tier:** $250/month + 7% fee, 50/25/25 payouts, advanced features, priority support

### Payment Processing
- **Stripe Integration:** Webhook handlers, subscription management, billing cycles
- **Usage Tracking:** Monitor API calls, agent interactions, feature usage per tier
- **RLS Policies:** Ensure contractors only access their own data and tier-appropriate features

## 🔒 Security & Data Isolation

### Row Level Security (RLS)
- **Contractor Data Isolation:** Implement RLS policies for all contractor-specific tables
- **Tier-based Access:** Restrict features based on subscription tier in database policies
- **API Security:** Validate user permissions in all API routes and agent endpoints

### Authentication Flow
- **SMS Verification:** Phone-based authentication with 6-digit codes
- **JWT Tokens:** Supabase-managed tokens with automatic refresh
- **Session Management:** Long-lived contractor sessions with secure token storage

## 🚀 Deployment & Monitoring

### Vercel Deployment
- **Automatic Builds:** Connected to GitHub with automatic deployments on push
- **Environment Variables:** Secure management of API keys, database URLs, secrets
- **Serverless Functions:** Python agents and Next.js API routes with proper timeouts

### Performance Monitoring
- **Real-time Updates:** Supabase subscriptions for live data without polling
- **Optimistic Updates:** Update UI immediately, sync with server asynchronously  
- **Error Tracking:** Comprehensive error logging and user feedback systems

## 📱 MOBILE PWA STRATEGY (DEPLOYMENT COMPLETE)

### **Progressive Web App Architecture**
FixItForMe is now a **full PWA with mobile-first contractor experience** that maintains desktop optimization for advanced features.

#### Mobile PWA Components (PRODUCTION READY)
- **`MobileLexiChat.tsx`** - AI assistant with conditional desktop redirects for complex requests
- **`MobileAddToHomeScreenTrigger.tsx`** - Platform-specific installation guide (iOS/Android)
- **`AddToHomeScreenGuide.tsx`** - Detailed step-by-step instructions with visual cues
- **`MobileDashboard.tsx`** - Essential contractor features with desktop upgrade prompts
- **`MobileNavigation.tsx`** - Touch-optimized navigation with company branding
- **Service Worker (`/public/sw.js`)** - Offline functionality and background sync
- **Enhanced Manifest** - PWA shortcuts, categories, and mobile optimization

#### Mobile Experience Strategy
```typescript
const MOBILE_STRATEGY = {
  philosophy: "Progressive Professional Experience",
  
  // Mobile = Essential Access Only
  mobileFeatures: [
    'basic_onboarding_with_lexi',
    'lead_notifications',
    'payment_status',
    'chat_history_persistence',
    'offline_pwa_functionality'
  ],
  
  // Desktop = Full Professional Suite  
  desktopUpgradePrompts: [
    'detailed_bidding_tools',
    'document_analysis',
    'multi_agent_workflows',
    'advanced_analytics',
    'rex_lead_generation',
    'alex_cost_analysis'
  ],
  
  // Conditional Logic in Chat
  conditionalRedirects: {
    trigger: 'DESKTOP_REQUIRED_INTENTS',
    action: 'Show "Continue on Desktop" CTA',
    message: 'Professional tools require larger screen'
  }
}
```

#### SSR Safety Protocols (CRITICAL)
```typescript
// ALWAYS check client-side before localStorage/sessionStorage
useEffect(() => {
  if (typeof window === 'undefined') return // SSR safety
  setIsClient(true)
}, [])

// ALWAYS conditionally render browser-specific features
if (!isClient) return null // Prevent SSR hydration issues
```

#### Platform-Specific Installation Instructions
- **iOS Safari**: Share button → "Add to Home Screen" → Confirm
- **Android Chrome**: Menu (⋮) → "Add to Home screen" / "Install app" 
- **Other Browsers**: Fallback to bookmark or browser recommendation

### Mobile Development Guidelines
1. **Mobile-First Components**: Always design for touch interfaces first
2. **Progressive Enhancement**: Basic functionality on mobile, advanced on desktop
3. **Harmonious UI**: Maintain brand consistency across all screen sizes
4. **Performance**: Optimize for mobile networks with service worker caching
5. **Accessibility**: Ensure touch targets meet minimum 44px standards

### PWA Deployment Checklist
- [x] Service worker registered and caching essential assets
- [x] Manifest.json with proper icons, shortcuts, and categories
- [x] Add to home screen guide with platform detection
- [x] Offline functionality for contractor dashboard
- [x] Push notification support for lead alerts
- [x] Background sync for data updates
- [x] SSR-safe client-side only rendering for browser APIs

This workspace represents a **production-ready, scalable contractor management platform** with a clean architectural foundation that separates business logic from presentation, enabling rapid feature development and easy maintenance.

## 🚨 CRITICAL: LATEST UI PRESERVATION PROTOCOL

### MANDATORY: Always Preserve Latest UI Work
**NEVER delete or modify sophisticated UI components without explicit user confirmation.**

#### Latest UI Status Verification Process
1. **Always search conversation history** for latest UI implementations before making changes
2. **Identify most recent/sophisticated versions** of components, especially those marked as "enhanced", "sophisticated", or "fromv0"
3. **Confirm with user before ANY deletion** of UI components that may contain advanced features
4. **Bias toward LATEST implementations** - newer sophisticated UI takes precedence over basic placeholders

#### UI Component Priority Hierarchy (HIGHEST TO LOWEST)
1. **🥇 Enhanced/Sophisticated Components**: D3.js charts, advanced agent UI, professional contractor branding
2. **🥈 Recent Implementations**: Components with Felix Gold/Forest Green branding, agent asset systems
3. **🥉 Basic/Placeholder Components**: Simple implementations without advanced features

#### Critical Files Requiring Extra Caution
- **`/src/components/ui/Charts.tsx`** - Contains sophisticated D3.js chart components with animations
- **`/src/components/EnhancedChatWindow.tsx`** - Advanced agent UI asset generation system  
- **`/src/components/agent-ui/*`** - Agent-specific UI components (AlexCostBreakdown, RexLeadDashboard, LexiOnboarding)
- **`/src/app/globals.css`** - Enhanced branding with Felix Gold (#D4A574) and Forest Green (#1A2E1A)
- **`/src/hooks/*`** - Business logic hooks containing sophisticated algorithms

#### Recovery Prevention Checklist
✅ **Before ANY file deletion/modification:**
1. Search conversation history with: `semantic_search("latest sophisticated UI fromv0 enhanced")`
2. Ask user: "I found [specific components]. Should I preserve the sophisticated version or replace with basic implementation?"
3. Wait for explicit user confirmation before proceeding
4. Document what sophisticated features would be lost in deletion

✅ **When finding conflicting implementations:**
1. Compare sophistication levels (D3.js charts > basic charts, enhanced branding > default colors)
2. Default to preserving the MORE sophisticated version
3. Ask user which implementation they prefer if unclear

✅ **Emergency Recovery Protocol:**
1. If sophisticated UI is accidentally deleted, immediately search conversation history
2. Identify lost components and features from documentation
3. Present comprehensive recovery plan to user
4. Implement step-by-step restoration with user approval

#### UI Sophistication Indicators to Preserve
- **D3.js interactive charts** with animations and tooltips
- **Agent UI asset generation** from JSON responses  
- **Felix Gold/Forest Green branding** with semantic CSS variables
- **Professional contractor dashboard** layouts
- **Enhanced chat management** with streaming responses
- **Responsive chart components** with breakpoint management
- **Advanced TypeScript interfaces** with comprehensive type safety

**Remember: The user has invested significant time developing sophisticated UI components. When in doubt, PRESERVE and ASK rather than DELETE and rebuild.**

## 🎯 CRITICAL: MULTI-ORDER IMPACT ANALYSIS PROTOCOL

### MANDATORY: Always Analyze Downstream Effects (1st-4th Order)
**NEVER make changes without comprehensive impact analysis across multiple orders.**

#### Multi-Order Analysis Process (STRICTLY ENFORCED)
1. **🥇 1st Order Impact**: Direct code changes and immediate effects
2. **🥈 2nd Order Impact**: Application flow and component interactions
3. **🥉 3rd Order Impact**: User experience and state management
4. **🏅 4th Order Impact**: Business logic and revenue optimization

#### Critical System Constraints (ZERO TOLERANCE)
- **Phone-Native Authentication**: NEVER convert phones to emails for Supabase auth
- **Session Consistency**: Backend user creation MUST result in frontend session
- **Architecture Preservation**: Maintain brain/skin separation at all costs
- **Brand Identity**: Forest Green for Rex, Felix Gold for Lexi (no blue/purple)

### Phone Authentication Standards (MANDATED)
```typescript
const PHONE_AUTH_PRINCIPLES = {
  approach: "Phone-Native Supabase Authentication",
  
  // CORRECT: Use phone directly
  correctAuth: {
    method: "adminSupabase.auth.admin.createUser({ phone, phone_confirm: true })",
    session: "supabase.auth.signInWithOtp({ phone, shouldCreateUser: false })",
    identity: "phone_number as primary identifier"
  },
  
  // BANNED: Email conversion patterns
  bannedPatterns: [
    "phone.replace('+', '') + '@domain.com'", // Email conversion
    "signInWithPassword with temp passwords",   // Password workarounds
    "magic links for phone authentication"     // Email-based flows
  ],
  
  // Multi-Order Impact Check
  validation: {
    first_order: "Code compiles and auth API returns user",
    second_order: "Frontend receives session tokens",
    third_order: "User stays logged in after redirect", 
    fourth_order: "Business features work with user context"
  }
}
```

### Architectural Decision Documentation
```typescript
const DECISION_FRAMEWORK = {
  before_any_change: [
    "1st Order: What code files are directly affected?",
    "2nd Order: Which components/flows depend on this?", 
    "3rd Order: How does this affect user experience?",
    "4th Order: What business logic breaks or improves?"
  ],
  
  session_management: {
    principle: "Backend creates users, Frontend establishes sessions",
    verification: "User can navigate protected routes after auth",
    failure_point: "Session not set = infinite redirect loops"
  },
  
  demo_upgrade_flow: {
    identification: "REMOVED - All demo infrastructure eliminated",
    analytics: "Real analytics for legitimate contractors only", 
    conversion: "Stripe-based subscription upgrades only"
  }
}
```

## 🎨 Design System & MCP Integration

### Figma MCP Configuration
- **Figma Dev Mode MCP Server:** Configured at `http://127.0.0.1:3845/sse` for real-time design token extraction
- **Workspace Configuration:** `.vscode/figma_mcp.json` with agent capabilities for `figma.devMode`
- **Global Configuration:** VS Code settings with MCP discovery enabled and chat agent mode
- **Myna UI Kit:** Premium TailwindCSS + shadcn/ui components at `https://www.figma.com/design/f5khzL71UIi807ND15eHcg/Myna-UI---TailwindCSS---shadcn-ui---Radix-Premium-UI-Kit--Community-?node-id=605-1271&m=dev`

### MCP Tools Available
- **`get_variable_defs`** - Extract design tokens (colors, spacing, typography) from Figma selections
- **`get_code`** - Generate React + TailwindCSS code from Figma components
- **`get_code_connect_map`** - Map Figma components to existing codebase components
- **`get_image`** - Extract component screenshots for layout reference

### Design Token Integration Workflow
1. **Select Figma Component:** Choose specific UI element in Figma desktop app
2. **Extract Variables:** Use MCP to get design tokens and component specifications
3. **Map to Brand:** Align extracted tokens with FixItForMe brand guidelines
4. **Update Components:** Apply new design system to existing shadcn/ui components
5. **Maintain Architecture:** Preserve brain/skin separation during UI updates

### Re-skinning Strategy
- **Component-First Approach:** Update individual UI components using Figma MCP data
- **Token-Driven Design:** Extract and apply consistent design tokens across all components
- **Responsive Integration:** Ensure Myna UI responsive patterns work with existing layouts
- **Brand Alignment:** Maintain FixItForMe brand identity while adopting Myna UI patterns

## File Structure Conventions
- `/src/hooks/*` - Custom React hooks containing all business logic
- `/src/app/contractor/*` - Contractor-facing pages (presentational only)
- `/src/app/api/agents/*` - AI agent endpoints
- `/src/app/api/payments/*` - Payment processing
- `/src/lib/*` - Shared utilities (supabase.ts, ai.ts)
- `/src/components/*` - Reusable UI components (presentational only)
- `/src/providers/*` - React context providers for global state

## 🎯 BRAND RESTORATION EXECUTION STATUS

### ✅ PHASE 1 COMPLETE: Critical Enhanced UI Components
**Status: COMPLETED** - All core agent color violations fixed

#### Fixed Components:
1. **✅ EnhancedChatWindow.tsx** - Rex avatar color: `bg-blue-600` → `bg-secondary`
2. **✅ AgentMentionModal.tsx** - Complete agent color system restored:
   - Lexi: `bg-blue-500` → `bg-primary`, `text-blue-600` → `text-primary`
   - Rex: `bg-purple-500` → `bg-secondary`, `text-purple-600` → `text-secondary`
   - Search focus ring: `focus:ring-blue-500` → `focus:ring-primary`
   - Selection states: `bg-blue-50 border-blue-200` → `bg-primary/5 border-primary/20`
   - Selection indicator: `bg-blue-500` → `bg-primary`

#### Impact: 
- ✅ All agent interactions now use correct brand colors
- ✅ Rex properly displays as Forest Green (professional, reliable)
- ✅ Lexi properly displays as Felix Gold (warm, welcoming)
- ✅ Foundation components affecting ALL agent UI are brand-compliant

### ✅ PHASE 2 COMPLETE: Chat & Interaction Components
**Status: COMPLETED** - All chat interaction violations fixed

#### Fixed Components:
1. **✅ ChatCards.tsx** - Comprehensive lead and material card system restored:
   - Platform colors: Craigslist `bg-blue-100` → `bg-muted/30`, Municipal `bg-purple-100` → `bg-secondary/10`
   - Lead details links: `text-blue-600` → `text-primary`
   - Contact icons: Phone/Mail `text-blue-600` → `text-secondary`
   - Contact buttons: `bg-blue-600` → `bg-primary`
   - Analysis buttons: `text-purple-600` → `text-primary`
   - Supplier styling: Lowe's `bg-blue-100` → `bg-muted/50`
   - Material comparison panels: `bg-blue-50/200/900/700` → `bg-primary/5/20` variants

2. **✅ ChatFileUpload.tsx** - File type icons:
   - Image icons: `text-blue-500` → `text-primary`

3. **✅ EnhancedChatManager.tsx** - Floating agent buttons:
   - Rex color: `bg-blue-600` → `bg-secondary`

#### Impact:
- ✅ All lead generation cards use proper brand colors
- ✅ Material research components follow brand guidelines
- ✅ Chat file uploads consistent with primary branding
- ✅ Agent interaction buttons properly branded

### ✅ PHASE 3 COMPLETE: Dashboard & Settings Components  
**Status: COMPLETED** - All dashboard and settings violations fixed

#### Fixed Components:
1. **✅ AgentProgressIndicator.tsx** - Complete agent progress system restored:
   - Agent background colors: Rex `bg-blue-500/10` → `bg-secondary/10`, Lexi `bg-purple-500/10` → `bg-primary/10`
   - Agent text colors: Rex `text-blue-600` → `text-secondary`, Lexi `text-purple-600` → `text-primary`
   - Progress bar colors: Rex `[&>div]:bg-blue-500` → `[&>div]:bg-secondary`, Lexi `[&>div]:bg-purple-500` → `[&>div]:bg-primary`
   - Quality metrics: Data points `text-blue-600` → `text-secondary`, Confidence `text-purple-600` → `text-primary`
   - Active step states: `bg-blue-50 border-blue-200` → `bg-primary/5 border-primary/20`
   - Loading spinners: `text-blue-600` → `text-primary`

2. **✅ useJobBid.ts** - Lead source color mapping:
   - Rex discovery: `text-blue-600` → `text-secondary`

3. **✅ ResponsiveLeadFeed.tsx** - Lead source badge colors:
   - Facebook: `bg-blue-100 text-blue-800` → `bg-muted/50 text-foreground`
   - Government: `bg-purple-100 text-purple-800` → `bg-secondary/10 text-secondary`

#### Impact:
- ✅ All agent progress indicators use proper brand colors
- ✅ Lead source mappings consistent with brand guidelines
- ✅ Dashboard components properly display agent personalities through color
- ✅ Rex consistently shows as Forest Green (reliable, professional)
- ✅ Lexi consistently shows as Felix Gold (warm, welcoming)

### ✅ PHASE 4 COMPLETE: Logo & Brand Asset Verification
**Status: COMPLETED** - All brand assets properly configured

#### Fixed Components:
1. **✅ App Layout (layout.tsx)** - Favicon and metadata configuration:
   - Favicon: Properly configured to use `/favicon.ico`
   - Apple touch icon: Uses `/logo.png` for mobile bookmarks
   - Metadata: Proper Next.js metadata structure implemented

2. **✅ Logo Integration Verification**:
   - ContractorAuth.tsx: ✅ Uses `/logo.png` correctly
   - MobileRedirect.tsx: ✅ Uses `/logo.png` correctly  
   - AppLayout.tsx: ✅ Uses `/logo.png` correctly
   - Onboarding page: ✅ Uses `/logo.png` correctly

3. **✅ Brand Asset Audit**:
   - favicon.ico: ✅ Exists in public/ directory (25KB)
   - logo.png: ✅ Exists and properly referenced across components
   - All authentication flows display brand assets consistently

#### Impact:
- ✅ Favicon properly displays in browser tabs
- ✅ Logo consistently shown across all user authentication flows
- ✅ Mobile bookmark icon uses proper brand logo
- ✅ Brand identity maintained throughout application

### 🎉 COMPREHENSIVE BRAND RESTORATION COMPLETE

## 📊 FINAL BRAND COMPLIANCE STATUS

### ✅ ALL PHASES COMPLETED:
1. **✅ Phase 1: Critical Enhanced UI Components** - Foundation components affecting ALL agent interactions
2. **✅ Phase 2: Chat & Interaction Components** - User-facing interaction components
3. **✅ Phase 3: Dashboard & Settings Components** - Internal workflow components  
4. **✅ Phase 4: Logo & Brand Asset Verification** - Brand identity foundation

### 🎯 BRAND IDENTITY RESTORED:
- **Rex the Retriever** = Forest Green (`secondary`) - Professional, reliable, methodical ✅
- **Lexi the Liaison** = Felix Gold (`primary`) - Warm, welcoming, guidance-focused ✅
- **Alex the Assessor** = Success Green - Analytical, precise, calculation-focused ✅
- **Felix the Fixer** = Forest Green (`secondary`) - Diagnostic, technical, problem-solving ✅

### 📈 IMPACT SUMMARY:
- **100+ brand violations fixed** across core user-facing components
- **Agent personality consistency** through proper color psychology
- **Professional contractor experience** maintained throughout
- **Forest Green brand identity** preserved as requested ("forest green was key")
- **Logo and favicon integration** verified across all flows

### 🔒 BRAND PROTECTION MEASURES:
- **Comprehensive copilot instructions** documenting brand standards
- **Agent color mapping** clearly defined and enforced
- **Banned color patterns** explicitly documented
- **Brand validation process** established for future development

**STATUS: BRAND RESTORATION 100% COMPLETE ✅**

#### Authentication System Status (JULY 2025)
- **✅ PRODUCTION READY**: Pure WhatsApp sandbox authentication via Twilio
- **✅ DEMO CODES REMOVED**: All bypass codes (209741, 503913, 058732, 002231) permanently deleted
- **✅ SECRET UPGRADE IMPLEMENTED**: `-felixscale` suffix enables Scale tier upgrade (WhatsApp OTP + "-felixscale")
- **✅ BACKEND CLEAN**: No demo logic in verify-whatsapp-otp or send-whatsapp-otp APIs
- **✅ UI CLEAN**: Authentication flow uses only real WhatsApp OTP verification with subtle upgrade hint
- **✅ PHONE-NATIVE**: Direct phone authentication, no email conversion patterns
- **✅ MOCK UPGRADE ACTIVE**: Secret code suffix-based Scale tier upgrades for power users

### SECRET UPGRADE SYSTEM: `-felixscale` Code
**Power users can append `-felixscale` to their WhatsApp OTP for instant Scale tier upgrade.**

#### Secret Upgrade Flow (PRODUCTION ACTIVE)
```typescript
const SECRET_UPGRADE_FLOW = {
  trigger: "WhatsApp OTP + '-felixscale' suffix",
  example: "123456-felixscale", // If OTP is 123456
  
  // Backend Processing (verify-whatsapp-otp API)
  backend: {
    detection: "token.endsWith('-felixscale')",
    validation: "Strip suffix, verify actual OTP normally",
    upgrade: "Set subscription_tier: 'scale', status: 'active'",
    tracking: "Analytics: 'secret_upgrade_success' event"
  },
  
  // Frontend Experience
  frontend: {
    input: "Standard OTP input accepts suffix seamlessly",
    feedback: "🎉 Secret Scale Tier Upgrade Activated!",
    hint: "🔓 Pro tip: Special codes unlock premium features",
    redirect: "Normal onboarding/dashboard flow"
  },
  
  // Database Updates
  database: {
    contractor_profiles: {
      subscription_tier: "scale",
      subscription_status: "active", 
      tier_upgraded_at: "ISO timestamp",
      upgrade_method: "secret_code_felixscale"
    }
  }
}
```

#### Secret Upgrade Security Features
- **Subtle Discovery**: UI hint without revealing exact syntax
- **Seamless Integration**: No special API endpoints, works through normal OTP flow  
- **Proper Validation**: Still requires valid WhatsApp OTP before processing upgrade
- **Analytics Tracking**: Full event tracking for upgrade success/failure
- **Retroactive Upgrade**: Works for both new and existing contractors

## 🎨 **ENHANCED BRAND RATIONALE & EVOLUTION**

### **Brand Identity Psychology (Updated July 2025)**
**Forest Green excellence with conversational agent personalities**

#### **Agent Color Psychology System**
```typescript
const AGENT_PERSONALITIES = {
  lexi: {
    color: '#D4A574', // Felix Gold
    personality: 'Warm, welcoming guidance counselor',
    conversation_style: 'Encouraging, educational, step-by-step',
    branding_rationale: 'Gold standard of onboarding excellence'
  },
  rex: {
    color: '#1A2E1A', // Forest Green  
    personality: 'Professional, methodical researcher',
    conversation_style: 'Data-driven, analytical, reliable',
    branding_rationale: 'Stable growth and professional reliability'
  },
  alex: {
    color: '#22c55e', // Success Green
    personality: 'Precise, analytical cost expert',
    conversation_style: 'Detail-oriented, calculation-focused',
    branding_rationale: 'Successful bidding and profit optimization'
  }
}
```

#### **Brand Evolution Through Conversational AI**
- **Phase 1**: Static forms → **Phase 5**: Conversational onboarding with Lexi
- **Phase 2**: Basic chat → **Phase 5**: Multi-agent thread management
- **Phase 3**: Mobile PWA → **Current**: 8-breakpoint responsive conversations
- **Brand Core**: Professional contractor excellence through AI-guided workflows

### **Thread-First Brand Experience**
- **Conversation Continuity**: Brand reinforcement through persistent threads
- **Agent Personality Consistency**: Each interaction strengthens brand identity
- **Professional Growth**: From Growth tier → Scale tier through agent guidance

#### Agent Color Standards (STRICTLY ENFORCED)
```typescript
const AGENT_COLORS = {
  lexi: {
    bg: 'bg-primary/10',           // Felix Gold variants ONLY
    text: 'text-primary', 
    border: 'border-primary/20',
    focus: 'focus:border-primary/50 focus:ring-primary/20'
  },
  alex: {
    bg: 'bg-green-500/10',         // Success Green variants  
    text: 'text-green-600',
    border: 'border-green-500/20',
    focus: 'focus:border-green-500/50 focus:ring-green-500/20'
  },
  rex: {
    bg: 'bg-secondary/10',         // Forest Green variants ONLY
    text: 'text-secondary',
    border: 'border-secondary/20', 
    focus: 'focus:border-secondary/50 focus:ring-secondary/20'
  }
}
```

#### BANNED Color Patterns (Zero Tolerance)
- ❌ `blue-*` classes for Rex (must use `secondary`)
- ❌ `purple-*` classes for Lexi (must use `primary`) 
- ❌ `violet-*` classes (never use)
- ❌ Hardcoded hex colors bypassing CSS variables

#### Brand Identity Core Principles
1. **Rex the Retriever = Forest Green (`secondary`)** - Professional, reliable, methodical
2. **Lexi the Liaison = Felix Gold (`primary`)** - Warm, welcoming, guidance-focused
3. **Alex the Assessor = Success Green** - Analytical, precise, calculation-focused
4. **Felix the Fixer = Forest Green (`secondary`)** - Diagnostic, technical, problem-solving

### Logo & Favicon Standards
- **Logo**: `/public/logo.png` - Must be consistently referenced in all auth components
- **Favicon**: `/public/favicon.ico` - Must be properly configured in app metadata
- **Brand Assets**: Verify integration across all user-facing components

### Enhanced UI Component Hierarchy
1. **🥇 enhanced-ui.tsx** - Foundation component affecting ALL agent interactions
2. **🥈 Agent-specific components** - AgentMentionModal, AgentProgressIndicator, EnhancedChatWindow
3. **🥉 Chat interaction components** - ChatCards, ChatFileUpload, chat managers
4. **📄 Page-level components** - Authentication, dashboard, settings, onboarding

### Brand Compliance Validation Process
1. **Before ANY component edit**: Search for existing blue/purple violations
2. **Component-level validation**: Ensure agent colors match brand standards
3. **Cross-component consistency**: Verify color usage across related components
4. **Logo/favicon verification**: Check brand asset integration in user flows

# FixItForMe Contractor Module - Comprehensive Development Guide

## 🏗️ Project Architecture & Technical Stack

### Core Technologies
- **Frontend Framework:** Next.js 15 with App Router and React Server Components
- **Language:** TypeScript with strict type checking and comprehensive interfaces
- **Styling:** Tailwind CSS with semantic design tokens and shadcn/ui components
- **State Management:** Custom React hooks pattern with Context providers for global state
- **Database:** Supabase PostgreSQL with Row Level Security (RLS) and real-time subscriptions
- **Authentication:** Supabase Auth with SMS verification and JWT tokens
- **AI Integration:** Vercel AI SDK with streaming responses and Deepseek reasoning models
- **Payments:** Stripe integration with webhook handlers and tiered subscription management
- **Deployment:** Vercel with serverless functions and automatic builds
- **File Management:** Supabase Storage with secure file uploads and CDN delivery

## 🗄️ **DATABASE ARCHITECTURE STATUS (Phase 5C Complete)**

### **Enhanced Chat System (Production Ready)**
```sql
-- Thread Management Functions (Deployed)
✅ delete_chat_thread(thread_id, contractor_id)
✅ cleanup_excess_chat_threads(contractor_id, max_threads) 
✅ get_chat_thread_count(contractor_id)
✅ get_chat_threads_with_metadata(contractor_id)
✅ archive_chat_thread(thread_id, contractor_id)

-- Chat Persistence Tables (Active)
✅ chat_message_ui_assets - Agent-generated UI components
✅ chat_typing_indicators - Real-time agent typing status
✅ chat_followup_prompts - Contextual conversation prompts
```

### **Conversational Database Integration**
- **Thread Limits**: 10 threads per contractor (configurable)
- **Automatic Cleanup**: Oldest threads deleted when limit exceeded
- **Soft Archive**: Important conversations can be archived instead of deleted
- **Cross-Agent Context**: All agents access same conversation history
- **Real-Time Sync**: Live typing indicators and prompt suggestions

## 🧠 Brain/Skin Architecture (Core Principle)

### The Brain: Custom Hooks (`/src/hooks/*`)
**All business logic MUST live in custom React hooks. This is the core architectural principle.**

#### Authentication & User Management
- **`useAuth.ts`** - SMS authentication flow, phone verification, session management, login state
- **`useUser.ts`** - Global user context interface, contractor profile types, subscription data
- **`useProfile.ts`** - Contractor profile CRUD operations, validation, profile updates

#### Core Application Features  
- **`useDashboard.ts`** - Dashboard metrics aggregation, performance data, analytics calculations
- **`useLeads.ts`** - Lead fetching, filtering, sorting, bid management, lead status updates
- **`useOnboarding.ts`** - Step-by-step contractor setup, progress tracking, validation logic
- **`useChat.ts`** - Multi-agent chat coordination, message handling, conversation state

#### Business Operations
- **`useSubscription.ts`** - Stripe integration, tier management, payment processing, billing
- **`useDocumentUploader.ts`** - File upload logic, document validation, storage management
- **`useSettings.ts`** - Profile settings, notification preferences, account configuration

#### UI Coordination
- **`useAgentUI.ts`** - Agent component interactions, dynamic UI generation, agent responses
- **`useHomePage.ts`** - Landing page logic, mobile detection, navigation routing
- **`useResponsiveChart.ts`** - Chart responsive behavior, breakpoint management, D3 integration

### The Skin: Presentational Components
**All UI components MUST be purely presentational, consuming hooks for data and actions.**

#### Pages (100% Presentational)
- **`src/app/page.tsx`** - Landing page (consumes `useHomePage`)
- **`src/app/login/page.tsx`** - Authentication UI (consumes `useAuth`)  
- **`src/app/contractor/dashboard/page.tsx`** - Main dashboard (consumes `useDashboard`)
- **`src/app/contractor/onboarding/page.tsx`** - Setup flow (consumes `useOnboarding`)
- **`src/app/contractor/settings/page.tsx`** - Settings UI (consumes `useSettings`)

#### Components (100% Presentational)
- **`ProfileEditor.tsx`** - Profile editing UI (consumes `useProfile`)
- **`LeadFeed.tsx`** - Lead display and interaction (consumes `useLeads`)
- **`SubscriptionManager.tsx`** - Subscription management UI (consumes `useSubscription`)
- **`DocumentUploader.tsx`** - File upload interface (consumes `useDocumentUploader`)
- **`AgentComponents.tsx`** - Agent UI components (consumes `useAgentUI`)

### Architectural Constraints (STRICTLY ENFORCED)
1. **No useState/useEffect in UI components** - All reactive state handled by hooks
2. **Props-driven components** - Components receive all data and functions from hooks via props  
3. **Single responsibility hooks** - Each hook manages one business domain
4. **Type safety throughout** - Comprehensive TypeScript interfaces for all hook returns
5. **Event handling only** - Components only handle UI events, no business logic

## 🤖 AI AGENT SYSTEM - CONVERSATIONAL ARCHITECTURE

### **Indie Dev Dan Inspired Conversational Agents**
**CRITICAL: All agents are fully conversational, NOT scripted bots**

#### **Agent Personas & Capabilities**
- **Lexi the Liaison** (`/src/app/api/agents/lexi/route.ts`) - Conversational onboarding guide, Felix Gold branding
- **Alex the Assessor** (`/src/app/api/agents/alex/route.ts`) - Conversational bidding assistant, Success Green branding  
- **Rex the Retriever** (`/src/app/api/agents/rex/route.ts`) - Conversational lead generation, Forest Green branding
- **Felix the Fixer** (referenced) - Conversational diagnostic agent for homeowner referrals

#### **Conversational Agent Architecture Principles**
- **Shared Context Access:** All agents can draw context from the same chat thread
- **Thread-Based Memory:** Persistent conversation history across agent interactions
- **Dynamic Agent Switching:** Users can switch agents within the same conversation
- **Real-Time Streaming:** All responses use Vercel AI SDK streaming
- **Thread Management:** Automatic cleanup when users reach thread limits (default: 10 threads)

#### **Thread Management System**
```typescript
// Thread deletion and management functions deployed
const THREAD_MANAGEMENT = {
  functions: [
    'delete_chat_thread(thread_id, contractor_id)',
    'cleanup_excess_chat_threads(contractor_id, max_threads)',
    'get_chat_thread_count(contractor_id)',
    'get_chat_threads_with_metadata(contractor_id)',
    'archive_chat_thread(thread_id, contractor_id)'
  ],
  default_limit: 10,
  cleanup_strategy: 'Delete oldest threads when limit exceeded',
  soft_delete: 'Archive option available for important conversations'
}
```

## 📁 Critical File Structure & Documentation

### Configuration & Setup
- **`package.json`** - Dependencies, scripts, Next.js 15 configuration
- **`tsconfig.json`** - TypeScript strict configuration with path mapping
- **`tailwind.config.ts`** - Design system tokens, semantic color variables
- **`next.config.ts`** - Next.js configuration, API routes, environment variables
- **`vercel.json`** - Deployment configuration, function settings

### Database & Authentication  
- **`/database/schema.sql`** - Complete PostgreSQL schema with RLS policies
- **`/database/deploy-schema.sql`** - Production deployment schema
- **`/src/lib/supabase.ts`** - Supabase client configuration and helpers

### Core Libraries & Utilities
- **`/src/lib/ai.ts`** - AI SDK configuration, streaming helpers, agent utilities
- **`/src/lib/brand.ts`** - Brand constants, design tokens, color system
- **`/src/lib/utils.ts`** - Utility functions, class name helpers, formatting
- **`/src/lib/motion.ts`** - Framer Motion variants, animation presets
- **`/src/lib/design-system.ts`** - Design system patterns, layout utilities

### Global Providers & Context
- **`/src/providers/UserProvider.tsx`** - Global user state management
- **`/src/components/ui/ConcurrentExecutionManager.tsx`** - Cross-cutting agent execution

### Documentation
- **`/docs/*`** - Comprehensive project documentation, architectural decisions
- **`BRAIN_SKIN_REFACTOR_COMPLETE.md`** - Detailed refactor documentation
- **`README.md`** - Project overview, setup instructions

## 🎯 Development Workflow

### Hook-First Development Process
1. **Define business requirements** → Create custom hook with TypeScript interfaces
2. **Implement business logic** in hook with proper error handling and side effects  
3. **Create presentational component** that consumes the hook via props
4. **Component focuses solely** on rendering and user interaction, no business logic

### Testing Strategy
- **Unit test hooks** independently with mock data and API responses
- **Integration test components** with hook mocks and user interactions
- **E2E test** complete user workflows across pages and agent interactions

### Error Handling Patterns
- **Implement `handle_payment_failure`** and `handle_agent_error` functions in hooks
- **Use toast notifications** for user feedback on errors and success states
- **Graceful degradation** when APIs are unavailable or slow

## 💰 Business Logic & Payments

### Subscription Tiers
- **Growth Tier:** 10% transaction fee, 30/40/30 payout structure, basic features
- **Scale Tier:** $250/month + 7% fee, 50/25/25 payouts, advanced features, priority support

### Payment Processing
- **Stripe Integration:** Webhook handlers, subscription management, billing cycles
- **Usage Tracking:** Monitor API calls, agent interactions, feature usage per tier
- **RLS Policies:** Ensure contractors only access their own data and tier-appropriate features

## 🔒 Security & Data Isolation

### Row Level Security (RLS)
- **Contractor Data Isolation:** Implement RLS policies for all contractor-specific tables
- **Tier-based Access:** Restrict features based on subscription tier in database policies
- **API Security:** Validate user permissions in all API routes and agent endpoints

### Authentication Flow
- **SMS Verification:** Phone-based authentication with 6-digit codes
- **JWT Tokens:** Supabase-managed tokens with automatic refresh
- **Session Management:** Long-lived contractor sessions with secure token storage

## 🚀 Deployment & Monitoring

### Vercel Deployment
- **Automatic Builds:** Connected to GitHub with automatic deployments on push
- **Environment Variables:** Secure management of API keys, database URLs, secrets
- **Serverless Functions:** Python agents and Next.js API routes with proper timeouts

### Performance Monitoring
- **Real-time Updates:** Supabase subscriptions for live data without polling
- **Optimistic Updates:** Update UI immediately, sync with server asynchronously  
- **Error Tracking:** Comprehensive error logging and user feedback systems

## 📱 MOBILE PWA STRATEGY (DEPLOYMENT COMPLETE)

### **Progressive Web App Architecture**
FixItForMe is now a **full PWA with mobile-first contractor experience** that maintains desktop optimization for advanced features.

#### Mobile PWA Components (PRODUCTION READY)
- **`MobileLexiChat.tsx`** - AI assistant with conditional desktop redirects for complex requests
- **`MobileAddToHomeScreenTrigger.tsx`** - Platform-specific installation guide (iOS/Android)
- **`AddToHomeScreenGuide.tsx`** - Detailed step-by-step instructions with visual cues
- **`MobileDashboard.tsx`** - Essential contractor features with desktop upgrade prompts
- **`MobileNavigation.tsx`** - Touch-optimized navigation with company branding
- **Service Worker (`/public/sw.js`)** - Offline functionality and background sync
- **Enhanced Manifest** - PWA shortcuts, categories, and mobile optimization

#### Mobile Experience Strategy
```typescript
const MOBILE_STRATEGY = {
  philosophy: "Progressive Professional Experience",
  
  // Mobile = Essential Access Only
  mobileFeatures: [
    'basic_onboarding_with_lexi',
    'lead_notifications',
    'payment_status',
    'chat_history_persistence',
    'offline_pwa_functionality'
  ],
  
  // Desktop = Full Professional Suite  
  desktopUpgradePrompts: [
    'detailed_bidding_tools',
    'document_analysis',
    'multi_agent_workflows',
    'advanced_analytics',
    'rex_lead_generation',
    'alex_cost_analysis'
  ],
  
  // Conditional Logic in Chat
  conditionalRedirects: {
    trigger: 'DESKTOP_REQUIRED_INTENTS',
    action: 'Show "Continue on Desktop" CTA',
    message: 'Professional tools require larger screen'
  }
}
```

#### SSR Safety Protocols (CRITICAL)
```typescript
// ALWAYS check client-side before localStorage/sessionStorage
useEffect(() => {
  if (typeof window === 'undefined') return // SSR safety
  setIsClient(true)
}, [])

// ALWAYS conditionally render browser-specific features
if (!isClient) return null // Prevent SSR hydration issues
```

#### Platform-Specific Installation Instructions
- **iOS Safari**: Share button → "Add to Home Screen" → Confirm
- **Android Chrome**: Menu (⋮) → "Add to Home screen" / "Install app" 
- **Other Browsers**: Fallback to bookmark or browser recommendation

### Mobile Development Guidelines
1. **Mobile-First Components**: Always design for touch interfaces first
2. **Progressive Enhancement**: Basic functionality on mobile, advanced on desktop
3. **Harmonious UI**: Maintain brand consistency across all screen sizes
4. **Performance**: Optimize for mobile networks with service worker caching
5. **Accessibility**: Ensure touch targets meet minimum 44px standards

### PWA Deployment Checklist
- [x] Service worker registered and caching essential assets
- [x] Manifest.json with proper icons, shortcuts, and categories
- [x] Add to home screen guide with platform detection
- [x] Offline functionality for contractor dashboard
- [x] Push notification support for lead alerts
- [x] Background sync for data updates
- [x] SSR-safe client-side only rendering for browser APIs

This workspace represents a **production-ready, scalable contractor management platform** with a clean architectural foundation that separates business logic from presentation, enabling rapid feature development and easy maintenance.

## 🚨 CRITICAL: LATEST UI PRESERVATION PROTOCOL

### MANDATORY: Always Preserve Latest UI Work
**NEVER delete or modify sophisticated UI components without explicit user confirmation.**

#### Latest UI Status Verification Process
1. **Always search conversation history** for latest UI implementations before making changes
2. **Identify most recent/sophisticated versions** of components, especially those marked as "enhanced", "sophisticated", or "fromv0"
3. **Confirm with user before ANY deletion** of UI components that may contain advanced features
4. **Bias toward LATEST implementations** - newer sophisticated UI takes precedence over basic placeholders

#### UI Component Priority Hierarchy (HIGHEST TO LOWEST)
1. **🥇 Enhanced/Sophisticated Components**: D3.js charts, advanced agent UI, professional contractor branding
2. **🥈 Recent Implementations**: Components with Felix Gold/Forest Green branding, agent asset systems
3. **🥉 Basic/Placeholder Components**: Simple implementations without advanced features

#### Critical Files Requiring Extra Caution
- **`/src/components/ui/Charts.tsx`** - Contains sophisticated D3.js chart components with animations
- **`/src/components/EnhancedChatWindow.tsx`** - Advanced agent UI asset generation system  
- **`/src/components/agent-ui/*`** - Agent-specific UI components (AlexCostBreakdown, RexLeadDashboard, LexiOnboarding)
- **`/src/app/globals.css`** - Enhanced branding with Felix Gold (#D4A574) and Forest Green (#1A2E1A)
- **`/src/hooks/*`** - Business logic hooks containing sophisticated algorithms

#### Recovery Prevention Checklist
✅ **Before ANY file deletion/modification:**
1. Search conversation history with: `semantic_search("latest sophisticated UI fromv0 enhanced")`
2. Ask user: "I found [specific components]. Should I preserve the sophisticated version or replace with basic implementation?"
3. Wait for explicit user confirmation before proceeding
4. Document what sophisticated features would be lost in deletion

✅ **When finding conflicting implementations:**
1. Compare sophistication levels (D3.js charts > basic charts, enhanced branding > default colors)
2. Default to preserving the MORE sophisticated version
3. Ask user which implementation they prefer if unclear

✅ **Emergency Recovery Protocol:**
1. If sophisticated UI is accidentally deleted, immediately search conversation history
2. Identify lost components and features from documentation
3. Present comprehensive recovery plan to user
4. Implement step-by-step restoration with user approval

#### UI Sophistication Indicators to Preserve
- **D3.js interactive charts** with animations and tooltips
- **Agent UI asset generation** from JSON responses  
- **Felix Gold/Forest Green branding** with semantic CSS variables
- **Professional contractor dashboard** layouts
- **Enhanced chat management** with streaming responses
- **Responsive chart components** with breakpoint management
- **Advanced TypeScript interfaces** with comprehensive type safety

**Remember: The user has invested significant time developing sophisticated UI components. When in doubt, PRESERVE and ASK rather than DELETE and rebuild.**

## 🎨 Design System & MCP Integration

### Figma MCP Configuration
- **Figma Dev Mode MCP Server:** Configured at `http://127.0.0.1:3845/sse` for real-time design token extraction
- **Workspace Configuration:** `.vscode/figma_mcp.json` with agent capabilities for `figma.devMode`
- **Global Configuration:** VS Code settings with MCP discovery enabled and chat agent mode
- **Myna UI Kit:** Premium TailwindCSS + shadcn/ui components at `https://www.figma.com/design/f5khzL71UIi807ND15eHcg/Myna-UI---TailwindCSS---shadcn-ui---Radix-Premium-UI-Kit--Community-?node-id=605-1271&m=dev`

### MCP Tools Available
- **`get_variable_defs`** - Extract design tokens (colors, spacing, typography) from Figma selections
- **`get_code`** - Generate React + TailwindCSS code from Figma components
- **`get_code_connect_map`** - Map Figma components to existing codebase components
- **`get_image`** - Extract component screenshots for layout reference

### Design Token Integration Workflow
1. **Select Figma Component:** Choose specific UI element in Figma desktop app
2. **Extract Variables:** Use MCP to get design tokens and component specifications
3. **Map to Brand:** Align extracted tokens with FixItForMe brand guidelines
4. **Update Components:** Apply new design system to existing shadcn/ui components
5. **Maintain Architecture:** Preserve brain/skin separation during UI updates

### Re-skinning Strategy
- **Component-First Approach:** Update individual UI components using Figma MCP data
- **Token-Driven Design:** Extract and apply consistent design tokens across all components
- **Responsive Integration:** Ensure Myna UI responsive patterns work with existing layouts
- **Brand Alignment:** Maintain FixItForMe brand identity while adopting Myna UI patterns

## File Structure Conventions
- `/src/hooks/*` - Custom React hooks containing all business logic
- `/src/app/contractor/*` - Contractor-facing pages (presentational only)
- `/src/app/api/agents/*` - AI agent endpoints
- `/src/app/api/payments/*` - Payment processing
- `/src/lib/*` - Shared utilities (supabase.ts, ai.ts)
- `/src/components/*` - Reusable UI components (presentational only)
- `/src/providers/*` - React context providers for global state

## 🎯 BRAND RESTORATION EXECUTION STATUS

### ✅ PHASE 1 COMPLETE: Critical Enhanced UI Components
**Status: COMPLETED** - All core agent color violations fixed

#### Fixed Components:
1. **✅ EnhancedChatWindow.tsx** - Rex avatar color: `bg-blue-600` → `bg-secondary`
2. **✅ AgentMentionModal.tsx** - Complete agent color system restored:
   - Lexi: `bg-blue-500` → `bg-primary`, `text-blue-600` → `text-primary`
   - Rex: `bg-purple-500` → `bg-secondary`, `text-purple-600` → `text-secondary`
   - Search focus ring: `focus:ring-blue-500` → `focus:ring-primary`
   - Selection states: `bg-blue-50 border-blue-200` → `bg-primary/5 border-primary/20`
   - Selection indicator: `bg-blue-500` → `bg-primary`

#### Impact: 
- ✅ All agent interactions now use correct brand colors
- ✅ Rex properly displays as Forest Green (professional, reliable)
- ✅ Lexi properly displays as Felix Gold (warm, welcoming)
- ✅ Foundation components affecting ALL agent UI are brand-compliant

### ✅ PHASE 2 COMPLETE: Chat & Interaction Components
**Status: COMPLETED** - All chat interaction violations fixed

#### Fixed Components:
1. **✅ ChatCards.tsx** - Comprehensive lead and material card system restored:
   - Platform colors: Craigslist `bg-blue-100` → `bg-muted/30`, Municipal `bg-purple-100` → `bg-secondary/10`
   - Lead details links: `text-blue-600` → `text-primary`
   - Contact icons: Phone/Mail `text-blue-600` → `text-secondary`
   - Contact buttons: `bg-blue-600` → `bg-primary`
   - Analysis buttons: `text-purple-600` → `text-primary`
   - Supplier styling: Lowe's `bg-blue-100` → `bg-muted/50`
   - Material comparison panels: `bg-blue-50/200/900/700` → `bg-primary/5/20` variants

2. **✅ ChatFileUpload.tsx** - File type icons:
   - Image icons: `text-blue-500` → `text-primary`

3. **✅ EnhancedChatManager.tsx** - Floating agent buttons:
   - Rex color: `bg-blue-600` → `bg-secondary`

#### Impact:
- ✅ All lead generation cards use proper brand colors
- ✅ Material research components follow brand guidelines
- ✅ Chat file uploads consistent with primary branding
- ✅ Agent interaction buttons properly branded

### ✅ PHASE 3 COMPLETE: Dashboard & Settings Components  
**Status: COMPLETED** - All dashboard and settings violations fixed

#### Fixed Components:
1. **✅ AgentProgressIndicator.tsx** - Complete agent progress system restored:
   - Agent background colors: Rex `bg-blue-500/10` → `bg-secondary/10`, Lexi `bg-purple-500/10` → `bg-primary/10`
   - Agent text colors: Rex `text-blue-600` → `text-secondary`, Lexi `text-purple-600` → `text-primary`
   - Progress bar colors: Rex `[&>div]:bg-blue-500` → `[&>div]:bg-secondary`, Lexi `[&>div]:bg-purple-500` → `[&>div]:bg-primary`
   - Quality metrics: Data points `text-blue-600` → `text-secondary`, Confidence `text-purple-600` → `text-primary`
   - Active step states: `bg-blue-50 border-blue-200` → `bg-primary/5 border-primary/20`
   - Loading spinners: `text-blue-600` → `text-primary`

2. **✅ useJobBid.ts** - Lead source color mapping:
   - Rex discovery: `text-blue-600` → `text-secondary`

3. **✅ ResponsiveLeadFeed.tsx** - Lead source badge colors:
   - Facebook: `bg-blue-100 text-blue-800` → `bg-muted/50 text-foreground`
   - Government: `bg-purple-100 text-purple-800` → `bg-secondary/10 text-secondary`

#### Impact:
- ✅ All agent progress indicators use proper brand colors
- ✅ Lead source mappings consistent with brand guidelines
- ✅ Dashboard components properly display agent personalities through color
- ✅ Rex consistently shows as Forest Green (reliable, professional)
- ✅ Lexi consistently shows as Felix Gold (warm, welcoming)

### ✅ PHASE 4 COMPLETE: Logo & Brand Asset Verification
**Status: COMPLETED** - All brand assets properly configured

#### Fixed Components:
1. **✅ App Layout (layout.tsx)** - Favicon and metadata configuration:
   - Favicon: Properly configured to use `/favicon.ico`
   - Apple touch icon: Uses `/logo.png` for mobile bookmarks
   - Metadata: Proper Next.js metadata structure implemented

2. **✅ Logo Integration Verification**:
   - ContractorAuth.tsx: ✅ Uses `/logo.png` correctly
   - MobileRedirect.tsx: ✅ Uses `/logo.png` correctly  
   - AppLayout.tsx: ✅ Uses `/logo.png` correctly
   - Onboarding page: ✅ Uses `/logo.png` correctly

3. **✅ Brand Asset Audit**:
   - favicon.ico: ✅ Exists in public/ directory (25KB)
   - logo.png: ✅ Exists and properly referenced across components
   - All authentication flows display brand assets consistently

#### Impact:
- ✅ Favicon properly displays in browser tabs
- ✅ Logo consistently shown across all user authentication flows
- ✅ Mobile bookmark icon uses proper brand logo
- ✅ Brand identity maintained throughout application

### 🎉 COMPREHENSIVE BRAND RESTORATION COMPLETE

## 📊 FINAL BRAND COMPLIANCE STATUS

### ✅ ALL PHASES COMPLETED:
1. **✅ Phase 1: Critical Enhanced UI Components** - Foundation components affecting ALL agent interactions
2. **✅ Phase 2: Chat & Interaction Components** - User-facing interaction components
3. **✅ Phase 3: Dashboard & Settings Components** - Internal workflow components  
4. **✅ Phase 4: Logo & Brand Asset Verification** - Brand identity foundation

### 🎯 BRAND IDENTITY RESTORED:
- **Rex the Retriever** = Forest Green (`secondary`) - Professional, reliable, methodical ✅
- **Lexi the Liaison** = Felix Gold (`primary`) - Warm, welcoming, guidance-focused ✅
- **Alex the Assessor** = Success Green - Analytical, precise, calculation-focused ✅
- **Felix the Fixer** = Forest Green (`secondary`) - Diagnostic, technical, problem-solving ✅

### 📈 IMPACT SUMMARY:
- **100+ brand violations fixed** across core user-facing components
- **Agent personality consistency** through proper color psychology
- **Professional contractor experience** maintained throughout
- **Forest Green brand identity** preserved as requested ("forest green was key")
- **Logo and favicon integration** verified across all flows

### 🔒 BRAND PROTECTION MEASURES:
- **Comprehensive copilot instructions** documenting brand standards
- **Agent color mapping** clearly defined and enforced
- **Banned color patterns** explicitly documented
- **Brand validation process** established for future development

**STATUS: BRAND RESTORATION 100% COMPLETE ✅**

## 🎯 CRITICAL: MULTI-ORDER IMPACT ANALYSIS PROTOCOL

### MANDATORY: Always Analyze Downstream Effects (1st-4th Order)
**NEVER make changes without comprehensive impact analysis across multiple orders.**

#### Multi-Order Analysis Process (STRICTLY ENFORCED)
1. **🥇 1st Order Impact**: Direct code changes and immediate effects
2. **🥈 2nd Order Impact**: Application flow and component interactions
3. **🥉 3rd Order Impact**: User experience and state management
4. **🏅 4th Order Impact**: Business logic and revenue optimization

#### Critical System Constraints (ZERO TOLERANCE)
- **Phone-Native Authentication**: NEVER convert phones to emails for Supabase auth
- **Session Consistency**: Backend user creation MUST result in frontend session
- **Architecture Preservation**: Maintain brain/skin separation at all costs
- **Brand Identity**: Forest Green for Rex, Felix Gold for Lexi (no blue/purple)

### Phone Authentication Standards (MANDATED)
```typescript
const PHONE_AUTH_PRINCIPLES = {
  approach: "Phone-Native Supabase Authentication",
  
  // CORRECT: Use phone directly
  correctAuth: {
    method: "adminSupabase.auth.admin.createUser({ phone, phone_confirm: true })",
    session: "supabase.auth.signInWithOtp({ phone, shouldCreateUser: false })",
    identity: "phone_number as primary identifier"
  },
  
  // BANNED: Email conversion patterns
  bannedPatterns: [
    "phone.replace('+', '') + '@domain.com'", // Email conversion
    "signInWithPassword with temp passwords",   // Password workarounds
    "magic links for phone authentication"     // Email-based flows
  ],
  
  // Multi-Order Impact Check
  validation: {
    first_order: "Code compiles and auth API returns user",
    second_order: "Frontend receives session tokens",
    third_order: "User stays logged in after redirect", 
    fourth_order: "Business features work with user context"
  }
}
```

### Architectural Decision Documentation
```typescript
const DECISION_FRAMEWORK = {
  before_any_change: [
    "1st Order: What code files are directly affected?",
    "2nd Order: Which components/flows depend on this?", 
    "3rd Order: How does this affect user experience?",
    "4th Order: What business logic breaks or improves?"
  ],
  
  session_management: {
    principle: "Backend creates users, Frontend establishes sessions",
    verification: "User can navigate protected routes after auth",
    failure_point: "Session not set = infinite redirect loops"
  },
  
  demo_upgrade_flow: {
    identification: "REMOVED - All demo infrastructure eliminated",
    analytics: "Real analytics for legitimate contractors only", 
    conversion: "Stripe-based subscription upgrades only"
  }
}
```
