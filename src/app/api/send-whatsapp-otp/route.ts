import { NextRequest, NextResponse } from 'next/server';

// Twilio types
interface TwilioError extends Error {
  code?: number;
  status?: number;
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
      
      // Store OTP in session/database for verification
      // In production, you'd store this in Redis or database
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
      
      // Store OTP for verification (implement your storage logic)
      // Example: await storeOTP(phone, otpCode, 10 * 60 * 1000); // 10 minutes
      
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
