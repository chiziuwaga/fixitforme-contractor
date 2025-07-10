"use client"

import Image from "next/image"
import { useOnboarding } from "@/hooks/useOnboarding"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { OnboardingStep1 } from "@/components/onboarding/Step1-CompanyInfo"
import { OnboardingStep2 } from "@/components/onboarding/Step2-Services"
import { OnboardingStep3 } from "@/components/onboarding/Step3-Credentials"
import { OnboardingStep4 } from "@/components/onboarding/Step4-Confirmation"

export default function OnboardingPage() {
  const onboarding = useOnboarding()
  const { step, totalSteps, loading, progress, canContinue, nextStep, prevStep } = onboarding

  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } },
    exit: { opacity: 0, x: -50, transition: { ease: "easeInOut" as const } },
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <OnboardingStep1 {...onboarding} />
      case 2:
        return <OnboardingStep2 {...onboarding} />
      case 3:
        return <OnboardingStep3 {...onboarding} />
      case 4:
        return <OnboardingStep4 {...onboarding} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="FixItForMe Logo" width={60} height={60} />
        </div>
        <Card className="shadow-xl">
          <CardHeader>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center pt-3">
              Step {step} of {totalSteps}
            </p>
          </CardHeader>
          <CardContent className="py-10 px-8 min-h-[380px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full"
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
          <div className="border-t p-6 flex justify-between items-center">
            <Button variant="ghost" onClick={prevStep} disabled={step === 1 || loading}>
              Back
            </Button>
            <Button onClick={nextStep} disabled={!canContinue || loading}>
              {loading ? <Loader2 className="animate-spin" /> : step === totalSteps ? "Go to Dashboard" : "Continue"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
