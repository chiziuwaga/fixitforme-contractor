import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test Supabase connection
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json(
        { error: 'Supabase connection failed', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'success',
      message: 'FixItForMe Contractor API is running',
      supabase: 'connected',
      timestamp: new Date().toISOString()
    })  } catch {
    return NextResponse.json(
      { error: 'API setup incomplete', details: 'Environment variables may be missing' },
      { status: 500 }
    )
  }
}
