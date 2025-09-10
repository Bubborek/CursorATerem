const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create staff members
  const staff1 = await prisma.staff.upsert({
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

  const staff2 = await prisma.staff.upsert({
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

  console.log('Created staff members:', { staff1, staff2 });

  // Create sample members with passwords
  const member1 = await prisma.member.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      username: 'johndoe',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone_number: '+1234567890',
      qr_code: uuidv4(),
      password_hash: await bcrypt.hash('password123', 10)
    }
  });

  const member2 = await prisma.member.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      username: 'janesmith',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone_number: '+1234567891',
      qr_code: uuidv4(),
      password_hash: await bcrypt.hash('password123', 10)
    }
  });

  const member3 = await prisma.member.upsert({
    where: { email: 'bob.johnson@example.com' },
    update: {},
    create: {
      username: 'bobjohnson',
      first_name: 'Bob',
      last_name: 'Johnson',
      email: 'bob.johnson@example.com',
      phone_number: '+1234567892',
      qr_code: uuidv4(),
      password_hash: await bcrypt.hash('password123', 10)
    }
  });

  console.log('Created members:', { member1, member2, member3 });

  // Create sample memberships
  const now = new Date();
  const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const expiredDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

  // Active monthly membership for John
  const membership1 = await prisma.membership.create({
    data: {
      member_id: member1.member_id,
      membership_type: 'MONTHLY',
      purchase_date: now,
      expiration_date: oneMonthFromNow,
      status: 'ACTIVE'
    }
  });

  // Active yearly membership for Jane
  const membership2 = await prisma.membership.create({
    data: {
      member_id: member2.member_id,
      membership_type: 'YEARLY',
      purchase_date: now,
      expiration_date: oneYearFromNow,
      status: 'ACTIVE'
    }
  });

  // Expired membership for Bob
  const membership3 = await prisma.membership.create({
    data: {
      member_id: member3.member_id,
      membership_type: 'MONTHLY',
      purchase_date: expiredDate,
      expiration_date: expiredDate,
      status: 'EXPIRED'
    }
  });

  console.log('Created memberships:', { membership1, membership2, membership3 });

  // Create some sample access logs
  const accessLog1 = await prisma.accessLog.create({
    data: {
      member_id: member1.member_id,
      result: 'GRANTED'
    }
  });

  const accessLog2 = await prisma.accessLog.create({
    data: {
      member_id: member2.member_id,
      result: 'GRANTED'
    }
  });

  const accessLog3 = await prisma.accessLog.create({
    data: {
      member_id: member3.member_id,
      result: 'DENIED'
    }
  });

  console.log('Created access logs:', { accessLog1, accessLog2, accessLog3 });

  // Create sample badges
  const badge1 = await prisma.badge.upsert({
    where: { name: 'First Visit' },
    update: {},
    create: {
      name: 'First Visit',
      description: 'Welcome to the gym! Your first visit is complete.',
      icon_url: '🏋️',
      criteria: JSON.stringify({ visits: 1 })
    }
  });

  const badge2 = await prisma.badge.upsert({
    where: { name: 'Regular Visitor' },
    update: {},
    create: {
      name: 'Regular Visitor',
      description: 'You\'ve visited 10 times! Keep up the great work.',
      icon_url: '💪',
      criteria: JSON.stringify({ visits: 10 })
    }
  });

  const badge3 = await prisma.badge.upsert({
    where: { name: 'Streak Master' },
    update: {},
    create: {
      name: 'Streak Master',
      description: 'You\'ve maintained a 7-day streak!',
      icon_url: '🔥',
      criteria: JSON.stringify({ streak: 7 })
    }
  });

  const badge4 = await prisma.badge.upsert({
    where: { name: 'Monthly Champion' },
    update: {},
    create: {
      name: 'Monthly Champion',
      description: 'You\'ve visited 20 times this month!',
      icon_url: '🏆',
      criteria: JSON.stringify({ monthly_visits: 20 })
    }
  });

  console.log('Created badges:', { badge1, badge2, badge3, badge4 });

  // Assign badges to members
  const memberBadge1 = await prisma.memberBadge.create({
    data: {
      member_id: member1.member_id,
      badge_id: badge1.badge_id
    }
  });

  const memberBadge2 = await prisma.memberBadge.create({
    data: {
      member_id: member2.member_id,
      badge_id: badge1.badge_id
    }
  });

  const memberBadge3 = await prisma.memberBadge.create({
    data: {
      member_id: member2.member_id,
      badge_id: badge2.badge_id
    }
  });

  console.log('Assigned badges:', { memberBadge1, memberBadge2, memberBadge3 });

  // Create sample notifications
  const notification1 = await prisma.notification.create({
    data: {
      member_id: member1.member_id,
      title: 'Welcome!',
      message: 'Welcome to our gym! Your membership is now active.',
      type: 'SUCCESS'
    }
  });

  const notification2 = await prisma.notification.create({
    data: {
      member_id: member2.member_id,
      title: 'Membership Expiring Soon',
      message: 'Your membership expires in 3 days. Renew now to continue your fitness journey!',
      type: 'WARNING'
    }
  });

  const notification3 = await prisma.notification.create({
    data: {
      member_id: member1.member_id,
      title: 'Special Offer',
      message: 'Get 20% off your next membership renewal! Offer valid until end of month.',
      type: 'PROMOTION'
    }
  });

  console.log('Created notifications:', { notification1, notification2, notification3 });

  // Update existing members with passwords
  await prisma.member.update({
    where: { member_id: member1.member_id },
    data: { password_hash: await bcrypt.hash('password123', 10) }
  });

  await prisma.member.update({
    where: { member_id: member2.member_id },
    data: { password_hash: await bcrypt.hash('password123', 10) }
  });

  await prisma.member.update({
    where: { member_id: member3.member_id },
    data: { password_hash: await bcrypt.hash('password123', 10) }
  });

  console.log('Updated members with passwords');

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
