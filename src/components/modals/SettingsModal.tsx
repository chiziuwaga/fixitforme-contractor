"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Settings, 
  User, 
  Bell, 
  CreditCard, 
  Building, 
  Phone,
  Mail,
  MapPin,
  Zap,
  Trash2
} from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

/**
 * SettingsModal - Comprehensive Settings Management
 * 
 * Replaces traditional settings pages with modal overlay
 * Integrates with chat-centric architecture
 */

interface SettingsModalProps {
  children?: React.ReactNode
}

export function SettingsModal({ children }: SettingsModalProps) {
  const { profile, loading } = useUser()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  const handleLogout = async () => {
    localStorage.removeItem('whatsapp_verified_user')
    localStorage.removeItem('direct_access')
    localStorage.removeItem('contractor_profile')
    router.push("/login")
    setOpen(false)
  }

  const handleUpgrade = () => {
    // TODO: Implement Stripe upgrade flow
    console.log("Upgrade to Scale tier")
  }

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion flow
    console.log("Delete account")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Settings
          </DialogTitle>
          <DialogDescription>
            Manage your account, preferences, and subscription
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <div className="flex h-full">
            {/* Settings Navigation */}
            <div className="w-48 border-r bg-muted/20 p-4">
              <TabsList className="grid w-full grid-cols-1 h-auto bg-transparent">
                <TabsTrigger value="profile" className="justify-start mb-2">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="company" className="justify-start mb-2">
                  <Building className="h-4 w-4 mr-2" />
                  Company
                </TabsTrigger>
                <TabsTrigger value="subscription" className="justify-start mb-2">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Subscription
                </TabsTrigger>
                <TabsTrigger value="notifications" className="justify-start mb-2">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="advanced" className="justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Profile Settings */}
                <TabsContent value="profile" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                          Update your personal details and contact information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="contact_name">Full Name</Label>
                            <Input
                              id="contact_name"
                              defaultValue={profile?.contact_name || ""}
                              placeholder="Your full name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              defaultValue="(555) 123-4567"
                              placeholder="Your phone number"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            defaultValue="contractor@example.com"
                            placeholder="Your email address"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="email-verified" checked disabled />
                          <Label htmlFor="email-verified" className="text-sm text-muted-foreground">
                            Email verified
                          </Label>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                        <CardDescription>
                          Upload a profile picture for your account
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-semibold">
                            {profile?.contact_name ? profile.contact_name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                          </div>
                          <div className="space-y-2">
                            <Button variant="outline" size="sm">
                              Upload Photo
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              JPG, PNG or GIF. Max size 2MB.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Company Settings */}
                <TabsContent value="company" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Company Details</CardTitle>
                        <CardDescription>
                          Manage your business information and services
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="company_name">Company Name</Label>
                          <Input
                            id="company_name"
                            defaultValue={profile?.company_name || ""}
                            placeholder="Your company name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="license">License Number</Label>
                            <Input
                              id="license"
                              placeholder="License #"
                            />
                          </div>
                          <div>
                            <Label htmlFor="insurance">Insurance Provider</Label>
                            <Input
                              id="insurance"
                              placeholder="Insurance company"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="services">Services Offered</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {profile?.services_offered?.map((service, index) => (
                              <Badge key={index} variant="secondary">
                                {service}
                              </Badge>
                            )) || (
                              <p className="text-sm text-muted-foreground">
                                No services configured
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Subscription Settings */}
                <TabsContent value="subscription" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          Current Plan
                          <Badge variant={profile?.subscription_tier === 'scale' ? 'default' : 'secondary'}>
                            {profile?.subscription_tier?.toUpperCase() || 'GROWTH'}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Manage your subscription and billing
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {profile?.subscription_tier !== 'scale' ? (
                          <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                            <div className="flex items-start gap-3">
                              <Zap className="h-5 w-5 text-primary mt-0.5" />
                              <div className="flex-1">
                                <h4 className="font-medium">Upgrade to Scale</h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                  Unlock advanced AI agents, priority support, and enhanced features
                                </p>
                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                  <div>
                                    <strong>Growth Plan:</strong>
                                    <ul className="mt-1 space-y-1 text-muted-foreground">
                                      <li>• Lexi onboarding agent</li>
                                      <li>• Basic lead notifications</li>
                                      <li>• 10% transaction fee</li>
                                    </ul>
                                  </div>
                                  <div>
                                    <strong>Scale Plan:</strong>
                                    <ul className="mt-1 space-y-1 text-muted-foreground">
                                      <li>• All Growth features</li>
                                      <li>• Alex bidding agent</li>
                                      <li>• Rex lead generation</li>
                                      <li>• Priority support</li>
                                      <li>• $250/month + 7% fee</li>
                                    </ul>
                                  </div>
                                </div>
                                <Button onClick={handleUpgrade} className="w-full">
                                  <Zap className="h-4 w-4 mr-2" />
                                  Upgrade to Scale - $250/month
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="h-5 w-5 text-green-600" />
                              <h4 className="font-medium text-green-900">Scale Plan Active</h4>
                            </div>
                            <p className="text-sm text-green-700">
                              You have access to all premium features and agents
                            </p>
                          </div>
                        )}

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-2">Billing Information</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-muted-foreground">Next billing date</Label>
                              <p>August 19, 2025</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Payment method</Label>
                              <p>•••• •••• •••• 4242</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>
                          Choose how you want to receive notifications
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>New Lead Alerts</Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified when Rex finds new leads
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Agent Completion Notifications</Label>
                              <p className="text-sm text-muted-foreground">
                                Alerts when agents finish processing requests
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Payment Updates</Label>
                              <p className="text-sm text-muted-foreground">
                                Notifications about payments and billing
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Marketing Communications</Label>
                              <p className="text-sm text-muted-foreground">
                                Product updates and feature announcements
                              </p>
                            </div>
                            <Switch />
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <Label>Notification Method</Label>
                          <Select defaultValue="push">
                            <SelectTrigger className="w-full mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="push">Push Notifications</SelectItem>
                              <SelectItem value="email">Email Only</SelectItem>
                              <SelectItem value="sms">SMS Only</SelectItem>
                              <SelectItem value="all">All Methods</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                {/* Advanced Settings */}
                <TabsContent value="advanced" className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Privacy & Security</CardTitle>
                        <CardDescription>
                          Manage your account security and data preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-muted-foreground">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Enable 2FA
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Download Your Data</Label>
                            <p className="text-sm text-muted-foreground">
                              Export all your account data and conversations
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Export Data
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-destructive/50">
                      <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>
                          Irreversible actions that affect your account
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Delete Account</Label>
                            <p className="text-sm text-muted-foreground">
                              Permanently delete your account and all data
                            </p>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={handleDeleteAccount}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </div>
            </div>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t pt-4">
          <Button variant="outline" onClick={handleLogout}>
            <Mail className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
