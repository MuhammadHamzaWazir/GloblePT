const axios = require('axios');
const colors = require('console');

// Configuration
const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test credentials
const TEST_CREDENTIALS = {
  admin: { email: 'admin@pharmacy.com', password: 'password123' },
  supervisor: { email: 'supervisor@pharmacy.com', password: 'password123' },
  staff: { email: 'sarah.johnson@pharmacy.com', password: 'password123' },
  customer: { email: 'alice.smith@gmail.com', password: 'password123' },
};

let authTokens = {};

class APITester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      failures: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async test(name, testFunction) {
    this.results.total++;
    try {
      this.log(`Testing: ${name}`, 'info');
      await testFunction();
      this.results.passed++;
      this.log(`✅ PASSED: ${name}`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.failures.push({ name, error: error.message });
      this.log(`❌ FAILED: ${name} - ${error.message}`, 'error');
    }
  }

  async login(role) {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, TEST_CREDENTIALS[role]);
      if (response.data.token) {
        authTokens[role] = response.data.token;
        return response.data.token;
      }
      throw new Error('No token received');
    } catch (error) {
      throw new Error(`Login failed for ${role}: ${error.response?.data?.error || error.message}`);
    }
  }

  getAuthHeader(role) {
    return { Authorization: `Bearer ${authTokens[role]}` };
  }

  async runAllTests() {
    this.log('🚀 Starting comprehensive API testing...', 'info');
    this.log(`Base URL: ${BASE_URL}`, 'info');

    // Authentication tests
    await this.test('Admin login', () => this.login('admin'));
    await this.test('Supervisor login', () => this.login('supervisor'));
    await this.test('Staff login', () => this.login('staff'));
    await this.test('Customer login', () => this.login('customer'));

    // Auth verification tests
    await this.test('Verify admin token', async () => {
      const response = await axios.get(`${API_BASE}/auth/verify`, {
        headers: this.getAuthHeader('admin')
      });
      if (response.data.user.email !== TEST_CREDENTIALS.admin.email) {
        throw new Error('Token verification failed');
      }
    });

    // User management tests (Admin only)
    await this.test('Get all users (Admin)', async () => {
      const response = await axios.get(`${API_BASE}/admin/users`, {
        headers: this.getAuthHeader('admin')
      });
      if (!Array.isArray(response.data)) {
        throw new Error('Expected array of users');
      }
    });

    await this.test('Create new user (Admin)', async () => {
      const newUser = {
        name: 'Test User API',
        email: `test-${Date.now()}@test.com`,
        password: 'password123',
        address: '123 Test St',
        roleId: 3 // Customer role
      };
      const response = await axios.post(`${API_BASE}/admin/users`, newUser, {
        headers: this.getAuthHeader('admin')
      });
      if (!response.data.id) {
        throw new Error('User creation failed');
      }
    });

    // Role management tests
    await this.test('Get all roles (Admin)', async () => {
      const response = await axios.get(`${API_BASE}/admin/roles`, {
        headers: this.getAuthHeader('admin')
      });
      if (!Array.isArray(response.data)) {
        throw new Error('Expected array of roles');
      }
    });

    // Prescription tests
    await this.test('Get prescriptions (Staff)', async () => {
      const response = await axios.get(`${API_BASE}/staff/prescriptions`, {
        headers: this.getAuthHeader('staff')
      });
      if (!Array.isArray(response.data)) {
        throw new Error('Expected array of prescriptions');
      }
    });

    await this.test('Get all prescriptions (Admin)', async () => {
      const response = await axios.get(`${API_BASE}/admin/prescriptions`, {
        headers: this.getAuthHeader('admin')
      });
      if (!Array.isArray(response.data)) {
        throw new Error('Expected array of prescriptions');
      }
    });

    await this.test('Create prescription (Customer)', async () => {
      const prescription = {
        medicine: 'Test Medicine API',
        amount: 1,
        deliveryAddress: '123 Test Address'
      };
      const response = await axios.post(`${API_BASE}/prescriptions`, prescription, {
        headers: this.getAuthHeader('customer')
      });
      if (!response.data.id) {
        throw new Error('Prescription creation failed');
      }
    });

    // Complaint tests
    await this.test('Get complaints (Staff)', async () => {
      const response = await axios.get(`${API_BASE}/staff/complaints`, {
        headers: this.getAuthHeader('staff')
      });
      if (!Array.isArray(response.data)) {
        throw new Error('Expected array of complaints');
      }
    });

    await this.test('Get all complaints (Admin)', async () => {
      const response = await axios.get(`${API_BASE}/admin/complaints`, {
        headers: this.getAuthHeader('admin')
      });
      if (!Array.isArray(response.data)) {
        throw new Error('Expected array of complaints');
      }
    });

    await this.test('Create complaint (Customer)', async () => {
      const complaint = {
        message: 'Test complaint from API testing'
      };
      const response = await axios.post(`${API_BASE}/complaints`, complaint, {
        headers: this.getAuthHeader('customer')
      });
      if (!response.data.id) {
        throw new Error('Complaint creation failed');
      }
    });

    // Contact form test
    await this.test('Submit contact form', async () => {
      const contactData = {
        name: 'API Test User',
        email: 'apitest@test.com',
        subject: 'API Testing',
        message: 'This is a test message from API testing'
      };
      await axios.post(`${API_BASE}/contact`, contactData);
    });

    // Test email system (if configured)
    await this.test('Test email system (Admin)', async () => {
      try {
        await axios.post(`${API_BASE}/test-email`, {
          to: 'test@example.com',
          subject: 'API Test Email',
          message: 'This is a test email from API testing'
        }, {
          headers: this.getAuthHeader('admin')
        });
      } catch (error) {
        if (error.response?.status === 500 && error.response?.data?.error?.includes('EMAIL')) {
          // Email not configured, that's okay for testing
          return;
        }
        throw error;
      }
    });

    // Authorization tests (should fail)
    await this.test('Unauthorized access test (Customer accessing admin users)', async () => {
      try {
        await axios.get(`${API_BASE}/admin/users`, {
          headers: this.getAuthHeader('customer')
        });
        throw new Error('Should have been unauthorized');
      } catch (error) {
        if (error.response?.status !== 403 && error.response?.status !== 401) {
          throw new Error('Expected 401/403 status');
        }
      }
    });

    // Logout test
    await this.test('Logout (Admin)', async () => {
      await axios.post(`${API_BASE}/auth/logout`, {}, {
        headers: this.getAuthHeader('admin')
      });
    });

    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    this.log('🏁 API Testing Complete!', 'info');
    console.log('='.repeat(50));
    
    this.log(`Total Tests: ${this.results.total}`, 'info');
    this.log(`Passed: ${this.results.passed}`, 'success');
    this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');
    
    if (this.results.failures.length > 0) {
      this.log('\n❌ Failed Tests:', 'error');
      this.results.failures.forEach(failure => {
        this.log(`  - ${failure.name}: ${failure.error}`, 'error');
      });
    }

    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    this.log(`\nSuccess Rate: ${successRate}%`, successRate >= 90 ? 'success' : 'warning');
    
    if (successRate >= 90) {
      this.log('🎉 Great job! Your API is working well!', 'success');
    } else if (successRate >= 70) {
      this.log('⚠️  Some issues found. Please check the failed tests.', 'warning');
    } else {
      this.log('🚨 Many tests failed. Please review your API implementation.', 'error');
    }
  }
}

// Check if axios is available
async function checkDependencies() {
  try {
    require('axios');
  } catch (error) {
    console.log('❌ axios is required for API testing. Install it with: npm install axios');
    process.exit(1);
  }
}

// Main execution
async function main() {
  await checkDependencies();
  
  const tester = new APITester();
  
  // Wait a bit for the server to be ready
  console.log(`⏳ Waiting for server at ${BASE_URL}...`);
  
  let serverReady = false;
  let attempts = 0;
  const maxAttempts = 30;
  
  while (!serverReady && attempts < maxAttempts) {
    try {
      await axios.get(BASE_URL, { timeout: 3000 });
      serverReady = true;
    } catch (error) {
      attempts++;
      console.log(`⏳ Server not ready, attempt ${attempts}/${maxAttempts}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  if (!serverReady) {
    console.log('❌ Server is not responding. Please make sure your Next.js app is running.');
    process.exit(1);
  }
  
  console.log('✅ Server is ready! Starting tests...\n');
  
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = APITester;
