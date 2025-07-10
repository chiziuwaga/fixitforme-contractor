# FixItForMe Contractor Frontend - Complete Deployment Guide

## 📋 Summary of Changes Made

### Configuration Files Modified (All Frontend-focused)

- **`.github/copilot-instructions.md`** - Added MCP integration documentation
- **`.vscode/figma_mcp.json`** - Fixed JSON syntax for Figma MCP agent configuration
- **`.vscode/settings.json`** - Added MCP server configuration for VS Code workspace
- **`.vscode/mcp.json`** - Core MCP server configuration for Figma Dev Mode
- **`src/lib/brand.ts`** - Updated agent colors and added serif font family
- **`docs/Custom_Instructions_Contractor_FixItForMe.md`** - Enhanced development workflow

## 🎨 Complete Frontend Architecture

### 🧠 Brain/Skin Architecture (Core System)

#### The Brain: Custom React Hooks (`/src/hooks/`)

All business logic resides in these hooks. Each hook manages one domain:

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER (HOOKS)                 │
├─────────────────────────────────────────────────────────────────┤
│  useAuth.ts          │  SMS auth, phone verification, sessions │
│  useUser.ts          │  Global user context, profile data     │
│  useProfile.ts       │  Contractor CRUD, validation            │
│  useDashboard.ts     │  Metrics, analytics, performance       │
│  useLeads.ts         │  Lead management, bidding, filtering    │
│  useOnboarding.ts    │  Step-by-step setup, progress tracking │
│  useChat.ts          │  Multi-agent coordination, messaging   │
│  useSubscription.ts  │  Stripe integration, tier management   │
│  useDocumentUploader.ts │ File upload, validation, storage    │
│  useSettings.ts      │  Profile settings, preferences         │
│  useAgentUI.ts       │  Agent interactions, dynamic UI        │
│  useHomePage.ts      │  Landing page logic, mobile detection  │
│  useResponsiveChart.ts │ Chart behavior, breakpoints, D3     │
└─────────────────────────────────────────────────────────────────┘
```

#### The Skin: Presentational Components (`/src/components/`)

Pure UI components that consume hooks via props:

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER (COMPONENTS)               │
├─────────────────────────────────────────────────────────────────┤
│  Pages (100% Presentational)                                   │
│  ├── page.tsx (Landing)      → useHomePage()                   │
│  ├── login/page.tsx          → useAuth()                       │
│  ├── dashboard/page.tsx      → useDashboard()                  │
│  ├── onboarding/page.tsx     → useOnboarding()                 │
│  └── settings/page.tsx       → useSettings()                   │
│                                                                 │
│  Components (Props-Driven)                                     │
│  ├── ProfileEditor.tsx       → useProfile()                    │
│  ├── LeadFeed.tsx           → useLeads()                       │
│  ├── SubscriptionManager.tsx → useSubscription()               │
│  ├── DocumentUploader.tsx    → useDocumentUploader()           │
│  ├── ChatManager.tsx         → useChat()                       │
│  └── AgentComponents.tsx     → useAgentUI()                    │
└─────────────────────────────────────────────────────────────────┘
```

### 🤖 AI Agent System JSON Assets

#### Agent Response Format

All agents return structured JSON with UI generation capabilities:

```json
{
  "message": "Conversational response text",
  "ui_assets": {
    "type": "cost_breakdown" | "lead_summary" | "onboarding_checklist" | "market_insights",
    "data": {
      // Type-specific data structure
    }
  },
  "actions": [
    {
      "type": "update_profile" | "submit_bid" | "schedule_call" | "save_lead",
      "data": { /* action payload */ },
      "label": "Action Button Text",
      "variant": "primary" | "secondary" | "outline"
    }
  ],
  "metadata": {
    "agent": "lexi" | "alex" | "rex",
    "timestamp": "ISO 8601 datetime",
    "session_id": "unique_session_identifier",
    "requires_auth": "boolean"
  }
}
```

### 🎨 Design System Integration

#### Brand Colors & Design Tokens

From `src/lib/brand.ts`:

```typescript
export const BRAND = {
  colors: {
    primary: '#D4A574',      // Felix Gold
    secondary: '#1A2E1A',    // Forest Green
    background: '#FFFFFF',   // Pure White
    
    agents: {
      lexi: '#D4A574',       // Felix Gold - Liaison
      alex: '#28A745',       // Success Green - Assessor
      rex: '#4A6FA5',        // Steel Blue - Retriever
      felix: '#1A2E1A',      // Forest Green - Diagnostic
    },
    
    text: {
      primary: '#1A2E1A',    // Forest Green
      secondary: '#2C2C2C',  // Charcoal
      accent: '#D4A574',     // Felix Gold
    }
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Roboto Slab', 'Georgia', 'serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    }
  }
}
```

#### Figma MCP Integration

Configuration files for design token extraction:

**`.vscode/mcp.json`**

```json
{
  "servers": {
    "Figma Dev Mode MCP": {
      "type": "sse",
      "url": "http://127.0.0.1:3845/sse",
      "dev": true
    }
  }
}
```

**Myna UI Kit Integration:**

- URL: `https://www.figma.com/design/f5khzL71UIi807ND15eHcg/Myna-UI`
- Available MCP Tools:
  - `get_variable_defs` - Extract design tokens
  - `get_code` - Generate React + TailwindCSS code
  - `get_code_connect_map` - Map components to codebase
  - `get_image` - Component screenshots

### 📱 Responsive Design System

#### Breakpoint Strategy

```typescript
breakpoints: {
  mobile: '640px',     // Mobile-first approach
  tablet: '768px',     // Tablet landscape
  desktop: '1024px',   // Desktop minimum
  wide: '1280px',      // Wide screens
  ultrawide: '1536px', // Ultra-wide displays
}
```

#### Mobile Behavior

- **Desktop-First Platform:** Redirects mobile users to mobile-optimized version
- **Responsive Components:** All components adapt to screen size
- **Touch-Friendly:** Larger touch targets on mobile devices
- **Performance:** Optimized images and lazy loading

### 🔄 State Management Architecture

#### Global State Providers

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                       GLOBAL STATE LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  UserProvider.tsx                                               │
│  ├── Authentication state                                       │
│  ├── Contractor profile data                                    │
│  ├── Subscription tier information                              │
│  └── Global user preferences                                    │
│                                                                 │
│  ConcurrentExecutionManager.tsx                                 │
│  ├── Multi-agent session management                             │
│  ├── Background process coordination                            │
│  └── Real-time state synchronization                            │
└─────────────────────────────────────────────────────────────────┘
```

#### Hook Data Flow

```ascii
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │   Custom Hook   │    │   Component     │
│   (Database)    │◄──►│   (Business     │◄──►│   (UI Only)     │
│                 │    │    Logic)       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │              ┌─────────────────┐              │
        │              │   Real-time     │              │
        └─────────────►│   Updates       │◄─────────────┘
                       │   (Subscriptions)│
                       └─────────────────┘
```

### 🚀 Deployment Configuration

#### Vercel Configuration (`vercel.json`)

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "functions": {
    "src/app/api/agents/*/route.ts": {
      "maxDuration": 30
    }
  }
}
```

#### Build Process

1. **TypeScript Compilation:** Strict type checking
2. **Tailwind CSS Processing:** Purge unused styles
3. **Next.js Build:** Static generation + SSR
4. **Asset Optimization:** Image optimization and compression
5. **Bundle Analysis:** Code splitting and tree shaking

### 🗂️ File Structure Summary

```ascii
src/
├── app/                          # Next.js 15 App Router
│   ├── page.tsx                 # Landing page (useHomePage)
│   ├── login/page.tsx           # Authentication (useAuth)
│   ├── contractor/              # Contractor dashboard area
│   │   ├── dashboard/page.tsx   # Main dashboard (useDashboard)
│   │   ├── onboarding/page.tsx  # Setup flow (useOnboarding)
│   │   └── settings/page.tsx    # Settings UI (useSettings)
│   └── api/                     # Backend API routes
│       ├── agents/              # AI agent endpoints
│       ├── auth/                # Authentication endpoints
│       ├── leads/               # Lead management
│       └── payments/            # Stripe integration
├── components/                   # Presentational components
│   ├── agent-ui/               # Agent-specific UI components
│   ├── auth/                   # Authentication components
│   ├── dashboard/              # Dashboard components
│   ├── settings/               # Settings components
│   └── ui/                     # Shared UI components
├── hooks/                       # Custom React hooks (business logic)
│   ├── useAuth.ts              # Authentication logic
│   ├── useUser.ts              # User state management
│   ├── useProfile.ts           # Profile CRUD operations
│   ├── useDashboard.ts         # Dashboard metrics
│   ├── useLeads.ts             # Lead management
│   ├── useOnboarding.ts        # Onboarding flow
│   ├── useChat.ts              # Multi-agent chat
│   ├── useSubscription.ts      # Stripe integration
│   ├── useDocumentUploader.ts  # File upload logic
│   ├── useSettings.ts          # Settings management
│   ├── useAgentUI.ts           # Agent UI coordination
│   ├── useHomePage.ts          # Landing page logic
│   └── useResponsiveChart.ts   # Chart interactions
├── lib/                        # Shared utilities
│   ├── brand.ts               # Brand system & design tokens
│   ├── supabase.ts            # Database client
│   ├── ai.ts                  # AI SDK configuration
│   ├── utils.ts               # Utility functions
│   ├── motion.ts              # Animation presets
│   └── design-system.ts       # Design system patterns
└── providers/                  # React Context providers
    ├── UserProvider.tsx        # Global user state
    └── ConcurrentExecutionManager.tsx # Agent coordination
```

## 🎯 Ready for Frontend Transfer

This frontend system is **completely decoupled** from the backend and can be transferred to any environment. The brain/skin architecture ensures:

1. **Business Logic Isolation:** All logic in hooks, easily testable
2. **UI Flexibility:** Components can be restyled without touching logic
3. **State Management:** Global state handled through providers
4. **Type Safety:** Comprehensive TypeScript interfaces
5. **Design System:** Consistent brand application across all components

The system is ready for deployment with proper error handling, loading states, and responsive design patterns in place.
