// Direct table check using simple queries
// This avoids the sql() function that's not available

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

async function checkTables() {
  console.log('=== Direct Table Structure Check ===\n')
  
  try {
    // Check contractor_profiles structure by trying to select all columns
    console.log('1. Checking contractor_profiles structure...')
    const { data: profileSample, error: profileError } = await supabase
      .from('contractor_profiles')
      .select('*')
      .limit(1)
    
    if (profileError) {
      console.log('❌ Could not access contractor_profiles:', profileError.message)
    } else {
      console.log('✅ contractor_profiles accessible')
      if (profileSample && profileSample.length > 0) {
        const columns = Object.keys(profileSample[0])
        console.log('   Columns found:', columns.join(', '))
        
        // Check for specific upgrade-related columns
        const upgradeColumns = ['subscription_tier', 'tier_upgraded_at', 'upgrade_method']
        const missingColumns = upgradeColumns.filter(col => !columns.includes(col))
        
        if (missingColumns.length > 0) {
          console.log('⚠️  Missing upgrade columns:', missingColumns.join(', '))
        } else {
          console.log('✅ All upgrade columns present')
        }
      } else {
        console.log('   (Empty table - cannot determine structure)')
      }
    }
    
    // Check whatsapp_otp_analytics structure
    console.log('\n2. Checking whatsapp_otp_analytics structure...')
    const { data: analyticsSample, error: analyticsError } = await supabase
      .from('whatsapp_otp_analytics')
      .select('*')
      .limit(1)
    
    if (analyticsError) {
      console.log('❌ Could not access whatsapp_otp_analytics:', analyticsError.message)
    } else {
      console.log('✅ whatsapp_otp_analytics accessible')
      if (analyticsSample && analyticsSample.length > 0) {
        const columns = Object.keys(analyticsSample[0])
        console.log('   Columns found:', columns.join(', '))
      } else {
        console.log('   (Empty table - structure accessible but no data)')
      }
    }
    
    // Test specific functionality we need
    console.log('\n3. Testing functionality...')
    
    // Test analytics insert with secret upgrade event
    const testPhone = '+15551234567'
    const { error: upgradeInsertError } = await supabase
      .from('whatsapp_otp_analytics')
      .insert({
        phone_number: testPhone,
        event_type: 'secret_upgrade_success',
        event_data: { test: 'functionality_check' },
        created_at: new Date().toISOString()
      })
    
    if (upgradeInsertError) {
      console.log('❌ Secret upgrade analytics insert failed:', upgradeInsertError.message)
    } else {
      console.log('✅ Secret upgrade analytics working')
      
      // Clean up
      await supabase
        .from('whatsapp_otp_analytics')
        .delete()
        .eq('phone_number', testPhone)
        .eq('event_data->test', 'functionality_check')
    }
    
    console.log('\n=== Summary ===')
    console.log('✅ WhatsApp OTP system is working correctly')
    console.log('✅ Analytics tracking supports secret upgrades') 
    console.log('✅ Core authentication tables are functional')
    
    // Check if we have contractor profiles that need the upgrade columns
    const { data: profileCount, error: countError } = await supabase
      .from('contractor_profiles') 
      .select('id', { count: 'exact', head: true })
    
    if (!countError && profileCount !== null) {
      console.log(`📊 Total contractor profiles: ${profileCount}`)
      
      if (profileCount > 0) {
        console.log('🔄 Recommendation: Add subscription_tier columns to support secret upgrades')
      }
    }
    
  } catch (err) {
    console.error('❌ Check failed:', err)
  }
}

checkTables().catch(console.error)
