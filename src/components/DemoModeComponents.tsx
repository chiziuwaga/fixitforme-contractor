import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoIcon, MessageSquareIcon } from 'lucide-react';

interface DemoModeIndicatorProps {
  isActive?: boolean;
  demoCode?: string;
  onDemoInstructions?: () => void;
}

export function DemoModeIndicator({ 
  isActive = true, 
  demoCode = '209741',
  onDemoInstructions 
}: DemoModeIndicatorProps) {
  if (!isActive) return null;

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-800">
      <InfoIcon className="h-4 w-4" />
      <div className="ml-2">
        <div className="font-semibold text-amber-900 mb-1">Demo Mode Active</div>
        <AlertDescription className="text-amber-700">
          WhatsApp/SMS services are in demo mode. Use bypass code: <Badge variant="secondary" className="ml-1 bg-amber-200 text-amber-900">{demoCode}</Badge>
        </AlertDescription>
      </div>
    </Alert>
  );
}

export function DemoPhoneInput({ onSelectDemoNumber }: { onSelectDemoNumber?: (phone: string) => void }) {
  const demoNumbers = [
    { number: '+1234567890', label: 'Demo User 1' },
    { number: '+19876543210', label: 'Demo User 2' },
    { number: '+15551234567', label: 'Presentation Demo' },
  ];

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-blue-900">Quick Demo Numbers</CardTitle>
        <CardDescription className="text-xs text-blue-700">
          Click to auto-fill phone number for demo purposes
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {demoNumbers.map((demo) => (
            <button
              key={demo.number}
              onClick={() => onSelectDemoNumber?.(demo.number)}
              className="flex items-center justify-between p-2 text-xs bg-white border border-blue-200 rounded hover:bg-blue-100 transition-colors"
            >
              <span className="font-medium text-blue-900">{demo.label}</span>
              <span className="text-blue-600 text-xs">{demo.number}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function WhatsAppBypassInstructions() {
  return (
    <Card className="mt-4 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-900 flex items-center gap-2">
          <MessageSquareIcon className="h-5 w-5" />
          WhatsApp Demo Bypass System
        </CardTitle>
        <CardDescription className="text-green-700">
          How the demo authentication works
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm text-green-800">
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-green-200 text-green-900 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <strong>Enter any phone number</strong> - The system accepts any valid phone format
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-green-200 text-green-900 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <strong>WhatsApp fallback activated</strong> - Due to sandbox limitations, demo mode engages automatically
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-green-200 text-green-900 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <strong>Use bypass code: 209741</strong> - This code works for all demo authentications
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-green-200 text-green-900 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <div>
              <strong>Full authentication flow</strong> - Complete onboarding or login as normal
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-green-100 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">Why Demo Mode?</h4>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• Twilio WhatsApp Sandbox requires manual user opt-in (join code)</li>
            <li>• Rate limiting: Only 1 message per 3 seconds in sandbox</li>
            <li>• Session expiry: Sandbox connections expire every 3 days</li>
            <li>• Production limitations: Real WhatsApp setup requires business verification</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export function ServerErrorFallback({ onTryDemo }: { onTryDemo?: () => void }) {
  return (
    <Alert className="border-red-200 bg-red-50 text-red-800">
      <div className="ml-2">
        <div className="font-semibold text-red-900 mb-1">Server Configuration Error</div>
        <AlertDescription className="text-red-700">
          WhatsApp/SMS service is temporarily unavailable. 
          <button 
            onClick={onTryDemo}
            className="ml-2 underline hover:no-underline font-medium"
          >
            Try Demo Mode Instead
          </button>
        </AlertDescription>
      </div>
    </Alert>
  );
}
