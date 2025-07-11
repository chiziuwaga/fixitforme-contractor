<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

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

### Backend Infrastructure
- **API Routes:** Next.js API routes in `/src/app/api/*` with TypeScript
- **AI Agents:** Python serverless functions on Vercel with distinct AI personas
- **Database Schema:** PostgreSQL with comprehensive RLS policies in `/database/schema.sql`
- **Real-time:** Supabase subscriptions for live data updates
- **Webhooks:** Stripe webhook handlers for payment processing and subscription management

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

## 🤖 AI Agent System

### Agent Personas & Capabilities
- **Lexi the Liaison** (`/src/app/api/agents/lexi/route.ts`) - Friendly onboarding guide, contractor education
- **Alex the Assessor** (`/src/app/api/agents/alex/route.ts`) - Precise bidding assistant, quantity surveyor persona  
- **Rex the Retriever** (`/src/app/api/agents/rex/route.ts`) - Silent lead generation, market research
- **Felix the Fixer** (referenced) - Homeowner-facing diagnostic agent for referrals

### Agent Architecture Principles
- **Decoupled Intelligence:** Agents communicate only through Supabase, never directly
- **Async UX:** UI never blocks on AI processes, always shows working indicators
- **Streaming Responses:** Use Vercel AI SDK for real-time streaming in hooks
- **Data Persistence:** Store agent interactions in `bids.assistance_data` JSONB column
- **Concurrent Execution:** Manage multiple agent sessions with `ConcurrentExecutionManager`

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
