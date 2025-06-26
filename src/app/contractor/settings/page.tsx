'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, CreditCard, FileText } from 'lucide-react';
import SubscriptionManager from '@/components/settings/SubscriptionManager';
import ProfileEditor from '@/components/settings/ProfileEditor';
import DocumentUploader from '@/components/settings/DocumentUploader';
import { BRAND } from '@/lib/brand';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible"
        className="container mx-auto px-6 py-8"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-[rgb(var(--primary-orange))] mb-2">
            Settings
          </h1>
          <p className="text-neutral-600 text-lg">
            Manage your account, subscription, and profile settings
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="profile" className="grid grid-cols-12 gap-6">
            {/* Sidebar Navigation */}
            <div className="col-span-12 lg:col-span-3">
              <Card className="brand-shadow border-0 bg-white/95 backdrop-blur-sm">
                <CardContent className="p-0">
                  <TabsList className="flex flex-col h-auto w-full bg-transparent">
                    <TabsTrigger 
                      value="profile" 
                      className="w-full justify-start gap-3 p-4 text-left data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(var(--primary-orange))] data-[state=active]:to-[rgb(var(--primary-blue))] data-[state=active]:text-white hover:bg-neutral-50 brand-transition"
                    >
                      <User className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Profile</div>
                        <div className="text-xs opacity-70">Personal information</div>
                      </div>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="subscription" 
                      className="w-full justify-start gap-3 p-4 text-left data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(var(--primary-purple))] data-[state=active]:to-[rgb(var(--primary-indigo))] data-[state=active]:text-white hover:bg-neutral-50 brand-transition"
                    >
                      <CreditCard className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Subscription</div>
                        <div className="text-xs opacity-70">Billing & plans</div>
                      </div>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="documents" 
                      className="w-full justify-start gap-3 p-4 text-left data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(var(--primary-teal))] data-[state=active]:to-[rgb(var(--primary-cyan))] data-[state=active]:text-white hover:bg-neutral-50 brand-transition"
                    >
                      <FileText className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Documents</div>
                        <div className="text-xs opacity-70">Verification & files</div>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="col-span-12 lg:col-span-9">
              <TabsContent value="profile" className="mt-0">
                <Card className="brand-shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-[rgb(var(--primary-orange))]/10 to-[rgb(var(--primary-blue))]/10 border-b border-neutral-200">
                    <CardTitle className="text-2xl text-[rgb(var(--primary-orange))] flex items-center gap-3">
                      <User className="h-6 w-6" />
                      Profile Settings
                    </CardTitle>
                    <CardDescription>
                      Update your personal information, business details, and service areas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ProfileEditor />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subscription" className="mt-0">
                <Card className="brand-shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-[rgb(var(--primary-purple))]/10 to-[rgb(var(--primary-indigo))]/10 border-b border-neutral-200">
                    <CardTitle className="text-2xl text-[rgb(var(--primary-purple))] flex items-center gap-3">
                      <CreditCard className="h-6 w-6" />
                      Subscription & Billing
                    </CardTitle>
                    <CardDescription>
                      Manage your subscription plan, billing information, and payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <SubscriptionManager />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                <Card className="brand-shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-[rgb(var(--primary-teal))]/10 to-[rgb(var(--primary-cyan))]/10 border-b border-neutral-200">
                    <CardTitle className="text-2xl text-[rgb(var(--primary-teal))] flex items-center gap-3">
                      <FileText className="h-6 w-6" />
                      Documents & Verification
                    </CardTitle>
                    <CardDescription>
                      Upload and manage your licenses, insurance, and certification documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <DocumentUploader />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}
