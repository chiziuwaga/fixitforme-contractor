#!/usr/bin/env node

// Environment Variable Verification Script
console.log('🔍 CHECKING SUPABASE ENVIRONMENT VARIABLES...\n');

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SITE_URL'
];

const optionalVars = [
  'SUPABASE_DB_PASSWORD',
  'DATABASE_URL'
];

console.log('📋 REQUIRED VARIABLES:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Show first 20 chars and last 10 chars for security
    const masked = value.length > 30 
      ? `${value.substring(0, 20)}...${value.substring(value.length - 10)}`
      : value;
    console.log(`✅ ${varName}: ${masked}`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
  }
});

console.log('\n📋 OPTIONAL VARIABLES:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const masked = value.length > 30 
      ? `${value.substring(0, 20)}...${value.substring(value.length - 10)}`
      : value;
    console.log(`✅ ${varName}: ${masked}`);
  } else {
    console.log(`⚠️  ${varName}: Not set`);
  }
});

// Check if URLs look correct
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

console.log('\n🔗 URL VALIDATION:');
if (supabaseUrl) {
  if (supabaseUrl.includes('supabase.co')) {
    console.log(`✅ Supabase URL format: Looks correct`);
  } else {
    console.log(`⚠️  Supabase URL format: ${supabaseUrl} (verify this is correct)`);
  }
} else {
  console.log(`❌ Supabase URL: Missing`);
}

if (siteUrl) {
  console.log(`✅ Site URL: ${siteUrl}`);
} else {
  console.log(`⚠️  Site URL: Not set (using default)`);
}

console.log('\n🧪 QUICK CONNECTION TEST:');
if (supabaseUrl && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('Testing Supabase connection...');
  
  import('@supabase/supabase-js').then(({ createClient }) => {
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Test basic connection
    supabase.from('contractor_profiles').select('count').limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.log(`❌ Supabase connection test failed: ${error.message}`);
        } else {
          console.log(`✅ Supabase connection test: SUCCESS`);
        }
      })
      .catch(err => {
        console.log(`❌ Supabase connection test error: ${err.message}`);
      });
  }).catch(() => {
    console.log(`⚠️  Cannot import Supabase client (run 'npm install' if needed)`);
  });
} else {
  console.log(`⚠️  Cannot test connection - missing URL or anon key`);
}
