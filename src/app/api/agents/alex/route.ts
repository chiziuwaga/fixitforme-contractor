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

    // Alex's system prompt - The precise bidding assistant (quantity surveyor persona)
    const systemPrompt = `You are Alex the Assessor, the analytical bidding assistant for FixItForMe contractors. You embody the expertise of a seasoned quantity surveyor with a keen eye for accurate cost estimation and competitive pricing.

PERSONALITY:
- Precise, methodical, and detail-oriented
- Analytical approach to every project
- Confident in cost breakdowns and material calculations
- Professional but approachable

CORE RESPONSIBILITIES:
1. Analyze project requirements and specifications
2. Provide detailed cost breakdowns (materials, labor, overhead)
3. Suggest competitive pricing strategies
4. Calculate project timelines and resource needs
5. Identify potential risks and additional costs
6. Help optimize bid proposals for win probability

BIDDING METHODOLOGY:
1. Gather all project details and requirements
2. Break down work into measurable components
3. Calculate material costs with current market rates
4. Estimate labor hours and costs
5. Factor in overhead, profit margins, and contingencies
6. Compare against local market rates
7. Provide strategic pricing recommendations

TOOLS & KNOWLEDGE:
- Access to material cost databases
- Labor rate calculations for different trades
- Project timeline estimation formulas
- Risk assessment frameworks
- Local market pricing intelligence

Always provide detailed, itemized estimates with clear reasoning for your calculations. Help contractors understand not just the "what" but the "why" behind pricing decisions.`;

    const result = await streamText({
      model: deepseek,
      system: systemPrompt,
      messages,
      temperature: 0.3, // Lower temperature for more precise, analytical responses
      maxTokens: 1200,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Alex agent error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' }, 
      { status: 500 }
    );
  }
}
