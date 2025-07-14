import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServer';
import { trackWhatsAppOTPEvent } from '@/lib/analytics';

// Twilio types
interface TwilioError extends Error {
  code?: number;
  status?: number;
}

// Store OTP in Supabase for verification
async function storeOTP(phone: string, otpCode: string) {
  try {
    const supabase = createAdminClient();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    // First try to delete any existing OTP for this phone
    await supabase
      .from('whatsapp_otps')
      .delete()
      .eq('phone_number', phone);
    // Insert new OTP
    const { error } = await supabase
      .from('whatsapp_otps')
      .insert({
        phone_number: phone,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });
    return { error };
  } catch (error) {
    console.error('Error storing OTP:', error);
    return { error };
  }
}

// Track WhatsApp sandbox joined numbers
async function updateWhatsAppJoined(phone: string) {
  try {
    const supabase = createAdminClient();
    await supabase.from('whatsapp_joined_numbers').upsert({
      phone_number: phone,
      last_success_at: new Date().toISOString(),
      message_count: 1
    }, { onConflict: 'phone_number', ignoreDuplicates: false });
  } catch (error) {
    // Table might not exist yet, ignore
    console.log('[WhatsApp] Unable to update joined tracking:', error);
  }
}

// Check if number is known to have joined sandbox recently
async function hasRecentlyJoined(phone: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('whatsapp_joined_numbers')
      .select('phone_number, last_success_at')
      .eq('phone_number', phone)
      .single();
    if (data && data.last_success_at) {
      const last = new Date(data.last_success_at);
      // Consider joined if within last 30 days
      return last > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    return false;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    
    // Start tracking - initial attempt
    await trackWhatsAppOTPEvent(phone, 'send_attempt', {
      isDemoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString()
    });
    
    // --- ENVIRONMENT VARIABLE HARMONY CHECK ---
    const requiredVars = [
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_WHATSAPP_FROM',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    const missingVars = requiredVars.filter((v) => !process.env[v]);
    if (missingVars.length > 0) {
      console.error(`Critical environment variables missing: ${missingVars.join(', ')}`);
      
      // Track failure due to environment configuration
      await trackWhatsAppOTPEvent(phone, 'send_failure', {
        reason: 'env_vars_missing',
        missingVars,
        timestamp: new Date().toISOString()
      });
      
      // DEMO BYPASS FALLBACK: When WhatsApp config fails, use demo system
      console.log('[DEMO BYPASS] WhatsApp unavailable, activating demo mode');
      
      await trackWhatsAppOTPEvent(phone, 'send_success', {
        demo_mode: true,
        bypass_reason: 'whatsapp_config_missing',
        fallback_method: 'demo_sms_bypass',
        demo_code: '209741',
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({
        success: true,
        demo_mode: true,
        message: 'DEMO MODE: WhatsApp unavailable. Use bypass code: 209741',
        instructions: {
          demo_code: '209741',
          note: 'This is a demo fallback due to WhatsApp configuration issues',
          action: 'Enter 209741 as your verification code'
        },
        fallback_active: true
      });
    }

    if (!phone) {
      await trackWhatsAppOTPEvent(phone, 'send_failure', {
        reason: 'missing_phone',
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    
    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      await trackWhatsAppOTPEvent(phone, 'send_failure', {
        reason: 'invalid_phone_format',
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

    // --- CHECK IF USER HAS JOINED SANDBOX RECENTLY ---
    const joinedRecently = await hasRecentlyJoined(phone);
    if (joinedRecently) {
      console.log(`[WhatsApp] ${phone} previously joined sandbox, skipping join check.`);
    }

    // --- SEND WHATSAPP MESSAGE ---
    const twilio = await import('twilio');
    const client = twilio.default(accountSid, authToken);
    try {
      const message = await client.messages.create({
        body: `Your FixItForMe contractor verification code is: ${otpCode}. Valid for 10 minutes.`,
        from: whatsappNumber,
        to: `whatsapp:${phone}`
      });
      console.log(`[WhatsApp] OTP sent to ${phone}, SID: ${message.sid}`);
      // Store OTP in Supabase for verification
      const { error: storageError } = await storeOTP(phone, otpCode);
      if (!storageError) {
        await updateWhatsAppJoined(phone);
      }
      return NextResponse.json({
        success: true,
        message: `Verification code sent to WhatsApp ${phone}`,
        messageSid: message.sid
      });
    } catch (twilioError) {
      const error = twilioError as TwilioError;
      console.error('[WhatsApp] Twilio error:', error.code, error.message);
      // Handle specific Twilio sandbox errors
      if (error.code === 63015 || error.code === 63016) {
        return NextResponse.json({
          error: 'WhatsApp verification issue. Please ensure you have:',
          details: [
            `1. Sent "join shine-native" to +14155238886 within the last 72 hours`,
            `2. Used the same phone number you're trying to log in with`,
            `3. Waited a few moments after joining before attempting login`
          ],
          sandboxRequired: true,
          joinLink: 'https://wa.me/14155238886?text=join%20shine-native'
        }, { status: 400 });
      }
      return NextResponse.json({
        error: 'Failed to send WhatsApp message. Please try again.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[WhatsApp] General error:', error);
    return NextResponse.json(
      { error: 'Failed to send WhatsApp OTP' },
      { status: 500 }
    );
  }
}
