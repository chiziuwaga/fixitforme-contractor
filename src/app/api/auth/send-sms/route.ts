import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    const supabase = createClient();

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
