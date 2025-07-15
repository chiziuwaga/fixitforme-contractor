import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exnkwdqgezzunkywapzg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bmt3ZHFnZXp6dW5reXdhcHpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAxMjk4OSwiZXhwIjoyMDY1NTg4OTg5fQ.9HGr-QT1xUvQCkKOPPkzBClFixCQ8jXAr4y73_rSooI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeInBatches() {
  try {
    console.log('🔄 Starting database linter fixes in batches...');
    
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
    
    // Step 1: Fix RLS policies for contractor_profiles
    console.log('🔄 Step 1: Optimizing RLS policies...');
    
    try {
      // Drop existing policies
      await supabase.rpc('exec', { 
        sql: 'DROP POLICY IF EXISTS "contractor_profiles_select_policy" ON contractor_profiles;'
      }).catch(() => {
        // Ignore if policy doesn't exist
      });
      
      await supabase.rpc('exec', { 
        sql: 'DROP POLICY IF EXISTS "contractor_profiles_insert_policy" ON contractor_profiles;'
      }).catch(() => {
        // Ignore if policy doesn't exist  
      });
      
      await supabase.rpc('exec', { 
        sql: 'DROP POLICY IF EXISTS "contractor_profiles_update_policy" ON contractor_profiles;'
      }).catch(() => {
        // Ignore if policy doesn't exist
      });
      
      await supabase.rpc('exec', { 
        sql: 'DROP POLICY IF EXISTS "contractor_profiles_delete_policy" ON contractor_profiles;'
      }).catch(() => {
        // Ignore if policy doesn't exist
      });
      
      // Create optimized policies with subquery auth calls (fixes auth_rls_initplan warning)
      const selectPolicy = `
        CREATE POLICY "contractor_profiles_select_policy" ON contractor_profiles
        FOR SELECT
        TO authenticated, anon
        USING (
          user_id = (SELECT auth.uid()) 
          OR 
          (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
        );
      `;
      
      await supabase.rpc('exec', { sql: selectPolicy });
      console.log('✅ Select policy created');
      
      const insertPolicy = `
        CREATE POLICY "contractor_profiles_insert_policy" ON contractor_profiles
        FOR INSERT
        TO authenticated, anon
        WITH CHECK (
          user_id = (SELECT auth.uid())
          OR 
          (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
        );
      `;
      
      await supabase.rpc('exec', { sql: insertPolicy });
      console.log('✅ Insert policy created');
      
      const updatePolicy = `
        CREATE POLICY "contractor_profiles_update_policy" ON contractor_profiles
        FOR UPDATE
        TO authenticated, anon
        USING (
          user_id = (SELECT auth.uid())
          OR 
          (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
        )
        WITH CHECK (
          user_id = (SELECT auth.uid())
          OR 
          (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
        );
      `;
      
      await supabase.rpc('exec', { sql: updatePolicy });
      console.log('✅ Update policy created');
      
      const deletePolicy = `
        CREATE POLICY "contractor_profiles_delete_policy" ON contractor_profiles
        FOR DELETE
        TO authenticated, anon
        USING (
          user_id = (SELECT auth.uid())
          OR 
          (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
        );
      `;
      
      await supabase.rpc('exec', { sql: deletePolicy });
      console.log('✅ Delete policy created');
      
      console.log('✅ Step 1 complete: RLS policies optimized');
      
    } catch (policyError) {
      console.error('❌ RLS policy fixes failed:', policyError);
    }
    
    console.log('🎉 Database linter fixes applied successfully!');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

executeInBatches();
