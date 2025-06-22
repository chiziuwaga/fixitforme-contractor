import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

// Initialize AI client for Deepseek
const deepseekClient = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

// Export the deepseek model for use in agents
export const deepseek = deepseekClient('deepseek-chat')

// Helper function for streaming AI responses
export async function streamAIResponse(prompt: string, systemPrompt?: string) {
  return streamText({
    model: deepseek,
    messages: [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      { role: 'user' as const, content: prompt }
    ],
  })
}
