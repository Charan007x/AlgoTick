require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGeminiAPI() {
  console.log('\n🧪 Testing Gemini API Connection...\n');
  
  // Check if API key exists
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('1. API Key loaded:', apiKey ? `✅ Yes (${apiKey.substring(0, 10)}...)` : '❌ No');
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    return;
  }
  
  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('2. Gemini client initialized: ✅');
    
    // Try different model names that work with AI Studio
    const modelNames = ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-pro', 'models/gemini-1.5-flash'];
    
    for (const modelName of modelNames) {
      try {
        console.log(`\n3. Testing model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = "Respond with just 'OK' if you can read this.";
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        console.log(`✅ SUCCESS with model: ${modelName}`);
        console.log(`   Response: ${response}`);
        console.log('\n✅ Gemini API is working correctly!');
        console.log(`\n🎯 Use this model name in your code: "${modelName}"\n`);
        return; // Exit after first success
        
      } catch (modelError) {
        console.log(`   ❌ Failed: ${modelError.message.split('\n')[0]}`);
      }
    }
    
    console.log('\n❌ None of the model names worked. This might be an API key issue.');
    
  } catch (error) {
    console.error('\n❌ Gemini API Error:');
    console.error('   Error type:', error.constructor.name);
    console.error('   Error message:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('\n🔑 The API key appears to be invalid.');
      console.error('   Please verify your GEMINI_API_KEY in .env file');
      console.error('   Get a new key from: https://makersuite.google.com/app/apikey');
    }
    
    if (error.message.includes('quota')) {
      console.error('\n📊 API quota exceeded.');
      console.error('   Check your usage at: https://makersuite.google.com/');
    }
    
    console.error('\nFull error:', error);
  }
}

testGeminiAPI();
