# WhatsApp OTP Implementation and Environment Synchronization

## WhatsApp Tracking Table

This SQL script creates a table to track which phone numbers have successfully received WhatsApp messages, avoiding redundant sandbox join prompts for returning users.

### How to Apply the SQL Script

1. Connect to your Supabase database using the SQL editor
2. Paste the contents of `whatsapp-tracking-table.sql`
3. Execute the script

## Environment Variable Synchronization

The `vercel-env-sync.mjs` script helps ensure your local and Vercel environment variables are in sync, which is crucial for WhatsApp functionality to work properly in production.

### Prerequisites

1. Install the Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Log into your Vercel account:

   ```bash
   vercel login
   ```

### How to Use the Environment Sync Tool

Run the script:

```bash
node vercel-env-sync.mjs
```

The script will:

1. Read your local `.env.local` file
2. Pull your Vercel environment variables
3. Compare the two environments
4. Report on missing and differing variables
5. Generate commands to push missing variables to Vercel

### Required Environment Variables for WhatsApp

The following environment variables must be present in both local and Vercel environments:

```env
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_FROM
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## Troubleshooting WhatsApp OTP in Production

If WhatsApp OTP is still not working in production after synchronizing environment variables:

1. **Check Twilio Console**: Review message logs to see if there are failed delivery attempts
2. **Verify Sandbox Join Status**: Ensure your testing number has joined the WhatsApp sandbox within the last 72 hours
3. **Review Server Logs**: Check Vercel logs for detailed error information
4. **Test in Development**: Confirm it works locally before deploying
