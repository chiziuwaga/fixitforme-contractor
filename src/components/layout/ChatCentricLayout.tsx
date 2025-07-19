"use client"

import React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  Menu, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  ChevronDown 
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import { SettingsModal } from "@/components/modals/SettingsModal"


/**
 * ChatCentricLayout - Minimal Chrome for Chat-First Experience
 * 
 * Philosophy: Chat IS the app. This layout provides only the essential
 * chrome needed for user account management while letting chat dominate
 * 95%+ of the screen real estate.
 */

interface ChatCentricLayoutProps {
  children: React.ReactNode
}

export default function ChatCentricLayout({ children }: ChatCentricLayoutProps) {
  const { profile, loading } = useUser()
  const router = useRouter()

  const handleLogout = async () => {
    // Pure WhatsApp OTP logout - clear localStorage
    localStorage.removeItem('whatsapp_verified_user')
    localStorage.removeItem('direct_access')
    localStorage.removeItem('contractor_profile')
    router.push("/login")
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Minimal Top Header - Only Essential Controls */}
      <header className="h-14 border-b flex items-center justify-between px-4 bg-background/80 backdrop-blur-sm z-50">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="FixItForMe" 
              width={32} 
              height={32}
              className="rounded-lg"
            />
            <span className="font-serif font-semibold text-lg hidden sm:block">
              FixItForMe
            </span>
          </div>
        </div>
        
        {/* Right: User Controls - Settings/Account Modal */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
          </Button>
          
          {/* User Account Dropdown Modal */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                  {profile?.contact_name ? profile.contact_name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">
                    {loading ? "Loading..." : profile?.contact_name || "Contractor"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Badge variant={profile?.subscription_tier === 'scale' ? 'default' : 'secondary'} className="text-xs">
                      {profile?.subscription_tier?.toUpperCase() || 'GROWTH'}
                    </Badge>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                    {profile?.contact_name ? profile.contact_name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-medium">
                      {loading ? "Loading..." : profile?.contact_name || "Contractor"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {profile?.company_name || "Professional Account"}
                    </div>
                    <Badge variant={profile?.subscription_tier === 'scale' ? 'default' : 'secondary'} className="text-xs mt-1">
                      {profile?.subscription_tier?.toUpperCase() || 'GROWTH'} TIER
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="cursor-pointer" asChild>
                <SettingsModal>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Profile Settings
                  </div>
                </SettingsModal>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer" asChild>
                <SettingsModal>
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </div>
                </SettingsModal>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer" asChild>
                <SettingsModal>
                  <div className="flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </div>
                </SettingsModal>
              </DropdownMenuItem>
              
              {profile?.subscription_tier !== 'scale' && (
                <DropdownMenuItem className="cursor-pointer text-primary">
                  <Badge variant="outline" className="mr-2">
                    ⚡
                  </Badge>
                  Upgrade to Scale
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      {/* Main Chat Interface - 95% of Screen */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
