import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { phone, token } = await request.json();
    
    if (!phone || !token) {
      return NextResponse.json({ error: 'Phone number and verification code are required' }, { status: 400 });
    }

    // Verify the SMS token
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: token,
      type: 'sms'
    });

    if (error) {
      console.error('SMS verification error:', error);
      return NextResponse.json(
        { error: 'Invalid verification code' }, 
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Verification failed' }, 
        { status: 400 }
      );
    }

    // Check if contractor profile exists
    const { data: contractorProfile, error: profileError } = await supabase
      .from('contractor_profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    let isNewUser = false;
    
    // Create contractor profile if it doesn't exist
    if (profileError && profileError.code === 'PGRST116') {
      isNewUser = true;
      const { error: createError } = await supabase
        .from('contractor_profiles')
        .insert({
          id: data.user.id,
          user_id: data.user.id,
          contact_phone: phone,
          tier: 'growth',
          created_at: new Date().toISOString(),
          onboarding_completed: false,
          profile_score: 20 // Phone verified = 20%
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
          contractor_id: data.user.id,
          step: 'phone_verification',
          completed: true,
          completed_at: new Date().toISOString()
        });
    }

    return NextResponse.json({
      message: 'Phone verification successful',
      user: data.user,
      session: data.session,
      contractor_profile: contractorProfile,
      is_new_user: isNewUser,
      redirect_url: isNewUser ? '/contractor/onboarding' : '/contractor/dashboard'
    });

  } catch (error) {
    console.error('SMS verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
