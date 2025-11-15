require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

async function testNewGeminiAPI() {
  console.log('\n🧪 Testing NEW Gemini API (@google/genai)\n');
  console.log('='.repeat(50));
  
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('1. API Key:', apiKey ? `✅ Loaded (${apiKey.substring(0, 15)}...)` : '❌ Missing');
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    return;
  }
  
  try {
    // Initialize with new SDK
    const ai = new GoogleGenAI({
      apiKey: apiKey
    });
    
    console.log('2. SDK Initialized: ✅');
    
    // Test with gemini-2.5-flash
    console.log('3. Testing gemini-2.5-flash model...\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say 'Hello from Gemini!' if you can read this.",
      config: {
        temperature: 0.7,
        thinkingConfig: {
          thinkingBudget: 0, // Disable thinking for faster response
        },
      },
    });
    
    console.log('✅ API Response:');
    console.log('   Text:', response.text);
    
    console.log('\n✅ SUCCESS! Gemini API is working with new SDK!');
    console.log('\n📝 Configuration to use:');
    console.log('   - Package: @google/genai');
    console.log('   - Model: gemini-2.5-flash');
    console.log('   - API Key: From GEMINI_API_KEY env var');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('PERMISSION_DENIED')) {
      console.error('\n🔑 API Key Issue:');
      console.error('   1. Go to: https://aistudio.google.com/apikey');
      console.error('   2. Create a new API key');
      console.error('   3. Update GEMINI_API_KEY in your .env file');
    }
    
    console.error('\nFull error:', error);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
}

testNewGeminiAPI();
