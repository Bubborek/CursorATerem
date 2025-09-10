const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, email, password, first_name, last_name, phone_number } = req.body;

    if (!username || !email || !password || !first_name || !last_name) {
      return res.status(400).json({ 
        error: 'Username, email, password, first name, and last name are required' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.member.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new member
    const newMember = await prisma.member.create({
      data: {
        username,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        first_name,
        last_name,
        phone_number: phone_number || null,
        qr_code: uuidv4()
      }
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newMember.member_id,
        username: newMember.username,
        email: newMember.email,
        first_name: newMember.first_name,
        last_name: newMember.last_name
      }
    });

  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
};
