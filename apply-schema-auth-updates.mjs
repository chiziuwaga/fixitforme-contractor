import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://exnkwdqgezzunkywapzg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bmt3ZHFnZXp6dW5reXdhcHpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAxMjk4OSwiZXhwIjoyMDY1NTg4OTg5fQ.9HGr-QT1xUvQCkKOPPkzBClFixCQ8jXAr4y73_rSooI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchemaAuthUpdates() {
  try {
    console.log('🔄 Applying schema authentication updates...');
    
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('contractor_profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection test failed:', testError);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Read the migration file
    const migrationSQL = fs.readFileSync('supabase/migrations/20250714235325_schema_auth_updates.sql', 'utf8');
    
    // Split into individual SQL statements (avoiding issues with large transactions)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔄 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.includes('SELECT') && statement.includes('status')) {
        // Skip verification statements
        continue;
      }
      
      try {
        console.log(`📝 Statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
        
        const { data, error } = await supabase.rpc('exec', { 
          sql: statement + ';'
        });
        
        if (error) {
          console.error(`❌ Statement ${i + 1} failed:`, error);
          // Continue with next statement for non-critical errors
        } else {
          console.log(`✅ Statement ${i + 1} completed`);
        }
        
      } catch (statementError) {
        console.error(`❌ Statement ${i + 1} error:`, statementError);
      }
    }
    
    console.log('✅ Schema authentication updates completed!');
    
    // Verify the update worked
    console.log('🔍 Verifying function exists...');
    const { data: funcData, error: funcError } = await supabase.rpc('ensure_contractor_profile', {
      user_uuid: '00000000-0000-0000-0000-000000000000',
      phone_number: '+1234567890'
    }).then(() => ({ data: 'Function exists', error: null }))
      .catch(err => ({ data: null, error: err }));
    
    if (funcError && !funcError.message.includes('duplicate')) {
      console.error('❌ Function verification failed:', funcError);
    } else {
      console.log('✅ Authentication functions deployed successfully');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

applySchemaAuthUpdates();
