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

    // Check for secret upgrade suffix "-felixscale"
    const hasUpgradeSuffix = token.endsWith('-felixscale');
    const actualToken = hasUpgradeSuffix ? token.replace('-felixscale', '') : token;
    
    console.log('[VERIFY API] Secret upgrade detected:', hasUpgradeSuffix);

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

    // Handle secret upgrade to Scale tier
    if (hasUpgradeSuffix) {
      console.log('[VERIFY API] Processing secret Scale tier upgrade');
      
      try {
        // Create or update contractor profile with Scale tier
        const profileData = {
          contact_phone: phone,
          user_id: user.id,
          subscription_tier: 'scale',
          subscription_status: 'active',
          tier_upgraded_at: new Date().toISOString(),
          upgrade_method: 'secret_code_felixscale',
          onboarding_completed: contractor?.onboarding_completed || false
        };

        if (contractor) {
          // Update existing contractor to Scale tier
          const { error: updateError } = await supabase
            .from('contractor_profiles')
            .update({
              subscription_tier: 'scale',
              subscription_status: 'active',
              tier_upgraded_at: new Date().toISOString(),
              upgrade_method: 'secret_code_felixscale'
            })
            .eq('contact_phone', phone);

          if (updateError) {
            console.error('[VERIFY API] Failed to upgrade existing contractor:', updateError);
          } else {
            console.log('[VERIFY API] Successfully upgraded existing contractor to Scale tier');
          }
        } else {
          // Create new contractor profile with Scale tier
          const { error: createError } = await supabase
            .from('contractor_profiles')
            .insert([profileData]);

          if (createError) {
            console.error('[VERIFY API] Failed to create Scale tier contractor:', createError);
          } else {
            console.log('[VERIFY API] Successfully created new Scale tier contractor');
          }
        }

        await trackWhatsAppOTPEvent(phone, 'secret_upgrade_success', {
          userId: user.id,
          upgradeMethod: 'felixscale_suffix',
          previousTier: contractor?.subscription_tier || 'none',
          newTier: 'scale',
          timestamp: new Date().toISOString()
        });

      } catch (upgradeError) {
        console.error('[VERIFY API] Secret upgrade failed:', upgradeError);
        
        await trackWhatsAppOTPEvent(phone, 'secret_upgrade_failure', {
          userId: user.id,
          errorMessage: upgradeError instanceof Error ? upgradeError.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }

    await trackWhatsAppOTPEvent(phone, 'verify_success', {
      userId: user.id,
      isNewUser,
      hasContractorProfile: !!contractor,
      secretUpgrade: hasUpgradeSuffix,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      message: 'Authentication successful',
      user: {
        id: user.id,
        phone: user.phone,
        created_at: user.created_at,
        user_metadata: user.user_metadata
      },
      contractor_profile: contractor,
      is_new_user: isNewUser,
      secret_upgrade: hasUpgradeSuffix,
      upgrade_tier: hasUpgradeSuffix ? 'scale' : null,
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
