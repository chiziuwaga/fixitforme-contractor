import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServer';
import { trackWhatsAppOTPEvent } from '@/lib/analytics';

interface TwilioError extends Error {
  code?: number;
  status?: number;
}

async function storeOTP(phone: string, otpCode: string) {
  try {
    const supabase = createAdminClient();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await supabase.from('whatsapp_otps').delete().eq('phone_number', phone);
    
    const { error } = await supabase.from('whatsapp_otps').insert({
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

async function updateWhatsAppJoined(phone: string) {
  try {
    const supabase = createAdminClient();
    await supabase.from('whatsapp_joined_numbers').upsert({
      phone_number: phone,
      last_success_at: new Date().toISOString(),
      message_count: 1
    }, { onConflict: 'phone_number', ignoreDuplicates: false });
  } catch (error) {
    console.log('[WhatsApp] Unable to update joined tracking:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    
    await trackWhatsAppOTPEvent(phone, 'send_attempt', {
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString()
    });
    
    const requiredVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_FROM'];
    const missingVars = requiredVars.filter((v) => !process.env[v]);
    
    if (missingVars.length > 0) {
      console.error(`Critical environment variables missing: ${missingVars.join(', ')}`);
      
      await trackWhatsAppOTPEvent(phone, 'send_failure', {
        reason: 'env_vars_missing',
        missingVars,
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({
        error: 'WhatsApp service not configured',
        action: 'contact_support',
        missing_config: missingVars
      }, { status: 503 });
    }

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

    const twilio = await import('twilio');
    const client = twilio.default(accountSid, authToken);
    
    try {
      const message = await client.messages.create({
        body: `Your FixItForMe contractor verification code is: ${otpCode}. Valid for 10 minutes.`,
        from: whatsappNumber,
        to: `whatsapp:${phone}`
      });
      
      console.log(`[WhatsApp] OTP sent to ${phone}, SID: ${message.sid}`);
      
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
      
      if (error.code === 63015 || error.code === 63016) {
        return NextResponse.json({
          error: 'WhatsApp sandbox not joined',
          instructions: [
            'Send "join shine-native" to +1 415 523 8886',
            'Wait for confirmation message', 
            'Try login again within 72 hours'
          ],
          joinLink: 'https://wa.me/14155238886?text=join%20shine-native',
          sandboxRequired: true
        }, { status: 400 });
      }
      
      return NextResponse.json({
        error: 'Failed to send WhatsApp message. Please try again.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[WhatsApp] General error:', error);
    return NextResponse.json({ error: 'Failed to send WhatsApp OTP' }, { status: 500 });
  }
}
