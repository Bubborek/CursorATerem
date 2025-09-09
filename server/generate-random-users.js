#!/usr/bin/env node

/**
 * Gym Access Control - Random User Generator
 * 
 * This script generates 10 random users with:
 * - Random usernames
 * - Random pass types (Daily, Weekly, Monthly, Yearly)
 * - Random expiration dates (some expired, some active)
 * - Random badges assigned to each user
 * 
 * Usage: node generate-random-users.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🎲 Gym Access Control - Random User Generator');
console.log('=============================================\n');

try {
  console.log('🚀 Starting random user generation...');
  console.log('📝 This will:');
  console.log('   • Clear all existing users from the database');
  console.log('   • Keep admin and staff accounts');
  console.log('   • Generate 10 random users with usernames');
  console.log('   • Assign random membership types and expiration dates');
  console.log('   • Assign random badges to each user');
  console.log('   • Create sample access logs\n');

  // Run the seed script
  const seedScriptPath = path.join(__dirname, 'prisma', 'seed-random-users.js');
  execSync(`node "${seedScriptPath}"`, { stdio: 'inherit' });

  console.log('\n✅ Random user generation completed successfully!');
  console.log('\n🔑 Login credentials:');
  console.log('   Admin: admin@gym.com / admin123');
  console.log('   Staff: staff@gym.com / staff123');
  console.log('   Users: [any email from the list above] / password123');
  console.log('\n🌐 Start your application with: npm run dev');

} catch (error) {
  console.error('❌ Error generating random users:', error.message);
  process.exit(1);
}
