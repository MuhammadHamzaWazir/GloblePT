#!/usr/bin/env node

console.log('🔍 Direct Production Email Test');
console.log('');

async function testProductionEmail() {
  try {
    console.log('📡 Testing production URL: https://pharmacy-management-system-6oq0kuyke.vercel.app/api/auth/send-verification');
    
    const response = await fetch('https://pharmacy-management-system-6oq0kuyke.vercel.app/api/auth/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'mhamzawazir1996@gmail.com'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Raw response:', responseText.substring(0, 500) + '...');
    
    // Try to parse as JSON if possible
    try {
      const data = JSON.parse(responseText);
      console.log('Parsed JSON:', data);
      
      if (data.emailSent) {
        console.log('✅ SUCCESS: Email sent successfully!');
      } else {
        console.log('❌ Email not sent:', data.message);
      }
    } catch (jsonError) {
      console.log('⚠️  Response is not JSON (likely HTML error page)');
      
      // Let's try the direct Vercel deployment URL
      console.log('');
      console.log('🔄 Trying latest deployment URL...');
      
      const latestResponse = await fetch('https://pharmacy-management-system-ohfrjwd1v.vercel.app/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'mhamzawazir1996@gmail.com'
        })
      });
      
      console.log('Latest deployment status:', latestResponse.status);
      const latestText = await latestResponse.text();
      
      try {
        const latestData = JSON.parse(latestText);
        console.log('Latest deployment response:', latestData);
        
        if (latestData.emailSent) {
          console.log('✅ SUCCESS: Email sent from latest deployment!');
        } else {
          console.log('❌ Email not sent from latest deployment:', latestData.message);
        }
      } catch {
        console.log('Latest deployment also returned HTML');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProductionEmail();
