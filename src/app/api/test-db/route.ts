import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    // Test basic database access
    const { data, error } = await supabase
      .from('contractor_profiles')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      return NextResponse.json({ 
        error: 'Database access failed', 
        details: error 
      }, { status: 500 });
    }
    
    // Test whatsapp_otps table access
    const { error: otpError } = await supabase
      .from('whatsapp_otps')
      .select('count(*)')
      .limit(1);
    
    return NextResponse.json({
      success: true,
      database_access: 'working',
      contractor_profiles_accessible: !!data,
      whatsapp_otps_accessible: !otpError,
      whatsapp_otps_error: otpError
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Database test failed', 
      details: error 
    }, { status: 500 });
  }
}
