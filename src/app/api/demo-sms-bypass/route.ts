import { NextRequest, NextResponse } from 'next/server';
import { trackWhatsAppOTPEvent } from '@/lib/analytics';

// Demo bypass configuration
const DEMO_BYPASS_CONFIG = {
  // Known demo phone numbers that trigger bypass
  demoNumbers: [
    '+1234567890',    // Default demo number
    '+19876543210',   // Alternative demo number
    '+15551234567',   // Test number for presentations
  ],
  
  // Secret bypass code (as provided by user)
  secretCode: '209741',
  
  // Demo mode indicators
  demoMessages: {
    success: 'DEMO MODE: OTP sent successfully! Use code: 209741',
    bypass: 'DEMO MODE: Using bypass authentication',
    fallback: 'WhatsApp unavailable - using SMS fallback with demo code'
  }
};

export async function POST(request: NextRequest) {
  try {
    const { phone_number, action = 'send' } = await request.json();

    // Validate phone number format
    if (!phone_number || !/^\+[1-9]\d{1,14}$/.test(phone_number)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use E.164 format (+1234567890)' },
        { status: 400 }
      );
    }

    const isDemoNumber = DEMO_BYPASS_CONFIG.demoNumbers.includes(phone_number);

    if (action === 'send') {
      // Track demo bypass attempt
      await trackWhatsAppOTPEvent(
        phone_number,
        'send_attempt',
        {
          demo_mode: true,
          bypass_triggered: isDemoNumber,
          method: 'demo_sms_bypass',
          timestamp: new Date().toISOString()
        }
      );

      // Always return success for demo mode
      await trackWhatsAppOTPEvent(
        phone_number,
        'send_success',
        {
          demo_mode: true,
          bypass_code: DEMO_BYPASS_CONFIG.secretCode,
          message: DEMO_BYPASS_CONFIG.demoMessages.success,
          fallback_reason: 'whatsapp_sandbox_limitations'
        }
      );

      return NextResponse.json({
        success: true,
        demo_mode: true,
        message: isDemoNumber 
          ? DEMO_BYPASS_CONFIG.demoMessages.success
          : DEMO_BYPASS_CONFIG.demoMessages.fallback,
        bypass_code: DEMO_BYPASS_CONFIG.secretCode,
        instructions: {
          step1: 'Use the demo bypass code: 209741',
          step2: 'This code works for all demo authentications',
          step3: 'No actual SMS/WhatsApp message will be sent',
          note: 'This is a demo environment with simulated OTP delivery'
        }
      });
    }

    if (action === 'verify') {
      const { otp_code } = await request.json();

      // Track verification attempt
      await trackWhatsAppOTPEvent(
        phone_number,
        'verify_attempt',
        {
          demo_mode: true,
          provided_code: otp_code,
          expected_code: DEMO_BYPASS_CONFIG.secretCode,
          verification_method: 'demo_bypass'
        }
      );

      // Check if provided code matches demo bypass code
      const isValidCode = otp_code === DEMO_BYPASS_CONFIG.secretCode;

      if (isValidCode) {
        await trackWhatsAppOTPEvent(
          phone_number,
          'verify_success',
          {
            demo_mode: true,
            bypass_authentication: true,
            message: DEMO_BYPASS_CONFIG.demoMessages.bypass
          }
        );

        return NextResponse.json({
          success: true,
          valid: true,
          demo_mode: true,
          message: DEMO_BYPASS_CONFIG.demoMessages.bypass,
          authentication_method: 'demo_bypass'
        });
      } else {
        await trackWhatsAppOTPEvent(
          phone_number,
          'verify_failure',
          {
            demo_mode: true,
            provided_code: otp_code,
            expected_code: DEMO_BYPASS_CONFIG.secretCode,
            failure_reason: 'incorrect_demo_code'
          }
        );

        return NextResponse.json({
          success: false,
          valid: false,
          demo_mode: true,
          error: `Invalid demo code. Expected: ${DEMO_BYPASS_CONFIG.secretCode}`,
          hint: 'Use the demo bypass code: 209741'
        }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "send" or "verify"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Demo SMS bypass error:', error);
    
    // Track the error
    try {
      await trackWhatsAppOTPEvent(
        'unknown',
        'send_failure',
        {
          demo_mode: true,
          error: error instanceof Error ? error.message : 'Unknown error',
          bypass_system_error: true
        }
      );
    } catch (trackingError) {
      console.error('Analytics tracking failed:', trackingError);
    }

    return NextResponse.json(
      { 
        error: 'Demo bypass system error', 
        demo_mode: true,
        fallback_instructions: 'Use demo code: 209741 for any phone number'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    demo_bypass_system: {
      status: 'active',
      description: 'SMS/WhatsApp bypass for demo purposes',
      demo_code: DEMO_BYPASS_CONFIG.secretCode,
      supported_numbers: DEMO_BYPASS_CONFIG.demoNumbers,
      instructions: {
        send: 'POST to this endpoint with { "phone_number": "+1234567890", "action": "send" }',
        verify: 'POST to this endpoint with { "phone_number": "+1234567890", "action": "verify", "otp_code": "209741" }',
        note: 'All phone numbers work with demo code: 209741'
      }
    }
  });
}
