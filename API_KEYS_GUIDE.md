# API Keys & Service Integration Guide

## 🔑 Required API Keys for Production

### Priority 1: Essential (Must Have)
These services are required for core functionality:

#### 1. Supabase (Database & Auth)
- **Service**: Primary database, authentication, real-time features
- **Required Keys**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
  - `SUPABASE_SERVICE_ROLE_KEY`
- **Setup**: Create project at https://supabase.com
- **Cost**: Free tier available, paid plans start at $25/month

#### 2. Deepseek AI (Primary AI Provider)
- **Service**: AI reasoning for all contractor agents (Lexi, Alex, Rex)
- **Required Keys**:
  - `DEEPSEEK_API_KEY`
- **Setup**: Get API key from https://platform.deepseek.com
- **Cost**: Pay-per-use, very competitive pricing
- **Note**: Felix the Fixer operates on homeowner platform, not this module

#### 3. Stripe (Payment Processing)
- **Service**: Subscription management and commission processing
- **Required Keys**:
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- **Setup**: Create account at https://stripe.com
- **Cost**: 2.9% + 30¢ per transaction

#### 4. Twilio (SMS Authentication)
- **Service**: Phone number verification for contractor auth
- **Required Keys**:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
- **Setup**: Create account at https://twilio.com
- **Cost**: $1/month per phone number + $0.0075 per SMS

### Priority 2: Enhanced Features (Recommended)
These enhance the AI agents but have fallbacks:

#### 5. OpenAI (AI Fallback & Enhancement)
- **Service**: Backup AI provider and enhanced reasoning
- **Required Keys**:
  - `OPENAI_API_KEY`
- **Setup**: Get API key from https://platform.openai.com
- **Cost**: Pay-per-use, starts at $0.002/1K tokens
- **Note**: Used for enhanced material research and complex calculations

#### 6. AgentQL (Web Scraping for Leads)
- **Service**: Structured web scraping for lead generation
- **Required Keys**:
  - `AGENTQL_API_KEY`
- **Setup**: Get API key from https://agentql.com
- **Cost**: Usage-based pricing
- **Note**: Powers Rex's lead generation capabilities

### Priority 3: Optional Enhancements
These add valuable features but aren't critical:

#### 7. Google Places API (Local Business Data)
- **Service**: Contractor search and verification
- **Required Keys**:
  - `GOOGLE_PLACES_API_KEY`
- **Setup**: Enable in Google Cloud Console
- **Cost**: $17 per 1000 requests
- **Note**: Improves lead quality and contractor matching

#### 8. Yelp Fusion API (Business Verification)
- **Service**: Contractor reputation and review data
- **Required Keys**:
  - `YELP_API_KEY`
- **Setup**: Create app at https://fusion.yelp.com
- **Cost**: Free tier available
- **Note**: Helps verify contractor legitimacy

## 🛠 Service Configuration Details

### Supabase Setup Checklist
1. Create new project
2. Deploy schema from `database/schema.sql`
3. Enable SMS authentication provider
4. Configure RLS policies (already in schema)
5. Set up real-time subscriptions

### Stripe Setup Checklist
1. Create account and verify business
2. Create products for Growth (commission-only) and Scale ($250/month) plans
3. Set up webhook endpoint at `/api/payments/webhook`
4. Configure subscription billing
5. Test with Stripe's test mode first

### Twilio Setup Checklist
1. Create account and verify phone number
2. Purchase a phone number for SMS sending
3. Configure messaging service
4. Set up SMS templates (optional)

### AI Provider Setup
1. **Deepseek**: Create account, generate API key, monitor usage
2. **OpenAI**: Create account, generate API key, set usage limits

## 💰 Cost Estimation

### Monthly Costs for 100 Active Contractors
- **Supabase**: $25-50 (Pro plan for production)
- **Stripe**: 2.9% of transaction volume + fixed fees
- **Twilio**: ~$10-20 (phone number + SMS usage)
- **Deepseek**: ~$20-50 (based on AI agent usage)
- **OpenAI**: ~$30-100 (enhanced features)
- **AgentQL**: ~$50-100 (lead generation)
- **Google Places**: ~$20-50 (contractor searches)
- **Yelp**: Free tier likely sufficient

**Total Estimated Monthly Cost**: $155-390 + transaction fees

## 🔒 Security Best Practices

### API Key Management
- Store all keys in environment variables
- Use different keys for development/staging/production
- Regularly rotate API keys
- Monitor usage for unusual activity
- Set up usage alerts and limits

### Supabase Security
- Enable Row Level Security (RLS) - ✅ Already configured
- Use service role key only on server-side
- Regularly audit database access logs
- Enable database backups

### Stripe Security
- Use webhook secrets to verify requests
- Test all payment flows thoroughly
- Set up fraud detection rules
- Monitor failed payment attempts

## 🚀 Deployment Environment Variables

### Vercel Environment Variables Setup
Add these to your Vercel dashboard under Settings > Environment Variables:

```bash
# Production Values
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DEEPSEEK_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
OPENAI_API_KEY=sk-...
AGENTQL_API_KEY=...
GOOGLE_PLACES_API_KEY=...
YELP_API_KEY=...
```

## 📞 Support Contacts

### When You Need Help
1. **Supabase Issues**: https://supabase.com/support
2. **Stripe Problems**: https://support.stripe.com
3. **Twilio SMS Issues**: https://support.twilio.com
4. **AI Provider Issues**: Check respective documentation
5. **General Deployment**: Vercel support or GitHub Issues

---

**🎯 Next Steps**: Configure these API keys in your production environment and run end-to-end tests to ensure everything works correctly!
