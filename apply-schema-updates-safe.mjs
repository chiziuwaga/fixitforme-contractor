import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Using environment variables instead of hardcoded keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://exnkwdqgezzunkywapzg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchemaUpdatesWithExec() {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('contractor_profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection test failed:', testError);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    
    // First, deploy the exec function manually in Supabase Dashboard
    console.log('📋 MANUAL STEP REQUIRED:');
    console.log('   1. Open Supabase Dashboard SQL Editor');
    console.log('   2. Run DEPENDENCY_SAFE_DEPLOYMENT.sql section by section');
    console.log('   3. Verify exec function is created');
    console.log('   4. Then run this script again with --use-exec flag');
    
    // Check if exec function exists
    const { data: execTest, error: execError } = await supabase.rpc('exec', { 
      sql_query: 'SELECT \'exec function test\' as test;'
    });
    
    if (execError) {
      console.log('⚠️  exec function not yet available');
      console.log('   Run DEPENDENCY_SAFE_DEPLOYMENT.sql first in Supabase Dashboard');
      return;
    }
    
    console.log('✅ exec function is available');
    
    // Now we can use the exec function for additional updates
    console.log('🔄 Applying additional optimizations...');
    
    // Add any additional SQL optimizations here using the exec function
    const additionalSQL = [
      "ANALYZE contractor_profiles;",
      "ANALYZE whatsapp_otps;",
      "SELECT 'Database statistics updated' as status;"
    ];
    
    for (const sql of additionalSQL) {
      const { data, error } = await supabase.rpc('exec', { sql_query: sql });
      
      if (error) {
        console.error(`❌ SQL failed: ${sql.substring(0, 50)}...`, error);
      } else {
        console.log(`✅ SQL executed: ${data}`);
      }
    }
    
    console.log('✅ Schema updates completed successfully!');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

// Check command line arguments
const useExec = process.argv.includes('--use-exec');

if (useExec) {
  applySchemaUpdatesWithExec();
} else {
  console.log('📋 DEPLOYMENT INSTRUCTIONS:');
  console.log('');
  console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard/project/exnkwdqgezzunkywapzg');
  console.log('2. Go to SQL Editor');
  console.log('3. Run DEPENDENCY_SAFE_DEPLOYMENT.sql section by section');
  console.log('4. After successful deployment, run: node apply-schema-updates-safe.mjs --use-exec');
  console.log('');
  console.log('🔒 This approach avoids exposing API keys in the codebase');
}
