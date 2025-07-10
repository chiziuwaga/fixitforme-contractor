"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Brain, Search } from "lucide-react"

interface AgentPromptsProps {
  onNext?: () => void
}

const AgentPrompts: React.FC<AgentPromptsProps> = () => {
  const agentOptions = [
    {
      name: "Alex",
      icon: <Brain className="h-5 w-5" />,
      description: "Get detailed cost breakdown and bidding strategy",
      prompt: "Analyze this kitchen remodel project for competitive bidding"
    },
    {
      name: "Rex", 
      icon: <Search className="h-5 w-5" />,
      description: "Research similar projects and market rates",
      prompt: "Find comparable kitchen remodel projects in Oakland Hills"
    },
    {
      name: "Lexi",
      icon: <MessageSquare className="h-5 w-5" />,
      description: "Get guidance on client communication and requirements",
      prompt: "Help me craft a winning proposal for this project"
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get AI Agent Assistance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Use our AI agents to improve your bid with cost analysis, market research, and proposal guidance.
        </p>
        
        <div className="grid gap-3">
          {agentOptions.map((agent) => (
            <Button
              key={agent.name}
              variant="outline"
              className="justify-start h-auto p-4 text-left"
              onClick={() => {
                // This would open the chat with the specific agent prompt
                console.log(`Opening ${agent.name} with prompt:`, agent.prompt)
              }}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {agent.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-sm text-muted-foreground">{agent.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default AgentPrompts
