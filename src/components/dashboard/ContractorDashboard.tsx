'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard,
  User,
  FileText,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  MessageSquare,
  Menu,
  X
} from 'lucide-react';
import { EnhancedChatManager } from '@/components/EnhancedChatManager';
import LeadFeed from '@/components/dashboard/LeadFeed';
import QuickStats from '@/components/dashboard/QuickStats';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function ContractorDashboard({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [chatManagerOpen, setChatManagerOpen] = useState(true);
  
  // Mock contractor data - replace with actual data fetching
  const contractor = {
    id: 'mock-contractor-id',
    name: 'John Smith',
    tier: 'Growth',
    avatar: null,
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    location: 'Oakland, CA',
    joinDate: '2024-01-15'
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
    { id: 'profile', label: 'Profile', icon: User, active: false },
    { id: 'documents', label: 'Documents', icon: FileText, active: false, badge: '2' },
    { id: 'notifications', label: 'Notifications', icon: Bell, active: false, badge: '5' },
    { id: 'settings', label: 'Settings', icon: Settings, active: false },
  ];

  const NavItem = ({ item }: { item: typeof navigation[0] }) => (
    <button
      onClick={() => {
        setActiveSection(item.id);
        setSidebarOpen(false);
      }}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200
        ${activeSection === item.id 
          ? 'bg-primary text-primary-foreground shadow-lg' 
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }
      `}
    >
      <item.icon className="h-5 w-5" />
      <span className="font-medium">{item.label}</span>
      {item.badge && (
        <Badge 
          variant="secondary" 
          className={`ml-auto ${activeSection === item.id ? 'bg-background/20 text-background' : 'bg-primary/10 text-primary'}`}
        >
          {item.badge}
        </Badge>
      )}
    </button>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {contractor.name}</p>
              </div>
              <div className="flex gap-2">
                <Button className="bg-brand-primary hover:bg-brand-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setChatManagerOpen(!chatManagerOpen)}
                  className="border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  AI Agents
                </Button>
              </div>
            </div>
            
            <QuickStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LeadFeed contractorId={contractor.id} />
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-muted-foreground">Bid submitted for Kitchen Remodel</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-info rounded-full"></div>
                        <span className="text-muted-foreground">New lead from Rex</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-warning rounded-full"></div>
                        <span className="text-muted-foreground">Profile updated</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <Card>
              <CardHeader>
                <CardTitle>Contractor Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={contractor.avatar || undefined} />
                      <AvatarFallback className="bg-brand-primary text-white text-lg">
                        {contractor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{contractor.name}</h3>
                      <Badge variant="outline" className="mt-1">
                        {contractor.tier} Tier
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Email:</span>
                      <p>{contractor.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Phone:</span>
                      <p>{contractor.phone}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Location:</span>
                      <p>{contractor.location}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Member Since:</span>
                      <p>{new Date(contractor.joinDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return children || (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground capitalize">{activeSection}</h1>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} content coming soon...
                </p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        className="fixed left-0 top-0 h-full w-80 bg-card shadow-xl z-50 lg:translate-x-0 lg:static lg:z-0"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-brand-primary to-brand-primary/80 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <span className="text-xl font-bold text-foreground">FixItForMe</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Profile Section */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src={contractor.avatar || undefined} />
                <AvatarFallback className="bg-brand-primary text-white">
                  {contractor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{contractor.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {contractor.tier} Tier
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-6">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-6 border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="lg:ml-80">
        {/* Top Bar */}
        <div className="bg-card border-b px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-4 ml-auto">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                5
              </span>
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {/* Chat Manager */}
      <AnimatePresence>
        {chatManagerOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-4 right-4 z-30"
          >
            <EnhancedChatManager />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
