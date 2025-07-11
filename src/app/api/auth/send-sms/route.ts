import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { DEMO_CONFIG, createDemoResponse } from '@/lib/demo-config';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // DEMO MODE: Return mock success without actual SMS
    if (DEMO_CONFIG.SMS_DEMO.enabled || DEMO_CONFIG.DEMO_MODE) {
      console.log(`[DEMO] SMS would be sent to: ${phone} with code: ${DEMO_CONFIG.SMS_DEMO.mockCode}`);
      
      await createDemoResponse(null, 1500); // Simulate API delay
      
      return NextResponse.json({ 
        success: true, 
        message: `Demo verification code sent to ${phone}`,
        demo: true,
        hint: `Use code: ${DEMO_CONFIG.SMS_DEMO.mockCode}` // Only for demo!
      });
    }

    // Send SMS with 6-digit code using Supabase Auth
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone,
      options: {
        // Custom SMS template for contractor platform
        data: {
          platform: 'FixItForMe Contractor',
          role: 'contractor'
        }
      }
    });

    if (error) {
      console.error('SMS send error:', error);
      return NextResponse.json(
        { error: 'Failed to send verification code' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification code sent successfully',
      session: data.session,
      user: data.user
    });

  } catch (error) {
    console.error('Auth request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
