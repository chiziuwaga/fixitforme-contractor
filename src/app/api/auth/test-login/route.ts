import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

/**
 * Test Authentication Endpoint
 * 
 * This endpoint provides a test login system that bypasses WhatsApp verification
 * for development and testing purposes. It creates a test contractor account
 * or logs in an existing test account.
 * 
 * TEST PHONE NUMBERS:
 * - +1234567890 (basic test contractor)
 * - +1234567891 (premium test contractor)
 * - +1234567892 (test contractor with completed profile)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Only allow specific test phone numbers in test mode
    const testPhones = ['+1234567890', '+1234567891', '+1234567892'];
    if (!testPhones.includes(phone)) {
      return NextResponse.json({ 
        error: 'Invalid test phone number. Use +1234567890, +1234567891, or +1234567892' 
      }, { status: 400 });
    }

    // Create a test user session
    const testUserId = `test-${phone.replace(/\+/g, '')}`;
    
    // Check if test contractor already exists
    const { data: existingContractor, error: checkError } = await supabase
      .from('contractor_profiles')
      .select('*')
      .eq('contact_phone', phone)
      .single();

    let contractorProfile;
    let isNewUser = false;

    if (checkError && checkError.code === 'PGRST116') {
      // Create new test contractor
      isNewUser = true;
      
      // Determine test contractor profile based on phone number
      let testProfile;
      switch (phone) {
        case '+1234567890':
          testProfile = {
            company_name: 'Test Contracting LLC',
            services_offered: ['plumbing', 'electrical', 'hvac'],
            business_license: 'TEST-123456',
            tier: 'growth',
            profile_score: 25
          };
          break;
        case '+1234567891':
          testProfile = {
            company_name: 'Premium Test Services',
            services_offered: ['plumbing', 'electrical', 'hvac', 'roofing'],
            business_license: 'TEST-789012',
            tier: 'scale',
            profile_score: 40
          };
          break;
        case '+1234567892':
          testProfile = {
            company_name: 'Complete Test Solutions',
            services_offered: ['plumbing', 'electrical', 'hvac', 'roofing', 'flooring'],
            business_license: 'TEST-345678',
            tier: 'growth',
            profile_score: 85,
            onboarding_completed: true,
            service_areas: ['Oakland, CA', 'San Francisco, CA']
          };
          break;
        default:
          testProfile = {
            tier: 'growth',
            profile_score: 20
          };
      }

      const { data: newContractor, error: createError } = await supabase
        .from('contractor_profiles')
        .insert({
          id: testUserId,
          user_id: testUserId,
          contact_phone: phone,
          created_at: new Date().toISOString(),
          onboarding_completed: testProfile.onboarding_completed || false,
          ...testProfile
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating test contractor:', createError);
        return NextResponse.json(
          { error: 'Failed to create test contractor profile' }, 
          { status: 500 }
        );
      }

      contractorProfile = newContractor;

      // Create initial onboarding progress
      if (!testProfile.onboarding_completed) {
        await supabase
          .from('onboarding_progress')
          .insert({
            contractor_id: testUserId,
            step: 'phone_verification',
            completed: true,
            completed_at: new Date().toISOString()
          });
      }

      // For completed profile, add all onboarding steps
      if (testProfile.onboarding_completed) {
        const onboardingSteps = [
          'phone_verification',
          'business_info',
          'services_selection',
          'license_verification',
          'insurance_verification',
          'profile_completion'
        ];

        const onboardingRecords = onboardingSteps.map(step => ({
          contractor_id: testUserId,
          step,
          completed: true,
          completed_at: new Date().toISOString()
        }));

        await supabase
          .from('onboarding_progress')
          .insert(onboardingRecords);
      }

    } else if (existingContractor) {
      contractorProfile = existingContractor;
    } else {
      console.error('Error checking contractor:', checkError);
      return NextResponse.json(
        { error: 'Failed to check contractor profile' }, 
        { status: 500 }
      );
    }

    // Create a mock session object for test purposes
    const testSession = {
      access_token: `test-token-${Date.now()}`,
      refresh_token: `test-refresh-${Date.now()}`,
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: testUserId,
        phone: phone,
        user_metadata: {
          platform: 'FixItForMe Contractor',
          role: 'contractor'
        }
      }
    };

    return NextResponse.json({
      message: 'Test login successful',
      user: testSession.user,
      session: testSession,
      contractor_profile: contractorProfile,
      is_new_user: isNewUser,
      is_test_mode: true,
      redirect_url: contractorProfile.onboarding_completed 
        ? '/contractor/dashboard' 
        : '/contractor/onboarding'
    });

  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
