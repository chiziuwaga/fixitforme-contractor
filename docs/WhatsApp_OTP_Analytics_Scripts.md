# WhatsApp OTP Analytics Scripts

This document describes the available npm scripts for managing WhatsApp OTP analytics and maintenance.

## 🚀 Setup Scripts

### `npm run whatsapp:setup`
**Alias:** `npm run whatsapp:analytics` or `npm run analytics:deploy`
- Deploys both WhatsApp tracking table and analytics table to Supabase
- Creates necessary database schema and RLS policies
- Run this once to set up the analytics infrastructure

## 📊 Analytics Scripts

### `npm run analytics:check`
- Queries and displays WhatsApp OTP analytics summary
- Shows metrics for the last 24 hours including:
  - Total events count
  - Event type breakdown
  - Send success rates
  - Verification success rates
  - Recent event timeline

## 🧹 Maintenance Scripts

### `npm run otp:cleanup`
- **Local cleanup**: Runs OTP expiration cleanup locally
- Finds expired OTPs in the database
- Tracks expiration events in analytics
- Removes expired OTPs from the database
- Safe to run manually for maintenance

### `npm run otp:cleanup-prod`
- **Production cleanup**: Calls the production API endpoint
- Requires `CRON_SECRET_KEY` environment variable
- Intended for scheduled cron jobs or manual production cleanup
- Endpoint: `GET /api/otp-expiration-job`

## 🔧 Environment Sync Scripts

### `npm run vercel:sync`
- Synchronizes environment variables between local and Vercel
- Identifies missing variables and provides commands to add them
- Helps maintain consistency across environments

## 📋 Usage Examples

```bash
# First-time setup
npm run analytics:deploy

# Check analytics data
npm run analytics:check

# Clean up expired OTPs locally
npm run otp:cleanup

# View environment variable differences
npm run vercel:sync

# Production OTP cleanup (requires CRON_SECRET_KEY)
npm run otp:cleanup-prod
```

## 🔐 Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET_KEY` (for production cleanup)

## 📈 Analytics Data Structure

The analytics system tracks these event types:
- `send_attempt` - User requested OTP
- `send_success` - OTP successfully sent via WhatsApp
- `send_failure` - Failed to send OTP
- `verify_attempt` - User attempted to verify an OTP
- `verify_success` - OTP verification successful
- `verify_failure` - OTP verification failed
- `expired` - OTP expired without verification

Each event includes contextual data such as error codes, timing information, and user metadata to help optimize the verification flow.
