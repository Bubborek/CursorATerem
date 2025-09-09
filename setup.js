#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏋️‍♂️ Setting up Gym Access Control System...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ Node.js version 16 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version check passed:', nodeVersion);

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
  
  execSync('cd server && npm install', { stdio: 'inherit' });
  console.log('✅ Server dependencies installed');
  
  execSync('cd client && npm install', { stdio: 'inherit' });
  console.log('✅ Client dependencies installed');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Check if .env file exists
const envPath = path.join(__dirname, 'server', '.env');
const envExamplePath = path.join(__dirname, 'server', 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from template');
    console.log('⚠️  Please update server/.env with your database credentials');
  } else {
    console.log('⚠️  Please create server/.env file with your database configuration');
  }
} else {
  console.log('✅ .env file already exists');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update server/.env with your PostgreSQL database URL');
console.log('2. Create a PostgreSQL database named "gym_access_control"');
console.log('3. Run: npm run db:migrate');
console.log('4. Run: npm run db:seed');
console.log('5. Run: npm run dev');
console.log('\n🌐 The application will be available at:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend:  http://localhost:5000');
console.log('\n🔑 Demo credentials:');
console.log('   Admin: admin@gym.com / admin123');
console.log('   Staff: staff@gym.com / staff123');
