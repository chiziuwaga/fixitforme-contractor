// Demo/Test Configuration for Development and Testing
export const DEMO_CONFIG = {
  // Demo mode flags
  DEMO_MODE: process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
  
  // Mock Stripe for demo
  STRIPE_DEMO: {
    publishableKey: 'pk_test_demo_key',
    enabled: !process.env.STRIPE_PUBLISHABLE_KEY,
  },
  
  // Mock Twilio/SMS for demo
  SMS_DEMO: {
    enabled: !process.env.TWILIO_ACCOUNT_SID,
    mockCode: '123456', // Fixed demo verification code
  },
  
  // Mock Supabase for demo (if needed)
  SUPABASE_DEMO: {
    enabled: !process.env.NEXT_PUBLIC_SUPABASE_URL,
    mockUrl: 'https://demo.supabase.co',
    mockKey: 'demo-anon-key',
  },
  
  // Demo user data
  DEMO_USER: {
    id: 'demo-contractor-123',
    email: 'demo@contractor.com',
    phone: '(555) 123-4567',
    name: 'Demo Contractor',
    company: 'Demo Construction LLC',
  },
  
  // Demo leads data
  DEMO_LEADS: [
    {
      id: 'lead-1',
      title: 'Kitchen Cabinet Installation',
      description: 'Need help installing new kitchen cabinets in a 2-bedroom apartment.',
      estimated_value: 2500,
      location_city: 'Austin',
      location_state: 'TX',
      quality_score: 85,
      recency_score: 90,
      source: 'Demo Platform',
      posted_at: new Date().toISOString(),
      urgency_indicators: ['Same Day', 'High Priority'],
      contact_info: { phone: '(555) 987-6543', email: 'homeowner@demo.com' }
    },
    {
      id: 'lead-2', 
      title: 'Bathroom Tile Repair',
      description: 'Several loose tiles in master bathroom need repair and regrouting.',
      estimated_value: 800,
      location_city: 'Austin',
      location_state: 'TX',
      quality_score: 75,
      recency_score: 60,
      source: 'Demo Platform',
      posted_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      urgency_indicators: ['This Week'],
      contact_info: { phone: '(555) 456-7890', email: 'customer@demo.com' }
    }
  ]
};

// Demo response helpers
export const createDemoResponse = (data: unknown, delay = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true, data }), delay);
  });
};

export const createDemoError = (message: string, delay = 1000) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
};
