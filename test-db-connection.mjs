import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://exnkwdqgezzunkywapzg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bmt3ZHFnZXp6dW5reXdhcHpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAxMjk4OSwiZXhwIjoyMDY1NTg4OTg5fQ.9HGr-QT1xUvQCkKOPPkzBClFixCQ8jXAr4y73_rSooI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnectionAndExecuteViewFixes() {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    // Test connection with simple query
    const { data: testData, error: testError } = await supabase
      .from('contractor_profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection test failed:', testError);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Execute view fixes only (safest first step)
    console.log('🔄 Executing SECURITY DEFINER view fixes...');
    
    const viewFixes = `
-- Fix SECURITY DEFINER views by removing SECURITY DEFINER (linter warning)
DROP VIEW IF EXISTS contractor_analytics;

CREATE VIEW contractor_analytics AS
SELECT 
cp.id,
cp.business_name,
cp.subscription_tier,
cp.subscription_status,
cp.created_at,
COUNT(DISTINCT b.id) as total_bids,
COUNT(DISTINCT CASE WHEN b.bid_status = 'won' THEN b.id END) as won_bids,
COALESCE(SUM(CASE WHEN b.bid_status = 'won' THEN b.bid_amount END), 0) as total_revenue,
LEFT JOIN payment_transactions pt ON pt.contractor_id = cp.id -- Using payment_transactions table (correct name)
WHERE cp.subscription_status = 'active';
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: viewFixes 
    });
    
    if (error) {
      console.error('❌ View fixes failed:', error);
    } else {
      console.log('✅ SECURITY DEFINER view fixes applied successfully');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

testConnectionAndExecuteViewFixes();
