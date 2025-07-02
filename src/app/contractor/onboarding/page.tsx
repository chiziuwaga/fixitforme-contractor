'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  Award, 
  MapPin, 
  Check, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Shield,
  Users,
  TrendingUp,
  Bot,
  Rocket,
  Star,
  Zap,
  Heart
} from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OnboardingData {
  company_name: string;
  contact_name: string;
  email: string;
  business_type: string;
  services: string[];
  license_number: string;
  years_experience: number;
  team_size: number;
  service_areas: string[];
  insurance_verified: boolean;
  business_address: string;
}

const SERVICE_OPTIONS = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'kitchen_remodeling', label: 'Kitchen Remodeling' },
  { value: 'bathroom_renovation', label: 'Bathroom Renovation' },
  { value: 'painting', label: 'Painting' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'general_contracting', label: 'General Contracting' }
];

const BUSINESS_TYPES = [
  { value: 'sole_proprietor', label: 'Sole Proprietor' },
  { value: 'llc', label: 'LLC' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'partnership', label: 'Partnership' }
];

export default function ContractorOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    company_name: '',
    contact_name: '',
    email: '',
    business_type: '',
    services: [],
    license_number: '',
    years_experience: 0,
    team_size: 1,
    service_areas: [],
    insurance_verified: false,
    business_address: ''
  });

  const updateFormData = (field: keyof OnboardingData, value: string | string[] | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/contractor/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Welcome to FixItForMe!', {
          description: 'Your contractor profile has been created successfully.'
        });
        
        // Redirect to dashboard
        window.location.href = '/contractor/dashboard';
      } else {
        throw new Error('Failed to complete onboarding');
      }
    } catch {
      toast.error('Error', {
        description: 'Failed to complete onboarding. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Company Information</h3>
              <p className="text-sm text-muted-foreground">Tell us about your business</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                placeholder="Enter your company name"
                value={formData.company_name}
                onChange={(e) => updateFormData('company_name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_name">Contact Name</Label>
              <Input
                id="contact_name"
                placeholder="Your full name"
                value={formData.contact_name}
                onChange={(e) => updateFormData('contact_name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="your@email.com"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="business_type">Business Type</Label>
              <Select value={formData.business_type} onValueChange={(value) => updateFormData('business_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your business structure" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Services & Expertise</h3>
              <p className="text-sm text-muted-foreground">What services do you provide?</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="services">Services Offered</Label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_OPTIONS.map((service) => (
                  <div key={service.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={service.value}
                      checked={formData.services.includes(service.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData('services', [...formData.services, service.value]);
                        } else {
                          updateFormData('services', formData.services.filter(s => s !== service.value));
                        }
                      }}
                    />
                    <Label htmlFor={service.value} className="text-sm font-normal">
                      {service.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="years_experience">Years of Experience</Label>
                <Input
                  id="years_experience"
                  type="number"
                  placeholder="0"
                  min="0"
                  max="50"
                  value={formData.years_experience}
                  onChange={(e) => updateFormData('years_experience', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="team_size">Team Size</Label>
                <Input
                  id="team_size"
                  type="number"
                  placeholder="1"
                  min="1"
                  max="100"
                  value={formData.team_size}
                  onChange={(e) => updateFormData('team_size', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                placeholder="Enter your contractor license number"
                value={formData.license_number}
                onChange={(e) => updateFormData('license_number', e.target.value)}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Service Areas</h3>
              <p className="text-sm text-muted-foreground">Where do you provide services?</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="business_address">Business Address</Label>
              <Textarea
                id="business_address"
                placeholder="Enter your business address"
                value={formData.business_address}
                onChange={(e) => updateFormData('business_address', e.target.value)}
                rows={2}
                className="min-h-[60px]"
              />
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                We&apos;ll help you identify optimal service areas based on your location and competition analysis.
                Our AI agents will suggest the best markets for your business.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Review & Complete</h3>
              <p className="text-sm text-muted-foreground">Confirm your information</p>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Company</span>
                    <span className="text-muted-foreground">{formData.company_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Contact</span>
                    <span className="text-muted-foreground">{formData.contact_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Email</span>
                    <span className="text-muted-foreground">{formData.email}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-foreground">Services</span>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {formData.services.map(service => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {SERVICE_OPTIONS.find(s => s.value === service)?.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Experience</span>
                    <span className="text-muted-foreground">{formData.years_experience} years</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Next Steps</p>
                  <p className="text-sm">After completing onboarding, you&apos;ll get access to:</p>
                  <ul className="text-sm list-disc ml-4 space-y-1">
                    <li>AI-powered lead generation with Rex</li>
                    <li>Bidding assistance with Alex</li>
                    <li>Real-time market insights</li>
                    <li>Growth plan benefits (6% platform fee)</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.company_name && formData.contact_name && formData.email && formData.business_type;
      case 1:
        return formData.services.length > 0;
      case 2:
        return true; // Optional step
      case 3:
        return true; // Review step
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-950 to-purple-950 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            animate={{
              y: [-50, -800],
              x: [0, Math.random() * 100 - 50],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 12,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "linear"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: '100%',
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header with Logo */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 text-center"
        >
          <div className="flex items-center justify-center space-x-3 mb-2">
            <Image
              src="/logo.png"
              alt="FixItForMe Logo"
              width={48}
              height={48}
              className="drop-shadow-lg"
              priority
            />
            <h1 className="text-2xl font-bold text-white">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">FixItForMe</span>
            </h1>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Join thousands of contractors growing their business with AI-powered lead generation
          </p>
        </motion.header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container max-w-4xl mx-auto px-4 pb-8"
        >
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Side - Lexi's Guidance */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-1 space-y-6"
            >
              <Card className="bg-background/80 backdrop-blur-xl border border-white/20 shadow-2xl">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center"
                    >
                      <Bot className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-lg text-primary">Meet Lexi</h3>
                      <p className="text-sm text-muted-foreground">Your AI Onboarding Assistant</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-left">
                      <p className="text-sm italic text-foreground">
                        &ldquo;Hi! I&apos;m Lexi, and I&apos;m here to help you get set up for success. I&apos;ll guide you through each step and make sure you&apos;re ready to start earning more with our AI-powered platform!&rdquo;
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits Preview */}
              <Card className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-xl border border-white/10">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-primary" />
                    What You&apos;ll Get
                  </h4>
                  <div className="space-y-3">
                    {[
                      { icon: Bot, text: "AI agents finding leads 24/7", color: "text-accent" },
                      { icon: TrendingUp, text: "40% average revenue increase", color: "text-primary" },
                      { icon: Shield, text: "Only 6% platform fee", color: "text-primary" },
                      { icon: Users, text: "10,000+ contractor network", color: "text-accent" },
                    ].map((benefit, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="flex items-center space-x-3"
                      >
                        <benefit.icon className={cn("w-4 h-4", benefit.color)} />
                        <span className="text-sm text-foreground">{benefit.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Side - Main Form */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="bg-background/90 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Progress header */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-primary">
                        {['Company Setup', 'Services & Skills', 'Service Areas', 'Final Review'][currentStep]}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Step {currentStep + 1} of 4 • {Math.round((currentStep + 1) / 4 * 100)}% Complete
                      </p>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/20">
                      <Zap className="w-3 h-3 mr-1" />
                      Quick Setup
                    </Badge>
                  </div>
                  
                  <div className="relative">
                    <Progress 
                      value={(currentStep + 1) / 4 * 100} 
                      className="h-2 bg-white/20"
                    />
                    <motion.div
                      className="absolute top-0 left-0 h-2 bg-gradient-to-r from-primary to-accent rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(currentStep + 1) / 4 * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <CardContent className="p-8">{/* Step Indicators */}
                  <div className="flex items-center justify-between mb-8">
                    {[
                      { icon: Building, label: "Company", description: "Basic info" },
                      { icon: Award, label: "Services", description: "Your expertise" },
                      { icon: MapPin, label: "Location", description: "Service areas" },
                      { icon: Check, label: "Review", description: "Finish setup" }
                    ].map((step, index) => {
                      const Icon = step.icon;
                      const isActive = index === currentStep;
                      const isComplete = index < currentStep;
                      
                      return (
                        <motion.div 
                          key={index} 
                          className="flex flex-col items-center flex-1 relative"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <motion.div 
                            className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                              isActive 
                                ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25" 
                                : isComplete
                                  ? "bg-primary/20 text-primary" 
                                  : "bg-muted text-muted-foreground"
                            )}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isComplete ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </motion.div>
                          <div className="text-center">
                            <div className={cn(
                              "text-sm font-medium transition-colors",
                              isActive ? "text-primary" : isComplete ? "text-primary/70" : "text-muted-foreground"
                            )}>
                              {step.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {step.description}
                            </div>
                          </div>
                          {index < 3 && (
                            <div className={cn(
                              "absolute top-6 left-full w-full h-px transition-colors hidden sm:block",
                              isComplete ? "bg-primary/50" : "bg-border"
                            )} />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Step Content with animations */}
                  <motion.div 
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-[400px] mb-8"
                  >
                    {getStepContent()}
                  </motion.div>

                  {/* Enhanced Navigation */}
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="outline"
                      onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                      disabled={currentStep === 0}
                      className="flex items-center gap-2 bg-background/50 hover:bg-background/80"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                      {currentStep === 3 && (
                        <div className="flex items-center space-x-2 mr-4">
                          <Heart className="w-4 h-4 text-destructive" />
                          <span className="text-sm text-muted-foreground">Almost there!</span>
                        </div>
                      )}
                      <Button
                        onClick={handleNext}
                        disabled={!isStepValid() || loading}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white min-w-[140px]"
                      >
                        {loading ? (
                          <>
                            <motion.div
                              className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Setting up...
                          </>
                        ) : (
                          <>
                            {currentStep === 3 ? (
                              <>
                                <Rocket className="w-4 h-4" />
                                Launch Dashboard
                              </>
                            ) : (
                              <>
                                Continue
                                <ChevronRight className="w-4 h-4" />
                              </>
                            )}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
