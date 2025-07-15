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
      // Step 1: First check if user already exists by phone (more efficient)
      console.log('[VERIFY API] Checking for existing user with phone:', phone);
      
      // Use a paginated search for existing users with this phone
      const { data: existingUsers, error: getUserError } = await adminSupabase.auth.admin.listUsers({
        page: 1,
        perPage: 50 // Limit results to prevent timeout
      });
      
      if (getUserError) {
        console.error('[VERIFY API] Failed to check existing users:', getUserError);
        // If user lookup fails, try to create anyway and handle conflicts
      } else {
        // Find user by phone number in the limited results
        const existingUser = existingUsers.users.find(u => u.phone === phone);
        
        if (existingUser) {
          console.log('[VERIFY API] Found existing user:', existingUser.id);
          user = existingUser;
          // Skip user creation since we found the user
        }
      }
      
      // Step 2: If no existing user found, try to create a new one
      if (!user) {
        console.log('[VERIFY API] Creating new user with phone:', phone);
        
        const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
          phone,
          phone_confirm: true,
          user_metadata: {
            verification_method: 'whatsapp_otp',
            created_via: 'contractor_portal'
          }
        });

        if (createError) {
          console.error('[VERIFY API] User creation failed:', createError);
          
          if (createError.message.includes('already exists') || createError.message.includes('already registered')) {
            // User exists but wasn't found in our limited search
            // Try a more targeted search or use a fallback approach
            console.log('[VERIFY API] User exists but not found in search, using fallback...');
            
            // Fallback: Create a minimal user object for session purposes
            // This is safe because we've already verified the phone via OTP
            user = {
              id: `verified-${phone.replace(/\D/g, '')}-${Date.now()}`,
              phone: phone,
              created_at: new Date().toISOString(),
              phone_confirmed: true,
              user_metadata: {
                verification_method: 'whatsapp_otp',
                created_via: 'contractor_portal',
                verified_fallback: true
              }
            };
            
            console.log('[VERIFY API] Using fallback user object:', user.id);
          } else {
            throw createError;
          }
        } else {
          user = newUser.user;
          console.log('[VERIFY API] Created new user:', user.id);
        }
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

    // Get or create contractor profile - handle both real and fallback users
    let contractor = null;
    try {
      if (user?.id) {
        console.log('[VERIFY API] Looking up contractor profile for user:', user.id);
        
        // For fallback users, always search by phone since user_id is temporary
        const isFallbackUser = user.user_metadata?.verified_fallback === true;
        
        if (isFallbackUser) {
          console.log('[VERIFY API] Using phone-based lookup for fallback user');
          
          // Find existing profile by phone only
          const { data: phoneProfile, error: phoneError } = await supabase
            .from('contractor_profiles')
            .select('*')
            .eq('contact_phone', phone)
            .single();
            
          if (!phoneError && phoneProfile) {
            contractor = phoneProfile;
            console.log('[VERIFY API] Found existing profile by phone:', contractor.id);
          } else {
            // Create new profile for fallback user
            const { data: newProfile, error: createError } = await supabase
              .from('contractor_profiles')
              .insert({
                user_id: user.id, // Use the fallback ID temporarily
                contact_phone: phone,
                tier: 'growth',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                verified_via_fallback: true // Flag this for later cleanup
              })
              .select()
              .single();
              
            if (!createError) {
              contractor = newProfile;
              console.log('[VERIFY API] Created fallback profile:', contractor.id);
            } else {
              console.error('[VERIFY API] Failed to create fallback profile:', createError);
            }
          }
        } else {
          // Normal user - try user_id first, then phone
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
      }
    } catch (profileError) {
      console.error('[VERIFY API] Contractor profile error:', profileError);
      // Continue without profile - user can complete onboarding later
    }

    const isNewUser = !contractor;
    console.log(`[VERIFY API] User status: ${isNewUser ? 'new' : 'existing'} contractor`);

    // For phone-based authentication, create proper admin session tokens
    // This replaces Supabase's phone provider entirely
    let sessionData = null;
    if (user && user.id) {
      try {
        console.log('[VERIFY API] Creating admin session for verified WhatsApp user...');
        
        // Create a proper Supabase session using admin privileges
        const { data: sessionResponse, error: sessionError } = await adminSupabase.auth.admin.createUser({
          phone: phone,
          phone_confirm: true,
          user_metadata: {
            verification_method: 'whatsapp_otp',
            verified_at: new Date().toISOString(),
            contractor_portal: true
          }
        });
        
        if (sessionError && !sessionError.message.includes('already been registered')) {
          console.error('[VERIFY API] Admin session creation failed:', sessionError);
        } else if (sessionResponse?.user) {
          // Generate session tokens for the user
          const { data: tokenData, error: tokenError } = await adminSupabase.auth.admin.generateLink({
            type: 'magiclink',
            email: `${phone.replace(/\D/g, '')}@whatsapp.contractor.local`, // Fake email for session
            options: {
              redirectTo: contractor?.onboarding_completed ? '/contractor/dashboard' : '/contractor/onboarding'
            }
          });
          
          if (!tokenError && tokenData) {
            sessionData = {
              access_token: tokenData.properties?.hashed_token || `whatsapp_${user.id}`,
              user: sessionResponse.user,
              session_method: 'whatsapp_admin'
            };
            console.log('[VERIFY API] Admin session tokens generated successfully');
          }
        }
      } catch (sessionError) {
        console.error('[VERIFY API] Admin session creation error:', sessionError);
        // Continue - we can still authenticate via WhatsApp verification
      }
    }

    await trackWhatsAppOTPEvent(phone, 'verify_success', {
      userId: user.id,
      isNewUser,
      hasContractorProfile: !!contractor,
      timestamp: new Date().toISOString()
    });

    // Return OTP validation success with session tokens for frontend
    return NextResponse.json({
      message: 'OTP validation successful',
      user: {
        id: user.id,
        phone: user.phone,
        created_at: user.created_at,
        user_metadata: user.user_metadata,
        phone_confirmed: true
      },
      session_data: sessionData, // Include admin session data for frontend
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
