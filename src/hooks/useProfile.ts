'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  company: string;
  license_number: string;
  services: string[];
  service_areas: string[];
  experience_years: number;
  bio: string;
}

export const useProfile = (initialData?: Partial<ProfileData>) => {
  const [formData, setFormData] = useState<ProfileData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    company: initialData?.company || '',
    license_number: initialData?.license_number || '',
    services: initialData?.services || [],
    service_areas: initialData?.service_areas || [],
    experience_years: initialData?.experience_years || 0,
    bio: initialData?.bio || '',
  });
  const [loading, setLoading] = useState(false);

  const serviceOptions = [
    { label: 'Plumbing', value: 'plumbing' },
    { label: 'Electrical', value: 'electrical' },
    { label: 'HVAC', value: 'hvac' },
    { label: 'Carpentry', value: 'carpentry' },
    { label: 'Painting', value: 'painting' },
    { label: 'Flooring', value: 'flooring' },
    { label: 'Roofing', value: 'roofing' },
    { label: 'Kitchen Remodel', value: 'kitchen' },
    { label: 'Bathroom Remodel', value: 'bathroom' },
    { label: 'General Repair', value: 'general' }
  ];

  const areaOptions = [
    { label: 'Oakland', value: 'oakland' },
    { label: 'Berkeley', value: 'berkeley' },
    { label: 'San Francisco', value: 'san_francisco' },
    { label: 'San Leandro', value: 'san_leandro' },
    { label: 'Alameda', value: 'alameda' },
    { label: 'Fremont', value: 'fremont' },
    { label: 'Hayward', value: 'hayward' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you'd call an API to save the data
      // For now, we'll just show a success toast
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileData, value: string | string[] | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    loading,
    serviceOptions,
    areaOptions,
    handleSubmit,
    handleChange,
    setFormData
  };
};
