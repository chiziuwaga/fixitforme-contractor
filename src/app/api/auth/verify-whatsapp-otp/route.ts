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
      // Step 1: Try to create a new user
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
          console.log('[VERIFY API] User already exists, finding existing user...');
          
          // Step 2: Find existing user by phone number using admin client
          const { data: existingUsers, error: getUserError } = await adminSupabase.auth.admin.listUsers();
          
          if (getUserError) {
            throw new Error(`Failed to lookup existing users: ${getUserError.message}`);
          }
          
          // Find user by phone number
          const existingUser = existingUsers.users.find(u => u.phone === phone);
          
          if (!existingUser) {
            throw new Error(`User with phone ${phone} not found in auth.users table`);
          }
          
          user = existingUser;
          console.log('[VERIFY API] Found existing user:', user.id);
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

    // Get or create contractor profile using direct approach (bypass function for now)
    let contractor = null;
    try {
      if (user?.id) {
        console.log('[VERIFY API] Looking up contractor profile...');
        
        // First try to find existing profile by user_id
        const { data: existingProfile, error: profileError } = await supabase
          .from('contractor_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (!profileError && existingProfile) {
          contractor = existingProfile;
          console.log('[VERIFY API] Found profile by user_id:', contractor.id);
        } else {
          // Try to find by phone
          const { data: phoneProfile, error: phoneError } = await supabase
            .from('contractor_profiles')
            .select('*')
            .eq('contact_phone', phone)
            .single();
            
          if (!phoneError && phoneProfile) {
            // Update the profile to link with the correct user_id
            const { data: updatedProfile, error: updateError } = await supabase
              .from('contractor_profiles')
              .update({ user_id: user.id })
              .eq('id', phoneProfile.id)
              .select()
              .single();
              
            if (!updateError) {
              contractor = updatedProfile;
              console.log('[VERIFY API] Updated and linked existing profile:', contractor.id);
            }
          } else {
            // Create new profile
            const { data: newProfile, error: createError } = await supabase
              .from('contractor_profiles')
              .insert({
                user_id: user.id,
                contact_phone: phone,
                tier: 'growth',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();
              
            if (!createError) {
              contractor = newProfile;
              console.log('[VERIFY API] Created new profile:', contractor.id);
            } else {
              console.error('[VERIFY API] Failed to create profile:', createError);
            }
          }
        }
      }
    } catch (profileError) {
      console.error('[VERIFY API] Contractor profile error:', profileError);
      // Continue without profile - user can complete onboarding later
    }

    const isNewUser = !contractor;
    console.log(`[VERIFY API] User status: ${isNewUser ? 'new' : 'existing'} contractor`);

    await trackWhatsAppOTPEvent(phone, 'verify_success', {
      userId: user.id,
      isNewUser,
      hasContractorProfile: !!contractor,
      timestamp: new Date().toISOString()
    });

    // Return OTP validation success - frontend will handle session creation
    return NextResponse.json({
      message: 'OTP validation successful',
      user: {
        id: user.id,
        phone: user.phone,
        created_at: user.created_at,
        user_metadata: user.user_metadata,
        phone_confirmed: true
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
