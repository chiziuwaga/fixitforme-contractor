import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabaseServer';
import { trackWhatsAppOTPEvent } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const adminSupabase = createAdminClient();
    const { phone, token } = await request.json();
    const startTime = Date.now();
    
    // IMMEDIATE DEMO BYPASS CHECK: Check for demo code first to avoid database issues
    if (token === '209741') {
      console.log('[DEMO BYPASS] Demo code 209741 detected, activating demo mode immediately');
      
      // Track demo bypass (non-blocking)
      try {
        await trackWhatsAppOTPEvent(phone, 'verify_success', {
          demo_mode: true,
          bypass_authentication: true,
          bypass_reason: 'demo_code_209741',
          immediate_bypass: true,
          timestamp: new Date().toISOString()
        });
      } catch (trackingError) {
        console.warn('[DEMO BYPASS] Analytics tracking failed (non-blocking):', trackingError);
      }

      // For demo mode, we'll assume it's a new contractor needing onboarding
      // This avoids database dependency issues in demo mode
      return NextResponse.json({ 
        success: true, 
        exists: false, 
        needsOnboarding: true,
        demo_mode: true,
        message: 'DEMO MODE: Authentication successful with bypass code 209741',
        bypass_active: true
      });
    }
    
    // Track verification attempt (non-blocking)
    try {
      await trackWhatsAppOTPEvent(phone, 'verify_attempt', {
        otpLength: token?.length || 0,
        timestamp: new Date().toISOString()
      });
    } catch (trackingError) {
      console.warn('[ANALYTICS] Tracking failed (non-blocking):', trackingError);
    }
    
    if (!phone || !token) {
      try {
        await trackWhatsAppOTPEvent(phone, 'verify_failure', {
          reason: 'missing_parameters',
          timestamp: new Date().toISOString()
        });
      } catch (trackingError) {
        console.warn('[ANALYTICS] Tracking failed (non-blocking):', trackingError);
      }
      
      return NextResponse.json({ 
        error: 'Phone number and verification code are required',
        hint: 'For demo purposes, use code: 209741 with any phone number'
      }, { status: 400 });
    }

    // Verify OTP against stored value in Supabase
    const { data: otpData, error: otpError } = await supabase
      .from('whatsapp_otps')
      .select('*')
      .eq('phone_number', phone)
      .eq('otp_code', token)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpData) {
      console.error('OTP verification failed:', otpError);
      
      // DEMO BYPASS CHECK: If OTP lookup fails, check for demo bypass code
      if (token === '209741') {
        console.log('[DEMO BYPASS] Demo code detected, bypassing OTP verification');
        
        await trackWhatsAppOTPEvent(phone, 'verify_success', {
          demo_mode: true,
          bypass_authentication: true,
          bypass_reason: 'demo_code_209741',
          timestamp: new Date().toISOString()
        });

        // Continue with normal auth flow but mark as demo mode
        // Check if contractor already exists
        const { data: contractor, error: contractorError } = await supabase
          .from('contractor_profiles')
          .select('*')
          .eq('phone_number', phone)
          .single();

        if (contractorError && contractorError.code !== 'PGRST116') {
          console.error('Database error during demo bypass:', contractorError);
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        if (contractor) {
          // Existing contractor - return success
          return NextResponse.json({ 
            success: true, 
            exists: true,
            demo_mode: true,
            message: 'DEMO MODE: Authentication successful with bypass code'
          });
        } else {
          // New contractor - needs onboarding
          return NextResponse.json({ 
            success: true, 
            exists: false, 
            needsOnboarding: true,
            demo_mode: true,
            message: 'DEMO MODE: New contractor detected, proceed to onboarding'
          });
        }
      }
      
      await trackWhatsAppOTPEvent(phone, 'verify_failure', {
        reason: otpError?.code === 'PGRST116' ? 'otp_not_found' : 'invalid_or_expired',
        errorCode: otpError?.code,
        provided_token: token,
        demo_bypass_attempted: token === '209741',
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json(
        { 
          error: 'Invalid or expired verification code',
          hint: 'For demo purposes, try code: 209741'
        }, 
        { status: 400 }
      );
    }

    // Delete used OTP to prevent reuse
    await supabase
      .from('whatsapp_otps')
      .delete()
      .eq('phone_number', phone);

    // Create or get user with WhatsApp phone number
    // Use Supabase Auth admin API to create a verified user with phone
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      phone: phone,
      phone_confirm: true,
      user_metadata: {
        platform: 'FixItForMe Contractor',
        role: 'contractor',
        verification_method: 'whatsapp_otp'
      }
    });

    if (authError && authError.message.includes('already been registered')) {
      // User exists, get existing user by phone from our profile table
      const { data: existingUser, error: userError } = await supabase
        .from('contractor_profiles')
        .select('*')
        .eq('contact_phone', phone)
        .single();

      if (userError) {
        console.error('Error getting contractor profile:', userError);
        
        await trackWhatsAppOTPEvent(phone, 'verify_failure', {
          reason: 'profile_fetch_error',
          error: userError.message,
          timestamp: new Date().toISOString()
        });
        
        return NextResponse.json(
          { error: 'Failed to get contractor profile' }, 
          { status: 500 }
        );
      }

      // Track successful verification for existing user
      await trackWhatsAppOTPEvent(phone, 'verify_success', {
        userId: existingUser.user_id,
        timeToVerify: Date.now() - startTime,
        isExistingUser: true,
        timestamp: new Date().toISOString()
      }, existingUser.user_id);

      return NextResponse.json({
        message: 'WhatsApp verification successful',
        user: { id: existingUser.user_id, phone: phone },
        contractor_profile: existingUser,
        is_new_user: false,
        redirect_url: existingUser.onboarding_completed ? '/contractor/dashboard' : '/contractor/onboarding'
      });
    }

    if (authError) {
      console.error('WhatsApp auth creation error:', authError);
      
      await trackWhatsAppOTPEvent(phone, 'verify_failure', {
        reason: 'auth_creation_error',
        error: authError.message,
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json(
        { error: 'Failed to create user account' }, 
        { status: 500 }
      );
    }

    if (!authData.user) {
      await trackWhatsAppOTPEvent(phone, 'verify_failure', {
        reason: 'no_user_created',
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json(
        { error: 'Verification failed' }, 
        { status: 400 }
      );
    }

    // Check if contractor profile exists
    const { data: contractorProfile, error: profileError } = await supabase
      .from('contractor_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    let isNewUser = false;
    
    // Create contractor profile if it doesn't exist
    if (profileError && profileError.code === 'PGRST116') {
      isNewUser = true;
      const { error: createError } = await supabase
        .from('contractor_profiles')
        .insert({
          id: authData.user.id,
          user_id: authData.user.id,
          contact_phone: phone,
          tier: 'growth',
          created_at: new Date().toISOString(),
          onboarding_completed: false,
          profile_score: 20 // Phone verified via WhatsApp = 20%
        });

      if (createError) {
        console.error('Error creating contractor profile:', createError);
        
        await trackWhatsAppOTPEvent(phone, 'verify_failure', {
          reason: 'profile_creation_error',
          error: createError.message,
          userId: authData.user.id,
          timestamp: new Date().toISOString()
        }, authData.user.id);
        
        return NextResponse.json(
          { error: 'Failed to create contractor profile' }, 
          { status: 500 }
        );
      }

      // Create initial onboarding progress record
      await supabase
        .from('onboarding_progress')
        .insert({
          contractor_id: authData.user.id,
          step: 'whatsapp_verification',
          completed: true,
          completed_at: new Date().toISOString()
        });
    }

    // Track successful verification with timing data
    await trackWhatsAppOTPEvent(phone, 'verify_success', {
      userId: authData.user.id,
      timeToVerify: Date.now() - startTime,
      isNewUser: isNewUser,
      timestamp: new Date().toISOString()
    }, authData.user.id);

    return NextResponse.json({
      message: 'WhatsApp verification successful',
      user: authData.user,
      contractor_profile: contractorProfile,
      is_new_user: isNewUser,
      redirect_url: isNewUser ? '/contractor/onboarding' : '/contractor/dashboard'
    });

  } catch (error) {
    console.error('WhatsApp verification error:', error);
    
    // Get phone and token from request if available  
    let phoneFromRequest = 'unknown';
    let tokenFromRequest = '';
    try {
      const body = await request.json();
      phoneFromRequest = body.phone || 'unknown';
      tokenFromRequest = body.token || '';
    } catch {
      // Ignore if we can't parse the request
    }
    
    // EMERGENCY DEMO BYPASS: If system error occurs with demo code, still allow bypass
    if (tokenFromRequest === '209741') {
      console.log('[EMERGENCY DEMO BYPASS] System error occurred, but demo code detected - allowing bypass');
      
      try {
        await trackWhatsAppOTPEvent(phoneFromRequest, 'verify_success', {
          demo_mode: true,
          emergency_bypass: true,
          bypass_reason: 'system_error_demo_fallback',
          original_error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });
      } catch (trackingError) {
        console.warn('[EMERGENCY DEMO] Analytics tracking failed (non-blocking):', trackingError);
      }
      
      return NextResponse.json({
        success: true,
        exists: false,
        needsOnboarding: true,
        demo_mode: true,
        emergency_bypass: true,
        message: 'DEMO MODE: Emergency bypass activated due to system error',
        instructions: 'Demo authentication successful with code 209741'
      });
    }
    
    // Regular error tracking (non-blocking)
    try {
      await trackWhatsAppOTPEvent(phoneFromRequest, 'verify_failure', {
        reason: 'system_error',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    } catch (trackingError) {
      console.warn('[ERROR TRACKING] Failed to track error (non-blocking):', trackingError);
    }
    
    return NextResponse.json(
      { 
        error: 'Server configuration error. Please contact support.',
        hint: 'For demo purposes, try using code: 209741 with any phone number',
        demo_available: true
      }, 
      { status: 500 }
    );
  }
}
