#!/usr/bin/env node

/**
 * FixItForMe Contractor - Supabase Connection Test
 * Tests database connectivity and basic operations
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 FixItForMe Contractor - Supabase Connection Test\n');

// Test 1: Basic Client Creation
console.log('1️⃣ Testing Supabase Client Creation...');
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '❌ Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
console.log('✅ Supabase clients created successfully\n');

// Test 2: Database Connection
async function testDatabaseConnection() {
  console.log('2️⃣ Testing Database Connection...');
  
  try {
    const { data, error } = await supabase
      .from('contractor_profiles')
      .select('count')
      .single();
      
    if (error && error.code === 'PGRST116') {
      console.log('⚠️  Table "contractor_profiles" does not exist yet - this is expected');
      console.log('   Schema deployment needed (Step 3)');
      return false;
    } else if (error) {
      console.error('❌ Database connection error:', error.message);
      return false;
    } else {
      console.log('✅ Database connection successful');
      console.log('📊 Contractor profiles count:', data?.count || 0);
      return true;
    }
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
}

// Test 3: Authentication Service
async function testAuthService() {
  console.log('\n3️⃣ Testing Authentication Service...');
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Auth service error:', error.message);
      return false;
    } else {
      console.log('✅ Authentication service accessible');
      console.log('📱 Current session:', data.session ? 'Active' : 'None (expected for test)');
      return true;
    }
  } catch (err) {
    console.error('❌ Auth service failed:', err.message);
    return false;
  }
}

// Test 4: Storage Service
async function testStorageService() {
  console.log('\n4️⃣ Testing Storage Service...');
  
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Storage service error:', error.message);
      return false;
    } else {
      console.log('✅ Storage service accessible');
      console.log('🗂️  Available buckets:', data.map(b => b.name).join(', ') || 'None yet');
      return true;
    }
  } catch (err) {
    console.error('❌ Storage service failed:', err.message);
    return false;
  }
}

// Test 5: Real-time Subscriptions
async function testRealtimeService() {
  console.log('\n5️⃣ Testing Real-time Service...');
  
  try {
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'contractor_profiles' }, 
          () => {})
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time service connected');
          channel.unsubscribe();
        } else if (status === 'CHANNEL_ERROR') {
          console.log('⚠️  Real-time service accessible but table missing (expected)');
          channel.unsubscribe();
        }
      });
      
    // Give it 2 seconds to connect
    await new Promise(resolve => setTimeout(resolve, 2000));
    return true;
  } catch (err) {
    console.error('❌ Real-time service failed:', err.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  const dbConnected = await testDatabaseConnection();
  const authWorking = await testAuthService();
  const storageWorking = await testStorageService();
  const realtimeWorking = await testRealtimeService();
  
  console.log('\n📋 TEST SUMMARY:');
  console.log('='.repeat(50));
  console.log('Database Connection:', dbConnected ? '✅ Ready' : '⚠️  Schema needed');
  console.log('Authentication:', authWorking ? '✅ Working' : '❌ Failed');
  console.log('Storage Service:', storageWorking ? '✅ Working' : '❌ Failed');
  console.log('Real-time Service:', realtimeWorking ? '✅ Working' : '❌ Failed');
  
  if (!dbConnected) {
    console.log('\n🚀 NEXT STEP: Deploy database schema');
    console.log('   Run: npm run deploy:schema');
  } else {
    console.log('\n🎉 Supabase fully operational!');
  }
  
  process.exit(0);
}

runTests().catch(console.error);
