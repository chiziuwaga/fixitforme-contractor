// src/jobs/otp-expiration-cleanup.mjs
// Local script to clean up expired OTPs and track expiration analytics
// Run with: npm run otp:cleanup

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
 * Track WhatsApp OTP events for analytics
 */
async function trackWhatsAppOTPEvent(phone, eventType, eventData = {}) {
  try {
    const { error } = await supabase
      .from('whatsapp_otp_analytics')
      .insert({
        phone_number: phone,
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error(`[Analytics] Failed to track ${eventType}:`, error);
    }
  } catch (err) {
    console.error(`[Analytics] Error tracking ${eventType}:`, err);
  }
}

/**
 * Main cleanup function
 */
async function cleanupExpiredOTPs() {
  console.log('🧹 Starting OTP expiration cleanup...');
  
  try {
    // Find expired OTPs
    const { data: expiredOTPs, error } = await supabase
      .from('whatsapp_otps')
      .select('id, phone_number, created_at, expires_at')
      .lt('expires_at', new Date().toISOString());
      
    if (error) {
      console.error('❌ Error finding expired OTPs:', error);
      return { success: false, error: error.message };
    }
    
    console.log(`📊 Found ${expiredOTPs?.length || 0} expired OTPs`);
    
    if (!expiredOTPs || expiredOTPs.length === 0) {
      console.log('✅ No expired OTPs to clean up');
      return { success: true, processed: 0 };
    }
    
    // Track each expired OTP in analytics
    for (const otp of expiredOTPs) {
      await trackWhatsAppOTPEvent(otp.phone_number, 'expired', {
        otpId: otp.id,
        createdAt: otp.created_at,
        expiredAt: otp.expires_at,
        expirationReason: 'time_limit',
        cleanupTime: new Date().toISOString()
      });
      
      console.log(`📝 Tracked expiration for OTP ${otp.id} (${otp.phone_number})`);
    }
    
    // Delete the expired OTPs
    const { error: deleteError } = await supabase
      .from('whatsapp_otps')
      .delete()
      .lt('expires_at', new Date().toISOString());
      
    if (deleteError) {
      console.error('❌ Error deleting expired OTPs:', deleteError);
      return { success: false, error: deleteError.message };
    }
    
    console.log(`✅ Successfully cleaned up ${expiredOTPs.length} expired OTPs`);
    console.log('📈 Analytics tracking completed');
    
    return { 
      success: true, 
      processed: expiredOTPs.length,
      details: expiredOTPs.map(otp => ({
        id: otp.id,
        phone: otp.phone_number,
        expired: otp.expires_at
      }))
    };
    
  } catch (error) {
    console.error('❌ Cleanup job failed:', error);
    return { success: false, error: error.message };
  }
}

// Run the cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupExpiredOTPs()
    .then(result => {
      if (result.success) {
        console.log('🎉 OTP cleanup completed successfully');
        process.exit(0);
      } else {
        console.error('💥 OTP cleanup failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

export { cleanupExpiredOTPs };
