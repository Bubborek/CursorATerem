#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test basic queries
    const memberCount = await prisma.member.count();
    const staffCount = await prisma.staff.count();
    const membershipCount = await prisma.membership.count();
    const logCount = await prisma.accessLog.count();
    
    console.log('📊 Database statistics:');
    console.log(`   Members: ${memberCount}`);
    console.log(`   Staff: ${staffCount}`);
    console.log(`   Memberships: ${membershipCount}`);
    console.log(`   Access Logs: ${logCount}`);
    
    if (memberCount === 0) {
      console.log('⚠️  No members found. Run "npm run db:seed" to populate the database.');
    }
    
    if (staffCount === 0) {
      console.log('⚠️  No staff found. Run "npm run db:seed" to create demo accounts.');
    }
    
    console.log('✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your DATABASE_URL in server/.env');
    console.log('3. Ensure the database "gym_access_control" exists');
    console.log('4. Run "npm run db:migrate" to create tables');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function testAPIEndpoints() {
  try {
    console.log('\n🌐 Testing API endpoints...');
    
    const axios = require('axios');
    const baseURL = 'http://localhost:5000';
    
    // Test health endpoint
    const healthResponse = await axios.get(`${baseURL}/api/health`);
    console.log('✅ Health endpoint working');
    
    // Test login endpoint
    try {
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        email: 'admin@gym.com',
        password: 'admin123'
      });
      console.log('✅ Login endpoint working');
      
      const token = loginResponse.data.token;
      
      // Test protected endpoint
      const membersResponse = await axios.get(`${baseURL}/api/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Protected endpoints working');
      console.log(`   Found ${membersResponse.data.length} members`);
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('⚠️  Login failed - make sure database is seeded');
      } else {
        console.log('⚠️  API test failed:', error.message);
      }
    }
    
  } catch (error) {
    console.log('⚠️  API server not running or not accessible');
    console.log('   Make sure to run "npm run server" in another terminal');
  }
}

async function main() {
  console.log('🧪 Running system tests...\n');
  
  await testDatabaseConnection();
  await testAPIEndpoints();
  
  console.log('\n🎉 System tests completed!');
  console.log('\n📋 If all tests passed, you can:');
  console.log('1. Run "npm run dev" to start the full application');
  console.log('2. Open http://localhost:3000 in your browser');
  console.log('3. Login with admin@gym.com / admin123');
}

main().catch(console.error);
