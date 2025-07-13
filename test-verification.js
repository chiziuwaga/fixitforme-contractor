const fetch = require('node-fetch');

async function testWhatsAppVerification() {
  try {
    console.log('Testing WhatsApp verification API...');
    
    const response = await fetch('http://localhost:3000/api/auth/verify-whatsapp-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '+15551234567',
        token: '123456'
      })
    });
    
    const data = await response.text();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (!response.ok) {
      console.error('API Error:', data);
    } else {
      console.log('WhatsApp verification API is working correctly!');
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testWhatsAppVerification();
