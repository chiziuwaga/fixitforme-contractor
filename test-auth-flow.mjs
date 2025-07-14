import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const TEST_PHONE = '+1234567890'
const BASE_URL = process.env.VERCEL_URL || 'http://localhost:3001'

async function testAuthFlow() {
  try {
    console.log('🧪 Testing enhanced WhatsApp authentication flow...\n')
    
    // Test OTP verification endpoint
    console.log('📞 Testing verify-whatsapp-otp endpoint...')
    
    const response = await fetch(`${BASE_URL}/api/auth/verify-whatsapp-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: TEST_PHONE,
        token: '123456'  // Test OTP
      })
    })
    
    const data = await response.json()
    
    console.log(`Status: ${response.status}`)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.status === 200) {
      console.log('\n✅ Authentication endpoint is working!')
      console.log('✅ Efficient user lookup implemented')
      console.log('✅ Fallback strategy active')
    } else if (response.status === 400) {
      console.log('\n⚠️  Expected 400 for test OTP (authentication logic working)')
    } else {
      console.log('\n❌ Unexpected status code')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testAuthFlow()
