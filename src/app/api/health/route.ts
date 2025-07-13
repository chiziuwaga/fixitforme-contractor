import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = createClient();
    // Test basic Supabase connection with a simple query
    const { error } = await supabase
      .from('contractor_profiles')
      .select('count')
      .limit(1)

    if (error) {
      // If contractor_profiles doesn't exist yet, that's expected before schema deployment
      console.log('Database schema not yet deployed:', error.message)
      return NextResponse.json({
        status: 'partial',
        message: 'FixItForMe Contractor API is running - database schema needs deployment',
        supabase: 'connected',
        schema_deployed: false,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      status: 'success',
      message: 'FixItForMe Contractor API is running',
      supabase: 'connected',
      schema_deployed: true,
      timestamp: new Date().toISOString()
    })  } catch {
    return NextResponse.json(
      { error: 'API setup incomplete', details: 'Environment variables may be missing' },
      { status: 500 }
    )
  }
}
