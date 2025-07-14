// Quick test of demo bypass system
// Run this with: node test-demo-simple.mjs

const API_BASE = 'http://localhost:3000';

async function testDemoBypass() {
  console.log('🧪 Testing Demo Bypass System\n');

  try {
    // Test demo verification
    console.log('📤 Testing verify with demo code...');
    const response = await fetch(`${API_BASE}/api/auth/verify-whatsapp-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '+1234567890',
        token: '209741'
      })
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.success && data.demo_mode) {
      console.log('\n✅ DEMO BYPASS WORKING!');
      console.log('✅ Demo code 209741 is functional');
      console.log('✅ Ready for production use');
    } else if (response.status === 500) {
      console.log('\n❌ 500 Error - but check if demo bypass still works');
      console.log('Response includes hint about demo code:', !!data.hint);
    } else {
      console.log('\n❌ Unexpected response');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testDemoBypass();
