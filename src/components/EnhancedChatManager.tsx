"use client"

import { useState, useCallback, useEffect } from "react"
import { useChat, type Message as VercelMessage } from "ai/react"
import { ChatWindow, type AgentType, type Message } from "./EnhancedChatWindow"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Lock, MessageCircle, Calculator, Search } from "lucide-react"
import { useUser } from "@/providers/UserProvider"
import { useConcurrentExecutionManager } from "@/components/ui/ConcurrentExecutionManager"
import { useNotifications } from "@/components/ui/NotificationCenter"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChatState {
  isOpen: boolean
  isMinimized: boolean
  messages: Message[]
}

type ChatStates = Record<AgentType, ChatState>

export default function EnhancedChatManager() {
  const { profile } = useUser()
  const { activeSessions, startExecution, endExecution, canStartNew } = useConcurrentExecutionManager()
  const { addNotification, removeNotification } = useNotifications()
  const router = useRouter()

  const isScaleTier = profile?.subscription_tier === "scale"
  const messagesPerChatLimit = isScaleTier ? 200 : 50

  const [chatStates, setChatStates] = useState<ChatStates>({
    lexi: { isOpen: true, isMinimized: false, messages: [] },
    alex: { isOpen: false, isMinimized: false, messages: [] },
    rex: { isOpen: false, isMinimized: false, messages: [] },
  })

  const onFinish = (agent: AgentType, message: VercelMessage) => {
    endExecution(agent)
    try {
      const parsed = JSON.parse(message.content)
      const newMessage: Message = {
        id: message.id,
        role: "assistant",
        content: parsed.message,
        ui_assets: parsed.ui_assets,
        actions: parsed.actions,
        timestamp: new Date(),
      }
      setChatStates((prev) => ({
        ...prev,
        [agent]: { ...prev[agent], messages: [...prev[agent].messages, newMessage] },
      }))

      if (agent === "rex" && parsed.ui_assets?.type === "lead_dashboard") {
        addNotification({
          type: "success",
          title: "Rex found new leads!",
          message: "Your new leads have been added to your dashboard.",
          action: {
            label: "View Dashboard",
            onClick: () => router.push("/contractor/dashboard"),
          },
        })
      }
    } catch (e) {
      console.error("Failed to parse AI JSON response:", e)
      setChatStates((prev) => ({
        ...prev,
        [agent]: {
          ...prev[agent],
          messages: [
            ...prev[agent].messages,
            {
              id: message.id,
              role: "assistant",
              content: "I encountered an issue generating a response. Please try again.",
              timestamp: new Date(),
            },
          ],
        },
      }))
    }
  }

  const lexiChat = useChat({ api: "/api/agents/lexi", id: "lexi", onFinish: (msg) => onFinish("lexi", msg) })
  const alexChat = useChat({ api: "/api/agents/alex", id: "alex", onFinish: (msg) => onFinish("alex", msg) })
  const rexChat = useChat({ api: "/api/agents/rex", id: "rex", onFinish: (msg) => onFinish("rex", msg) })

  const getChatInstance = (agentType: AgentType) => {
    if (agentType === "alex") return alexChat
    if (agentType === "rex") return rexChat
    return lexiChat
  }

  const handleSendMessage = async (message: string, agentType: AgentType) => {
    const chatInstance = getChatInstance(agentType)
    const userMessages = chatStates[agentType].messages.filter((m) => m.role === "user").length

    if (userMessages >= messagesPerChatLimit) {
      toast.error("Message limit reached for this chat.")
      return
    }

    const isPremiumAgent = agentType === "alex" || agentType === "rex"
    if (isPremiumAgent) {
      if (!canStartNew) {
        toast.warning("Agent execution limit reached.", {
          description: "You can only run 2 premium agents at a time.",
        })
        return
      }
      const executionId = await startExecution(agentType, 300000) // 5 min timeout
      addNotification({
        id: executionId,
        type: "info",
        title: `@${agentType} is working...`,
        message: "You will be notified when the task is complete.",
        autoClose: false,
      })
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date(),
    }
    setChatStates((prev) => ({
      ...prev,
      [agentType]: { ...prev[agentType], messages: [...prev[agentType].messages, userMessage] },
    }))

    chatInstance.append({ role: "user", content: message })
  }

  useEffect(() => {
    activeSessions.forEach((session) => {
      if (session.status === "finished" || session.status === "failed") {
        removeNotification(session.id)
      }
    })
  }, [activeSessions, removeNotification])

  const toggleChat = useCallback(
    (agentType: AgentType) => {
      const isPremiumAgent = agentType === "alex" || agentType === "rex"
      if (isPremiumAgent && !isScaleTier) {
        toast.warning(`@${agentType} is a premium feature.`, {
          description: "Upgrade to the Scale tier for advanced capabilities.",
          action: { label: "Upgrade", onClick: () => router.push("/contractor/settings") },
        })
        return
      }

      setChatStates((prev) => {
        const currentState = prev[agentType]
        if (currentState.isOpen && currentState.isMinimized) {
          return { ...prev, [agentType]: { ...currentState, isMinimized: false } }
        }
        return {
          ...prev,
          [agentType]: { ...currentState, isOpen: !currentState.isOpen, isMinimized: false },
        }
      })
    },
    [isScaleTier, router],
  )

  const minimizeChat = useCallback((agentType: AgentType) => {
    setChatStates((prev) => ({
      ...prev,
      [agentType]: { ...prev[agentType], isMinimized: !prev[agentType].isMinimized },
    }))
  }, [])

  const isAgentExecuting = (agentType: AgentType): boolean => {
    const chatInstance = getChatInstance(agentType)
    const hasActiveSession = activeSessions.some((s) => s.agent === agentType && s.status === "running")
    return chatInstance.isLoading || hasActiveSession
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enhanced Chat Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="fixed bottom-20 right-4 z-50 space-y-3">
          {(Object.keys(chatStates) as AgentType[]).map((agentType) => {
            if (!chatStates[agentType].isOpen) return null
            return (
              <ChatWindow
                key={agentType}
                agentType={agentType}
                messages={chatStates[agentType].messages}
                onSendMessage={handleSendMessage}
                onClose={() => toggleChat(agentType)}
                onMinimize={() => minimizeChat(agentType)}
                isMinimized={chatStates[agentType].isMinimized}
                isTyping={isAgentExecuting(agentType)}
              />
            )
          })}
        </div>

        <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-3">
          <TooltipProvider>
            {(["lexi", "alex", "rex"] as AgentType[]).map((agent, index) => {
              const isPremium = agent !== "lexi"
              const isDisabled = isPremium && !isScaleTier
              const Icon = agent === "lexi" ? MessageCircle : agent === "alex" ? Calculator : Search
              const color = agent === "lexi" ? "bg-primary" : agent === "alex" ? "bg-green-600" : "bg-blue-600"

              return (
                <Tooltip key={agent}>
                  <TooltipTrigger asChild>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 * (index + 1) }}>
                      <Button
                        onClick={() => toggleChat(agent)}
                        className={cn(
                          "h-14 w-14 rounded-full text-white shadow-lg",
                          isDisabled ? "bg-muted cursor-not-allowed" : color,
                        )}
                        disabled={isDisabled}
                      >
                        {isDisabled ? <Lock className="h-5 w-5" /> : <Icon className="h-6 w-6" />}
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>{isDisabled ? `Upgrade to use @${agent}` : `Chat with @${agent}`}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  )
}
