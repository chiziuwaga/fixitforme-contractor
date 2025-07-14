// Quick database verification script
// This script checks if all required WhatsApp tables exist

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyTables() {
  console.log('=== Database Table Verification ===')
  
  const tables = [
    'whatsapp_otps',
    'whatsapp_otp_analytics', 
    'whatsapp_joined_numbers'
  ]
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table '${table}' does not exist or has issues:`, error.message)
      } else {
        console.log(`✓ Table '${table}' exists and is accessible`)
      }
    } catch (err) {
      console.log(`❌ Error checking table '${table}':`, err.message)
    }
  }
  
  console.log('\n=== Verification Complete ===')
}

verifyTables().catch(console.error)
