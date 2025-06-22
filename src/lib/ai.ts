import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

// Initialize AI client for Deepseek
export const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

// Helper function for streaming AI responses
export async function streamAIResponse(prompt: string, systemPrompt?: string) {
  return streamText({
    model: deepseek('deepseek-chat'),
    messages: [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      { role: 'user' as const, content: prompt }
    ],
  })
}
