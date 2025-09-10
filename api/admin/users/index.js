const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

module.exports = async (req, res) => {
  try {
    console.log('Fetching users from database...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    const staff = await prisma.staff.findMany({
      select: {
        staff_id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        created_at: true,
        is_active: true
      }
    });
    
    const members = await prisma.member.findMany({
      select: {
        member_id: true,
        email: true,
        first_name: true,
        last_name: true,
        username: true,
        created_at: true
      }
    });
    
    console.log('Found staff:', staff.length, 'members:', members.length);
    
    res.json({ 
      staff, 
      members, 
      staffCount: staff.length,
      memberCount: members.length 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message,
      stack: error.stack
    });
  } finally {
    await prisma.$disconnect();
  }
};
