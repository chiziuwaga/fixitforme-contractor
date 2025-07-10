"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Home, Settings, Briefcase, User, LogOut, Bell } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/contractor/dashboard", icon: Home },
  { name: "Leads", href: "/contractor/leads", icon: Briefcase },
  { name: "Settings", href: "/contractor/settings", icon: Settings },
]

const Sidebar = () => {
  const pathname = usePathname()
  const { user, loading, logout } = useUser()

  return (
    <aside className="w-64 flex-shrink-0 bg-secondary text-secondary-foreground flex flex-col p-4">
      <div className="p-4 mb-6">
        <Link href="/contractor/dashboard" className="flex items-center gap-3">
          <Image src="/logo.png" alt="FixItForMe Logo" width={40} height={40} className="rounded-lg bg-white/20 p-1" />
          <span className="font-serif text-xl font-semibold">FixItForMe</span>
        </Link>
      </div>

      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <motion.div
                    className={cn(
                      "flex items-center gap-3 p-3 my-1 rounded-lg transition-colors duration-200",
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-white/10",
                    )}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </motion.div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-auto">
        <div className="p-3 rounded-lg bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">
              {user?.email ? user.email.charAt(0).toUpperCase() : <User />}
            </div>
            <div>
              <p className="font-semibold text-sm">{loading ? "Loading..." : user?.email || "Contractor"}</p>
              <p className="text-xs text-secondary-foreground/70">Pro Tier</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start mt-3 text-secondary-foreground/80 hover:bg-white/10 hover:text-white"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  )
}

const Header = () => {
  return (
    <header className="h-16 flex-shrink-0 bg-background-light border-b border-ui-border flex items-center justify-end px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-text-light-secondary hover:bg-ui-muted">
          <Bell className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background-light">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
