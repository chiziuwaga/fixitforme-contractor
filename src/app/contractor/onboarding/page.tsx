'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import Confetti from 'react-confetti'
import { cn } from '@/lib/utils'
import { useOnboarding } from '@/hooks/useOnboarding'

export default function OnboardingPage() {
  const {
    step,
    form,
    submitted,
    windowWidth,
    windowHeight,
    isSubmitting,
    steps,
    availableServices,
    handleNext,
    handlePrev,
    updateForm,
    toggleService,
    getProgress,
  } = useOnboarding()

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-dark via-secondary to-secondary-light flex items-center justify-center p-6">
      {submitted && <Confetti width={windowWidth} height={windowHeight} recycle={false} />}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-secondary-dark/30 rounded-xl p-8 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to FixItForMe!</h2>
        <p className="text-sm text-muted-foreground mb-6">Let&apos;s get you set up with a few quick steps. Lexi will guide you.</p>
        <Progress value={getProgress()} className="mb-6" aria-label="Onboarding progress" />
        
        <motion.div
          key={step}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={e => updateForm({ companyName: e.target.value })}
                  required
                  className="mt-1"
                  aria-required="true"
                />
              </div>
              <div>
                <Label htmlFor="contactName">Your Name</Label>
                <Input
                  id="contactName"
                  value={form.contactName}
                  onChange={e => updateForm({ contactName: e.target.value })}
                  required
                  className="mt-1"
                  aria-required="true"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => updateForm({ email: e.target.value })}
                  required
                  className="mt-1"
                  aria-required="true"
                />
              </div>
            </div>
          )}
          
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessType">Business Type</Label>
                <Input
                  id="businessType"
                  value={form.businessType}
                  onChange={e => updateForm({ businessType: e.target.value })}
                  placeholder="e.g., Plumbing, Electrical"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Years of Experience</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="5"
                  className="mt-1"
                  aria-label="Years of experience"
                />
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <Label>Select Your Services</Label>
              <div className="grid grid-cols-2 gap-3">
                {availableServices.map(service => (
                  <motion.div
                    key={service}
                    onClick={() => toggleService(service)}
                    whileHover={{ scale: 1.03 }}
                    className={cn(
                      'cursor-pointer p-3 border rounded-lg text-center select-none',
                      form.services.includes(service)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white/50 border-gray-200'
                    )}
                    tabIndex={0}
                    role="button"
                    aria-pressed={form.services.includes(service)}
                  >
                    {service}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-medium">Review Your Info</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>Company:</strong> {form.companyName}</li>
                <li><strong>Name:</strong> {form.contactName}</li>
                <li><strong>Email:</strong> {form.email}</li>
                <li><strong>Type:</strong> {form.businessType}</li>
                <li><strong>Services:</strong> {form.services.join(', ')}</li>
              </ul>
            </div>
          )}
          
          <div className="mt-6 flex justify-between">
            <Button 
              variant="outline" 
              disabled={step === 0 || isSubmitting} 
              onClick={handlePrev}
            >
              Back
            </Button>
            <Button 
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Setting up...
                </>
              ) : (
                step === steps.length - 1 ? 'Finish Setup' : 'Next Step'
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
