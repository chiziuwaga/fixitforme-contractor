# FixItForMe Contractor Module

A robust, AI-driven platform for contractors built with Next.js, featuring specialized AI agents and a tiered payment system.

## 🏗️ Architecture

This application follows a **Decoupled Intelligence** architecture where AI agents (Lexi, Alex, Rex) operate independently, communicating only through a central Supabase database. This ensures robustness, scalability, and an asynchronous user experience.

## 🚀 Tech Stack

- **Frontend:** Next.js 15 with TypeScript and Tailwind CSS
- **Backend:** Vercel Serverless Functions (Python for AI agents)
- **Database:** Supabase with Row Level Security
- **AI:** Vercel AI SDK with Deepseek for reasoning
- **Payments:** Stripe integration
- **Authentication:** Supabase Auth with SMS verification

## 🤖 AI Agent Family

- **Lexi the Liaison:** Friendly onboarding guide for new contractors
- **Alex the Assessor:** Precise bidding assistant with quantity surveyor expertise
- **Rex the Retriever:** Background lead generation specialist
- **Felix the Fixer:** Homeowner diagnostic agent (generates referrals)

## 💰 Payment Tiers

### Growth Tier (Free)
- 10% platform fee
- 30%/40%/30% payout structure
- Perfect for solo contractors building their client base

### Scale Tier ($250/month)
- 7% platform fee
- 50%/25%/25% payout structure
- Enhanced cash flow for established businesses

## 🛠️ Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chiziuwaga/fixitforme-contractor.git
   cd fixitforme-contractor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your actual keys
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Visit:** http://localhost:3000

## 📁 Project Structure

```
src/
├── app/
│   ├── contractor/          # Contractor-facing pages
│   │   ├── dashboard/       # Main contractor dashboard
│   │   ├── bid/            # Job bidding interface
│   │   └── settings/       # Profile and subscription management
│   └── api/
│       ├── agents/         # AI agent endpoints
│       ├── payments/       # Payment processing
│       └── health/         # API health check
├── components/             # Reusable React components
└── lib/
    ├── supabase.ts        # Supabase client configuration
    └── ai.ts              # AI SDK configuration
```

## 🔐 Environment Variables

Required environment variables (see `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `DEEPSEEK_API_KEY` - AI model API key
- `STRIPE_SECRET_KEY` - Stripe secret key (test mode)
- `TWILIO_ACCOUNT_SID` - Twilio SMS configuration

## 🚢 Deployment

This project is configured for Vercel deployment:

```bash
vercel --prod
```

The project is automatically deployed on pushes to the main branch via Vercel's GitHub integration.

## 📋 Key Features

- **Nested Chat UI:** Interactive agent conversations
- **Real-time Lead Generation:** Automated opportunity discovery
- **Secure Payment Processing:** Multi-stage contractor payouts
- **Row Level Security:** Contractor data isolation
- **Responsive Design:** Desktop and tablet optimized

## 🧪 API Health Check

Visit `/api/health` to verify the system status and database connectivity.

## 📚 Development Guidelines

- Follow the established AI agent personas
- Implement RLS policies for all contractor data
- Use streaming responses for AI interactions
- Store agent conversations in `bids.assistance_data`
- Follow the decoupled architecture principles

## 📞 Support

For development questions or issues, refer to the project documentation or contact the development team.
