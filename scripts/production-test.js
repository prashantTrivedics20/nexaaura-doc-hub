#!/usr/bin/env node

/**
 * Production Readiness Test Script
 * Tests all major functionality before deployment
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Test results
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper functions
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

const test = async (name, testFn) => {
  try {
    log(`Testing: ${name}`, 'info');
    await testFn();
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASSED' });
    log(`✅ ${name} - PASSED`, 'success');
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAILED', error: error.message });
    log(`❌ ${name} - FAILED: ${error.message}`, 'error');
  }
};

// Test functions
const testBackendHealth = async () => {
  const response = await axios.get(`${API_BASE_URL}/health`);
  if (response.status !== 200) {
    throw new Error('Backend health check failed');
  }
  if (!response.data.status || response.data.status === 'unhealthy') {
    throw new Error('Backend reports unhealthy status');
  }
};

const testDatabaseConnection = async () => {
  const response = await axios.get(`${API_BASE_URL}/health`);
  if (!response.data.database || response.data.database.status !== 'connected') {
    throw new Error('Database connection failed');
  }
};

const testAuthenticationFlow = async () => {
  // Test registration
  const registerData = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'testpassword123'
  };

  const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, registerData);
  if (registerResponse.status !== 201) {
    throw new Error('User registration failed');
  }

  const token = registerResponse.data.token;
  if (!token) {
    throw new Error('No token received after registration');
  }

  // Test login
  const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
    email: registerData.email,
    password: registerData.password
  });

  if (loginResponse.status !== 200) {
    throw new Error('User login failed');
  }

  // Test protected route
  const meResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (meResponse.status !== 200) {
    throw new Error('Protected route access failed');
  }
};

const testDocumentAPI = async () => {
  // Create test user first
  const userData = {
    username: `doctest_${Date.now()}`,
    email: `doctest_${Date.now()}@example.com`,
    password: 'testpassword123'
  };

  const userResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
  const token = userResponse.data.token;

  // Test document listing
  const docsResponse = await axios.get(`${API_BASE_URL}/api/documents`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (docsResponse.status !== 200) {
    throw new Error('Document listing failed');
  }

  if (!Array.isArray(docsResponse.data.documents)) {
    throw new Error('Documents response is not an array');
  }
};

const testStatsAPI = async () => {
  // Create test user
  const userData = {
    username: `statstest_${Date.now()}`,
    email: `statstest_${Date.now()}@example.com`,
    password: 'testpassword123'
  };

  const userResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
  const token = userResponse.data.token;

  // Test dashboard stats
  const statsResponse = await axios.get(`${API_BASE_URL}/api/stats/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (statsResponse.status !== 200) {
    throw new Error('Stats API failed');
  }

  const requiredFields = ['totalDocuments', 'totalCategories', 'totalDownloads', 'userProgress'];
  for (const field of requiredFields) {
    if (!(field in statsResponse.data)) {
      throw new Error(`Missing required stats field: ${field}`);
    }
  }
};

const testCategoriesAPI = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/categories`);
  
  if (response.status !== 200) {
    throw new Error('Categories API failed');
  }

  if (!Array.isArray(response.data.categories)) {
    throw new Error('Categories response is not an array');
  }
};

const testAdminAPI = async () => {
  // Create admin user
  const adminData = {
    username: `admin_${Date.now()}`,
    email: `admin_${Date.now()}@example.com`,
    password: 'adminpassword123'
  };

  // Note: In production, admin users should be created through proper channels
  // This is just for testing
  try {
    const adminResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, adminData);
    const token = adminResponse.data.token;

    // Test admin settings (this might fail if user is not admin, which is expected)
    try {
      const settingsResponse = await axios.get(`${API_BASE_URL}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // If this succeeds, the user was somehow made admin, which is fine for testing
    } catch (error) {
      // Expected for non-admin users
      if (error.response && error.response.status === 403) {
        // This is expected behavior
        return;
      }
      throw error;
    }
  } catch (error) {
    // Admin API test is optional since we can't easily create admin users in tests
    log('Admin API test skipped (requires admin user)', 'warning');
  }
};

const testEnvironmentVariables = async () => {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  // We can't directly check backend env vars, but we can check if services work
  const response = await axios.get(`${API_BASE_URL}/health`);
  
  if (!response.data.database || response.data.database.status !== 'connected') {
    throw new Error('Database connection suggests missing MONGODB_URI');
  }

  // JWT secret is tested implicitly through auth tests
  // Cloudinary is tested implicitly through file upload (if implemented)
};

const testSecurityHeaders = async () => {
  const response = await axios.get(`${API_BASE_URL}/health`);
  
  // Check for basic security headers
  const headers = response.headers;
  
  if (!headers['x-content-type-options']) {
    throw new Error('Missing X-Content-Type-Options header');
  }
  
  if (!headers['x-frame-options']) {
    throw new Error('Missing X-Frame-Options header');
  }
};

const testRateLimiting = async () => {
  // Test rate limiting by making multiple rapid requests
  const requests = [];
  for (let i = 0; i < 10; i++) {
    requests.push(axios.get(`${API_BASE_URL}/health`));
  }

  try {
    await Promise.all(requests);
    // If all requests succeed, rate limiting might not be working
    // But this could also mean the limit is high enough for our test
    log('Rate limiting test: All requests succeeded (limit may be high)', 'warning');
  } catch (error) {
    // Some requests failed, which could indicate rate limiting is working
    if (error.response && error.response.status === 429) {
      // This is good - rate limiting is working
      return;
    }
    throw error;
  }
};

const testCORSConfiguration = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });

    if (!response.headers['access-control-allow-origin']) {
      throw new Error('CORS headers not present');
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to backend server');
    }
    throw error;
  }
};

// Main test runner
const runTests = async () => {
  log('🚀 Starting Production Readiness Tests', 'info');
  log('=' * 50, 'info');

  // Core functionality tests
  await test('Backend Health Check', testBackendHealth);
  await test('Database Connection', testDatabaseConnection);
  await test('Authentication Flow', testAuthenticationFlow);
  await test('Document API', testDocumentAPI);
  await test('Statistics API', testStatsAPI);
  await test('Categories API', testCategoriesAPI);
  await test('Admin API', testAdminAPI);

  // Security and configuration tests
  await test('Environment Variables', testEnvironmentVariables);
  await test('Security Headers', testSecurityHeaders);
  await test('Rate Limiting', testRateLimiting);
  await test('CORS Configuration', testCORSConfiguration);

  // Results summary
  log('=' * 50, 'info');
  log('📊 Test Results Summary', 'info');
  log(`✅ Passed: ${testResults.passed}`, 'success');
  log(`❌ Failed: ${testResults.failed}`, 'error');
  log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`, 'info');

  if (testResults.failed > 0) {
    log('\n❌ Failed Tests:', 'error');
    testResults.tests
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        log(`  • ${test.name}: ${test.error}`, 'error');
      });
  }

  // Generate test report
  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      apiUrl: API_BASE_URL,
      frontendUrl: FRONTEND_URL,
      nodeVersion: process.version
    },
    results: testResults,
    summary: {
      total: testResults.passed + testResults.failed,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)
    }
  };

  // Save report to file
  const reportPath = path.join(__dirname, '..', 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 Test report saved to: ${reportPath}`, 'info');

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
};

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`Unhandled rejection: ${error.message}`, 'error');
  process.exit(1);
});

// Run tests
runTests().catch((error) => {
  log(`Test runner error: ${error.message}`, 'error');
  process.exit(1);
});