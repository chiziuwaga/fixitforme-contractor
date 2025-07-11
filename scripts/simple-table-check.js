#!/usr/bin/env node

/**
 * Simple Database Table Check
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Database Table Check\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const expectedTables = [
    'contractor_profiles',
    'felix_problems', 
    'leads',
    'bids',
    'subscriptions',
    'jobs',
    'notifications'
  ];

  console.log('📊 Checking Core Tables:\n');

  for (const table of expectedTables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: ${count || 0} records`);
      }
    } catch (err) {
      console.log(`   ❌ ${table}: Error - ${err.message}`);
    }
  }
}

checkTables().then(() => {
  console.log('\n✅ Table check complete');
}).catch(console.error);
