'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { toast } from 'sonner';

interface ProfileData {
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

interface ProfileEditorProps {
  initialData?: Partial<ProfileData>;
  onSave?: (data: ProfileData) => void;
}

export default function ProfileEditor({ initialData, onSave }: ProfileEditorProps) {
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
      
      if (onSave) {
        onSave(formData);
      }
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileData, value: string | string[] | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Smith Construction LLC"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license">License Number</Label>
              <Input
                id="license"
                value={formData.license_number}
                onChange={(e) => handleChange('license_number', e.target.value)}
                placeholder="CA-12345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience_years}
                onChange={(e) => handleChange('experience_years', parseInt(e.target.value) || 0)}
                placeholder="10"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Services Offered</Label>
            <MultiSelect
              options={serviceOptions}
              value={formData.services}
              onValueChange={(value) => handleChange('services', value)}
              placeholder="Select services you offer..."
            />
          </div>

          <div className="space-y-2">
            <Label>Service Areas</Label>
            <MultiSelect
              options={areaOptions}
              value={formData.service_areas}
              onValueChange={(value) => handleChange('service_areas', value)}
              placeholder="Select areas you serve..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell potential clients about your experience and expertise..."
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-brand-primary hover:bg-brand-primary/90"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
