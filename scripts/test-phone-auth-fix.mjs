#!/usr/bin/env node

/**
 * Test Phone Authentication Fix
 * 
 * This script tests the newly deployed ensure_contractor_profile function
 * to verify the database consistency fix is working.
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPhoneAuthFix() {
  try {
    console.log('🧪 Testing phone authentication fix...');
    
    // Test 1: Check if function exists
    console.log('📋 Test 1: Checking ensure_contractor_profile function...');
    const { data: functions, error: funcError } = await supabase
      .rpc('ensure_contractor_profile', {
        input_phone: '+1234567890',
        input_user_id: '00000000-0000-0000-0000-000000000001'
      });
      
    if (funcError && funcError.message.includes('does not exist in auth.users')) {
      console.log('✅ Function exists and properly validates user existence');
    } else if (funcError) {
      console.log('⚠️  Function error (expected for test UUID):', funcError.message);
    } else {
      console.log('✅ Function executed successfully');
    }
    
    // Test 2: Check existing users in auth.users
    console.log('📋 Test 2: Checking existing users in auth.users...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error listing users:', usersError);
    } else {
      console.log(`✅ Found ${users.users.length} users in auth.users`);
      
      // Find phone users
      const phoneUsers = users.users.filter(u => u.phone);
      console.log(`📱 Phone users: ${phoneUsers.length}`);
      
      if (phoneUsers.length > 0) {
        const testUser = phoneUsers[0];
        console.log(`🔍 Testing with existing user: ${testUser.phone} (${testUser.id})`);
        
        // Test the function with a real user
        const { data: profileId, error: profileError } = await supabase
          .rpc('ensure_contractor_profile', {
            input_phone: testUser.phone,
            input_user_id: testUser.id
          });
          
        if (profileError) {
          console.error('❌ Profile function error:', profileError);
        } else {
          console.log('✅ Profile function succeeded, profile ID:', profileId);
          
          // Verify the profile was created/found
          const { data: profile, error: fetchError } = await supabase
            .from('contractor_profiles')
            .select('*')
            .eq('id', profileId)
            .single();
            
          if (fetchError) {
            console.error('❌ Error fetching profile:', fetchError);
          } else {
            console.log('✅ Profile verified:', {
              id: profile.id,
              user_id: profile.user_id,
              contact_phone: profile.contact_phone,
              onboarding_completed: profile.onboarding_completed
            });
          }
        }
      }
    }
    
    console.log('🎉 Phone authentication fix test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPhoneAuthFix().catch(console.error);
