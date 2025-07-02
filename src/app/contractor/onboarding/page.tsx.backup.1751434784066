'use client';

import { useState } from 'react';
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
import { Building, Award, MapPin, Check, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { motion } from 'framer-motion';
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-background to-muted/50 py-8"
    >
      <div className="container max-w-2xl mx-auto px-4">
        <motion.div variants={itemVariants}>
          <Card className="shadow-lg border-border/50">
            <CardContent className="p-8">
              {/* Header */}
              <motion.div variants={itemVariants} className="text-center mb-8">
                <div 
                  className="text-5xl mb-4"
                  style={{ color: BRAND.colors.primary }}
                >
                  🔧
                </div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: BRAND.colors.text.primary }}>
                  Welcome to FixItForMe
                </h1>
                <p className="text-lg text-muted-foreground">
                  Let&apos;s set up your contractor profile
                </p>
              </motion.div>

              {/* Progress */}
              <div className="mb-8">
                <Progress 
                  value={(currentStep + 1) / 4 * 100} 
                  className="mb-4"
                />
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    Step {currentStep + 1} of 4
                  </span>
                </div>
              </div>

              {/* Step Indicators */}
              <div className="flex items-center justify-between mb-8">
                {[
                  { icon: Building, label: "Company Info", description: "Basic information" },
                  { icon: Award, label: "Services", description: "What you offer" },
                  { icon: MapPin, label: "Location", description: "Service areas" },
                  { icon: Check, label: "Review", description: "Confirm details" }
                ].map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isComplete = index < currentStep;
                  
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : isComplete
                            ? "bg-primary/20 text-primary" 
                            : "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <div className={cn(
                          "text-sm font-medium",
                          isActive ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {step.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {step.description}
                        </div>
                      </div>
                      {index < 3 && (
                        <div className={cn(
                          "h-px bg-border flex-1 mt-5 absolute left-1/2 transform translate-x-1/2",
                          "hidden md:block"
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Step Content */}
              <div className="min-h-[400px] mb-8">
                {getStepContent()}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  Back
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid() || loading}
                  className="flex items-center gap-2"
                  style={{ backgroundColor: BRAND.colors.primary }}
                >
                  {loading && <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                  {currentStep === 3 ? 'Complete Setup' : 'Next Step'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
