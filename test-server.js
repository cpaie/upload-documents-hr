// Test script to verify the OneDrive upload server is working
const fs = require('fs');
const path = require('path');

async function testServer() {
  console.log('🧪 Testing OneDrive Upload Server...');
  
  try {
    // Test health endpoint
    console.log('📋 Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ Health check passed:', healthData);
    } else {
      console.log('❌ Health check failed:', healthData);
      return;
    }
    
    // Create a test file
    const testContent = 'This is a test file for OneDrive upload';
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, testContent);
    
    console.log('📁 Created test file:', testFilePath);
    
    // Test file upload
    console.log('📤 Testing file upload...');
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(testFilePath);
    const blob = new Blob([fileBuffer], { type: 'text/plain' });
    formData.append('file', blob, 'test-file.txt');
    formData.append('folderPath', 'test-uploads');
    
    const uploadResponse = await fetch('http://localhost:3001/api/upload-to-onedrive', {
      method: 'POST',
      body: formData
    });
    
    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      console.log('✅ File upload successful:', uploadData);
    } else {
      const errorData = await uploadResponse.text();
      console.log('❌ File upload failed:', errorData);
    }
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    console.log('🧹 Cleaned up test file');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testServer(); 