import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabaseServer';
import { trackWhatsAppOTPEvent } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  console.log('[VERIFY API] Request received');
  
  try {
    const body = await request.json();
    const { phone, token } = body;
    console.log('[VERIFY API] Parsed body:', { phone: phone || 'missing', token: token || 'missing' });
    
    const supabase = createClient();
    const adminSupabase = createAdminClient();
    
    await trackWhatsAppOTPEvent(phone, 'verify_attempt', {
      otpLength: token?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    if (!phone || !token) {
      return NextResponse.json({ 
        error: 'Phone number and verification code are required'
      }, { status: 400 });
    }

    // Remove secret upgrade logic - this belongs in subscription flow only
    const actualToken = token;

    const { data: otpData, error: otpError } = await supabase
      .from('whatsapp_otps')
      .select('*')
      .eq('phone_number', phone)
      .eq('otp_code', actualToken)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpData) {
      console.error('OTP verification failed:', otpError);
      
      await trackWhatsAppOTPEvent(phone, 'verify_failure', {
        reason: otpError?.code === 'PGRST116' ? 'otp_not_found' : 'invalid_or_expired',
        errorCode: otpError?.code,
        provided_token: token,
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({ 
        error: 'Invalid or expired verification code'
      }, { status: 400 });
    }

    console.log('[VERIFY API] OTP verification successful');

    await supabase.from('whatsapp_otps').delete().eq('id', otpData.id);

    let user;
    try {
      const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
        phone,
        phone_confirm: true,
        user_metadata: {
          verification_method: 'whatsapp_otp',
          created_via: 'contractor_portal'
        }
      });

      if (createError) {
        if (createError.message.includes('already exists') || createError.message.includes('already registered')) {
          const { data: existingUsers } = await adminSupabase.auth.admin.listUsers();
          const existingUser = existingUsers.users.find(u => u.phone === phone);
          
          if (existingUser) {
            user = existingUser;
            console.log('[VERIFY API] Found existing user:', user.id);
          } else {
            throw new Error('User exists but could not be retrieved');
          }
        } else {
          throw createError;
        }
      } else {
        user = newUser.user;
        console.log('[VERIFY API] Created new user:', user.id);
      }
    } catch (userError) {
      console.error('[VERIFY API] User creation/retrieval failed:', userError);
      
      await trackWhatsAppOTPEvent(phone, 'verify_failure', {
        reason: 'user_creation_failed',
        errorMessage: userError instanceof Error ? userError.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
    }

    const { data: contractor, error: contractorError } = await supabase
      .from('contractor_profiles')
      .select('*')
      .eq('contact_phone', phone)
      .single();

    if (contractorError && contractorError.code !== 'PGRST116') {
      console.error('[VERIFY API] Contractor profile fetch error:', contractorError);
    }

    const isNewUser = !contractor;
    console.log(`[VERIFY API] User status: ${isNewUser ? 'new' : 'existing'} contractor`);

    await trackWhatsAppOTPEvent(phone, 'verify_success', {
      userId: user.id,
      isNewUser,
      hasContractorProfile: !!contractor,
      timestamp: new Date().toISOString()
    });

    // For phone-based authentication, we'll let the frontend handle session
    // using the user ID and phone verification status
    return NextResponse.json({
      message: 'Authentication successful',
      user: {
        id: user.id,
        phone: user.phone,
        created_at: user.created_at,
        user_metadata: user.user_metadata,
        phone_confirmed: true // Critical: tells frontend phone is verified
      },
      contractor_profile: contractor,
      is_new_user: isNewUser,
      redirect_url: contractor?.onboarding_completed ? '/contractor/dashboard' : '/contractor/onboarding'
    });

  } catch (error) {
    console.error('[VERIFY API] Unexpected error:', error);
    
    await trackWhatsAppOTPEvent('unknown', 'verify_failure', {
      reason: 'unexpected_error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
