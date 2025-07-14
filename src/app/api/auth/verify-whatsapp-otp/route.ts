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
          console.log('[VERIFY API] User already exists, retrieving existing user...');
          
          // Try to find existing user by phone using getUserByPhone (if available) or admin.getUserById
          try {
            // Alternative approach: Use admin.listUsers with phone filter
            const { data: existingUsers, error: listError } = await adminSupabase.auth.admin.listUsers({
              page: 1,
              perPage: 1000 // Increase limit to catch all users
            });
            
            if (listError) {
              console.error('[VERIFY API] Error listing users:', listError);
              throw new Error(`Failed to retrieve existing user: ${listError.message}`);
            }
            
            const existingUser = existingUsers.users.find(u => u.phone === phone);
            
            if (existingUser) {
              user = existingUser;
              console.log('[VERIFY API] Found existing user:', user.id);
            } else {
              // Final fallback: Query the contractor_profiles table to find user
              const { data: contractorProfile } = await supabase
                .from('contractor_profiles')
                .select('user_id')
                .eq('contact_phone', phone)
                .single();
                
              if (contractorProfile) {
                // Get user by ID from contractor profile
                const { data: userById, error: userError } = await adminSupabase.auth.admin.getUserById(contractorProfile.user_id);
                
                if (userError || !userById.user) {
                  throw new Error(`User exists in contractor_profiles but not in auth: ${userError?.message || 'User not found'}`);
                }
                
                user = userById.user;
                console.log('[VERIFY API] Found user via contractor profile lookup:', user.id);
              } else {
                throw new Error('User exists but could not be retrieved from auth.users or contractor_profiles');
              }
            }
          } catch (retrievalError) {
            console.error('[VERIFY API] User retrieval failed:', retrievalError);
            throw new Error(`User exists but could not be retrieved: ${retrievalError instanceof Error ? retrievalError.message : 'Unknown error'}`);
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

    // Get or create contractor profile using consistent lookup
    let contractor = null;
    try {
      if (user?.id) {
        // Use the database function to ensure consistent profile
        const { data: profileResult, error: profileFunctionError } = await supabase
          .rpc('ensure_contractor_profile', {
            input_phone: phone,
            input_user_id: user.id
          });

        if (profileFunctionError) {
          console.error('[VERIFY API] Profile function error:', profileFunctionError);
        } else {
          // Now fetch the complete contractor profile
          const { data: fullProfile, error: fetchError } = await supabase
            .from('contractor_profiles')
            .select('*')
            .eq('id', profileResult)
            .single();
            
          if (!fetchError && fullProfile) {
            contractor = fullProfile;
          }
        }
      }
    } catch (profileError) {
      console.error('[VERIFY API] Contractor profile creation/retrieval error:', profileError);
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
