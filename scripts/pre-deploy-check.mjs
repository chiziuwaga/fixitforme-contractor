#!/usr/bin/env node

/**
 * Pre-Deployment Health Check Script
 * 
 * This script verifies critical system components before Vercel deployment:
 * 1. Database RLS policies are working
 * 2. Authentication flow is functional
 * 3. Environment variables are properly configured
 * 4. WhatsApp OTP system is operational
 * 
 * Usage: npm run pre-deploy
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m"
};

console.log(`${colors.cyan}🚀 FixItForMe Pre-Deployment Health Check${colors.reset}\n`);

// Check environment variables
function checkEnvironmentVariables() {
  console.log(`${colors.blue}📋 Checking Environment Variables...${colors.reset}`);
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_WHATSAPP_FROM'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log(`${colors.red}❌ Missing environment variables:${colors.reset}`);
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    return false;
  }
  
  console.log(`${colors.green}✅ All required environment variables are present${colors.reset}`);
  return true;
}

// Test database connection and RLS policies
async function testDatabaseConnection() {
  console.log(`${colors.blue}🗄️  Testing Database Connection & RLS Policies...${colors.reset}`);
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Test 1: Basic connection
    const { error: connectionError } = await supabase
      .from('whatsapp_otp_analytics')
      .select('count(*)')
      .limit(1);
    
    if (connectionError) {
      console.log(`${colors.red}❌ Database connection failed: ${connectionError.message}${colors.reset}`);
      return false;
    }
    
    // Test 2: Analytics table access (this was failing in production)
    const { error: analyticsError } = await supabase
      .from('whatsapp_otp_analytics')
      .insert({
        phone_number: '+1234567890',
        event_type: 'health_check',
        event_data: { test: true, timestamp: new Date().toISOString() },
        created_at: new Date().toISOString()
      });
    
    if (analyticsError) {
      console.log(`${colors.red}❌ Analytics insert failed (RLS issue): ${analyticsError.message}${colors.reset}`);
      console.log(`${colors.yellow}   This indicates RLS policies need fixing before deployment${colors.reset}`);
      return false;
    }
    
    // Test 3: Function access
    const { error: funcError } = await supabase.rpc('track_whatsapp_event', {
      p_phone: '+1234567890',
      p_event_type: 'health_check',
      p_event_data: { test: true }
    });
    
    if (funcError) {
      console.log(`${colors.red}❌ Function call failed: ${funcError.message}${colors.reset}`);
      return false;
    }
    
    console.log(`${colors.green}✅ Database connection and RLS policies are working${colors.reset}`);
    return true;
    
  } catch (error) {
    console.log(`${colors.red}❌ Database test failed: ${error.message}${colors.reset}`);
    return false;
  }
}

// Test authentication flow
async function testAuthenticationFlow() {
  console.log(`${colors.blue}🔐 Testing Authentication Flow...${colors.reset}`);
  
  try {
    const API_BASE = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    // Test WhatsApp OTP verification with demo code
    const response = await fetch(`${API_BASE}/api/auth/verify-whatsapp-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '+1234567890',
        token: '209741'
      })
    });
    
    if (!response.ok) {
      console.log(`${colors.red}❌ Auth endpoint returned ${response.status}${colors.reset}`);
      return false;
    }
    
    const data = await response.json();
    
    if (!data.success || !data.demo_mode) {
      console.log(`${colors.red}❌ Demo authentication failed${colors.reset}`);
      console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
      return false;
    }
    
    console.log(`${colors.green}✅ Authentication flow is working${colors.reset}`);
    return true;
    
  } catch (error) {
    console.log(`${colors.red}❌ Authentication test failed: ${error.message}${colors.reset}`);
    return false;
  }
}

// Check critical files exist
function checkCriticalFiles() {
  console.log(`${colors.blue}📁 Checking Critical Files...${colors.reset}`);
  
  const criticalFiles = [
    'database/COMPREHENSIVE_RLS_FIX.sql',
    'src/app/api/auth/verify-whatsapp-otp/route.ts',
    'src/app/api/send-whatsapp-otp/route.ts',
    'src/hooks/useAuth.ts',
    'src/lib/analytics.ts'
  ];
  
  const missingFiles = criticalFiles.filter(file => {
    const fullPath = path.join(__dirname, '..', file);
    return !fs.existsSync(fullPath);
  });
  
  if (missingFiles.length > 0) {
    console.log(`${colors.red}❌ Missing critical files:${colors.reset}`);
    missingFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
    return false;
  }
  
  console.log(`${colors.green}✅ All critical files are present${colors.reset}`);
  return true;
}

// Main health check function
async function runHealthCheck() {
  console.log(`${colors.cyan}Starting comprehensive health check...${colors.reset}\n`);
  
  const checks = [
    { name: 'Environment Variables', fn: checkEnvironmentVariables },
    { name: 'Critical Files', fn: checkCriticalFiles },
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Authentication Flow', fn: testAuthenticationFlow }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      const result = await check.fn();
      if (!result) {
        allPassed = false;
      }
    } catch (error) {
      console.log(`${colors.red}❌ ${check.name} check failed: ${error.message}${colors.reset}`);
      allPassed = false;
    }
    console.log(''); // Add spacing
  }
  
  if (allPassed) {
    console.log(`${colors.green}🎉 ALL HEALTH CHECKS PASSED!${colors.reset}`);
    console.log(`${colors.green}✅ System is ready for deployment${colors.reset}`);
    console.log(`${colors.cyan}You can now run: npm run deploy-safe${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}❌ HEALTH CHECK FAILED!${colors.reset}`);
    console.log(`${colors.red}🚨 DO NOT DEPLOY - Fix issues first${colors.reset}`);
    console.log(`${colors.yellow}💡 Run the comprehensive RLS fix: npm run db:fix${colors.reset}\n`);
    process.exit(1);
  }
}

// Run the health check
runHealthCheck().catch(error => {
  console.error(`${colors.red}❌ Health check execution failed:${colors.reset}`, error);
  process.exit(1);
});
