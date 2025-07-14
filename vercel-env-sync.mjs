// vercel-env-sync.mjs
// Script to help synchronize local and Vercel environment variables
// Run with: node vercel-env-sync.mjs

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m"
};

// Required variables for WhatsApp functionality
const REQUIRED_VARS = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_FROM',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

// Check if Vercel CLI is installed
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    return true;
  } catch {
    console.log(`${colors.red}Vercel CLI is not installed.${colors.reset}`);
    console.log(`${colors.yellow}Install it with: ${colors.cyan}npm i -g vercel${colors.reset}`);
    return false;
  }
}

// Read local .env.local file
function getLocalEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      console.log(`${colors.yellow}No .env.local file found.${colors.reset}`);
      return {};
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && match[1] && match[2]) {
        envVars[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
      }
    });

    return envVars;
  } catch (error) {
    console.error(`${colors.red}Error reading local environment:${colors.reset}`, error);
    return {};
  }
}

// Get Vercel environment variables
function getVercelEnv() {
  try {
    execSync('vercel env pull .env.vercel --yes', { encoding: 'utf8' });
    console.log(`${colors.green}Vercel environment pulled successfully.${colors.reset}`);

    // Read the pulled .env.vercel file
    const envPath = path.join(process.cwd(), '.env.vercel');
    if (!fs.existsSync(envPath)) {
      console.log(`${colors.yellow}No .env.vercel file was created.${colors.reset}`);
      return {};
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && match[1] && match[2]) {
        envVars[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
      }
    });

    // Delete the temporary file
    fs.unlinkSync(envPath);
    return envVars;
  } catch (error) {
    console.error(`${colors.red}Error pulling Vercel environment:${colors.reset}`, error);
    console.log(`${colors.yellow}Make sure you're logged into the Vercel CLI with ${colors.cyan}vercel login${colors.reset}`);
    return {};
  }
}

// Compare local and Vercel environment variables
function compareEnvironments(localEnv, vercelEnv) {
  const allVars = new Set([...Object.keys(localEnv), ...Object.keys(vercelEnv)]);
  const missing = { local: [], vercel: [] };
  const different = [];
  const requiredMissing = { local: [], vercel: [] };

  allVars.forEach(key => {
    // Check if variable exists in both environments
    const inLocal = key in localEnv;
    const inVercel = key in vercelEnv;

    if (!inLocal) {
      missing.local.push(key);
      if (REQUIRED_VARS.includes(key)) {
        requiredMissing.local.push(key);
      }
    }

    if (!inVercel) {
      missing.vercel.push(key);
      if (REQUIRED_VARS.includes(key)) {
        requiredMissing.vercel.push(key);
      }
    }

    // If variable exists in both environments, check if values match
    if (inLocal && inVercel && localEnv[key] !== vercelEnv[key]) {
      different.push(key);
    }
  });

  return { missing, different, requiredMissing };
}

// Generate commands to push missing local variables to Vercel
function generateVercelCommands(localEnv, missing) {
  const commands = missing.map(key => {
    const value = localEnv[key];
    const escapedValue = value.includes(' ') ? `"${value}"` : value;
    return `vercel env add ${key} ${escapedValue}`;
  });

  return commands;
}

// Main function
async function main() {
  console.log(`${colors.cyan}=== Vercel Environment Synchronization ===${colors.reset}`);

  if (!checkVercelCLI()) {
    return;
  }

  console.log(`${colors.cyan}Reading local environment variables...${colors.reset}`);
  const localEnv = getLocalEnv();
  
  console.log(`${colors.cyan}Pulling Vercel environment variables...${colors.reset}`);
  const vercelEnv = getVercelEnv();

  console.log(`${colors.cyan}Comparing environments...${colors.reset}`);
  const { missing, different, requiredMissing } = compareEnvironments(localEnv, vercelEnv);

  // Display critical issues first
  if (requiredMissing.local.length > 0 || requiredMissing.vercel.length > 0) {
    console.log(`\n${colors.red}CRITICAL: Required variables are missing:${colors.reset}`);
    if (requiredMissing.local.length > 0) {
      console.log(`${colors.yellow}Missing in local:${colors.reset} ${requiredMissing.local.join(', ')}`);
    }
    if (requiredMissing.vercel.length > 0) {
      console.log(`${colors.yellow}Missing in Vercel:${colors.reset} ${requiredMissing.vercel.join(', ')}`);
    }
  }

  // Display report
  console.log(`\n${colors.cyan}=== Environment Comparison Report ===${colors.reset}`);
  console.log(`Local variables: ${Object.keys(localEnv).length}`);
  console.log(`Vercel variables: ${Object.keys(vercelEnv).length}`);
  console.log(`Variables missing from local: ${missing.local.length}`);
  console.log(`Variables missing from Vercel: ${missing.vercel.length}`);
  console.log(`Variables with different values: ${different.length}`);

  // Display Vercel missing variables
  if (missing.vercel.length > 0) {
    console.log(`\n${colors.cyan}Variables missing from Vercel:${colors.reset}`);
    console.log(missing.vercel.join('\n'));

    const commands = generateVercelCommands(localEnv, missing.vercel);
    
    console.log(`\n${colors.cyan}Commands to push missing variables to Vercel:${colors.reset}`);
    console.log(commands.join('\n'));
  }

  // Display different values
  if (different.length > 0) {
    console.log(`\n${colors.yellow}Variables with different values:${colors.reset}`);
    different.forEach(key => {
      // Don't show actual values for sensitive variables
      const isSensitive = key.toLowerCase().includes('key') || 
                         key.toLowerCase().includes('secret') || 
                         key.toLowerCase().includes('password') ||
                         key.toLowerCase().includes('token');
      
      if (isSensitive) {
        console.log(`${key}: [values differ - sensitive]`);
      } else {
        console.log(`${key}:`);
        console.log(`  Local: ${localEnv[key]}`);
        console.log(`  Vercel: ${vercelEnv[key]}`);
      }
    });
  }

  // Final recommendations
  console.log(`\n${colors.cyan}=== Recommendations ===${colors.reset}`);
  if (requiredMissing.vercel.length > 0) {
    console.log(`${colors.red}• Critical: Add missing required variables to Vercel${colors.reset}`);
    requiredMissing.vercel.forEach(key => {
      if (key in localEnv) {
        const value = localEnv[key].includes(' ') ? `"${localEnv[key]}"` : localEnv[key];
        console.log(`  ${colors.yellow}vercel env add ${key} ${value}${colors.reset}`);
      } else {
        console.log(`  ${colors.yellow}vercel env add ${key} [value-needed]${colors.reset}`);
      }
    });
  }

  if (different.length > 0) {
    console.log(`${colors.yellow}• Review variables with different values${colors.reset}`);
  }

  console.log(`\n${colors.green}Sync completed.${colors.reset}`);
}

main().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
});
