#!/usr/bin/env node

/**
 * Local WhatsApp OTP Testing Script
 * Tests the WhatsApp sandbox integration on localhost:3000
 */

import dotenv from 'dotenv';
import { createRequire } from 'module';

// Load environment variables
dotenv.config({ path: '.env.local' });

const require = createRequire(import.meta.url);

// Validate environment variables
const requiredVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN', 
  'TWILIO_WHATSAPP_FROM',
  'NEXT_PUBLIC_APP_URL'
];

console.log('🧪 FixItForMe WhatsApp Local Testing\n');

// Check environment variables
const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:', missingVars.join(', '));
  process.exit(1);
}

console.log('✅ Environment Variables:');
console.log(`   TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID?.substring(0, 6)}...`);
console.log(`   TWILIO_WHATSAPP_FROM: ${process.env.TWILIO_WHATSAPP_FROM}`);
console.log(`   NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
console.log();

// Test phone number (yours from sandbox)
const testPhone = '+13477646025';

console.log('📱 WhatsApp Sandbox Test Configuration:');
console.log(`   Test Phone: ${testPhone}`);
console.log(`   Sandbox Bot: ${process.env.TWILIO_WHATSAPP_FROM}`);
console.log(`   Join Code: "join shine-native"`);
console.log();

console.log('🚀 Test Endpoints:');
console.log(`   Send OTP: ${process.env.NEXT_PUBLIC_APP_URL}/api/send-whatsapp-otp`);
console.log(`   Verify OTP: ${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-whatsapp-otp`);
console.log(`   Login Page: ${process.env.NEXT_PUBLIC_APP_URL}/login`);
console.log();

console.log('📋 Manual Testing Steps:');
console.log('1. Start development server: npm run dev');
console.log('2. Open browser: http://localhost:3000/login');
console.log(`3. Enter phone: ${testPhone.replace('+', '')}`);
console.log('4. Make sure WhatsApp is joined to sandbox: "join shine-native" to +14155238886');
console.log('5. Click "Send WhatsApp OTP"');
console.log('6. Check WhatsApp for 6-digit code');
console.log('7. Test secret upgrade: append "-felixscale" to OTP code');
console.log('8. Complete onboarding flow');
console.log();

console.log('🔍 Secret Upgrade Testing:');
console.log('   Normal OTP: 123456');
console.log('   Secret Scale Upgrade: 123456-felixscale');
console.log('   Expected Result: "🎉 Secret Scale Tier Upgrade Activated!"');
console.log();

console.log('✅ Ready for local WhatsApp testing!');
console.log('📞 Remember: Your phone must be joined to the Twilio sandbox first.');
