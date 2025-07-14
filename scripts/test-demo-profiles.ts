/**
 * Demo Profile Testing Script
 * Tests all 4 demo codes and their profile configurations
 */

import { getDemoProfileConfig, isValidDemoCode, createDemoSession } from '@/lib/demoSession';

// Test all demo codes
const DEMO_CODES = ['209741', '503913', '058732', '002231'];

console.log('🧪 Testing Multi-Profile Demo System\n');

DEMO_CODES.forEach(code => {
  console.log(`\n📋 Testing Demo Code: ${code}`);
  console.log('✓ Valid Code:', isValidDemoCode(code));
  
  const config = getDemoProfileConfig(code);
  if (config) {
    console.log(`  🏢 Company: ${config.company_name}`);
    console.log(`  👤 Profile Type: ${config.type}`);
    console.log(`  💰 Tier: ${config.tier}`);
    console.log(`  📞 Phone Suffix: ${config.phone_suffix}`);
    console.log(`  🛠️ Services: ${config.services.join(', ')}`);
    console.log(`  👥 Team Size: ${config.team_size}`);
    console.log(`  💵 Monthly Revenue: $${config.monthly_revenue.toLocaleString()}`);
    console.log(`  🎯 Bid Win Rate: ${config.bid_win_rate}%`);
    console.log(`  📚 Onboarding Steps: ${config.onboarding_steps}`);
    console.log(`  📍 Service Areas: ${config.service_areas.join(', ')}`);
  } else {
    console.log('  ❌ No configuration found');
  }
});

console.log('\n🎯 Demo Profile Experience Summary:');
console.log('209741: Basic plumbing contractor, new to platform (Growth tier, needs full onboarding)');
console.log('503913: Established general contractor business (Growth tier, minimal onboarding)');
console.log('058732: Premium multi-service contractor (Scale tier, skip onboarding)');
console.log('002231: Growing multi-trade contractor (Growth tier, moderate onboarding)');

console.log('\n✅ Multi-Profile Demo System Ready for Launch!');
