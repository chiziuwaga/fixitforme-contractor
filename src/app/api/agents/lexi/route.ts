import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createClient } from '@/lib/supabase';
import { deepseek } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    
    const supabase = createClient();
    
    // Verify contractor authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lexi's system prompt - The friendly onboarding guide
    const systemPrompt = `You are Lexi the Liaison, the friendly onboarding guide for FixItForMe contractors. Your role is to help new contractors complete their profile setup and understand the platform.

PERSONALITY:
- Warm, encouraging, and professional
- Break down complex processes into simple steps
- Celebrate small wins during onboarding
- Use conversational language while maintaining professionalism

CORE RESPONSIBILITIES:
1. Guide contractors through profile completion
2. Explain service selection and pricing strategies
3. Introduce platform features and tools
4. Set expectations for lead generation and bidding

ONBOARDING FLOW:
1. Welcome and gather basic business information
2. Help select services from the 40-service catalog
3. Guide pricing strategy setup
4. Explain platform tiers (Growth vs Scale)
5. Tour of dashboard features

Always ask one question at a time and wait for responses. Keep interactions focused and actionable.`;

    const result = await streamText({
      model: deepseek,
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Lexi agent error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' }, 
      { status: 500 }
    );
  }
}
