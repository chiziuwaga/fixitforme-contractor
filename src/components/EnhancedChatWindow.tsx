"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Minus, X, Loader2, Bot, User } from "lucide-react"
import {
  AlexCostBreakdown,
  RexLeadDashboard,
  LexiOnboarding,
  UpgradePrompt,
  SystemMessage,
} from "@/components/ui/AgentComponents"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export type AgentType = "lexi" | "alex" | "rex"

export interface Message {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  timestamp: Date
  agentType?: AgentType
  ui_assets?: {
    type: string
    data: Record<string, unknown>
  }
  actions?: Array<{
    type: string
    label: string
    style: "primary" | "secondary" | "outline"
  }>
  follow_up_prompts?: string[]
}

export interface ChatWindowProps {
  agentType: AgentType
  messages: Message[]
  onSendMessage: (message: string, agentType: AgentType) => Promise<void>
  isMinimized?: boolean
  onMinimize: () => void
  onClose: () => void
  isTyping?: boolean
}

const AGENT_CONFIG = {
  lexi: { name: "Lexi", color: "bg-primary", avatar: <Bot /> },
  alex: { name: "Alex", color: "bg-green-600", avatar: <Bot /> },
  rex: { name: "Rex", color: "bg-secondary", avatar: <Bot /> },
}

function GenerativeUIRenderer({ ui_assets }: { ui_assets: Message["ui_assets"] }) {
  if (!ui_assets) return null

  // Use type assertion for dynamic UI assets
  const data = ui_assets.data as Record<string, unknown>

  switch (ui_assets.type) {
    case "alex_cost_breakdown":
    case "alex_timeline_chart":
    case "alex_material_calculator":
    case "alex_competitive_analysis":
      return <AlexCostBreakdown data={data as Parameters<typeof AlexCostBreakdown>[0]['data']} />
    case "rex_lead_dashboard":
      return <RexLeadDashboard data={data as Parameters<typeof RexLeadDashboard>[0]['data']} />
    case "lexi_onboarding":
      return <LexiOnboarding data={data as Parameters<typeof LexiOnboarding>[0]['data']} />
    case "upgrade_prompt":
      return <UpgradePrompt data={data as Parameters<typeof UpgradePrompt>[0]['data']} />
    case "system_message":
      return <SystemMessage message={data.message as string} />
    default:
      return (
        <div className="p-2 my-2 text-xs bg-red-100 border border-red-300 rounded-md">
          Unknown UI asset type: {ui_assets.type}
        </div>
      )
  }
}

export function ChatWindow({
  agentType,
  messages,
  onSendMessage,
  isMinimized,
  onMinimize,
  onClose,
  isTyping = false,
}: ChatWindowProps) {
  const viewport = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState("")
  const config = AGENT_CONFIG[agentType]

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputValue.trim() || isTyping) return
    await onSendMessage(inputValue, agentType)
    setInputValue("")
  }

  const handlePromptClick = async (prompt: string) => {
    if (!isTyping) {
      await onSendMessage(prompt, agentType)
    }
  }

  // Handle window resize and overflow
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
      
      // Auto-minimize on mobile when multiple chats open
      if (isMobile && !isMinimized) {
        const openChats = document.querySelectorAll('[data-chat-window]').length
        if (openChats > 1) {
          onMinimize()
        }
      }
      
      // Adjust height on tablet to prevent overflow
      if (isTablet && viewport.current) {
        const maxHeight = window.innerHeight * 0.7
        viewport.current.style.maxHeight = `${maxHeight}px`
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Initial check
    
    return () => window.removeEventListener('resize', handleResize)
  }, [isMinimized, onMinimize])

  // Auto-scroll with better handling for UI assets
  useEffect(() => {
    if (viewport.current) {
      const scrollToBottom = () => {
        // Check if user is near bottom before auto-scrolling
        const { scrollTop, scrollHeight, clientHeight } = viewport.current!
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100
        
        if (isNearBottom) {
          viewport.current!.scrollTo({ 
            top: scrollHeight, 
            behavior: "smooth" 
          })
        }
      }
      
      // Delay for UI asset rendering
      setTimeout(scrollToBottom, 100)
    }
  }, [messages])

  const lastMessage = messages[messages.length - 1]

  // Chat window UI rendering

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed bottom-24 right-6 w-[400px] bg-card border rounded-xl shadow-lg flex flex-col overflow-hidden",
        isMinimized ? "h-16" : "h-[600px]",
      )}
    >
      <header className={cn("flex items-center p-3 border-b text-white", config.color)}>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 bg-white/20">
            <AvatarFallback className="bg-transparent text-white">{config.avatar}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold">{config.name}</h3>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Button variant="ghost" size="icon" onClick={onMinimize} className="h-8 w-8 text-white hover:bg-white/20">
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-white hover:bg-white/20">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-1 bg-muted/20"
          >
            <ScrollArea className="flex-1 p-4" ref={viewport}>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex items-start gap-3", message.role === "user" && "justify-end")}
                  >
                    {message.role === "assistant" && (
                      <Avatar className={cn("h-7 w-7 text-white", config.color)}>
                        <AvatarFallback className="bg-transparent">{config.avatar}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-lg p-3 max-w-[85%] text-sm",
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border",
                      )}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      {message.ui_assets && <GenerativeUIRenderer ui_assets={message.ui_assets} />}
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-7 w-7 bg-muted">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-3">
                    <Avatar className={cn("h-7 w-7 text-white", config.color)}>
                      <AvatarFallback className="bg-transparent">{config.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2 p-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {lastMessage?.role === "assistant" && lastMessage.follow_up_prompts && (
              <div className="p-3 border-t">
                <div className="flex flex-wrap gap-2">
                  {lastMessage.follow_up_prompts.map((prompt, i) => (
                    <Button key={i} variant="outline" size="sm" onClick={() => handlePromptClick(prompt)}>
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t p-3 bg-card">
              <form onSubmit={handleFormSubmit} className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Message @${agentType}...`}
                  disabled={isTyping}
                />
                <Button type="submit" size="icon" disabled={!inputValue.trim() || isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
