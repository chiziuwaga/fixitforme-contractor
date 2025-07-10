"use client"

import type React from "react"
import { useFormik } from "formik"
import * as yup from "yup"
import { useJobBidContext } from "@/contexts/JobBidContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AgentPromptsProps {
  onNext: () => void
}

const validationSchema = yup.object({
  agent_introduction: yup.string().required("Agent Introduction is required"),
  reason_to_hire: yup.string().required("Reason to Hire is required"),
  relevant_experience: yup.string().required("Relevant Experience is required"),
})

const AgentPrompts: React.FC<AgentPromptsProps> = ({ onNext }) => {
  const { jobBid, updateJobBid } = useJobBidContext()

  const formik = useFormik({
    initialValues: {
      agent_introduction: jobBid?.agent_introduction || "",
      reason_to_hire: jobBid?.reason_to_hire || "",
      relevant_experience: jobBid?.relevant_experience || "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      updateJobBid({
        ...jobBid,
        agent_introduction: values.agent_introduction,
        reason_to_hire: values.reason_to_hire,
        relevant_experience: values.relevant_experience,
      })
      onNext()
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Prompts</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Agent prompts for bidding will be here.</p>
      </CardContent>
    </Card>
  )
}

export default AgentPrompts
