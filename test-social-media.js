// Test script to verify social media API integration
// Run with: node test-social-media.js

const { FacebookApiService, InstagramApiService } = require('./src/server/api/services/socialMediaService');

async function testFacebookConnection() {
  console.log('🔵 Testing Facebook API Connection...');
  
  const config = {
    appId: process.env.FACEBOOK_APP_ID || 'your_app_id',
    appSecret: process.env.FACEBOOK_APP_SECRET || 'your_app_secret', 
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN || 'your_access_token',
    webhookVerifyToken: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'verify_token'
  };

  try {
    const fbService = new FacebookApiService(config);
    
    // Test connection
    const isConnected = await fbService.testConnection();
    console.log(`✅ Facebook connected: ${isConnected}`);
    
    if (isConnected) {
      // Test lead capture
      const leads = await fbService.captureLeads();
      console.log(`📝 Facebook leads found: ${leads.length}`);
      console.log('Sample lead:', leads[0] || 'No leads');
    }
  } catch (error) {
    console.log(`❌ Facebook error: ${error.message}`);
  }
}

async function testInstagramConnection() {
  console.log('🟡 Testing Instagram API Connection...');
  
  const config = {
    businessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || 'your_business_id',
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || 'your_access_token'
  };

  try {
    const igService = new InstagramApiService(config);
    
    // Test connection
    const isConnected = await igService.testConnection();
    console.log(`✅ Instagram connected: ${isConnected}`);
    
    if (isConnected) {
      // Test interactions
      const interactions = await igService.getInteractions('test_contact');
      console.log(`💬 Instagram interactions found: ${interactions.length}`);
      console.log('Sample interaction:', interactions[0] || 'No interactions');
    }
  } catch (error) {
    console.log(`❌ Instagram error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting Social Media API Tests\n');
  
  await testFacebookConnection();
  console.log('');
  await testInstagramConnection();
  
  console.log('\n✨ Tests completed!');
  console.log('\n📝 To get real data, you need:');
  console.log('1. Facebook App ID, Secret, and Page Access Token');
  console.log('2. Instagram Business Account ID and Access Token');
  console.log('3. Set environment variables or update config in this script');
}

runTests().catch(console.error);