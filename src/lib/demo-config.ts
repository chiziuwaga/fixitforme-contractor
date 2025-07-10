// Demo/Test Configuration for Development and Testing
export const DEMO_CONFIG = {
  // Demo mode flags
  DEMO_MODE: process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEMO_MODE === "true",

  // Mock Stripe for demo
  STRIPE_DEMO: {
    publishableKey: "pk_test_demo_key",
    enabled: !process.env.STRIPE_PUBLISHABLE_KEY,
  },

  // Mock Twilio/SMS for demo
  SMS_DEMO: {
    enabled: !process.env.TWILIO_ACCOUNT_SID,
    mockCode: "123456", // Fixed demo verification code
  },

  // Demo leads data
  DEMO_LEADS: [
    {
      id: "demo-1",
      title: "Kitchen Cabinet Installation",
      description: "Need help installing new kitchen cabinets",
      location: "Downtown Seattle",
      category: "carpentry",
      estimated_value: 2500,
      urgency: "high",
      created_at: new Date().toISOString(),
    },
    {
      id: "demo-2", 
      title: "Bathroom Tile Repair",
      description: "Several loose tiles in bathroom need fixing",
      location: "Capitol Hill",
      category: "flooring",
      estimated_value: 800,
      urgency: "medium",
      created_at: new Date().toISOString(),
    }
  ],
}

// Demo response helpers
export const createDemoResponse = (data: unknown, delay = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true, data }), delay)
  })
}
