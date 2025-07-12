import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // For demo purposes, always return success
    // In production, this would integrate with Twilio WhatsApp API
    console.log(`WhatsApp OTP requested for: ${phone}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({ 
      success: true, 
      message: 'WhatsApp OTP sent successfully (demo mode)' 
    });
    
  } catch (error) {
    console.error('WhatsApp OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send WhatsApp OTP' },
      { status: 500 }
    );
  }
}
