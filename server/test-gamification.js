const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testGamificationSystem() {
  console.log('🎮 Testing Gamification System...\n');

  try {
    // Get all members
    const members = await prisma.member.findMany({
      include: {
        member_badges: {
          include: {
            badge: true
          }
        }
      }
    });

    console.log(`📊 Found ${members.length} members in the system\n`);

    // Display member stats
    for (const member of members) {
      console.log(`👤 ${member.username || `${member.first_name} ${member.last_name}`}`);
      console.log(`   Level: ${member.level}`);
      console.log(`   Points: ${member.total_points.toLocaleString()}`);
      console.log(`   Experience: ${member.experience.toLocaleString()}`);
      console.log(`   Current Streak: ${member.current_streak} days`);
      console.log(`   Longest Streak: ${member.longest_streak} days`);
      console.log(`   Badges: ${member.member_badges.length}`);
      
      if (member.member_badges.length > 0) {
        console.log(`   Badge Details:`);
        member.member_badges.forEach(mb => {
          console.log(`     - ${mb.badge.name} (${mb.badge.rarity}) - ${mb.badge.point_value} pts`);
        });
      }
      console.log('');
    }

    // Get leaderboard
    console.log('🏆 TOP 10 LEADERBOARD:');
    const leaderboard = await prisma.member.findMany({
      orderBy: { total_points: 'desc' },
      take: 10,
      select: {
        username: true,
        first_name: true,
        last_name: true,
        total_points: true,
        level: true,
        current_streak: true
      }
    });

    leaderboard.forEach((member, index) => {
      const displayName = member.username || `${member.first_name} ${member.last_name}`;
      console.log(`${index + 1}. ${displayName} - ${member.total_points.toLocaleString()} pts (Level ${member.level}, Streak: ${member.current_streak})`);
    });

    console.log('\n🎯 BADGE STATISTICS:');
    const badgeStats = await prisma.badge.groupBy({
      by: ['rarity'],
      _count: {
        badge_id: true
      }
    });

    badgeStats.forEach(stat => {
      console.log(`${stat.rarity}: ${stat._count.badge_id} badges`);
    });

    console.log('\n📈 SYSTEM STATISTICS:');
    const totalMembers = await prisma.member.count();
    const totalBadges = await prisma.badge.count();
    const totalMemberBadges = await prisma.memberBadge.count();
    const totalNotifications = await prisma.notification.count();
    const totalDailyPoints = await prisma.dailyPoints.count();

    console.log(`Total Members: ${totalMembers}`);
    console.log(`Total Badges: ${totalBadges}`);
    console.log(`Total Badges Awarded: ${totalMemberBadges}`);
    console.log(`Total Notifications: ${totalNotifications}`);
    console.log(`Total Daily Points Records: ${totalDailyPoints}`);

    // Test awarding a badge
    console.log('\n🏅 Testing Badge Award System...');
    const firstMember = members[0];
    const firstBadge = await prisma.badge.findFirst({
      where: { rarity: 'COMMON' }
    });

    if (firstMember && firstBadge) {
      // Check if member already has this badge
      const existingBadge = await prisma.memberBadge.findFirst({
        where: {
          member_id: firstMember.member_id,
          badge_id: firstBadge.badge_id
        }
      });

      if (!existingBadge) {
        // Award badge
        await prisma.memberBadge.create({
          data: {
            member_id: firstMember.member_id,
            badge_id: firstBadge.badge_id,
            earned_date: new Date()
          }
        });

        // Award points
        await prisma.member.update({
          where: { member_id: firstMember.member_id },
          data: {
            total_points: {
              increment: firstBadge.point_value
            },
            experience: {
              increment: firstBadge.point_value
            }
          }
        });

        // Create notification
        await prisma.notification.create({
          data: {
            member_id: firstMember.member_id,
            title: 'New Badge Earned! 🏆',
            message: `Congratulations! You've earned the "${firstBadge.name}" badge and received ${firstBadge.point_value} points!`,
            type: 'ACHIEVEMENT'
          }
        });

        console.log(`✅ Awarded "${firstBadge.name}" badge to ${firstMember.username || firstMember.first_name}`);
      } else {
        console.log(`ℹ️  ${firstMember.username || firstMember.first_name} already has the "${firstBadge.name}" badge`);
      }
    }

    console.log('\n🎉 Gamification system test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing gamification system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGamificationSystem();
