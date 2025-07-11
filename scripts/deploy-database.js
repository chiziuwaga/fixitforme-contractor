#!/usr/bin/env node

/**
 * FixItForMe Contractor - Direct Schema Deployment
 * Deploy the complete database schema using PostgreSQL direct connection
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('🚀 FixItForMe Contractor - Direct Schema Deployment\n');

// PostgreSQL connection configuration  
const connectionString = process.env.POSTGRES_URL_NON_POOLING?.replace('sslmode=require', 'sslmode=disable');

const client = new Client({
  connectionString: connectionString,
  ssl: false
});

async function connectDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');
    return true;
  } catch (err) {
    console.error('❌ Failed to connect to database:', err.message);
    return false;
  }
}

async function deploySchema() {
  console.log('\n🏗️  Deploying Database Schema...\n');
  
  try {
    // Read the schema file directly from database directory
    const schemaPath = path.join(__dirname, '..', 'database', 'deploy-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Schema file not found:', schemaPath);
      return false;
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Read schema file:', schemaPath);
    console.log('📊 Schema size:', (schemaSQL.length / 1024).toFixed(1), 'KB');
    
    // Execute the schema
    console.log('🚀 Executing schema deployment...');
    await client.query(schemaSQL);
    
    console.log('✅ Schema deployment completed successfully!');
    return true;
    
  } catch (err) {
    console.error('❌ Schema deployment failed:', err.message);
    console.error('Error details:', err.stack);
    return false;
  }
}

async function deployFelixData() {
  console.log('\n🔧 Deploying Felix 40-Problem Data...\n');
  
  try {
    // Read Felix data file
    const felixPath = path.join(__dirname, '..', 'deploy-felix-data.sql');
    
    if (!fs.existsSync(felixPath)) {
      console.error('❌ Felix data file not found:', felixPath);
      return false;
    }
    
    const felixSQL = fs.readFileSync(felixPath, 'utf8');
    console.log('📄 Read Felix data file:', felixPath);
    
    // Execute Felix data deployment
    console.log('🚀 Executing Felix data deployment...');
    await client.query(felixSQL);
    
    console.log('✅ Felix data deployment completed successfully!');
    return true;
    
  } catch (err) {
    console.error('❌ Felix data deployment failed:', err.message);
    return false;
  }
}

async function verifyDeployment() {
  console.log('\n🔍 Verifying Deployment...\n');
  
  try {
    // Check tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    const tableNames = tablesResult.rows.map(row => row.table_name);
    
    console.log('📊 Tables Created:', tableNames.length);
    tableNames.forEach(name => console.log(`   ✅ ${name}`));
    
    // Check Felix data
    if (tableNames.includes('felix_problems')) {
      const felixQuery = 'SELECT COUNT(*) as count FROM felix_problems;';
      const felixResult = await client.query(felixQuery);
      const count = parseInt(felixResult.rows[0].count);
      
      console.log(`\n🔧 Felix Problems: ${count} (expected: 40)`);
      
      if (count === 40) {
        console.log('✅ Felix data is complete');
      } else {
        console.log('⚠️  Felix data may be incomplete');
      }
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
    return false;
  }
}

async function main() {
  const connected = await connectDatabase();
  if (!connected) {
    process.exit(1);
  }

  try {
    // Deploy schema
    const schemaDeployed = await deploySchema();
    if (!schemaDeployed) {
      console.log('❌ Schema deployment failed, stopping...');
      process.exit(1);
    }
    
    // Deploy Felix data
    const felixDeployed = await deployFelixData();
    if (!felixDeployed) {
      console.log('⚠️  Felix data deployment failed, but schema was successful');
    }
    
    // Verify deployment
    await verifyDeployment();
    
    console.log('\n🎉 DATABASE DEPLOYMENT COMPLETE!');
    console.log('=' * 50);
    
  } catch (err) {
    console.error('❌ Deployment failed:', err.message);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

main().catch(console.error);
