import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { DEMO_CONFIG, createDemoResponse } from '@/lib/demo-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // DEMO MODE: Return mock leads
    if (DEMO_CONFIG.DEMO_MODE) {
      console.log('[DEMO] Returning mock leads data');
      
      await createDemoResponse(null, 800); // Simulate API delay
      
      return NextResponse.json({ 
        leads: DEMO_CONFIG.DEMO_LEADS,
        demo: true,
        message: 'Demo leads data' 
      });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Get contractor profile to filter leads by services and service areas
    const { data: profile, error: profileError } = await supabase
      .from('contractor_profiles')
      .select('services_offered, service_areas')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching contractor profile:', profileError);
      return new NextResponse(JSON.stringify({ error: 'Profile not found' }), { status: 404 });
    }

    // Fetch leads relevant to the contractor's profile
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      // .contains('service_requirements', profile.services_offered || []) // TODO: Fix this filter
      // .overlaps('service_areas', profile.service_areas || [])
      .order('posted_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching leads:', error);
      return new NextResponse(JSON.stringify({ error: 'Failed to fetch leads' }), { status: 500 });
    }

    return new NextResponse(JSON.stringify(leads || []), { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
