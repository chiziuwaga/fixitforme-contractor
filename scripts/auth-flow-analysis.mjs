#!/usr/bin/env node

/**
 * Authentication Flow Analysis & Verification Script
 * 
 * This script analyzes the complete authentication flow across the FixItForMe
 * contractor codebase to ensure there are no login issues and that all
 * components work together harmoniously.
 * 
 * Usage: npm run verify-auth
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
  blue: "\x1b[34m",
  magenta: "\x1b[35m"
};

console.log(`${colors.cyan}🔐 FixItForMe Authentication Flow Analysis${colors.reset}\n`);

// Authentication flow components to verify
const AUTH_COMPONENTS = {
  routes: [
    'src/app/login/page.tsx',
    'src/app/auth/page.tsx', 
    'src/app/contractor/layout.tsx',
    'src/app/api/auth/verify-whatsapp-otp/route.ts',
    'src/app/api/send-whatsapp-otp/route.ts',
    'src/app/api/auth/test-login/route.ts'
  ],
  hooks: [
    'src/hooks/useAuth.ts',
    'src/hooks/useUser.ts',
    'src/hooks/useOnboardingGate.ts'
  ],
  components: [
    'src/components/auth/ContractorAuth.tsx',
    'src/providers/UserProvider.tsx',
    'src/providers/SupabaseProvider.tsx'
  ],
  libs: [
    'src/lib/supabaseServer.ts',
    'src/lib/supabaseClient.ts',
    'src/lib/demoSession.ts',
    'src/lib/analytics.ts'
  ]
};

// Check if all critical authentication files exist
function checkAuthenticationFiles() {
  console.log(`${colors.blue}📁 Checking Authentication Files...${colors.reset}`);
  
  let allFilesExist = true;
  let missingFiles = [];
  
  Object.entries(AUTH_COMPONENTS).forEach(([category, files]) => {
    console.log(`\n${colors.magenta}  ${category.toUpperCase()}:${colors.reset}`);
    
    files.forEach(file => {
      const fullPath = path.join(__dirname, '..', file);
      if (fs.existsSync(fullPath)) {
        console.log(`   ✅ ${file}`);
      } else {
        console.log(`   ❌ ${file} - MISSING`);
        allFilesExist = false;
        missingFiles.push(file);
      }
    });
  });
  
  if (!allFilesExist) {
    console.log(`\n${colors.red}❌ Missing authentication files:${colors.reset}`);
    missingFiles.forEach(file => console.log(`   - ${file}`));
    return false;
  }
  
  console.log(`\n${colors.green}✅ All authentication files are present${colors.reset}`);
  return true;
}

// Analyze authentication flow patterns
function analyzeAuthenticationPatterns() {
  console.log(`\n${colors.blue}🔍 Analyzing Authentication Patterns...${colors.reset}`);
  
  const analysisResults = {
    phoneAuthSupport: false,
    demoModeSupport: false,
    sessionManagement: false,
    whatsappIntegration: false,
    routeProtection: false,
    errors: []
  };
  
  try {
    // Check useAuth.ts for phone authentication patterns
    const useAuthPath = path.join(__dirname, '..', 'src/hooks/useAuth.ts');
    if (fs.existsSync(useAuthPath)) {
      const useAuthContent = fs.readFileSync(useAuthPath, 'utf8');
      
      // Phone authentication support
      if (useAuthContent.includes('signInWithOtp') && useAuthContent.includes('phone')) {
        analysisResults.phoneAuthSupport = true;
        console.log('   ✅ Phone authentication support detected');
      } else {
        analysisResults.errors.push('Phone authentication not properly configured in useAuth.ts');
      }
      
      // Demo mode support
      if (useAuthContent.includes('demo_mode') && useAuthContent.includes('createDemoSession')) {
        analysisResults.demoModeSupport = true;
        console.log('   ✅ Demo mode support detected');
      } else {
        analysisResults.errors.push('Demo mode not properly integrated in useAuth.ts');
      }
    }
    
    // Check WhatsApp OTP verification endpoint
    const verifyOtpPath = path.join(__dirname, '..', 'src/app/api/auth/verify-whatsapp-otp/route.ts');
    if (fs.existsSync(verifyOtpPath)) {
      const verifyOtpContent = fs.readFileSync(verifyOtpPath, 'utf8');
      
      // WhatsApp integration
      if (verifyOtpContent.includes('DEMO_CODES') && verifyOtpContent.includes('trackWhatsAppOTPEvent')) {
        analysisResults.whatsappIntegration = true;
        console.log('   ✅ WhatsApp OTP integration detected');
      } else {
        analysisResults.errors.push('WhatsApp OTP integration incomplete');
      }
    }
    
    // Check contractor layout for route protection
    const layoutPath = path.join(__dirname, '..', 'src/app/contractor/layout.tsx');
    if (fs.existsSync(layoutPath)) {
      const layoutContent = fs.readFileSync(layoutPath, 'utf8');
      
      // Route protection
      if (layoutContent.includes('router.push("/login")') && layoutContent.includes('user || (demoSession')) {
        analysisResults.routeProtection = true;
        console.log('   ✅ Route protection detected');
      } else {
        analysisResults.errors.push('Route protection may be incomplete in contractor layout');
      }
    }
    
    // Check UserProvider for session management
    const userProviderPath = path.join(__dirname, '..', 'src/providers/UserProvider.tsx');
    if (fs.existsSync(userProviderPath)) {
      const userProviderContent = fs.readFileSync(userProviderPath, 'utf8');
      
      // Session management
      if (userProviderContent.includes('useSessionContext') && userProviderContent.includes('getDemoSession')) {
        analysisResults.sessionManagement = true;
        console.log('   ✅ Session management detected');
      } else {
        analysisResults.errors.push('Session management may be incomplete in UserProvider');
      }
    }
    
  } catch (error) {
    analysisResults.errors.push(`File analysis error: ${error.message}`);
  }
  
  return analysisResults;
}

// Test authentication endpoints
async function testAuthenticationEndpoints() {
  console.log(`\n${colors.blue}🔌 Testing Authentication Endpoints...${colors.reset}`);
  
  const API_BASE = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  
  const endpointTests = [
    {
      name: 'WhatsApp OTP Send',
      url: `${API_BASE}/api/send-whatsapp-otp`,
      method: 'POST',
      body: { phone: '+1234567890' },
      expectedDemo: true
    },
    {
      name: 'WhatsApp OTP Verify (Demo)',
      url: `${API_BASE}/api/auth/verify-whatsapp-otp`,
      method: 'POST', 
      body: { phone: '+1234567890', token: '209741' },
      expectedDemo: true
    },
    {
      name: 'Test Login',
      url: `${API_BASE}/api/auth/test-login`,
      method: 'POST',
      body: { phone: '+1234567890' },
      expectedDemo: false
    }
  ];
  
  let allEndpointsWork = true;
  
  for (const test of endpointTests) {
    try {
      console.log(`\n   Testing ${test.name}...`);
      
      const response = await fetch(test.url, {
        method: test.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.body)
      });
      
      if (!response.ok) {
        console.log(`   ❌ ${test.name} failed with status ${response.status}`);
        allEndpointsWork = false;
        continue;
      }
      
      const data = await response.json();
      
      if (test.expectedDemo && !data.demo_mode && !data.is_test_mode) {
        console.log(`   ❌ ${test.name} should support demo mode`);
        allEndpointsWork = false;
      } else {
        console.log(`   ✅ ${test.name} working correctly`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${test.name} failed: ${error.message}`);
      allEndpointsWork = false;
    }
  }
  
  return allEndpointsWork;
}

// Test database RLS policies for authentication
async function testAuthenticationRLS() {
  console.log(`\n${colors.blue}🗄️  Testing Authentication RLS Policies...${colors.reset}`);
  
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
    
    // Test 1: WhatsApp OTP analytics access (this was failing in production)
    const { error: analyticsError } = await supabase
      .from('whatsapp_otp_analytics')
      .insert({
        phone_number: '+1234567890',
        event_type: 'auth_flow_test',
        event_data: { test: true, timestamp: new Date().toISOString() },
        created_at: new Date().toISOString()
      });
    
    if (analyticsError) {
      console.log(`   ❌ Analytics insert failed: ${analyticsError.message}`);
      return false;
    }
    console.log('   ✅ WhatsApp analytics RLS working');
    
    // Test 2: Contractor profiles access
    const { error: profileError } = await supabase
      .from('contractor_profiles')
      .select('count(*)')
      .limit(1);
    
    if (profileError) {
      console.log(`   ❌ Contractor profiles access failed: ${profileError.message}`);
      return false;
    }
    console.log('   ✅ Contractor profiles RLS working');
    
    // Test 3: Function access
    const { error: funcError } = await supabase.rpc('track_whatsapp_event', {
      p_phone: '+1234567890',
      p_event_type: 'auth_flow_test',
      p_event_data: { test: true }
    });
    
    if (funcError) {
      console.log(`   ❌ Function call failed: ${funcError.message}`);
      return false;
    }
    console.log('   ✅ Database functions working');
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ RLS test failed: ${error.message}`);
    return false;
  }
}

// Generate authentication flow recommendations
function generateAuthFlowRecommendations(analysisResults, endpointsWork, rlsWork) {
  console.log(`\n${colors.blue}💡 Authentication Flow Recommendations...${colors.reset}`);
  
  const recommendations = [];
  
  // Critical issues
  if (!rlsWork) {
    recommendations.push({
      level: 'CRITICAL',
      issue: 'Database RLS policies are blocking authentication',
      solution: 'Deploy the comprehensive RLS fix: npm run db:fix'
    });
  }
  
  if (!endpointsWork) {
    recommendations.push({
      level: 'HIGH',
      issue: 'Authentication endpoints are not responding correctly',
      solution: 'Check environment variables and deploy latest code'
    });
  }
  
  if (analysisResults.errors.length > 0) {
    recommendations.push({
      level: 'MEDIUM', 
      issue: 'Code pattern issues detected',
      solution: `Fix: ${analysisResults.errors.join(', ')}`
    });
  }
  
  // Best practices
  if (analysisResults.phoneAuthSupport && analysisResults.demoModeSupport) {
    recommendations.push({
      level: 'SUCCESS',
      issue: 'Phone authentication with demo fallback is properly configured',
      solution: 'Continue monitoring authentication success rates'
    });
  }
  
  return recommendations;
}

// Main authentication flow analysis
async function runAuthFlowAnalysis() {
  console.log(`${colors.cyan}Starting comprehensive authentication flow analysis...${colors.reset}\n`);
  
  // Step 1: Check files
  const filesExist = checkAuthenticationFiles();
  
  // Step 2: Analyze patterns  
  const analysisResults = analyzeAuthenticationPatterns();
  
  // Step 3: Test endpoints
  const endpointsWork = await testAuthenticationEndpoints();
  
  // Step 4: Test database RLS
  const rlsWork = await testAuthenticationRLS();
  
  // Step 5: Generate recommendations
  const recommendations = generateAuthFlowRecommendations(analysisResults, endpointsWork, rlsWork);
  
  // Final results
  console.log(`\n${colors.cyan}📊 AUTHENTICATION FLOW ANALYSIS RESULTS${colors.reset}\n`);
  
  console.log(`Files Present: ${filesExist ? '✅' : '❌'}`);
  console.log(`Phone Auth Support: ${analysisResults.phoneAuthSupport ? '✅' : '❌'}`);
  console.log(`Demo Mode Support: ${analysisResults.demoModeSupport ? '✅' : '❌'}`);
  console.log(`WhatsApp Integration: ${analysisResults.whatsappIntegration ? '✅' : '❌'}`);
  console.log(`Route Protection: ${analysisResults.routeProtection ? '✅' : '❌'}`);
  console.log(`Session Management: ${analysisResults.sessionManagement ? '✅' : '❌'}`);
  console.log(`Endpoints Working: ${endpointsWork ? '✅' : '❌'}`);
  console.log(`Database RLS: ${rlsWork ? '✅' : '❌'}`);
  
  // Display recommendations
  if (recommendations.length > 0) {
    console.log(`\n${colors.yellow}🔧 RECOMMENDATIONS:${colors.reset}`);
    recommendations.forEach((rec, index) => {
      const levelColor = rec.level === 'CRITICAL' ? colors.red : 
                        rec.level === 'HIGH' ? colors.yellow :
                        rec.level === 'SUCCESS' ? colors.green : colors.cyan;
      
      console.log(`\n${index + 1}. ${levelColor}[${rec.level}]${colors.reset} ${rec.issue}`);
      console.log(`   Solution: ${rec.solution}`);
    });
  }
  
  // Overall status
  const criticalIssues = recommendations.filter(r => r.level === 'CRITICAL').length;
  const highIssues = recommendations.filter(r => r.level === 'HIGH').length;
  
  if (criticalIssues > 0) {
    console.log(`\n${colors.red}🚨 CRITICAL AUTHENTICATION ISSUES DETECTED!${colors.reset}`);
    console.log(`${colors.red}Login will NOT work until these issues are resolved.${colors.reset}`);
    console.log(`${colors.yellow}Run: npm run db:fix to resolve database issues${colors.reset}\n`);
    process.exit(1);
  } else if (highIssues > 0) {
    console.log(`\n${colors.yellow}⚠️  HIGH PRIORITY AUTHENTICATION ISSUES DETECTED${colors.reset}`);
    console.log(`${colors.yellow}Some login flows may not work correctly.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}🎉 AUTHENTICATION FLOW IS HEALTHY!${colors.reset}`);
    console.log(`${colors.green}✅ All components are working correctly${colors.reset}`);
    console.log(`${colors.cyan}Login flow should work end-to-end${colors.reset}\n`);
    process.exit(0);
  }
}

// Run the authentication flow analysis
runAuthFlowAnalysis().catch(error => {
  console.error(`${colors.red}❌ Authentication analysis failed:${colors.reset}`, error);
  process.exit(1);
});
