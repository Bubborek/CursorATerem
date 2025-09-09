const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Sample data for random generation
const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn',
  'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Hayden', 'Jamie', 'Kendall',
  'Logan', 'Parker', 'Peyton', 'Reese', 'Sage', 'Skyler', 'Sydney', 'Tatum'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'
];

const membershipTypes = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

const badgeNames = [
  'First Entry', 'Top 10 Weekly', 'Annual Member', 'Early Bird', 'Night Owl',
  'Weekend Warrior', 'Consistent Visitor', 'Fitness Enthusiast', 'Gym Regular',
  'Motivation Master', 'Strength Seeker', 'Cardio Champion', 'Flexibility Fan',
  'Wellness Warrior', 'Health Hero', 'Fitness Fanatic', 'Gym Guru', 'Workout Wizard'
];

const badgeDescriptions = {
  'First Entry': 'Welcome to the gym! Your fitness journey begins now.',
  'Top 10 Weekly': 'You\'re in the top 10 most active members this week!',
  'Annual Member': 'Congratulations on your annual membership commitment!',
  'Early Bird': 'You love working out in the morning hours.',
  'Night Owl': 'You prefer late-night workout sessions.',
  'Weekend Warrior': 'You make the most of your weekend workouts.',
  'Consistent Visitor': 'You visit the gym regularly and maintain consistency.',
  'Fitness Enthusiast': 'Your passion for fitness is truly inspiring.',
  'Gym Regular': 'You\'re a familiar face around here.',
  'Motivation Master': 'You motivate others with your dedication.',
  'Strength Seeker': 'You\'re focused on building strength and power.',
  'Cardio Champion': 'You excel at cardiovascular exercises.',
  'Flexibility Fan': 'You prioritize flexibility and mobility.',
  'Wellness Warrior': 'You approach fitness holistically.',
  'Health Hero': 'You\'re a champion of health and wellness.',
  'Fitness Fanatic': 'Your love for fitness knows no bounds.',
  'Gym Guru': 'You\'re knowledgeable about fitness and training.',
  'Workout Wizard': 'You have magical workout skills.'
};

const badgeIcons = {
  'First Entry': '🎯',
  'Top 10 Weekly': '🏆',
  'Annual Member': '⭐',
  'Early Bird': '🌅',
  'Night Owl': '🦉',
  'Weekend Warrior': '⚔️',
  'Consistent Visitor': '📅',
  'Fitness Enthusiast': '💪',
  'Gym Regular': '🏋️',
  'Motivation Master': '🔥',
  'Strength Seeker': '💥',
  'Cardio Champion': '❤️',
  'Flexibility Fan': '🧘',
  'Wellness Warrior': '🛡️',
  'Health Hero': '🦸',
  'Fitness Fanatic': '🎪',
  'Gym Guru': '🧙',
  'Workout Wizard': '🪄'
};

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateUsername(firstName, lastName) {
  const randomNum = Math.floor(Math.random() * 1000);
  return `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomNum}`;
}

function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'fitness.com'];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(domains)}`;
}

function generatePhoneNumber() {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `+1${areaCode}${exchange}${number}`;
}

function getExpirationDate(membershipType, purchaseDate) {
  const expiration = new Date(purchaseDate);
  
  switch (membershipType) {
    case 'DAILY':
      expiration.setDate(expiration.getDate() + 1);
      break;
    case 'WEEKLY':
      expiration.setDate(expiration.getDate() + 7);
      break;
    case 'MONTHLY':
      expiration.setMonth(expiration.getMonth() + 1);
      break;
    case 'YEARLY':
      expiration.setFullYear(expiration.getFullYear() + 1);
      break;
  }
  
  return expiration;
}

async function createRandomBadges() {
  console.log('Creating random badges...');
  
  for (const badgeName of badgeNames) {
    await prisma.badge.upsert({
      where: { name: badgeName },
      update: {},
      create: {
        name: badgeName,
        description: badgeDescriptions[badgeName],
        icon_url: badgeIcons[badgeName],
        criteria: JSON.stringify({ type: 'random_generation' })
      }
    });
  }
  
  console.log('Created all badges');
}

async function createRandomUser() {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const username = generateUsername(firstName, lastName);
  const email = generateEmail(firstName, lastName);
  const phoneNumber = generatePhoneNumber();
  const membershipType = getRandomElement(membershipTypes);
  
  // Generate random dates
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  
  const purchaseDate = getRandomDate(oneYearAgo, now);
  const expirationDate = getExpirationDate(membershipType, purchaseDate);
  
  // Determine membership status
  const status = expirationDate < now ? 'EXPIRED' : 'ACTIVE';
  
  // Create member
  const member = await prisma.member.create({
    data: {
      username,
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phoneNumber,
      qr_code: uuidv4(),
      password_hash: await bcrypt.hash('password123', 10)
    }
  });
  
  // Create membership
  const membership = await prisma.membership.create({
    data: {
      member_id: member.member_id,
      membership_type: membershipType,
      purchase_date: purchaseDate,
      expiration_date: expirationDate,
      status
    }
  });
  
  // Assign random badges (1-3 badges per user)
  const numBadges = Math.floor(Math.random() * 3) + 1;
  const availableBadges = await prisma.badge.findMany();
  const selectedBadges = availableBadges
    .sort(() => 0.5 - Math.random())
    .slice(0, numBadges);
  
  for (const badge of selectedBadges) {
    await prisma.memberBadge.create({
      data: {
        member_id: member.member_id,
        badge_id: badge.badge_id,
        earned_date: getRandomDate(purchaseDate, now)
      }
    });
  }
  
  // Create some random access logs
  const numLogs = Math.floor(Math.random() * 10) + 1;
  for (let i = 0; i < numLogs; i++) {
    const logDate = getRandomDate(purchaseDate, now);
    const result = status === 'ACTIVE' && logDate <= expirationDate ? 'GRANTED' : 'DENIED';
    
    await prisma.accessLog.create({
      data: {
        member_id: member.member_id,
        result,
        scan_time: logDate
      }
    });
  }
  
  return {
    member,
    membership,
    badges: selectedBadges,
    accessLogs: numLogs
  };
}

async function main() {
  console.log('🚀 Starting random user generation...');
  
  try {
    // Clear all existing users and related data
    console.log('🧹 Clearing existing data...');
    
    await prisma.memberBadge.deleteMany();
    await prisma.accessLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.member.deleteMany();
    
    console.log('✅ Cleared all existing user data');
    
    // Create admin and staff users (keep these)
    console.log('👥 Creating admin and staff users...');
    
    const admin = await prisma.staff.upsert({
      where: { email: 'admin@gym.com' },
      update: {},
      create: {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@gym.com',
        password_hash: await bcrypt.hash('admin123', 10),
        role: 'admin'
      }
    });
    
    const staff = await prisma.staff.upsert({
      where: { email: 'staff@gym.com' },
      update: {},
      create: {
        first_name: 'John',
        last_name: 'Staff',
        email: 'staff@gym.com',
        password_hash: await bcrypt.hash('staff123', 10),
        role: 'staff'
      }
    });
    
    console.log('✅ Created admin and staff users');
    
    // Create random badges
    await createRandomBadges();
    
    // Generate 10 random users
    console.log('🎲 Generating 10 random users...');
    
    const users = [];
    for (let i = 1; i <= 10; i++) {
      console.log(`Creating user ${i}/10...`);
      const userData = await createRandomUser();
      users.push(userData);
    }
    
    console.log('✅ Successfully generated 10 random users!');
    
    // Display summary
    console.log('\n📊 SUMMARY:');
    console.log('===========');
    
    users.forEach((user, index) => {
      const member = user.member;
      const membership = user.membership;
      const badges = user.badges;
      
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   Username: ${member.username}`);
      console.log(`   Name: ${member.first_name} ${member.last_name}`);
      console.log(`   Email: ${member.email}`);
      console.log(`   Membership: ${membership.membership_type} (${membership.status})`);
      console.log(`   Expires: ${membership.expiration_date.toLocaleDateString()}`);
      console.log(`   Badges: ${badges.map(b => b.name).join(', ')}`);
      console.log(`   Access Logs: ${user.accessLogs} entries`);
    });
    
    console.log('\n🎉 Random user generation completed successfully!');
    console.log('\n📝 Login credentials for testing:');
    console.log('   Admin: admin@gym.com / admin123');
    console.log('   Staff: staff@gym.com / staff123');
    console.log('   Users: [any email from above] / password123');
    
  } catch (error) {
    console.error('❌ Error during random user generation:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('💥 Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
