import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const {
      company_name,
      contact_name,
      email,
      business_type,
      services,
      license_number,
      years_experience,
      team_size,
      service_areas,
      business_address
    } = await request.json();

    // Basic validation
    if (!company_name || !contact_name || !email || !business_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // For now, we'll create a placeholder contractor record
    // In a full implementation, this would be tied to the authenticated user
    const contractorId = `contractor_${Date.now()}`;

    // Create contractor record
    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .insert({
        id: contractorId,
        phone: '+1234567890', // Placeholder - would come from session
        onboarding_completed: true,
        subscription_status: 'growth',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (contractorError) {
      console.error('Error creating contractor:', contractorError);
      return NextResponse.json(
        { error: 'Failed to create contractor profile' },
        { status: 500 }
      );
    }

    // Create contractor profile
    const { data: profile, error: profileError } = await supabase
      .from('contractor_profiles')
      .insert({
        contractor_id: contractorId,
        company_name,
        contact_name,
        email,
        business_type,
        services: services || [],
        license_number,
        years_experience: years_experience || 0,
        team_size: team_size || 1,
        service_areas: service_areas || [],
        business_address,
        profile_completion_score: 85,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating contractor profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to create contractor profile' },
        { status: 500 }
      );
    }

    // Create onboarding progress records
    const onboardingSteps = [
      'business_info',
      'services_selection',
      'location_setup',
      'profile_completion'
    ];

    const onboardingRecords = onboardingSteps.map(step => ({
      contractor_id: contractorId,
      step,
      completed: true,
      completed_at: new Date().toISOString()
    }));

    await supabase
      .from('onboarding_progress')
      .insert(onboardingRecords);

    return NextResponse.json({
      success: true,
      contractor,
      profile,
      message: 'Onboarding completed successfully'
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
