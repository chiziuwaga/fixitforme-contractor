#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = 'https://ehkklxbemxhofmjgxxgj.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoa2tseGJlbXhob2Ztamd4eGdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjg4MzI1OCwiZXhwIjoyMDUyNDU5MjU4fQ.YKrGMyNVGnYFUaU7T6rKJzpKNx7j7aPAaJ3VNkQFvsg'

console.log('🚀 Deploying Service Role Auth Access Fix...')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

try {
  // Read the SQL file
  const sqlPath = path.join(process.cwd(), 'database', 'fix-service-role-auth-access.sql')
  const sqlContent = fs.readFileSync(sqlPath, 'utf8')
  
  console.log('📄 SQL file loaded, executing...')
  
  // Execute the SQL
  const { data, error } = await supabase.rpc('exec_sql', { 
    sql_query: sqlContent 
  })
  
  if (error) {
    console.error('❌ SQL Execution Error:', error)
    
    // Try alternative approach - execute individual statements
    console.log('🔄 Trying individual statement execution...')
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Executing ${statements.length} individual statements...`)
    
    for (const [index, statement] of statements.entries()) {
      try {
        console.log(`⏳ Statement ${index + 1}/${statements.length}:`, statement.substring(0, 50) + '...')
        
        const { error: stmtError } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        })
        
        if (stmtError) {
          console.error(`❌ Statement ${index + 1} failed:`, stmtError.message)
        } else {
          console.log(`✅ Statement ${index + 1} completed`)
        }
      } catch (stmtErr) {
        console.error(`❌ Statement ${index + 1} exception:`, stmtErr.message)
      }
    }
  } else {
    console.log('✅ SQL executed successfully:', data)
  }
  
  // Test the function
  console.log('\n🧪 Testing ensure_contractor_profile function...')
  
  const { data: testResult, error: testError } = await supabase.rpc('ensure_contractor_profile', {
    user_id_param: '123e4567-e89b-12d3-a456-426614174000',
    phone_param: '+1234567890'
  })
  
  if (testError) {
    console.error('❌ Function test failed:', testError)
  } else {
    console.log('✅ Function test successful:', testResult)
  }
  
} catch (err) {
  console.error('💥 Deployment failed:', err.message)
  process.exit(1)
}

console.log('🎉 Service Role Auth Access Fix deployment complete!')
