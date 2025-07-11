#!/usr/bin/env node

/**
 * FixItForMe Contractor - Database Schema Verification
 * Checks all tables exist and structure is correct
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 FixItForMe Contractor - Database Schema Verification\n');

const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

async function checkTables() {
  console.log('📋 Checking Database Tables...\n');
  
  try {
    // Query to get all tables in public schema
    const { data: tables, error } = await adminSupabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (error) {
      console.error('❌ Error fetching tables:', error.message);
      return false;
    }

    const tableNames = tables.map(t => t.table_name);
    console.log('📊 Found Tables:', tableNames.join(', '));
    console.log(`📊 Total Tables: ${tableNames.length}\n`);

    // Expected tables from our schema
    const expectedTables = [
      'agent_executions',
      'bids', 
      'chat_messages',
      'contractor_analytics',
      'contractor_documents',
      'contractor_profiles',
      'felix_problems',
      'jobs',
      'leads',
      'notifications',
      'payment_transactions',
      'service_areas',
      'subscriptions'
    ];

    console.log('✅ Expected Tables Check:');
    let missingTables = [];
    
    for (const table of expectedTables) {
      if (tableNames.includes(table)) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} - MISSING`);
        missingTables.push(table);
      }
    }

    if (missingTables.length > 0) {
      console.log(`\n⚠️  Missing ${missingTables.length} tables:`, missingTables.join(', '));
      return false;
    } else {
      console.log('\n🎉 All expected tables exist!');
      return true;
    }

  } catch (err) {
    console.error('❌ Database check failed:', err.message);
    return false;
  }
}

async function checkSampleData() {
  console.log('\n📊 Checking Sample Data...\n');

  try {
    // Check contractor_profiles
    const { count: profileCount } = await adminSupabase
      .from('contractor_profiles')
      .select('*', { count: 'exact', head: true });
    
    console.log(`👥 Contractor Profiles: ${profileCount || 0}`);

    // Check felix_problems
    const { count: felixCount } = await adminSupabase
      .from('felix_problems')
      .select('*', { count: 'exact', head: true });
    
    console.log(`🔧 Felix Problems: ${felixCount || 0} (expected: 40)`);

    // Check leads
    const { count: leadCount } = await adminSupabase
      .from('leads')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📋 Leads: ${leadCount || 0}`);

    // Check bids
    const { count: bidCount } = await adminSupabase
      .from('bids')
      .select('*', { count: 'exact', head: true });
    
    console.log(`💰 Bids: ${bidCount || 0}`);

    return true;

  } catch (err) {
    console.error('❌ Sample data check failed:', err.message);
    return false;
  }
}

async function main() {
  const tablesExist = await checkTables();
  if (tablesExist) {
    await checkSampleData();
  }
  
  console.log('\n📋 SCHEMA VERIFICATION COMPLETE');
  console.log('='.repeat(50));
  
  if (!tablesExist) {
    console.log('⚠️  Some tables are missing. Run the schema deployment first.');
    console.log('   Command: npm run supabase:push');
  }

  process.exit(0);
}

main().catch(console.error);
