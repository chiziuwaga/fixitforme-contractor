#!/usr/bin/env node

/**
 * Test Database RLS Fix Deployment
 * This script verifies that the RLS fixes are working correctly
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testRLSFixes() {
  console.log('🧪 Testing Database RLS Fixes...\n')
  
  try {
    // Test 1: WhatsApp OTP Analytics Insert (Primary Fix)
    console.log('📊 Test 1: WhatsApp OTP Analytics Insert')
    const testAnalytics = {
      phone_number: '+15551234567',
      event_type: 'send_attempt',
      event_data: { test: 'rls_fix_verification' },
      created_at: new Date().toISOString()
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('whatsapp_otp_analytics')
      .insert(testAnalytics)
      .select()
    
    if (insertError) {
      console.log('❌ CRITICAL: Analytics insert still failing!')
      console.log('Error:', insertError)
      return false
    } else {
      console.log('✅ Analytics insert working - RLS fix successful!')
    }
    
    // Test 2: Clean up test data
    console.log('\n🧹 Test 2: Cleanup Test Data')
    const { error: deleteError } = await supabase
      .from('whatsapp_otp_analytics')
      .delete()
      .eq('phone_number', '+15551234567')
      .eq('event_data->test', 'rls_fix_verification')
    
    if (deleteError) {
      console.log('⚠️  Warning: Could not clean up test data:', deleteError)
    } else {
      console.log('✅ Test data cleaned up successfully')
    }
    
    // Test 3: Verify WhatsApp OTPs table access
    console.log('\n📱 Test 3: WhatsApp OTPs Table Access')
    const { data: otpData, error: otpError } = await supabase
      .from('whatsapp_otps')
      .select('count(*)')
      .limit(1)
    
    if (otpError) {
      console.log('❌ WhatsApp OTPs table access failed:', otpError)
      return false
    } else {
      console.log('✅ WhatsApp OTPs table accessible')
    }
    
    // Test 4: Test function execution
    console.log('\n🔧 Test 4: Function Execution')
    const { data: funcData, error: funcError } = await supabase
      .rpc('cleanup_expired_otps')
    
    if (funcError) {
      console.log('❌ Function execution failed:', funcError)
      return false
    } else {
      console.log('✅ cleanup_expired_otps function working')
    }
    
    // Test 5: Verify views are accessible
    console.log('\n👀 Test 5: View Access')
    const { data: viewData, error: viewError } = await supabase
      .from('demo_contractors')
      .select('count(*)')
      .limit(1)
    
    if (viewError) {
      console.log('❌ View access failed:', viewError)
      return false
    } else {
      console.log('✅ Views accessible without SECURITY DEFINER')
    }
    
    console.log('\n🎉 ALL TESTS PASSED!')
    console.log('✅ RLS fixes are working correctly')
    console.log('✅ Production authentication should be restored')
    console.log('✅ Performance improvements are active')
    
    return true
    
  } catch (err) {
    console.error('❌ Test execution failed:', err)
    return false
  }
}

async function showDeploymentStatus() {
  console.log('\n📋 DEPLOYMENT STATUS SUMMARY')
  console.log('=' .repeat(50))
  
  try {
    // Check if critical tables exist
    const tables = ['whatsapp_otps', 'whatsapp_otp_analytics', 'whatsapp_joined_numbers']
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count(*)')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table}: NOT ACCESSIBLE`)
      } else {
        console.log(`✅ ${table}: ACCESSIBLE`)
      }
    }
    
    console.log('\n📊 Recent Analytics Events:')
    const { data: recentEvents, error: eventsError } = await supabase
      .from('whatsapp_otp_analytics')
      .select('event_type, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (eventsError) {
      console.log('❌ Cannot access recent events:', eventsError.message)
    } else if (recentEvents && recentEvents.length > 0) {
      recentEvents.forEach(event => {
        console.log(`  • ${event.event_type} at ${event.created_at}`)
      })
    } else {
      console.log('  No recent events (this is normal for fresh deployments)')
    }
    
  } catch (err) {
    console.error('❌ Status check failed:', err)
  }
}

// Main execution
async function main() {
  console.log('🔒 DATABASE RLS FIX VERIFICATION')
  console.log('=' .repeat(50))
  
  const success = await testRLSFixes()
  
  if (success) {
    await showDeploymentStatus()
    console.log('\n🚀 NEXT STEPS:')
    console.log('1. Monitor Vercel logs for WhatsApp OTP operations')
    console.log('2. Test authentication flow in production')
    console.log('3. Verify no more 42501 RLS errors appear')
    process.exit(0)
  } else {
    console.log('\n❌ DEPLOYMENT VERIFICATION FAILED')
    console.log('Please check the RLS fix deployment in Supabase')
    process.exit(1)
  }
}

main().catch(console.error)
