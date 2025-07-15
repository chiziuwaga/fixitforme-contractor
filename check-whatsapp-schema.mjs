// Check current WhatsApp OTP Analytics schema status
// This script verifies what columns and constraints exist before updating

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  console.log('=== WhatsApp OTP Analytics Schema Check ===\n')
  
  try {
    // Check whatsapp_otp_analytics table structure
    console.log('1. Checking whatsapp_otp_analytics columns...')
    const { data: analyticsColumns, error: analyticsError } = await supabase.rpc('sql', {
      query: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'whatsapp_otp_analytics'
        ORDER BY ordinal_position
      `
    })
    
    if (analyticsError) {
      console.log('❌ Could not check analytics columns:', analyticsError.message)
    } else {
      console.log('✅ whatsapp_otp_analytics columns:')
      analyticsColumns?.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'}`)
      })
    }
    
    // Check event_type constraint
    console.log('\n2. Checking event_type constraint...')
    const { data: constraints, error: constraintError } = await supabase.rpc('sql', {
      query: `
        SELECT constraint_name, check_clause
        FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%event_type%' 
          AND table_name = 'whatsapp_otp_analytics'
      `
    })
    
    if (constraintError) {
      console.log('❌ Could not check constraints:', constraintError.message)
    } else if (constraints && constraints.length > 0) {
      console.log('✅ Found event_type constraint:')
      constraints.forEach(c => {
        console.log(`   - ${c.constraint_name}: ${c.check_clause}`)
      })
    } else {
      console.log('⚠️  No event_type constraint found (this is expected for older schemas)')
    }
    
    // Check contractor_profiles columns for secret upgrade support
    console.log('\n3. Checking contractor_profiles secret upgrade columns...')
    const { data: profileColumns, error: profileError } = await supabase.rpc('sql', {
      query: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'contractor_profiles' 
          AND column_name IN ('subscription_tier', 'tier_upgraded_at', 'upgrade_method', 'tier')
        ORDER BY column_name
      `
    })
    
    if (profileError) {
      console.log('❌ Could not check profile columns:', profileError.message)
    } else {
      console.log('✅ contractor_profiles upgrade-related columns:')
      if (profileColumns && profileColumns.length > 0) {
        profileColumns.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'} ${col.column_default ? `default: ${col.column_default}` : ''}`)
        })
      } else {
        console.log('   (No upgrade-related columns found)')
      }
    }
    
    // Test a simple analytics insert to check current constraint
    console.log('\n4. Testing current event types...')
    const testPhone = '+15551234567'
    
    // Test normal event type
    const { error: normalTest } = await supabase
      .from('whatsapp_otp_analytics')
      .insert({
        phone_number: testPhone,
        event_type: 'send_attempt',
        event_data: { test: 'schema_check' }
      })
    
    if (normalTest) {
      console.log('❌ Normal event type test failed:', normalTest.message)
    } else {
      console.log('✅ Normal event types working')
      
      // Clean up test data
      await supabase
        .from('whatsapp_otp_analytics')
        .delete()
        .eq('phone_number', testPhone)
        .eq('event_data->test', 'schema_check')
    }
    
    // Test secret upgrade event type (should fail if constraint exists)
    const { error: upgradeTest } = await supabase
      .from('whatsapp_otp_analytics')
      .insert({
        phone_number: testPhone,
        event_type: 'secret_upgrade_success',
        event_data: { test: 'schema_check_upgrade' }
      })
    
    if (upgradeTest) {
      console.log('⚠️  Secret upgrade events not supported yet (expected):', upgradeTest.message)
      console.log('   → Schema update needed to support secret upgrades')
    } else {
      console.log('✅ Secret upgrade events already supported')
      
      // Clean up test data
      await supabase
        .from('whatsapp_otp_analytics')
        .delete()
        .eq('phone_number', testPhone)
        .eq('event_data->test', 'schema_check_upgrade')
    }
    
    console.log('\n=== Schema Check Complete ===')
    console.log('\n📋 RECOMMENDATIONS:')
    
    // Check if updates are needed
    const needsEventTypeUpdate = upgradeTest !== null
    const needsProfileColumns = !profileColumns || profileColumns.find(c => c.column_name === 'subscription_tier') === undefined
    
    if (needsEventTypeUpdate) {
      console.log('🔄 UPDATE NEEDED: Run UPDATE_WHATSAPP_ANALYTICS_SCHEMA.sql to add secret upgrade support')
    }
    
    if (needsProfileColumns) {
      console.log('🔄 UPDATE NEEDED: contractor_profiles needs subscription_tier columns')
    }
    
    if (!needsEventTypeUpdate && !needsProfileColumns) {
      console.log('✅ Schema is up to date for pure WhatsApp OTP system')
    }
    
  } catch (err) {
    console.error('❌ Schema check failed:', err)
  }
}

checkSchema().catch(console.error)
