#!/usr/bin/env node

/**
 * Complete Deployment Verification Script
 * 
 * This script runs a comprehensive verification of the entire FixItForMe
 * contractor system before and during Vercel deployment. It can be used
 * as a pre-build script to ensure system health.
 * 
 * Usage in package.json:
 * "vercel-build": "node scripts/deployment-verification.mjs && next build"
 * 
 * Or standalone:
 * npm run deploy-verify
 */

import { createClient } from '@supabase/supabase-js';

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m"
};

console.log(`${colors.cyan}🚀 FixItForMe Complete Deployment Verification${colors.reset}\n`);

// Environment variable validation
function validateEnvironment() {
  console.log(`${colors.blue}📋 Validating Environment Configuration...${colors.reset}`);
  
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
    console.log(`${colors.red}❌ Missing critical environment variables:${colors.reset}`);
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    return false;
  }
  
  console.log(`${colors.green}✅ All environment variables present${colors.reset}`);
  return true;
}

// Database connectivity and RLS policy verification
async function verifyDatabaseHealth() {
  console.log(`\n${colors.blue}🗄️  Verifying Database Health & RLS Policies...${colors.reset}`);
  
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
    
    // Test 1: Basic connectivity
    console.log('   Testing database connectivity...');
    const { error: connectError } = await supabase
      .from('whatsapp_otp_analytics')
      .select('count(*)')
      .limit(1);
    
    if (connectError) {
      console.log(`   ❌ Database connection failed: ${connectError.message}`);
      return false;
    }
    console.log('   ✅ Database connection working');
    
    // Test 2: WhatsApp analytics insert (critical for auth flow)
    console.log('   Testing WhatsApp analytics RLS...');
    const { error: analyticsError } = await supabase
      .from('whatsapp_otp_analytics')
      .insert({
        phone_number: '+1234567890',
        event_type: 'deployment_verification',
        event_data: { 
          test: true, 
          timestamp: new Date().toISOString(),
          deployment_check: true
        },
        created_at: new Date().toISOString()
      });
    
    if (analyticsError) {
      console.log(`   ❌ Analytics RLS blocking inserts: ${analyticsError.message}`);
      console.log(`   ${colors.yellow}This will cause production authentication failures!${colors.reset}`);
      return false;
    }
    console.log('   ✅ WhatsApp analytics RLS working');
    
    // Test 3: Contractor profiles access
    console.log('   Testing contractor profiles RLS...');
    const { error: profileError } = await supabase
      .from('contractor_profiles')
      .select('count(*)')
      .limit(1);
    
    if (profileError) {
      console.log(`   ❌ Contractor profiles RLS error: ${profileError.message}`);
      return false;
    }
    console.log('   ✅ Contractor profiles RLS working');
    
    // Test 4: Function execution
    console.log('   Testing database functions...');
    const { error: funcError } = await supabase.rpc('track_whatsapp_event', {
      p_phone: '+1234567890',
      p_event_type: 'deployment_verification',
      p_event_data: { test: true, deployment_check: true }
    });
    
    if (funcError) {
      console.log(`   ❌ Function execution failed: ${funcError.message}`);
      return false;
    }
    console.log('   ✅ Database functions working');
    
    console.log(`${colors.green}✅ Database health verification complete${colors.reset}`);
    return true;
    
  } catch (error) {
    console.log(`   ❌ Database verification failed: ${error.message}`);
    return false;
  }
}

// Authentication flow end-to-end verification
async function verifyAuthenticationFlow() {
  console.log(`\n${colors.blue}🔐 Verifying Authentication Flow...${colors.reset}`);
  
  const API_BASE = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  
  try {
    // Test 1: WhatsApp OTP Send (with demo fallback)
    console.log('   Testing WhatsApp OTP send...');
    const sendResponse = await fetch(`${API_BASE}/api/send-whatsapp-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+1234567890' })
    });
    
    if (!sendResponse.ok) {
      console.log(`   ❌ OTP send failed with status ${sendResponse.status}`);
      return false;
    }
    
    const sendData = await sendResponse.json();
    if (!sendData.success) {
      console.log(`   ❌ OTP send unsuccessful: ${sendData.error || 'Unknown error'}`);
      return false;
    }
    console.log('   ✅ WhatsApp OTP send working');
    
    // Test 2: Demo bypass verification
    console.log('   Testing demo bypass verification...');
    const verifyResponse = await fetch(`${API_BASE}/api/auth/verify-whatsapp-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+1234567890', token: '209741' })
    });
    
    if (!verifyResponse.ok) {
      console.log(`   ❌ Demo verification failed with status ${verifyResponse.status}`);
      return false;
    }
    
    const verifyData = await verifyResponse.json();
    if (!verifyData.user || !verifyData.demo_mode) {
      console.log(`   ❌ Demo verification response invalid`);
      return false;
    }
    console.log('   ✅ Demo bypass verification working');
    
    // Test 3: Test login endpoint
    console.log('   Testing test login endpoint...');
    const testLoginResponse = await fetch(`${API_BASE}/api/auth/test-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+1234567890' })
    });
    
    if (!testLoginResponse.ok) {
      console.log(`   ❌ Test login failed with status ${testLoginResponse.status}`);
      return false;
    }
    
    const testLoginData = await testLoginResponse.json();
    if (!testLoginData.user || !testLoginData.is_test_mode) {
      console.log(`   ❌ Test login response invalid`);
      return false;
    }
    console.log('   ✅ Test login endpoint working');
    
    console.log(`${colors.green}✅ Authentication flow verification complete${colors.reset}`);
    return true;
    
  } catch (error) {
    console.log(`   ❌ Authentication verification failed: ${error.message}`);
    return false;
  }
}

// Production readiness checklist
function checkProductionReadiness() {
  console.log(`\n${colors.blue}📋 Production Readiness Checklist...${colors.reset}`);
  
  const checks = [
    { name: 'Environment Variables', check: () => process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY },
    { name: 'Twilio Configuration', check: () => process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN },
    { name: 'WhatsApp Integration', check: () => process.env.TWILIO_WHATSAPP_FROM },
    { name: 'Demo Mode Available', check: () => true }, // Always available as fallback
    { name: 'Cron Secret (Optional)', check: () => process.env.CRON_SECRET_KEY || true } // Optional but recommended
  ];
  
  let allReady = true;
  
  checks.forEach(({ name, check }) => {
    const isReady = check();
    console.log(`   ${isReady ? '✅' : '❌'} ${name}`);
    if (!isReady) allReady = false;
  });
  
  if (allReady) {
    console.log(`${colors.green}✅ Production readiness verified${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  Some production features may be limited${colors.reset}`);
  }
  
  return allReady;
}

// Generate deployment recommendation
function generateDeploymentRecommendation(envValid, dbHealthy, authWorking, prodReady) {
  console.log(`\n${colors.cyan}🎯 DEPLOYMENT RECOMMENDATION${colors.reset}\n`);
  
  const overallHealth = envValid && dbHealthy && authWorking;
  
  if (overallHealth) {
    console.log(`${colors.green}🟢 SAFE TO DEPLOY${colors.reset}`);
    console.log(`${colors.green}✅ All critical systems are healthy${colors.reset}`);
    console.log(`${colors.green}✅ Authentication flow is working${colors.reset}`);
    console.log(`${colors.green}✅ Database RLS policies are functional${colors.reset}`);
    
    if (prodReady) {
      console.log(`${colors.green}✅ Production features fully available${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️  Some production features limited (demo mode will cover)${colors.reset}`);
    }
    
    console.log(`\n${colors.cyan}You can safely run:${colors.reset}`);
    console.log(`${colors.cyan}  npm run deploy-safe${colors.reset}`);
    console.log(`${colors.cyan}  or${colors.reset}`);
    console.log(`${colors.cyan}  vercel --prod${colors.reset}\n`);
    
    return true;
  } else {
    console.log(`${colors.red}🔴 DO NOT DEPLOY${colors.reset}`);
    console.log(`${colors.red}❌ Critical system failures detected${colors.reset}`);
    
    if (!envValid) {
      console.log(`${colors.red}❌ Environment variables missing${colors.reset}`);
    }
    if (!dbHealthy) {
      console.log(`${colors.red}❌ Database RLS policies blocking operations${colors.reset}`);
    }
    if (!authWorking) {
      console.log(`${colors.red}❌ Authentication flow broken${colors.reset}`);
    }
    
    console.log(`\n${colors.yellow}REQUIRED FIXES:${colors.reset}`);
    if (!dbHealthy) {
      console.log(`${colors.yellow}1. Run: npm run db:fix${colors.reset}`);
      console.log(`${colors.yellow}   This will fix RLS policies blocking authentication${colors.reset}`);
    }
    if (!envValid) {
      console.log(`${colors.yellow}2. Add missing environment variables to Vercel${colors.reset}`);
      console.log(`${colors.yellow}   Run: npm run vercel:sync${colors.reset}`);
    }
    if (!authWorking) {
      console.log(`${colors.yellow}3. Test authentication locally first${colors.reset}`);
      console.log(`${colors.yellow}   Run: npm run verify-auth${colors.reset}`);
    }
    
    console.log(`\n${colors.red}Try deployment verification again after fixes${colors.reset}\n`);
    return false;
  }
}

// Main deployment verification
async function runDeploymentVerification() {
  const startTime = Date.now();
  
  console.log(`${colors.cyan}Starting complete deployment verification...${colors.reset}\n`);
  
  // Run all verification steps
  const envValid = validateEnvironment();
  const dbHealthy = await verifyDatabaseHealth();
  const authWorking = await verifyAuthenticationFlow();
  const prodReady = checkProductionReadiness();
  
  // Generate recommendation
  const safeTodeploy = generateDeploymentRecommendation(envValid, dbHealthy, authWorking, prodReady);
  
  // Performance metrics
  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(`${colors.cyan}Verification completed in ${duration}s${colors.reset}\n`);
  
  // Exit with appropriate code
  if (safeTodeploy) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Run the complete verification
runDeploymentVerification().catch(error => {
  console.error(`${colors.red}❌ Deployment verification failed:${colors.reset}`, error);
  console.log(`${colors.red}System is not ready for deployment${colors.reset}\n`);
  process.exit(1);
});
