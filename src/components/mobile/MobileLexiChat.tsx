"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Send, 
  Monitor, 
  ArrowRight,
  Smartphone
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getStoredJSON, setStoredJSON } from "@/lib/safeStorage"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  requiresDesktop?: boolean
  onboardingStep?: string
}

const MOBILE_ONBOARDING_STEPS = [
  'company_info',
  'contact_details', 
  'service_areas',
  'basic_profile'
]

const DESKTOP_REQUIRED_INTENTS = [
  'detailed_bidding',
  'document_analysis',
  'complex_calculations',
  'multi_agent_workflow',
  'advanced_analytics',
  'rex_lead_generation',
  'alex_cost_analysis'
]

export function MobileLexiChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Mark as client-side ready
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Load previous chat from mobile storage (client-side only)
    if (!isClient || typeof window === 'undefined') return
    
    const savedChat = getStoredJSON('mobile_lexi_chat', [])
    if (savedChat.length > 0) {
      setMessages(savedChat)
    } else {
      // Initial welcome message
      addLexiMessage(
        `Hi there! 👋 I'm Lexi, your mobile assistant. I can help you get started with basic onboarding on mobile, but for advanced features like detailed bidding and document analysis, you'll want to switch to desktop.\n\nWhat would you like to start with today?`,
        false,
        'mobile_welcome'
      )
    }
  }, [isClient]) // Include isClient dependency

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Save chat to mobile storage (client-side only)
    if (!isClient || typeof window === 'undefined') return
    setStoredJSON('mobile_lexi_chat', messages)
  }, [messages, isClient]) // Include isClient dependency

  const addLexiMessage = (content: string, requiresDesktop = false, step?: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: Date.now(),
      requiresDesktop,
      onboardingStep: step
    }
    setMessages(prev => [...prev, message])
  }

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'user', 
      content,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, message])
  }

  const detectIntent = (userMessage: string): { requiresDesktop: boolean; intent: string } => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Check for desktop-required intents
    for (const intent of DESKTOP_REQUIRED_INTENTS) {
      if (lowerMessage.includes(intent.replace('_', ' '))) {
        return { requiresDesktop: true, intent }
      }
    }

    // Check for mobile-friendly intents
    if (lowerMessage.includes('onboard') || lowerMessage.includes('start') || lowerMessage.includes('setup')) {
      return { requiresDesktop: false, intent: 'mobile_onboarding' }
    }

    if (lowerMessage.includes('company') || lowerMessage.includes('business')) {
      return { requiresDesktop: false, intent: 'company_info' }
    }

    if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      return { requiresDesktop: false, intent: 'contact_details' }
    }

    if (lowerMessage.includes('area') || lowerMessage.includes('location') || lowerMessage.includes('service')) {
      return { requiresDesktop: false, intent: 'service_areas' }
    }

    return { requiresDesktop: false, intent: 'general' }
  }

  const generateLexiResponse = (userMessage: string, intent: string, requiresDesktop: boolean): string => {
    if (requiresDesktop) {
      return `I'd love to help with ${intent.replace('_', ' ')}, but that requires our full desktop tools! 🖥️\n\nOn mobile, I can help you with:\n• Basic company setup\n• Contact information\n• Service areas\n• Profile basics\n\nFor detailed bidding, document analysis, and AI tools like Rex and Alex, you'll get the best experience on desktop. Want to continue with mobile setup for now?`
    }

    switch (intent) {
      case 'mobile_onboarding':
        return `Perfect! Let's get you started with mobile onboarding. 📱\n\nI'll help you set up the basics:\n\n✅ Company information\n✅ Contact details\n✅ Service areas\n✅ Basic profile\n\nLet's start with your company name. What should I call your business?`

      case 'company_info':
        return `Great! Let me help you with your company information. 🏢\n\nI'll need:\n• Company name\n• Business type (LLC, Corp, etc.)\n• Years in business\n• Brief description\n\nWhat's your company name?`

      case 'contact_details':
        return `Let's set up your contact information! 📞\n\nI'll need:\n• Primary phone number\n• Email address\n• Business address\n• Emergency contact\n\nWhat's your primary business phone number?`

      case 'service_areas':
        return `Time to define where you work! 📍\n\nI can help you set up:\n• Primary service areas\n• Travel radius\n• Preferred regions\n• Service limitations\n\nWhat cities or areas do you primarily serve?`

      default:
        return `I'm here to help with your mobile onboarding! 😊\n\nI can assist with:\n• Company setup\n• Contact information\n• Service areas\n• Basic profile questions\n\nFor advanced features like bidding tools, document analysis, and our AI agents Rex and Alex, you'll want to use the full desktop platform.\n\nWhat would you like to work on?`
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    addUserMessage(userMessage)
    setInput("")
    setIsTyping(true)

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000))

    const { requiresDesktop, intent } = detectIntent(userMessage)
    const response = generateLexiResponse(userMessage, intent, requiresDesktop)
    
    addLexiMessage(response, requiresDesktop, intent)
    setIsTyping(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Mobile Chat Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm">
              👋
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span>Lexi - Mobile Assistant</span>
                <Badge variant="outline" className="text-xs">
                  <Smartphone className="h-3 w-3 mr-1" />
                  Mobile
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-normal">
                Basic onboarding • Desktop for advanced features
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm flex-shrink-0">
                  👋
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground ml-auto' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Desktop redirect for complex requests */}
                {message.requiresDesktop && (
                  <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
                    <div className="flex items-center gap-2 text-orange-700">
                      <Monitor className="h-4 w-4" />
                      <span className="text-xs font-medium">Desktop Required</span>
                    </div>
                    <Button size="sm" variant="outline" className="mt-2 w-full" asChild>
                      <a href="https://fixitforme.ai" target="_blank" rel="noopener noreferrer">
                        Continue on Desktop
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                )}

                {/* Onboarding progress */}
                {message.onboardingStep && MOBILE_ONBOARDING_STEPS.includes(message.onboardingStep) && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Step {MOBILE_ONBOARDING_STEPS.indexOf(message.onboardingStep) + 1} of {MOBILE_ONBOARDING_STEPS.length}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white text-sm flex-shrink-0">
                  👤
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm">
              👋
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Mobile Input Area */}
      <div className="border-t bg-card p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Lexi about basic setup..."
              className="w-full p-3 border rounded-lg resize-none bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] max-h-[120px]"
              rows={1}
            />
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            size="sm"
            className="h-11 px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick action buttons */}
        <div className="mt-3 flex gap-2 overflow-x-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setInput("Help me get started with onboarding")}
          >
            Start Onboarding
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setInput("Set up my company information")}
          >
            Company Setup
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setInput("I need help with bidding")}
          >
            Bidding Help
          </Button>
        </div>
      </div>
    </div>
  )
}
