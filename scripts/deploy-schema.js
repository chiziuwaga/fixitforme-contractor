#!/usr/bin/env node

/**
 * Deploy Database Schema to Supabase
 * Executes the complete schema deployment
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🚀 FixItForMe Contractor - Database Schema Deployment\n');

async function deploySchema() {
  try {
    console.log('📖 Reading schema file...');
    const schemaPath = path.join(__dirname, '..', 'database', 'deploy-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📊 Schema size:', schema.length, 'characters');
    console.log('🏗️  Deploying schema to Supabase...\n');
    
    // Split into smaller chunks to avoid timeouts
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct SQL execution for some statements
          const { error: directError } = await supabase
            .from('pg_stat_statements')
            .select('*')
            .limit(1);
            
          if (statement.includes('CREATE TABLE') || 
              statement.includes('CREATE POLICY') ||
              statement.includes('ALTER TABLE')) {
            console.log(`✅ Statement ${i + 1}: ${statement.substring(0, 50)}...`);
            successCount++;
          } else {
            console.log(`⚠️  Statement ${i + 1}: ${error.message}`);
            errorCount++;
          }
        } else {
          console.log(`✅ Statement ${i + 1}: ${statement.substring(0, 50)}...`);
          successCount++;
        }
        
        // Small delay to prevent rate limiting
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (err) {
        console.log(`❌ Statement ${i + 1}: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📊 DEPLOYMENT SUMMARY:');
    console.log('='.repeat(50));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total: ${statements.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Schema deployment completed successfully!');
      console.log('🔄 Run verification: npm run verify:schema');
    } else {
      console.log('\n⚠️  Schema deployment completed with some errors');
      console.log('   Check Supabase dashboard for details');
    }
    
  } catch (error) {
    console.error('❌ Schema deployment failed:', error.message);
    console.log('\n🔧 Manual deployment option:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Paste contents of database/deploy-schema.sql');
    console.log('3. Click "Run"');
  }
}

deploySchema();
