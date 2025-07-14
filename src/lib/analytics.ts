// src/lib/analytics.ts
// Utility functions for tracking WhatsApp OTP events

import { createClient } from '@/lib/supabase';

/**
 * Track WhatsApp OTP events for analytics without requiring admin dashboard
 * @param phone Phone number in E.164 format
 * @param eventType Type of OTP event
 * @param eventData Additional data related to the event
 * @param contractorId Optional contractor ID if authenticated
 */
export async function trackWhatsAppOTPEvent(
  phone: string, 
  eventType: 'send_attempt' | 'send_success' | 'send_failure' | 'verify_attempt' | 'verify_success' | 'verify_failure' | 'expired',
  eventData: Record<string, unknown> = {},
  contractorId?: string
) {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('whatsapp_otp_analytics')
      .insert({
        phone_number: phone,
        event_type: eventType,
        event_data: eventData,
        contractor_id: contractorId,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error(`[OTP Analytics] Failed to track ${eventType}:`, error);
      // Non-blocking - we don't want analytics failures to impact core functionality
    }
  } catch (err) {
    console.error(`[OTP Analytics] Error tracking ${eventType}:`, err);
    // Non-blocking - analytics should never break the main flow
  }
}
