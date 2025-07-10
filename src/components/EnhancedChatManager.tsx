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
import { isAgentExecuting } from "@/utils/agentUtils" // Declare or import the variable here

interface ChatState {
  isOpen: boolean
  isMinimized: boolean
  messages: Message[]
}

type ChatStates = Record<AgentType, ChatState>

export function EnhancedChatManager() {
  const { profile } = useUser()
  const { activeSessions, startExecution, endExecution, canStartNew } = useConcurrentExecutionManager()
  const { addNotification, removeNotification } = useNotifications()
  const router = useRouter()

  const isScaleTier = profile?.subscription_tier === "scale"
  const chatThreadLimit = isScaleTier ? 30 : 10
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

      // Rex lead generation notification
      if (agent === "rex" && parsed.ui_assets?.type === "lead_dashboard") {
        addNotification({
          type: "success",
          title: "Rex found new leads!",
          message: "Your new leads have been added to your dashboard.",
          autoClose: false,
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
    if (agentType === "lexi") return lexiChat
    if (agentType === "alex") return alexChat
    return rexChat
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

  // Remove "working" notification when agent finishes
  useEffect(() => {
    const finishedAgents = ["lexi", "alex", "rex"].filter(
      (agent) => !activeSessions.some((s) => s.agent === agent && s.status === "running"),
    )
    activeSessions.forEach((session) => {
      if (session.status === "finished") {
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

  return (
    <>
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-3">
        {(Object.keys(chatStates) as AgentType[]).map((agentType) => {
          if (!chatStates[agentType].isOpen) return null
          const isExecuting = getChatInstance(agentType).isLoading || isAgentExecuting(agentType)
          return (
            <ChatWindow
              key={agentType}
              agentType={agentType}
              messages={chatStates[agentType].messages}
              onSendMessage={handleSendMessage}
              onClose={() => toggleChat(agentType)}
              onMinimize={() => minimizeChat(agentType)}
              isMinimized={chatStates[agentType].isMinimized}
              isTyping={isExecuting}
            />
          )
        })}
      </div>

      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
                <Button
                  onClick={() => toggleChat("lexi")}
                  className="h-14 w-14 rounded-full bg-primary text-white shadow-lg"
                >
                  <MessageCircle className="h-6 w-6" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Chat with Lexi</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                <Button
                  onClick={() => toggleChat("alex")}
                  className={cn(
                    "h-14 w-14 rounded-full bg-green-600 text-white shadow-lg",
                    !isScaleTier && "bg-muted cursor-not-allowed",
                  )}
                  disabled={!isScaleTier}
                >
                  {isScaleTier ? <Calculator className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isScaleTier ? "Chat with Alex" : "Upgrade to use Alex"}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
                <Button
                  onClick={() => toggleChat("rex")}
                  className={cn(
                    "h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg",
                    !isScaleTier && "bg-muted cursor-not-allowed",
                  )}
                  disabled={!isScaleTier}
                >
                  {isScaleTier ? <Search className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isScaleTier ? "Chat with Rex" : "Upgrade to use Rex"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  )
}
