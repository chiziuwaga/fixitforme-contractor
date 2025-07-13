import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const adminSupabase = createAdminClient();
    const { phone, token } = await request.json();
    
    if (!phone || !token) {
      return NextResponse.json({ error: 'Phone number and verification code are required' }, { status: 400 });
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
      return NextResponse.json(
        { error: 'Invalid or expired verification code' }, 
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
        return NextResponse.json(
          { error: 'Failed to get contractor profile' }, 
          { status: 500 }
        );
      }

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
      return NextResponse.json(
        { error: 'Failed to create user account' }, 
        { status: 500 }
      );
    }

    if (!authData.user) {
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

    return NextResponse.json({
      message: 'WhatsApp verification successful',
      user: authData.user,
      contractor_profile: contractorProfile,
      is_new_user: isNewUser,
      redirect_url: isNewUser ? '/contractor/onboarding' : '/contractor/dashboard'
    });

  } catch (error) {
    console.error('WhatsApp verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
