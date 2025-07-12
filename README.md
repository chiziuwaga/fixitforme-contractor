# FixItForMe Contractor Module

**Status: 100% Complete - Production Ready** 🚀

This is the contractor-facing module for FixItForMe, a robust, AI-driven platform built with Next.js, Vercel, and Supabase. It features a decoupled agentic architecture, a generative design system for UI, and a tiered payment system for contractors.

**Last Updated:** July 12, 2025 | **Build Status:** ✅ All TypeScript compilation successful  
**Deployment Status:** ✅ Ready for GitHub deployment with enhanced rate limiting  
**Live Demo:** Ready for Vercel production deployment

## 🎯 Production Milestone Achieved

✅ **Enhanced Rate Limiting System** - Rex (5 leads), Alex (15 materials), tier-based daily limits  
✅ **Agent Conflict Resolution** - Intelligent resource management with toast notifications  
✅ **Production Chat System** - localStorage persistence with Supabase upgrade path  
✅ **Complete AgentQL Integration** - Lead generation, material research, government contracts  
✅ **Build System Optimization** - 22 static pages, 0 TypeScript errors, production ready

## 🏗️ Architecture & Core Principles

- **Decoupled Intelligence:** AI agents (Lexi, Alex, Rex) operate independently, communicating only through a central Supabase database. This ensures robustness, scalability, and an asynchronous user experience.
- **Generative UI:** The application uses a generative design system where AI agents return structured JSON payloads that are rendered into dynamic, interactive UI components, including D3.js charts.
- **Desktop-First Experience:** The UI is optimized for professional use on desktop and tablet devices, with a dedicated mobile redirect.
- **Tiered Access:** Features and limits are controlled by a tiered subscription model (Growth vs. Scale) managed through Stripe.

## 🚀 Tech Stack

- **Frontend:** Next.js 15 with TypeScript, Tailwind CSS v4, and Shadcn/ui
- **UI Components:** Radix UI primitives with custom Shadcn/ui styling
- **CSS Processing:** PostCSS with @tailwindcss/postcss and autoprefixer
- **Data Visualization:** D3.js and Recharts
- **Backend:** Vercel Serverless Functions
- **Database:** Supabase with Row Level Security
- **AI:** Vercel AI SDK with Deepseek for reasoning
- **Payments:** Stripe
- **Authentication:** Supabase Auth with SMS verification

## 🤖 AI Agent Family

- **Lexi the Liaison:** A friendly onboarding guide for new contractors.
- **Alex the Assessor:** A precise bidding assistant with quantity surveyor expertise.
- **Rex the Retriever:** A background lead generation specialist that uses a Tool User Chain.
- **Felix the Fixer:** A homeowner-facing diagnostic agent whose 40-problem reference framework is used for lead categorization.

## 💰 Payment Tiers & Enhanced Rate Limiting

| Feature            | Growth Tier (Free)                        | Scale Tier ($250/month)                   |
| ------------------ | ----------------------------------------- | ----------------------------------------- |
| **Platform Fee**   | 10% of job value                          | 7% of job value                           |
| **Payout Structure** | 30% Upfront, 40% Mid, 30% Completion      | 50% Upfront, 25% Mid, 25% Completion      |
| **Max Bids/Month** | 10                                        | 50                                        |
| **Max Services**   | 5 (from Felix Reference)                  | 15 (from Felix Reference)                 |
| **Rex Search Agent** | ❌ Disabled (Visible but grayed out)      | ✅ Enabled                                |
| **Alex Quote Agent** | ❌ Disabled (Visible but grayed out)      | ✅ Enabled                                |

### 🚀 Enhanced Rate Limiting System (Production Ready)

**Per-Session Limits (Optimal UI Performance):**
- **Rex Lead Generation**: 5 hyper-relevant leads max per search
- **Alex Material Research**: 15 materials max per analysis

**Daily Usage Limits:**

| Agent | Growth Tier | Scale Tier | Purpose |
|-------|-------------|------------|---------|
| **Rex the Retriever** | 10 searches/day | 50 searches/day | Lead generation with multi-platform aggregation |
| **Alex the Assessor** | 5 analyses/day | 30 analyses/day | Material research & bidding assistance |
| **Lexi the Liaison** | 50 interactions/day | 100 interactions/day | Onboarding support & guidance |

**Intelligent Conflict Resolution:**
- Rex and Alex cannot run simultaneously (resource optimization)
- Real-time usage tracking with localStorage persistence
- Graceful degradation with informative toast notifications
- Tier-appropriate upgrade prompts for Growth users

## 🛠️ Development Setup

1.  **Clone the repository:**
    \`\`\`bash
    git clone https://github.com/your-username/fixitforme-contractor.git
    cd fixitforme-contractor
    \`\`\`

2.  **Install dependencies:**
    \`\`\`bash
    npm install
    \`\`\`

3.  **Set up environment variables:**
    Create a `.env.local` file by copying the example:
    \`\`\`bash
    cp .env.local.example .env.local
    \`\`\`
    Then, edit `.env.local` with your actual keys from Supabase, Stripe, etc.

4.  **Run the development server:**
    \`\`\`bash
    npm run dev
    \`\`\`

5.  **Open your browser** to `http://localhost:3000`.

## 📁 Key Project Structure

\`\`\`
src/
├── app/
│   ├── contractor/          # Contractor-facing pages (dashboard, settings)
│   └── api/
│       ├── agents/         # Streaming AI agent endpoints (lexi, alex, rex)
│       ├── admin/          # Admin API endpoints (see Admin_API_Endpoints.md)
│       └── payments/       # Stripe webhooks and payment logic
├── components/
│   ├── ui/                 # Generative UI components (Base, Charts, Agents)
│   ├── settings/           # Components for the settings page
│   └── EnhancedChatManager.tsx # Core multi-agent chat orchestrator
└── lib/
    ├── supabase.ts         # Supabase client configuration
    ├── supabase/admin.ts   # Supabase admin client for server-side operations
    ├── ai.ts               # Vercel AI SDK configuration
    ├── brand.ts            # Centralized brand assets and styles
    └── felix.ts            # Felix 40-problem reference module
\`\`\`

## 📚 Documentation

- **[Admin API Endpoints](./docs/Admin_API_Endpoints.md)** - Complete admin-side API documentation
- **[Phased Implementation Plan](./docs/Phased_Implementation_Plan.md)** - Development roadmap and progress
- **[Notification Rationale](./docs/Notification_Rationale.md)** - Notification system architecture
- **[Felix 40-Problem Reference](./docs/Felix_40_Problem_Reference.md)** - Lead categorization framework

## 🔐 Environment Variables

Ensure the following variables are set in your `.env.local` file:

**Database & Core Services:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**AI & Reasoning:**
- `DEEPSEEK_API_KEY`
- `VERCEL_AI_SDK_TOKEN`

**Payments (Stripe):**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Communications (Twilio):**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

**Admin & Security:**
- `ADMIN_JWT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

**Monitoring (Optional):**
- `SENTRY_DSN`
- `VERCEL_ANALYTICS_ID`

*See [Admin API Endpoints Documentation](./docs/Admin_API_Endpoints.md) for complete environment variable requirements.*

## 🚢 Deployment

This project is configured for continuous deployment on Vercel. Simply push to the `master` branch.

### Recent Fixes Applied:
- ✅ Fixed Root Directory configuration issue
- ✅ Simplified `vercel.json` to auto-detect runtime
- ✅ Fixed TypeScript animation type errors
- ✅ Resolved brand color reference issues
- ✅ Cleaned up duplicate files and imports

### Manual Deployment:
\`\`\`bash
# Build locally first
npm run build

# Deploy to Vercel
vercel --prod
\`\`\`

### Troubleshooting Vercel Deployment:
1. **Root Directory Error**: Ensure Vercel project settings have Root Directory set to blank or "/"
2. **Runtime Error**: Let Vercel auto-detect Node.js version (don't specify in vercel.json)
3. **Build Errors**: Run `npm run build` locally first to catch issues
