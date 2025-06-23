'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, Button, MultiSelect, Paper, Title, LoadingOverlay, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useUser } from '@/providers/UserProvider';
import { supabase } from '@/lib/supabase';
import { felixProblemReference } from '@/lib/felix';

const serviceCategories = [...new Set(Object.values(felixProblemReference).flat())].map(problem => ({ value: problem, label: problem }));

export default function ProfileEditor() {
  const { user, loading: userLoading, profile } = useUser();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      company_name: '',
      contact_phone: '',
      service_areas: [] as string[], // Type service areas as string array
      services_offered: [] as string[], // Type services offered as string array
    },

    validate: {
      company_name: (value) => (value.length < 2 ? 'Company name must have at least 2 letters' : null),
      contact_phone: (value) => (/^\+?[1-9]\d{1,14}$/.test(value) ? null : 'Invalid phone number format'),
      service_areas: (value) => (value.length === 0 ? 'At least one service area is required' : null),
      services_offered: (value) => (value.length === 0 ? 'At least one service offered is required' : null),
    },
  });

  useEffect(() => {
    if (profile) {
      form.setValues({
        company_name: profile.company_name || '',
        contact_phone: profile.contact_phone || '',
        service_areas: profile.service_areas || [],
        services_offered: profile.services_offered || [],
      });
    }
  }, [profile, form]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!user) return;

    setSubmitting(true);
    
    const { error } = await supabase
      .from('contractor_profiles')
      .upsert({
        user_id: user.id,
        company_name: values.company_name,
        contact_phone: values.contact_phone,
        service_areas: values.service_areas,
        services_offered: values.services_offered,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error updating profile:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update your profile. Please try again.',
        color: 'red',
      });
    } else {
      notifications.show({
        title: 'Success',
        message: 'Your profile has been updated successfully!',
        color: 'green',
      });
    }
    
    setSubmitting(false);
  };

  return (
    <Paper shadow="md" p="lg" withBorder>
        <LoadingOverlay visible={userLoading || submitting} />
        <Title order={3} mb="lg">Edit Your Profile</Title>
        <Text c="dimmed" mb="xl">Keep your information up to date to attract more leads.</Text>
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
                required
                label="Company Name"
                placeholder="Your Company LLC"
                {...form.getInputProps('company_name')}
            />
            <TextInput
                required
                mt="md"
                label="Contact Phone"
                placeholder="+1234567890"
                {...form.getInputProps('contact_phone')}
            />            <MultiSelect
                required
                mt="md"
                label="Service Areas (e.g., Zip Codes, Cities)"
                placeholder="Type and press Enter to add areas"
                data={form.values.service_areas} // Show existing values as selectable
                searchable
                {...form.getInputProps('service_areas')}
            />
            <MultiSelect
                required
                mt="md"
                label="Services Offered"
                placeholder="Select the services you provide"
                data={serviceCategories}
                searchable
                nothingFoundMessage="No services found"
                {...form.getInputProps('services_offered')}
            />            <Button type="submit" mt="xl" loading={submitting}>
                Save Changes
            </Button>
        </form>
    </Paper>
  );
}
