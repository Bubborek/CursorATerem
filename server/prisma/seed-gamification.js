const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Badge data with rarities and point values
const badges = [
  // Common badges (50 points)
  { name: 'First Entry', description: 'Welcome to the gym! Your first visit is complete.', icon_url: '🎯', rarity: 'COMMON', point_value: 50 },
  { name: 'Early Bird', description: 'You love working out in the morning hours.', icon_url: '🌅', rarity: 'COMMON', point_value: 50 },
  { name: 'Night Owl', description: 'You prefer late-night workout sessions.', icon_url: '🦉', rarity: 'COMMON', point_value: 50 },
  { name: 'Weekend Warrior', description: 'You make the most of your weekend workouts.', icon_url: '⚔️', rarity: 'COMMON', point_value: 50 },
  { name: 'Consistent Visitor', description: 'You visit the gym regularly and maintain consistency.', icon_url: '📅', rarity: 'COMMON', point_value: 50 },
  { name: 'Gym Regular', description: 'You\'re a familiar face around here.', icon_url: '🏋️', rarity: 'COMMON', point_value: 50 },
  { name: 'Flexibility Fan', description: 'You prioritize flexibility and mobility.', icon_url: '🧘', rarity: 'COMMON', point_value: 50 },
  { name: 'Cardio Champion', description: 'You excel at cardiovascular exercises.', icon_url: '❤️', rarity: 'COMMON', point_value: 50 },
  
  // Rare badges (150 points)
  { name: 'Top 10 Weekly', description: 'You\'re in the top 10 most active members this week!', icon_url: '🏆', rarity: 'RARE', point_value: 150 },
  { name: 'Monthly Champion', description: 'You\'ve visited 20 times this month!', icon_url: '🥇', rarity: 'RARE', point_value: 150 },
  { name: 'Fitness Enthusiast', description: 'Your passion for fitness is truly inspiring.', icon_url: '💪', rarity: 'RARE', point_value: 150 },
  { name: 'Motivation Master', description: 'You motivate others with your dedication.', icon_url: '🔥', rarity: 'RARE', point_value: 150 },
  { name: 'Strength Seeker', description: 'You\'re focused on building strength and power.', icon_url: '💥', rarity: 'RARE', point_value: 150 },
  { name: 'Wellness Warrior', description: 'You approach fitness holistically.', icon_url: '🛡️', rarity: 'RARE', point_value: 150 },
  { name: 'Health Hero', description: 'You\'re a champion of health and wellness.', icon_url: '🦸', rarity: 'RARE', point_value: 150 },
  { name: 'Gym Guru', description: 'You\'re knowledgeable about fitness and training.', icon_url: '🧙', rarity: 'RARE', point_value: 150 },
  
  // Epic badges (500 points)
  { name: 'Annual Member', description: 'Congratulations on your annual membership commitment!', icon_url: '⭐', rarity: 'EPIC', point_value: 500 },
  { name: 'Streak Master', description: 'You\'ve maintained a 30-day streak!', icon_url: '🔥', rarity: 'EPIC', point_value: 500 },
  { name: 'Fitness Fanatic', description: 'Your love for fitness knows no bounds.', icon_url: '🎪', rarity: 'EPIC', point_value: 500 },
  { name: 'Workout Wizard', description: 'You have magical workout skills.', icon_url: '🪄', rarity: 'EPIC', point_value: 500 },
  { name: 'Peak Performer', description: 'You consistently perform at your peak.', icon_url: '⛰️', rarity: 'EPIC', point_value: 500 },
  { name: 'Solo Warrior', description: 'You prefer to train alone and focus on your goals.', icon_url: '⚔️', rarity: 'EPIC', point_value: 500 },
  { name: 'Morning Person', description: 'You\'re always the first one at the gym.', icon_url: '🌅', rarity: 'EPIC', point_value: 500 },
  { name: 'Iron Will', description: 'Your determination is unbreakable.', icon_url: '💪', rarity: 'EPIC', point_value: 500 },
  
  // Legendary badges (1000 points)
  { name: 'Gym Legend', description: 'You are a true legend of the gym!', icon_url: '👑', rarity: 'LEGENDARY', point_value: 1000 },
  { name: 'Century Club', description: 'You\'ve visited the gym 100 times!', icon_url: '💯', rarity: 'LEGENDARY', point_value: 1000 },
  { name: 'Unstoppable Force', description: 'Nothing can stop your fitness journey.', icon_url: '🚀', rarity: 'LEGENDARY', point_value: 1000 },
  { name: 'Fitness Deity', description: 'You have achieved god-like fitness status.', icon_url: '⚡', rarity: 'LEGENDARY', point_value: 1000 },
  { name: 'The Immortal', description: 'Your dedication to fitness is eternal.', icon_url: '♾️', rarity: 'LEGENDARY', point_value: 1000 }
];

async function createGamificationBadges() {
  console.log('🎮 Creating gamification badges...');
  
  for (const badgeData of badges) {
    await prisma.badge.upsert({
      where: { name: badgeData.name },
      update: {},
      create: {
        name: badgeData.name,
        description: badgeData.description,
        icon_url: badgeData.icon_url,
        rarity: badgeData.rarity,
        point_value: badgeData.point_value,
        criteria: JSON.stringify({ type: 'gamification' })
      }
    });
  }
  
  console.log('✅ Created all gamification badges');
}

async function updateExistingMembers() {
  console.log('🔄 Updating existing members with gamification data...');
  
  const members = await prisma.member.findMany();
  
  for (const member of members) {
    // Calculate some initial stats based on existing access logs
    const accessLogs = await prisma.accessLog.findMany({
      where: {
        member_id: member.member_id,
        result: 'GRANTED'
      },
      orderBy: {
        scan_time: 'asc'
      }
    });
    
    if (accessLogs.length > 0) {
      // Calculate initial streak (simplified)
      let currentStreak = 1;
      let longestStreak = 1;
      let tempStreak = 1;
      
      for (let i = 1; i < accessLogs.length; i++) {
        const prevDate = new Date(accessLogs[i-1].scan_time);
        const currDate = new Date(accessLogs[i].scan_time);
        const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
      currentStreak = tempStreak;
      
      // Calculate initial points and experience
      const totalVisits = accessLogs.length;
      const basePoints = totalVisits * 100; // 100 points per visit
      const experience = basePoints;
      const level = Math.floor(experience / 1000) + 1;
      
      await prisma.member.update({
        where: { member_id: member.member_id },
        data: {
          total_points: basePoints,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          level: level,
          experience: experience,
          last_visit_date: accessLogs[accessLogs.length - 1].scan_time
        }
      });
      
      // Create daily points records for past visits
      const today = new Date();
      for (let i = 0; i < Math.min(accessLogs.length, 30); i++) {
        const visitDate = new Date(accessLogs[i].scan_time);
        visitDate.setHours(0, 0, 0, 0);
        
        // Check if daily points record already exists
        const existingPoints = await prisma.dailyPoints.findFirst({
          where: {
            member_id: member.member_id,
            date: visitDate
          }
        });
        
        if (!existingPoints) {
          const streakAtTime = Math.min(i + 1, 10); // Cap at 10 for simplicity
          const multiplier = Math.max(1.0, 1.0 + (streakAtTime - 1) * 0.1);
          const points = Math.floor(100 * multiplier);
          
          await prisma.dailyPoints.create({
            data: {
              member_id: member.member_id,
              date: visitDate,
              base_points: 100,
              streak_multiplier: multiplier,
              total_points: points
            }
          });
        }
      }
      
      // Award some badges based on stats
      const badgesToAward = [];
      
      if (totalVisits >= 1) {
        badgesToAward.push('First Entry');
      }
      if (totalVisits >= 10) {
        badgesToAward.push('Gym Regular');
      }
      if (totalVisits >= 20) {
        badgesToAward.push('Monthly Champion');
      }
      if (longestStreak >= 7) {
        badgesToAward.push('Streak Master');
      }
      if (totalVisits >= 100) {
        badgesToAward.push('Century Club');
      }
      
      // Award badges
      for (const badgeName of badgesToAward) {
        const badge = await prisma.badge.findUnique({
          where: { name: badgeName }
        });
        
        if (badge) {
          const existingMemberBadge = await prisma.memberBadge.findFirst({
            where: {
              member_id: member.member_id,
              badge_id: badge.badge_id
            }
          });
          
          if (!existingMemberBadge) {
            await prisma.memberBadge.create({
              data: {
                member_id: member.member_id,
                badge_id: badge.badge_id,
                earned_date: new Date()
              }
            });
            
            // Award points for badge
            await prisma.member.update({
              where: { member_id: member.member_id },
              data: {
                total_points: {
                  increment: badge.point_value
                },
                experience: {
                  increment: badge.point_value
                }
              }
            });
          }
        }
      }
    }
  }
  
  console.log('✅ Updated existing members with gamification data');
}

async function main() {
  console.log('🎮 Starting gamification system setup...');
  
  try {
    // Create gamification badges
    await createGamificationBadges();
    
    // Update existing members with gamification data
    await updateExistingMembers();
    
    console.log('🎉 Gamification system setup completed successfully!');
    console.log('\n📊 Badge Rarities:');
    console.log('   Common: 50 points each');
    console.log('   Rare: 150 points each');
    console.log('   Epic: 500 points each');
    console.log('   Legendary: 1000 points each');
    console.log('\n🏆 Point System:');
    console.log('   Base points per visit: 100');
    console.log('   Streak multiplier: +10% per consecutive day');
    console.log('   Level system: 1000 XP per level');
    
  } catch (error) {
    console.error('❌ Error setting up gamification system:', error);
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
