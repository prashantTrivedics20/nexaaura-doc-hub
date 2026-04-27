#!/usr/bin/env node

/**
 * Emergency Reset Script
 * Completely resets the server configuration and clears all caches
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY RESET STARTING...');
console.log('');

// Step 1: Kill all Node processes
console.log('1️⃣ Killing all Node processes...');
exec('taskkill /F /IM node.exe /T', (error) => {
  if (error) {
    console.log('   No Node processes found or already killed');
  } else {
    console.log('   ✅ Node processes killed');
  }
});

exec('taskkill /F /IM nodemon.exe /T', (error) => {
  if (error) {
    console.log('   No Nodemon processes found');
  } else {
    console.log('   ✅ Nodemon processes killed');
  }
});

// Step 2: Clear npm cache
console.log('');
console.log('2️⃣ Clearing npm cache...');
exec('npm cache clean --force', (error) => {
  if (error) {
    console.log('   ⚠️ Cache clear failed:', error.message);
  } else {
    console.log('   ✅ npm cache cleared');
  }
});

// Step 3: Remove node_modules cache
console.log('');
console.log('3️⃣ Checking for cached modules...');
const cacheDir = path.join(__dirname, 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  try {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('   ✅ Module cache cleared');
  } catch (error) {
    console.log('   ⚠️ Cache removal failed:', error.message);
  }
} else {
  console.log('   ℹ️ No module cache found');
}

// Step 4: Wait and show instructions
setTimeout(() => {
  console.log('');
  console.log('4️⃣ MANUAL STEPS REQUIRED:');
  console.log('');
  console.log('   🔴 CLOSE THIS TERMINAL WINDOW COMPLETELY');
  console.log('   🔴 WAIT 10 SECONDS');
  console.log('   🟢 OPEN A NEW TERMINAL WINDOW');
  console.log('   🟢 Run: cd backend');
  console.log('   🟢 Run: npm run dev');
  console.log('');
  console.log('💡 The server MUST be started in a fresh terminal!');
  console.log('');
  console.log('🎯 Expected output after restart:');
  console.log('   "🔍 Upload attempt started..."');
  console.log('   "❌ Upload error: File too large. Maximum file size is 10MB"');
  console.log('');
  console.log('✅ This is the CORRECT behavior for Cloudinary free plan!');
}, 2000);