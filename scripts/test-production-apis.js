#!/usr/bin/env node

/**
 * Production API Test Suite
 * Comprehensive tests for the live pharmacy management system deployment
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Production Vercel deployment URL
const BASE_URL = 'https://pharmacy-management-system-2v8qig04k.vercel.app';

class APITester {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.token = null;
  }

  log(message, type = 'info') {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪'
    };
    console.log(`${icons[type]} ${message}`);
  }

  async test(name, testFn) {
    this.log(`Testing: ${name}`, 'test');
    try {
      await testFn();
      this.passed++;
      this.log(`PASSED: ${name}`, 'success');
    } catch (error) {
      this.failed++;
      this.log(`FAILED: ${name} - ${error.message}`, 'error');
    }
  }

  async apiCall(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      }
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json().catch(() => ({ error: 'Invalid JSON response' }));
    
    return { response, data };
  }

  async runTests() {
    this.log('🚀 Starting Production API Test Suite...', 'info');
    this.log(`🌐 Testing deployment at: ${BASE_URL}`, 'info');
    
    // Test 1: Health Check
    await this.test('Health Check', async () => {
      const { response } = await this.apiCall('/api/health');
      if (!response.ok) throw new Error(`Health check failed with status ${response.status}`);
    });

    // Test 2: Database Connection
    await this.test('Database Connection', async () => {
      const { response, data } = await this.apiCall('/api/test-db');
      if (!response.ok) throw new Error(`Database test failed: ${data.error || 'Unknown error'}`);
      if (!data.success) throw new Error('Database connection test failed');
    });

    // Test 3: User Authentication
    await this.test('User Authentication', async () => {
      const { response, data } = await this.apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@pharmacy.com',
          password: 'password123'
        })
      });
      
      if (!response.ok) throw new Error(`Login failed with status ${response.status}: ${data.error || 'Unknown error'}`);
      if (!data.token) throw new Error('No token received from login');
      
      this.token = data.token;
    });

    // Test 4: Protected Route Access
    await this.test('Protected Route Access', async () => {
      const { response, data } = await this.apiCall('/api/users');
      if (!response.ok) throw new Error(`Protected route failed with status ${response.status}`);
      if (!Array.isArray(data)) throw new Error('Users API did not return an array');
    });

    // Test 5: User Management
    await this.test('User Management', async () => {
      const { response, data } = await this.apiCall('/api/users');
      if (!response.ok) throw new Error(`Users API failed with status ${response.status}`);
      if (data.length === 0) throw new Error('No users found in database');
    });

    // Test 6: Prescription Management  
    await this.test('Prescription Management', async () => {
      const { response, data } = await this.apiCall('/api/prescriptions');
      if (!response.ok) throw new Error(`Prescriptions API failed with status ${response.status}`);
      if (!Array.isArray(data)) throw new Error('Prescriptions API did not return an array');
    });

    // Test 7: Staff Management
    await this.test('Staff Management', async () => {
      const { response, data } = await this.apiCall('/api/staff');
      if (!response.ok) throw new Error(`Staff API failed with status ${response.status}`);
      if (!Array.isArray(data)) throw new Error('Staff API did not return an array');
    });

    // Test 8: Complaint System
    await this.test('Complaint System', async () => {
      const { response, data } = await this.apiCall('/api/complaints');
      if (!response.ok) throw new Error(`Complaints API failed with status ${response.status}`);
      if (!Array.isArray(data)) throw new Error('Complaints API did not return an array');
    });

    // Test 9: Role-based Access
    await this.test('Role-based Access', async () => {
      const { response, data } = await this.apiCall('/api/admin/users');
      if (!response.ok) throw new Error(`Admin API failed with status ${response.status}`);
      if (!Array.isArray(data)) throw new Error('Admin users API did not return an array');
    });

    // Test 10: Database Seeding Status
    await this.test('Database Seeding Status', async () => {
      const { response, data } = await this.apiCall('/api/users');
      if (!response.ok) throw new Error(`Users check failed with status ${response.status}`);
      
      // Check if we have the expected seeded users
      const adminUser = data.find(user => user.email === 'admin@pharmacy.com');
      if (!adminUser) throw new Error('Admin user not found - database may not be properly seeded');
      
      const supervisorUser = data.find(user => user.email === 'supervisor@pharmacy.com');
      if (!supervisorUser) throw new Error('Supervisor user not found - database may not be properly seeded');
    });

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('🎯 PRODUCTION API TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📊 Total: ${this.passed + this.failed}`);
    console.log(`📈 Success Rate: ${Math.round((this.passed / (this.passed + this.failed)) * 100)}%`);
    
    if (this.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Your production deployment is working perfectly!');
      console.log(`🌐 Live site: ${BASE_URL}`);
      console.log('🔑 Test login: admin@pharmacy.com / password123');
    } else {
      console.log(`\n⚠️  ${this.failed} test(s) failed. Please check the errors above.`);
    }
    console.log('='.repeat(50));
  }
}

// Run the tests
const tester = new APITester();
tester.runTests().catch(error => {
  console.error('❌ Test suite failed to run:', error.message);
  process.exit(1);
});
