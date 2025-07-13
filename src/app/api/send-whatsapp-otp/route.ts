import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServer';

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

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Twilio WhatsApp API configuration
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
    
    if (!accountSid || !authToken) {
      // Fallback: Use sandbox/demo mode for development
      console.log(`[DEMO] WhatsApp OTP for ${phone}: ${otpCode}`);
      
      // Store OTP in Supabase even in demo mode
      const { error: storageError } = await storeOTP(phone, otpCode);
      if (storageError) {
        console.error('Failed to store demo OTP:', storageError);
        console.error('Phone:', phone, 'OTP:', otpCode);
      } else {
        console.log('Demo OTP stored successfully for phone:', phone);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `WhatsApp OTP sent to ${phone}`,
        otpCode: process.env.NODE_ENV === 'development' ? otpCode : undefined // Only show in dev
      });
    }

    // Real Twilio WhatsApp API implementation
    const twilio = await import('twilio');
    const client = twilio.default(accountSid, authToken);
    
    try {
      const message = await client.messages.create({
        body: `Your FixItForMe contractor verification code is: ${otpCode}. Valid for 10 minutes.`,
        from: whatsappNumber,
        to: `whatsapp:${phone}`
      });

      console.log(`WhatsApp OTP sent successfully: ${message.sid}`);
      
      // Store OTP in Supabase for verification
      const { error: storageError } = await storeOTP(phone, otpCode);
      if (storageError) {
        console.error('Failed to store OTP:', storageError);
        console.error('Phone:', phone, 'OTP:', otpCode);
        // Continue anyway - user will get the message but verification might fail
      } else {
        console.log('OTP stored successfully for phone:', phone);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Verification code sent to WhatsApp ${phone}`,
        messageSid: message.sid
      });
      
    } catch (twilioError) {
      const error = twilioError as TwilioError;
      console.error('Twilio WhatsApp API error:', error);
      
      // Handle specific Twilio errors
      if (error.code === 63015) {
        return NextResponse.json({ 
          error: 'Please join our WhatsApp sandbox first. Send "join shine-native" to +14155238886, then try again.',
          sandboxRequired: true
        }, { status: 400 });
      }
      
      if (error.code === 63016) {
        return NextResponse.json({ 
          error: 'WhatsApp number not opted in. Please message the WhatsApp sandbox first.' 
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to send WhatsApp message. Please try again.' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('WhatsApp OTP API error:', error);
    return NextResponse.json(
      { error: 'Failed to send WhatsApp OTP' },
      { status: 500 }
    );
  }
}
