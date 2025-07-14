// src/jobs/analytics-query.mjs
// Local script to query WhatsApp OTP analytics data
// Run with: npm run analytics:check

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Query analytics data and display summary
 */
async function queryAnalytics() {
  console.log('📊 Querying WhatsApp OTP Analytics...');
  
  try {
    // Get recent analytics data (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentData, error } = await supabase
      .from('whatsapp_otp_analytics')
      .select('*')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('❌ Error querying analytics:', error);
      return;
    }
    
    console.log(`\n📈 Analytics Summary (Last 24 Hours)`);
    console.log(`═══════════════════════════════════════`);
    
    if (!recentData || recentData.length === 0) {
      console.log('📭 No analytics data found in the last 24 hours');
      return;
    }
    
    // Calculate metrics
    const totalEvents = recentData.length;
    const eventTypes = recentData.reduce((acc, item) => {
      acc[item.event_type] = (acc[item.event_type] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`Total Events: ${totalEvents}`);
    console.log(`\nEvent Breakdown:`);
    
    Object.entries(eventTypes).forEach(([type, count]) => {
      const percentage = ((count / totalEvents) * 100).toFixed(1);
      console.log(`  ${type}: ${count} (${percentage}%)`);
    });
    
    // Calculate success rates
    const sendAttempts = eventTypes.send_attempt || 0;
    const sendSuccesses = eventTypes.send_success || 0;
    const verifyAttempts = eventTypes.verify_attempt || 0;
    const verifySuccesses = eventTypes.verify_success || 0;
    
    if (sendAttempts > 0) {
      const sendSuccessRate = ((sendSuccesses / sendAttempts) * 100).toFixed(1);
      console.log(`\n📤 Send Success Rate: ${sendSuccessRate}% (${sendSuccesses}/${sendAttempts})`);
    }
    
    if (verifyAttempts > 0) {
      const verifySuccessRate = ((verifySuccesses / verifyAttempts) * 100).toFixed(1);
      console.log(`✅ Verify Success Rate: ${verifySuccessRate}% (${verifySuccesses}/${verifyAttempts})`);
    }
    
    // Show recent events
    console.log(`\n🕒 Recent Events (Latest 5):`);
    console.log(`─────────────────────────────────────`);
    
    recentData.slice(0, 5).forEach(event => {
      const time = new Date(event.created_at).toLocaleTimeString();
      const phone = event.phone_number.slice(-4).padStart(4, '*');
      console.log(`${time} | ${event.event_type.padEnd(15)} | ***${phone}`);
    });
    
    console.log(`\n✅ Analytics query completed`);
    
  } catch (error) {
    console.error('❌ Analytics query failed:', error);
  }
}

// Run the query if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  queryAnalytics()
    .then(() => {
      console.log('🎉 Analytics check completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

export { queryAnalytics };
