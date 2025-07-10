"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

export function AgentPrompts() {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="border-b border-info/20">
        <CardTitle className="text-xl font-semibold flex items-center gap-2 text-info-foreground">
          <User className="h-5 w-5 text-info" />
          Alex Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 text-center">
        <p className="text-info-foreground/70 mb-6">
          Ask @alex to analyze this job for competitive pricing and timeline estimates
        </p>
        <Button
          variant="outline"
          className="w-full border-info/30 text-info-foreground hover:bg-info/10 bg-transparent"
          onClick={() => {
            // TODO: Implement Alex analysis trigger
          }}
        >
          Get Alex&apos;s Analysis
        </Button>
      </CardContent>
    </Card>
  )
}
