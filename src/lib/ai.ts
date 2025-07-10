import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

// Validate environment variables
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

if (!DEEPSEEK_API_KEY) {
  throw new Error("Missing DEEPSEEK_API_KEY environment variable")
}

// Initialize AI client for Deepseek
export const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
})

// Helper function for streaming AI responses
export async function streamAIResponse(prompt: string, systemPrompt?: string) {
  return streamText({
    model: deepseek,
    messages: [
      ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
      { role: "user" as const, content: prompt },
    ],
  })
}
