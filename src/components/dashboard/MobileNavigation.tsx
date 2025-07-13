"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { 
  Menu, 
  Home, 
  Users, 
  MessageCircle, 
  Settings, 
  DollarSign,
  FileText,
  LogOut,
  Monitor
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useUser } from "@/hooks/useUser"
import { createBrowserClient } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { profile } = useUser()
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    setIsOpen(false)
  }

  const navItems = [
    { label: "Dashboard", href: "/contractor/dashboard", icon: Home },
    { label: "Leads", href: "/contractor/leads", icon: Users },
    { label: "Chat", href: "/contractor/chat", icon: MessageCircle },
    { label: "Payments", href: "/contractor/payments", icon: DollarSign },
    { label: "Documents", href: "/contractor/settings?tab=documents", icon: FileText },
    { label: "Settings", href: "/contractor/settings", icon: Settings },
  ]

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="FixItForMe"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <div className="flex-1">
                  <h2 className="font-bold text-foreground">FixItForMe</h2>
                  <p className="text-xs text-muted-foreground">
                    {profile?.company_name || 'Contractor Portal'}
                  </p>
                </div>
                <Badge variant={profile?.subscription_tier === 'scale' ? 'default' : 'secondary'}>
                  {profile?.subscription_tier?.toUpperCase() || 'GROWTH'}
                </Badge>
              </div>
            </div>

            {/* Desktop Recommendation */}
            <div className="p-4 m-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Switch to Desktop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Access all features and AI tools
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{item.label}</span>
                  </Link>
                ))}
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-3"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
