#!/usr/bin/env node

/**
 * Quick Admin Setup Script
 * Run this from the root directory to set up admin credentials
 */

const { execSync } = require('child_process');
const path = require('path');

const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
};

const runAdminSetup = () => {
  try {
    log('🚀 Setting up admin credentials...', 'info');
    log('=' * 40, 'info');

    // Check if we're in the right directory
    const backendPath = path.join(process.cwd(), 'backend');
    
    log('📁 Navigating to backend directory...', 'info');
    process.chdir(backendPath);

    log('🔧 Running production setup...', 'info');
    execSync('npm run setup:production', { stdio: 'inherit' });

    log('\n✅ Admin setup completed!', 'success');
    log('\n🔐 Admin Credentials:', 'info');
    log('Email: nexaaurait@gmail.com', 'success');
    log('Password: trivedi_cs1', 'success');

    log('\n🌐 Next Steps:', 'info');
    log('1. Start backend: cd backend && npm run dev', 'info');
    log('2. Start frontend: cd frontend-new && npm run dev', 'info');
    log('3. Login at: http://localhost:3000/signin', 'info');
    log('4. Access admin panel: http://localhost:3000/app/admin', 'info');

  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'error');
    
    if (error.message.includes('ENOENT')) {
      log('\n💡 Make sure you run this from the project root directory', 'warning');
      log('💡 Also ensure backend dependencies are installed: cd backend && npm install', 'warning');
    }
    
    process.exit(1);
  }
};

// Run the setup
runAdminSetup();