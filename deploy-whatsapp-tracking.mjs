#!/usr/bin/env node

// deploy-whatsapp-tracking.mjs
// Script to deploy the WhatsApp tracking table to your Supabase database
// Run with: node deploy-whatsapp-tracking.mjs

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local file if it exists
dotenv.config({ path: '.env.local' });

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m"
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Check if required environment variables are set
function checkEnvVars() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.error(`${colors.red}Error: Missing required environment variables: ${missingVars.join(', ')}${colors.reset}`);
    console.log(`${colors.yellow}Make sure your .env.local file includes these variables.${colors.reset}`);
    return false;
  }
  
  return true;
}

// Read the SQL script
function readSqlScript() {
  const filePath = path.join(__dirname, 'database', 'whatsapp-tracking-table.sql');
  
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`${colors.red}Error: SQL script not found at ${filePath}${colors.reset}`);
      return null;
    }
    
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`${colors.red}Error reading SQL file:${colors.reset}`, error);
    return null;
  }
}

// Deploy the SQL script to Supabase
async function deploySqlScript(sql) {
  // Create Supabase client with service role key for admin operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error(`${colors.red}Error: Supabase credentials not found in environment variables${colors.reset}`);
    return false;
  }
  
  console.log(`${colors.cyan}Connecting to Supabase at ${supabaseUrl}...${colors.reset}`);
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    console.log(`${colors.cyan}Executing SQL script...${colors.reset}`);
    
    // Execute the SQL script
    const { error } = await supabase.rpc('pg_execute', { query: sql });
    
    if (error) {
      console.error(`${colors.red}Error deploying SQL script:${colors.reset}`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`${colors.red}Error deploying SQL script:${colors.reset}`, error);
    
    if (error.message.includes('pg_execute')) {
      console.log(`${colors.yellow}Note: The 'pg_execute' function may not be available.${colors.reset}`);
      console.log(`${colors.yellow}You may need to manually run the SQL script in the Supabase dashboard.${colors.reset}`);
    }
    
    return false;
  }
}

// Ask the user for confirmation before deployment
function confirmDeployment() {
  return new Promise((resolve) => {
    console.log(`\n${colors.yellow}This script will create a new table 'whatsapp_joined_numbers' in your Supabase database.${colors.reset}`);
    console.log(`${colors.yellow}It will help track which phone numbers have successfully received WhatsApp messages.${colors.reset}`);
    console.log(`${colors.yellow}This is used to avoid redundant sandbox join prompts for returning users.${colors.reset}\n`);
    
    rl.question(`${colors.cyan}Do you want to continue? (y/n) ${colors.reset}`, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Main function
async function main() {
  console.log(`${colors.cyan}=== WhatsApp Tracking Table Deployment ===${colors.reset}\n`);
  
  // Check environment variables
  if (!checkEnvVars()) {
    rl.close();
    return;
  }
  
  // Read SQL script
  const sql = readSqlScript();
  if (!sql) {
    rl.close();
    return;
  }
  
  // Ask for confirmation
  const confirmed = await confirmDeployment();
  if (!confirmed) {
    console.log(`${colors.yellow}Deployment cancelled.${colors.reset}`);
    rl.close();
    return;
  }
  
  // Deploy SQL script
  const success = await deploySqlScript(sql);
  
  if (success) {
    console.log(`\n${colors.green}WhatsApp tracking table deployed successfully!${colors.reset}`);
    console.log(`${colors.green}Your app will now track which phone numbers have joined the WhatsApp sandbox.${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}Deployment failed. You can manually apply the SQL script:${colors.reset}`);
    console.log(`${colors.yellow}1. Go to your Supabase dashboard${colors.reset}`);
    console.log(`${colors.yellow}2. Open the SQL Editor${colors.reset}`);
    console.log(`${colors.yellow}3. Paste the contents of 'database/whatsapp-tracking-table.sql'${colors.reset}`);
    console.log(`${colors.yellow}4. Execute the script${colors.reset}`);
  }
  
  rl.close();
}

main().catch((error) => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  rl.close();
});
