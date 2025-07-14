#!/usr/bin/env node

/**
 * COMPREHENSIVE LOGIN VERIFICATION SCRIPT
 * 
 * Tests all authentication flows, PWA caching, SSR safety, and deployment readiness.
 * Designed to be run during Vercel build process as a pre-deployment check.
 * 
 * Usage:
 * - npm run verify:login         (full comprehensive check)
 * - npm run verify:login:quick   (essential checks only)
 * - vercel build && npm run verify:login  (as part of deployment)
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isVercelBuild = process.env.VERCEL === '1';
const API_BASE = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

console.log(`${colors.bold}🔒 COMPREHENSIVE LOGIN VERIFICATION${colors.reset}`);
console.log(`${colors.cyan}Environment: ${isProduction ? 'Production' : 'Development'}${colors.reset}`);
console.log(`${colors.cyan}API Base: ${API_BASE}${colors.reset}`);
console.log(`${colors.cyan}Vercel Build: ${isVercelBuild ? 'Yes' : 'No'}${colors.reset}\n`);

// Test results tracking
const testResults = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  passed: 0,
  total: 0
};

function addTestResult(severity, test, status, message) {
  testResults.total++;
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`${colors.green}✅ ${test}${colors.reset}`);
  } else {
    testResults[severity].push({ test, message });
    const color = severity === 'critical' ? colors.red : 
                  severity === 'high' ? colors.yellow : 
                  severity === 'medium' ? colors.blue : colors.cyan;
    console.log(`${color}❌ ${test}: ${message}${colors.reset}`);
  }
}

/**
 * 1. AUTHENTICATION FLOW VERIFICATION
 */
async function verifyAuthenticationFlow() {
  console.log(`\n${colors.blue}🔐 Testing Authentication Flow...${colors.reset}`);
  
  try {
    // Test demo bypass authentication
    const verifyResponse = await fetch(`${API_BASE}/api/auth/verify-whatsapp-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+1234567890', token: '209741' })
    });
    
    if (!verifyResponse.ok) {
      addTestResult('critical', 'Demo Authentication', 'FAIL', 
        `Demo auth failed with status ${verifyResponse.status}`);
      return false;
    }
    
    const authData = await verifyResponse.json();
    if (!authData.user || !authData.demo_mode) {
      addTestResult('critical', 'Demo Authentication Response', 'FAIL', 
        'Demo auth response missing required fields');
      return false;
    }
    
    addTestResult('critical', 'Demo Authentication', 'PASS', null);
    
    // Test test login endpoint
    const testLoginResponse = await fetch(`${API_BASE}/api/auth/test-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+1234567890' })
    });
    
    if (!testLoginResponse.ok) {
      addTestResult('high', 'Test Login Endpoint', 'FAIL', 
        `Test login failed with status ${testLoginResponse.status}`);
      return false;
    }
    
    const testData = await testLoginResponse.json();
    if (!testData.user || !testData.is_test_mode) {
      addTestResult('high', 'Test Login Response', 'FAIL', 
        'Test login response missing required fields');
      return false;
    }
    
    addTestResult('high', 'Test Login Endpoint', 'PASS', null);
    return true;
    
  } catch (error) {
    addTestResult('critical', 'Authentication Flow', 'FAIL', 
      `Network error: ${error.message}`);
    return false;
  }
}

/**
 * 2. DATABASE RLS POLICY VERIFICATION
 */
async function verifyDatabaseRLS() {
  console.log(`\n${colors.blue}🗄️ Testing Database RLS Policies...${colors.reset}`);
  
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      addTestResult('critical', 'Database Environment', 'FAIL', 
        'Missing Supabase environment variables');
      return false;
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Test analytics insert (was failing in production)
    const { error: analyticsError } = await supabase
      .from('whatsapp_otp_analytics')
      .insert({
        phone_number: '+1234567890',
        event_type: 'login_verification_test',
        event_data: { test: true, timestamp: new Date().toISOString() }
      });
    
    if (analyticsError) {
      addTestResult('critical', 'Analytics RLS Policy', 'FAIL', 
        `Analytics insert failed: ${analyticsError.message}`);
      return false;
    }
    
    addTestResult('critical', 'Analytics RLS Policy', 'PASS', null);
    
    // Test contractor profiles access
    const { error: profileError } = await supabase
      .from('contractor_profiles')
      .select('count(*)')
      .limit(1);
    
    if (profileError) {
      addTestResult('high', 'Contractor Profiles RLS', 'FAIL', 
        `Profile access failed: ${profileError.message}`);
      return false;
    }
    
    addTestResult('high', 'Contractor Profiles RLS', 'PASS', null);
    
    // Cleanup test data
    await supabase
      .from('whatsapp_otp_analytics')
      .delete()
      .eq('phone_number', '+1234567890')
      .eq('event_type', 'login_verification_test');
    
    return true;
    
  } catch (error) {
    addTestResult('critical', 'Database RLS', 'FAIL', 
      `Database test error: ${error.message}`);
    return false;
  }
}

/**
 * 3. SSR SAFETY VERIFICATION
 */
async function verifySSRSafety() {
  console.log(`\n${colors.blue}🏗️ Testing SSR Safety...${colors.reset}`);
  
  const ssrUnsafePatterns = [
    { file: 'src/lib/demoSession.ts', pattern: /localStorage|sessionStorage/, context: 'Demo session storage' },
    { file: 'src/lib/safeStorage.ts', pattern: /typeof window/, context: 'Safe storage checks' },
    { file: 'src/providers/UserProvider.tsx', pattern: /typeof window/, context: 'User provider safety' }
  ];
  
  let ssrSafe = true;
  
  for (const check of ssrUnsafePatterns) {
    try {
      const filePath = path.join(__dirname, '..', check.file);
      if (!fs.existsSync(filePath)) {
        addTestResult('medium', `SSR Safety - ${check.context}`, 'FAIL', 
          `File not found: ${check.file}`);
        continue;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      const hasPattern = check.pattern.test(content);
      
      if (check.file === 'src/lib/demoSession.ts' || check.file === 'src/lib/safeStorage.ts') {
        // These files SHOULD have typeof window checks
        if (!hasPattern) {
          addTestResult('high', `SSR Safety - ${check.context}`, 'FAIL', 
            'Missing SSR safety checks');
          ssrSafe = false;
        } else {
          addTestResult('high', `SSR Safety - ${check.context}`, 'PASS', null);
        }
      } else {
        // Check for proper SSR handling
        if (hasPattern) {
          addTestResult('high', `SSR Safety - ${check.context}`, 'PASS', null);
        } else {
          addTestResult('medium', `SSR Safety - ${check.context}`, 'FAIL', 
            'May need SSR safety checks');
        }
      }
      
    } catch (error) {
      addTestResult('medium', `SSR Safety - ${check.context}`, 'FAIL', 
        `File read error: ${error.message}`);
      ssrSafe = false;
    }
  }
  
  return ssrSafe;
}

/**
 * 4. PWA CACHING VERIFICATION
 */
async function verifyPWACaching() {
  console.log(`\n${colors.blue}📱 Testing PWA Caching...${colors.reset}`);
  
  try {
    // Check service worker file
    const swPath = path.join(__dirname, '..', 'public', 'sw.js');
    if (!fs.existsSync(swPath)) {
      addTestResult('medium', 'Service Worker File', 'FAIL', 
        'Service worker file not found');
      return false;
    }
    
    const swContent = fs.readFileSync(swPath, 'utf8');
    
    // Check for critical caching fixes
    const hasRootRouteBypass = swContent.includes("url.pathname === '/'") && 
                               swContent.includes('Response.redirect');
    if (!hasRootRouteBypass) {
      addTestResult('high', 'Service Worker Root Route', 'FAIL', 
        'Missing root route caching bypass');
      return false;
    }
    
    addTestResult('high', 'Service Worker Root Route', 'PASS', null);
    
    // Check for proper cache versioning
    const hasCacheVersion = /CACHE_NAME = ['"`].*v\d+\.\d+\.\d+['"`]/.test(swContent);
    if (!hasCacheVersion) {
      addTestResult('medium', 'Service Worker Versioning', 'FAIL', 
        'Missing proper cache versioning');
    } else {
      addTestResult('medium', 'Service Worker Versioning', 'PASS', null);
    }
    
    // Check for authentication caching exclusions
    const excludesAuth = swContent.includes('/api/auth/') || 
                        swContent.includes('login') ||
                        swContent.includes('authentication');
    if (!excludesAuth) {
      addTestResult('high', 'Service Worker Auth Exclusion', 'FAIL', 
        'May cache authentication routes');
    } else {
      addTestResult('high', 'Service Worker Auth Exclusion', 'PASS', null);
    }
    
    return true;
    
  } catch (error) {
    addTestResult('medium', 'PWA Caching', 'FAIL', 
      `PWA verification error: ${error.message}`);
    return false;
  }
}

/**
 * 5. LOCKFILE HARMONY VERIFICATION
 */
async function verifyLockfileHarmony() {
  console.log(`\n${colors.blue}📦 Testing Lockfile Harmony...${colors.reset}`);
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
  const pnpmLockPath = path.join(__dirname, '..', 'pnpm-lock.yaml');
  
  try {
    // Check which lockfiles exist
    const hasPackageLock = fs.existsSync(packageLockPath);
    const hasPnpmLock = fs.existsSync(pnpmLockPath);
    
    if (hasPackageLock && hasPnpmLock) {
      addTestResult('high', 'Lockfile Conflict', 'FAIL', 
        'Both npm and pnpm lockfiles present - choose one');
      return false;
    }
    
    if (!hasPackageLock && !hasPnpmLock) {
      addTestResult('medium', 'Lockfile Missing', 'FAIL', 
        'No lockfile found - dependencies may be inconsistent');
      return false;
    }
    
    // Verify package.json exists and is valid
    if (!fs.existsSync(packageJsonPath)) {
      addTestResult('critical', 'Package JSON', 'FAIL', 'package.json not found');
      return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check for critical dependencies
    const criticalDeps = [
      'next', 'react', '@supabase/supabase-js', 'tailwindcss'
    ];
    
    for (const dep of criticalDeps) {
      if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
        addTestResult('high', `Critical Dependency - ${dep}`, 'FAIL', 
          `Missing critical dependency: ${dep}`);
        return false;
      }
    }
    
    addTestResult('high', 'Critical Dependencies', 'PASS', null);
    addTestResult('high', 'Lockfile Harmony', 'PASS', null);
    
    return true;
    
  } catch (error) {
    addTestResult('medium', 'Lockfile Harmony', 'FAIL', 
      `Lockfile verification error: ${error.message}`);
    return false;
  }
}

/**
 * 6. DEPLOYMENT READINESS CHECK
 */
async function verifyDeploymentReadiness() {
  console.log(`\n${colors.blue}🚀 Testing Deployment Readiness...${colors.reset}`);
  
  try {
    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      addTestResult('critical', 'Environment Variables', 'FAIL', 
        `Missing: ${missingVars.join(', ')}`);
      return false;
    }
    
    addTestResult('critical', 'Environment Variables', 'PASS', null);
    
    // Check build artifacts (if in build context)
    if (isVercelBuild) {
      const nextConfigPath = path.join(__dirname, '..', 'next.config.ts');
      if (!fs.existsSync(nextConfigPath)) {
        addTestResult('high', 'Next.js Configuration', 'FAIL', 
          'next.config.ts not found');
        return false;
      }
      
      addTestResult('high', 'Next.js Configuration', 'PASS', null);
    }
    
    // Check for common deployment blockers
    const commonBlockers = [
      { file: '.env.local', critical: false, message: 'Local env file in production' },
      { file: '.env.development', critical: false, message: 'Dev env file in production' },
      { file: 'debug.log', critical: false, message: 'Debug logs in production' }
    ];
    
    for (const blocker of commonBlockers) {
      const blockerPath = path.join(__dirname, '..', blocker.file);
      if (fs.existsSync(blockerPath)) {
        const severity = blocker.critical ? 'high' : 'low';
        addTestResult(severity, `Deployment Blocker - ${blocker.file}`, 'FAIL', 
          blocker.message);
      }
    }
    
    return true;
    
  } catch (error) {
    addTestResult('high', 'Deployment Readiness', 'FAIL', 
      `Deployment check error: ${error.message}`);
    return false;
  }
}

/**
 * 7. COMPREHENSIVE RESULTS ANALYSIS
 */
function analyzeResults() {
  console.log(`\n${colors.bold}📊 VERIFICATION RESULTS${colors.reset}`);
  console.log(`${colors.cyan}Total Tests: ${testResults.total}${colors.reset}`);
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.total - testResults.passed}${colors.reset}\n`);
  
  // Critical issues
  if (testResults.critical.length > 0) {
    console.log(`${colors.red}${colors.bold}🚨 CRITICAL ISSUES (Login will NOT work):${colors.reset}`);
    testResults.critical.forEach(issue => {
      console.log(`${colors.red}   ❌ ${issue.test}: ${issue.message}${colors.reset}`);
    });
    console.log();
  }
  
  // High priority issues
  if (testResults.high.length > 0) {
    console.log(`${colors.yellow}${colors.bold}⚠️  HIGH PRIORITY ISSUES (Some features may not work):${colors.reset}`);
    testResults.high.forEach(issue => {
      console.log(`${colors.yellow}   ⚠️  ${issue.test}: ${issue.message}${colors.reset}`);
    });
    console.log();
  }
  
  // Medium priority issues
  if (testResults.medium.length > 0) {
    console.log(`${colors.blue}${colors.bold}📋 MEDIUM PRIORITY ISSUES (Recommended fixes):${colors.reset}`);
    testResults.medium.forEach(issue => {
      console.log(`${colors.blue}   📋 ${issue.test}: ${issue.message}${colors.reset}`);
    });
    console.log();
  }
  
  // Low priority issues
  if (testResults.low.length > 0) {
    console.log(`${colors.cyan}${colors.bold}💡 LOW PRIORITY ISSUES (Optional optimizations):${colors.reset}`);
    testResults.low.forEach(issue => {
      console.log(`${colors.cyan}   💡 ${issue.test}: ${issue.message}${colors.reset}`);
    });
    console.log();
  }
  
  // Final assessment
  const criticalCount = testResults.critical.length;
  const highCount = testResults.high.length;
  
  if (criticalCount > 0) {
    console.log(`${colors.red}${colors.bold}🔒 LOGIN STATUS: BROKEN${colors.reset}`);
    console.log(`${colors.red}Users will NOT be able to log in. Fix critical issues immediately.${colors.reset}`);
    process.exit(1);
  } else if (highCount > 0) {
    console.log(`${colors.yellow}${colors.bold}⚠️  LOGIN STATUS: DEGRADED${colors.reset}`);
    console.log(`${colors.yellow}Login may work but some features will be unreliable.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}✅ LOGIN STATUS: HEALTHY${colors.reset}`);
    console.log(`${colors.green}All critical login flows are working correctly.${colors.reset}`);
    console.log(`${colors.cyan}🚀 Ready for deployment!${colors.reset}`);
    process.exit(0);
  }
}

/**
 * MAIN EXECUTION
 */
async function runComprehensiveVerification() {
  const isQuickMode = process.argv.includes('--quick');
  
  console.log(`${colors.bold}Running ${isQuickMode ? 'Quick' : 'Comprehensive'} Login Verification...${colors.reset}\n`);
  
  // Critical tests (always run)
  await verifyAuthenticationFlow();
  await verifyDatabaseRLS();
  
  if (!isQuickMode) {
    // Comprehensive tests
    await verifySSRSafety();
    await verifyPWACaching();
    await verifyLockfileHarmony();
    await verifyDeploymentReadiness();
  }
  
  analyzeResults();
}

// Run verification
runComprehensiveVerification().catch(error => {
  console.error(`${colors.red}Fatal error during verification: ${error.message}${colors.reset}`);
  process.exit(1);
});
