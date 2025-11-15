require('dotenv').config();

async function diagnoseAPI() {
  console.log('\n🔍 Gemini API Diagnostics\n');
  console.log('='.repeat(50));
  
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('\n1. API Key Check:');
  console.log(`   Key exists: ${apiKey ? '✅ Yes' : '❌ No'}`);
  console.log(`   Key format: ${apiKey ? apiKey.substring(0, 15) + '...' : 'N/A'}`);
  console.log(`   Key length: ${apiKey ? apiKey.length : 0} characters`);
  console.log(`   Starts with 'AIza': ${apiKey?.startsWith('AIza') ? '✅ Yes (correct format)' : '❌ No'}`);
  
  console.log('\n2. Making direct API call...');
  console.log('   Testing with native fetch to bypass SDK issues\n');
  
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Say "Hello" if you can read this.'
          }]
        }]
      })
    });
    
    console.log(`   Response status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ API call successful!');
      console.log('   Response:', JSON.stringify(data, null, 2));
      console.log('\n✅ The API key is valid!');
      console.log('🎯 Use endpoint: /v1/ instead of /v1beta/');
      console.log('🎯 Use model: gemini-1.5-flash');
    } else {
      console.log('   ❌ API call failed');
      console.log('   Error:', JSON.stringify(data, null, 2));
      
      if (data.error?.status === 'PERMISSION_DENIED') {
        console.log('\n❌ API Key Issue: Permission Denied');
        console.log('   Solutions:');
        console.log('   1. Generate a new API key at: https://aistudio.google.com/apikey');
        console.log('   2. Make sure the key has "Generative Language API" enabled');
        console.log('   3. Check if there are usage restrictions on your Google Cloud project');
      }
    }
    
  } catch (error) {
    console.log('   ❌ Fetch error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
}

diagnoseAPI();
