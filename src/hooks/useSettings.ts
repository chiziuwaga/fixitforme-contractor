'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';

export interface ProfileData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  website: string;
}

export interface NotificationSettings {
  emailLeads: boolean;
  smsAlerts: boolean;
  weeklyReports: boolean;
  marketingEmails: boolean;
}

export interface SettingsTab {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const useSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    companyName: 'Acme Construction LLC',
    contactName: 'John Smith',
    email: 'john@acmeconstruction.com',
    phone: '(555) 123-4567',
    businessType: 'General Contractor',
    licenseNumber: 'GC-123456',
    address: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    website: 'www.acmeconstruction.com',
  });
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailLeads: true,
    smsAlerts: true,
    weeklyReports: false,
    marketingEmails: false,
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));
      
      // In a real app, this would call the API:
      // await api.updateProfile(profile);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification settings updated');
  };

  const updateProfile = (updates: Partial<ProfileData>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const updateProfileField = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return {
    // State
    activeTab,
    loading,
    profile,
    notifications,
    
    // Actions
    setActiveTab,
    handleSaveProfile,
    handleNotificationChange,
    updateProfile,
    updateProfileField,
  };
};
