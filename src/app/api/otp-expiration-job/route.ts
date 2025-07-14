import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServer';
import { trackWhatsAppOTPEvent } from '@/lib/analytics';

// This endpoint will be called by a scheduled job (Vercel Cron or external scheduler)
export async function GET(request: Request) {
  // Verify request comes from authorized source
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET_KEY || 'default-secret-key';
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = createAdminClient();
  
  try {
    // Find expired OTPs that haven't been tracked yet
    const { data: expiredOTPs, error } = await supabase
      .from('whatsapp_otps')
      .select('id, phone_number, created_at, expires_at')
      .lt('expires_at', new Date().toISOString());
      
    if (error) {
      console.error('[OTP Expiration Job] Error finding expired OTPs:', error);
      return NextResponse.json({ error: 'Failed to process expired OTPs' }, { status: 500 });
    }
    
    console.log(`[OTP Expiration Job] Found ${expiredOTPs?.length || 0} expired OTPs`);
    
    let processed = 0;
    
    // Track each expired OTP and clean up
    for (const otp of (expiredOTPs || [])) {
      try {
        // Track expiration
        await trackWhatsAppOTPEvent(otp.phone_number, 'expired', {
          otpId: otp.id,
          createdAt: otp.created_at,
          expiredAt: otp.expires_at,
          expirationReason: 'time_limit',
          timestamp: new Date().toISOString()
        });
        
        // Delete the expired OTP
        await supabase
          .from('whatsapp_otps')
          .delete()
          .eq('id', otp.id);
          
        processed++;
      } catch (err) {
        console.error(`[OTP Expiration Job] Error processing OTP ${otp.id}:`, err);
        // Continue with other OTPs even if one fails
      }
    }
    
    return NextResponse.json({
      success: true,
      processed,
      total: expiredOTPs?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[OTP Expiration Job] Error:', error);
    return NextResponse.json({ 
      error: 'Job execution failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Also support POST method for flexibility with different schedulers
export async function POST(request: Request) {
  return GET(request);
}
