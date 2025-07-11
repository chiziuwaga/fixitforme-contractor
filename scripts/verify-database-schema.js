#!/usr/bin/env node

/**
 * FixItForMe Contractor - Database Schema Verification
 * Verifies all required tables and data are present
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🗄️ FixItForMe Contractor - Database Schema Verification\n');

// Check required tables
const requiredTables = [
  'contractor_profiles',
  'subscriptions', 
  'jobs',
  'leads',
  'bids',
  'felix_categories',
  'felix_problems',
  'common_service_areas',
  'notifications'
];

async function checkTable(tableName) {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.log(`❌ ${tableName}: ${error.message}`);
      return false;
    } else {
      console.log(`✅ ${tableName}: ${count || 0} records`);
      return true;
    }
  } catch (err) {
    console.log(`❌ ${tableName}: ${err.message}`);
    return false;
  }
}

async function checkExtensions() {
  console.log('\n🔧 Checking Database Extensions...');
  
  try {
    const { data, error } = await supabase.rpc('check_extensions');
    
    if (error) {
      // Try alternative method
      const { data: extData, error: extError } = await supabase
        .from('pg_extension')
        .select('extname');
        
      if (extError) {
        console.log('⚠️  Cannot check extensions (permission limited)');
        return;
      }
      
      const extensions = extData.map(e => e.extname);
      console.log('📦 Installed extensions:', extensions.join(', '));
    }
  } catch (err) {
    console.log('⚠️  Extension check limited by permissions');
  }
}

async function checkFelixData() {
  console.log('\n🏠 Checking Felix 40-Problem Framework...');
  
  try {
    const { data: categories, error: catError } = await supabase
      .from('felix_categories')
      .select('*');
      
    const { data: problems, error: probError } = await supabase
      .from('felix_problems')
      .select('*');
      
    if (catError || probError) {
      console.log('⚠️  Felix data not yet seeded');
      return false;
    }
    
    console.log(`✅ Felix Categories: ${categories?.length || 0}`);
    console.log(`✅ Felix Problems: ${problems?.length || 0}`);
    
    if (problems?.length === 40) {
      console.log('🎯 Complete Felix 40-problem framework detected!');
      return true;
    }
    
    return false;
  } catch (err) {
    console.log('⚠️  Felix framework check failed:', err.message);
    return false;
  }
}

async function verifySchema() {
  console.log('📋 Checking Required Tables...');
  
  const results = [];
  for (const table of requiredTables) {
    const exists = await checkTable(table);
    results.push({ table, exists });
  }
  
  await checkExtensions();
  const felixReady = await checkFelixData();
  
  console.log('\n📊 SCHEMA VERIFICATION SUMMARY:');
  console.log('='.repeat(50));
  
  const missingTables = results.filter(r => !r.exists);
  const existingTables = results.filter(r => r.exists);
  
  console.log(`✅ Tables Present: ${existingTables.length}/${requiredTables.length}`);
  console.log(`🏠 Felix Framework: ${felixReady ? 'Complete' : 'Needs Seeding'}`);
  
  if (missingTables.length > 0) {
    console.log('\n⚠️  Missing Tables:');
    missingTables.forEach(t => console.log(`   - ${t.table}`));
    console.log('\n🚀 Run: npm run deploy:schema');
  }
  
  if (existingTables.length === requiredTables.length && felixReady) {
    console.log('\n🎉 Database schema is COMPLETE and ready for production!');
  } else if (existingTables.length === requiredTables.length) {
    console.log('\n🌱 Database schema ready - seed Felix data with:');
    console.log('   npm run seed:felix');
  }
}

verifySchema().catch(console.error);
