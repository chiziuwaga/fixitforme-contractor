// Environment variable check script
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

console.log('=== Environment Variable Check ===\n')

const envVars = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set (hidden)' : 'Not Set',
  'TWILIO_ACCOUNT_SID': process.env.TWILIO_ACCOUNT_SID ? 'Set (hidden)' : 'Not Set',
  'TWILIO_AUTH_TOKEN': process.env.TWILIO_AUTH_TOKEN ? 'Set (hidden)' : 'Not Set',
  'TWILIO_WHATSAPP_FROM': process.env.TWILIO_WHATSAPP_FROM,
  'CRON_SECRET_KEY': process.env.CRON_SECRET_KEY ? 'Set (hidden)' : 'Not Set'
}

for (const [key, value] of Object.entries(envVars)) {
  const status = value ? '✓' : '❌'
  console.log(`${status} ${key}: ${value || 'Not Set'}`)
}

console.log('\n=== Check Complete ===')

// Verify we can connect to Supabase
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('\n✓ Supabase connection variables are available')
} else {
  console.log('\n❌ Supabase connection variables missing')
}
