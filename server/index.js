const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set charset for JSON responses
app.use((req, res, next) => {
  res.charset = 'utf-8';
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, '../client/build')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to update membership status
const updateMembershipStatus = async () => {
  await prisma.membership.updateMany({
    where: {
      expiration_date: {
        lt: new Date()
      },
      status: 'ACTIVE'
    },
    data: {
      status: 'EXPIRED'
    }
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Staff authentication
app.post('/api/auth/staff/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const staff = await prisma.staff.findUnique({
      where: { email }
    });

    if (!staff || !await bcrypt.compare(password, staff.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        staffId: staff.staff_id, 
        email: staff.email, 
        role: staff.role,
        first_name: staff.first_name,
        last_name: staff.last_name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: staff.staff_id,
        first_name: staff.first_name,
        last_name: staff.last_name,
        email: staff.email,
        role: staff.role
      }
    });
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin middleware - check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Register new staff (Admin only)
app.post('/api/admin/staff/register', [
  body('first_name').trim().isLength({ min: 1 }),
  body('last_name').trim().isLength({ min: 1 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'staff'])
], authenticateToken, requireAdmin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, password, role } = req.body;

    // Check if email already exists
    const existingStaff = await prisma.staff.findUnique({
      where: { email }
    });

    if (existingStaff) {
      return res.status(400).json({ error: 'Staff with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const staff = await prisma.staff.create({
      data: {
        first_name,
        last_name,
        email,
        password_hash: passwordHash,
        role,
        created_by: req.user.staffId
      }
    });

    res.status(201).json({
      message: 'Staff registered successfully',
      staff: {
        staff_id: staff.staff_id,
        first_name: staff.first_name,
        last_name: staff.last_name,
        email: staff.email,
        role: staff.role,
        is_active: staff.is_active,
        created_at: staff.created_at
      }
    });
  } catch (error) {
    console.error('Staff registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all staff (Admin only)
app.get('/api/admin/staff', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      select: {
        staff_id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log('Staff data from database:', JSON.stringify(staff, null, 2));
    res.json(staff);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update staff status (Admin only)
app.patch('/api/admin/staff/:staffId/status', [
  body('is_active').isBoolean()
], authenticateToken, requireAdmin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { staffId } = req.params;
    const { is_active } = req.body;

    // Prevent admin from deactivating themselves
    if (staffId === req.user.staffId) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const staff = await prisma.staff.update({
      where: { staff_id: staffId },
      data: { is_active },
      select: {
        staff_id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        is_active: true
      }
    });

    res.json({
      message: `Staff ${is_active ? 'activated' : 'deactivated'} successfully`,
      staff
    });
  } catch (error) {
    console.error('Update staff status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User registration
app.post('/api/auth/user/register', [
  body('username').trim().isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/),
  body('first_name').trim().isLength({ min: 1 }),
  body('last_name').trim().isLength({ min: 1 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('phone_number').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, first_name, last_name, email, password, phone_number } = req.body;

    // Check if email already exists
    const existingMemberByEmail = await prisma.member.findUnique({
      where: { email }
    });

    if (existingMemberByEmail) {
      return res.status(400).json({ error: 'Member with this email already exists' });
    }

    // Check if username already exists
    const existingMemberByUsername = await prisma.member.findUnique({
      where: { username }
    });

    if (existingMemberByUsername) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Generate unique QR code and hash password
    const qrCode = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    const member = await prisma.member.create({
      data: {
        username,
        first_name,
        last_name,
        email,
        phone_number,
        qr_code: qrCode,
        password_hash: passwordHash
      }
    });

    const token = jwt.sign(
      { memberId: member.member_id, email: member.email, role: 'member' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: member.member_id,
        username: member.username,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        role: 'member'
      }
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
app.post('/api/auth/user/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const member = await prisma.member.findUnique({
      where: { email }
    });

    if (!member || !member.password_hash || !await bcrypt.compare(password, member.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { memberId: member.member_id, email: member.email, role: 'member' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: member.member_id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        role: 'member'
      }
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register new member
app.post('/api/members', [
  body('username').trim().isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/),
  body('first_name').trim().isLength({ min: 1 }),
  body('last_name').trim().isLength({ min: 1 }),
  body('email').isEmail().normalizeEmail(),
  body('phone_number').optional().isMobilePhone()
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, first_name, last_name, email, phone_number } = req.body;

    // Check if email already exists
    const existingMemberByEmail = await prisma.member.findUnique({
      where: { email }
    });

    if (existingMemberByEmail) {
      return res.status(400).json({ error: 'Member with this email already exists' });
    }

    // Check if username already exists
    const existingMemberByUsername = await prisma.member.findUnique({
      where: { username }
    });

    if (existingMemberByUsername) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Generate unique QR code
    const qrCode = uuidv4();

    const member = await prisma.member.create({
      data: {
        username,
        first_name,
        last_name,
        email,
        phone_number,
        qr_code: qrCode
      }
    });

    res.status(201).json({
      message: 'Member registered successfully',
      member: {
        member_id: member.member_id,
        username: member.username,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone_number: member.phone_number,
        qr_code: member.qr_code
      }
    });
  } catch (error) {
    console.error('Member registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign membership to member
app.post('/api/memberships', [
  body('member_id').isString(),
  body('membership_type').isIn(['DAILY', 'MONTHLY', 'YEARLY', 'CUSTOM']),
  body('purchase_date').isISO8601(),
  body('expiration_date').isISO8601()
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { member_id, membership_type, purchase_date, expiration_date } = req.body;

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { member_id }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const membership = await prisma.membership.create({
      data: {
        member_id,
        membership_type,
        purchase_date: new Date(purchase_date),
        expiration_date: new Date(expiration_date),
        status: new Date(expiration_date) > new Date() ? 'ACTIVE' : 'EXPIRED'
      },
      include: {
        member: {
          select: {
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Membership assigned successfully',
      membership
    });
  } catch (error) {
    console.error('Membership assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete membership
app.delete('/api/memberships/:membershipId', authenticateToken, async (req, res) => {
  try {
    const { membershipId } = req.params;
    console.log('DELETE /api/memberships/:membershipId called with ID:', membershipId);

    // Check if membership exists
    const membership = await prisma.membership.findUnique({
      where: { membership_id: membershipId },
      include: {
        member: {
          select: {
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    });

    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    // Delete the membership
    await prisma.membership.delete({
      where: { membership_id: membershipId }
    });

    res.json({
      message: 'Membership deleted successfully',
      deletedMembership: {
        membership_id: membership.membership_id,
        member_name: `${membership.member.first_name} ${membership.member.last_name}`,
        membership_type: membership.membership_type
      }
    });
  } catch (error) {
    console.error('Membership deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate QR code and check access
app.post('/api/access/validate', [
  body('qr_code').isString()
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { qr_code } = req.body;

    // Update membership statuses first
    await updateMembershipStatus();

    // Find member by QR code
    const member = await prisma.member.findUnique({
      where: { qr_code },
      include: {
        memberships: {
          where: {
            status: 'ACTIVE'
          },
          orderBy: {
            expiration_date: 'desc'
          }
        }
      }
    });

    if (!member) {
      // Log denied access
      await prisma.accessLog.create({
        data: {
          member_id: 'unknown',
          scanned_by: req.user.staffId,
          result: 'DENIED'
        }
      });

      return res.json({
        access: false,
        message: 'Access Denied',
        reason: 'Member not found'
      });
    }

    // Check for active membership
    const activeMembership = member.memberships[0];

    if (!activeMembership) {
      // Log denied access
      await prisma.accessLog.create({
        data: {
          member_id: member.member_id,
          scanned_by: req.user.staffId,
          result: 'DENIED'
        }
      });

      return res.json({
        access: false,
        message: 'Access Denied',
        reason: 'No active membership',
        member: {
          first_name: member.first_name,
          last_name: member.last_name,
          email: member.email
        }
      });
    }

    // Check if member already earned points today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingPoints = await prisma.dailyPoints.findFirst({
      where: {
        member_id: member.member_id,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    let pointsEarned = 0;
    let newStreak = member.current_streak;
    let streakMultiplier = 1.0;

    if (!existingPoints) {
      // Calculate streak
      const lastVisit = member.last_visit_date;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastVisit && lastVisit >= yesterday && lastVisit < today) {
        // Consecutive day - increment streak
        newStreak = member.current_streak + 1;
      } else if (lastVisit && lastVisit < yesterday) {
        // Streak broken - reset to 1
        newStreak = 1;
      } else {
        // First visit or first visit in a while
        newStreak = 1;
      }

      // Calculate points
      streakMultiplier = Math.max(1.0, 1.0 + (newStreak - 1) * 0.1);
      const basePoints = 100;
      pointsEarned = Math.floor(basePoints * streakMultiplier);

      // Create daily points record
      await prisma.dailyPoints.create({
        data: {
          member_id: member.member_id,
          date: today,
          base_points: basePoints,
          streak_multiplier: streakMultiplier,
          total_points: pointsEarned
        }
      });

      // Update member stats
      const newTotalPoints = member.total_points + pointsEarned;
      const newExperience = member.experience + pointsEarned;
      const newLevel = Math.floor(newExperience / 1000) + 1;
      const newLongestStreak = Math.max(member.longest_streak, newStreak);

      await prisma.member.update({
        where: { member_id: member.member_id },
        data: {
          total_points: newTotalPoints,
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          experience: newExperience,
          level: newLevel,
          last_visit_date: new Date()
        }
      });

      // Check for level up
      if (newLevel > member.level) {
        await prisma.notification.create({
          data: {
            member_id: member.member_id,
            title: 'Level Up! 🎉',
            message: `Congratulations! You've reached level ${newLevel}!`,
            type: 'ACHIEVEMENT'
          }
        });
      }
    }

    // Log granted access
    await prisma.accessLog.create({
      data: {
        member_id: member.member_id,
        scanned_by: req.user.staffId,
        result: 'GRANTED'
      }
    });

    res.json({
      access: true,
      message: 'Access Granted',
      member: {
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone_number: member.phone_number
      },
      membership: {
        membership_type: activeMembership.membership_type,
        purchase_date: activeMembership.purchase_date,
        expiration_date: activeMembership.expiration_date,
        status: activeMembership.status
      },
      points: {
        earned: pointsEarned,
        streak: newStreak,
        multiplier: streakMultiplier,
        total: member.total_points + pointsEarned
      }
    });
  } catch (error) {
    console.error('QR validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all members with their memberships
app.get('/api/members', authenticateToken, async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      include: {
        memberships: {
          orderBy: {
            created_at: 'desc'
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search members
app.get('/api/members/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const members = await prisma.member.findMany({
      where: {
        OR: [
          { first_name: { contains: query, mode: 'insensitive' } },
          { last_name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { qr_code: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        memberships: {
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    });

    res.json(members);
  } catch (error) {
    console.error('Search members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get access logs
app.get('/api/access/logs', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await prisma.accessLog.findMany({
      include: {
        member: {
          select: {
            first_name: true,
            last_name: true,
            email: true
          }
        },
        staff: {
          select: {
            first_name: true,
            last_name: true,
            email: true
          }
        }
      },
      orderBy: {
        scan_time: 'desc'
      },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const total = await prisma.accessLog.count();

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get access logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate QR code image
app.get('/api/members/:memberId/qr-code', authenticateToken, async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await prisma.member.findUnique({
      where: { member_id: memberId }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const qrCodeDataURL = await QRCode.toDataURL(member.qr_code, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      qr_code: member.qr_code,
      qr_code_image: qrCodeDataURL,
      member: {
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email
      }
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Dashboard Endpoints

// Get user dashboard data
app.get('/api/user/dashboard', authenticateToken, async (req, res) => {
  try {
    const memberId = req.user.memberId || req.user.staffId;
    const role = req.user.role;

    if (role !== 'member') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get member with memberships and badges
    const member = await prisma.member.findUnique({
      where: { member_id: memberId },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          orderBy: { expiration_date: 'desc' }
        },
        member_badges: {
          include: {
            badge: true
          },
          orderBy: { earned_date: 'desc' }
        }
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Get access logs for activity calculation
    const accessLogs = await prisma.accessLog.findMany({
      where: { 
        member_id: memberId,
        result: 'GRANTED'
      },
      orderBy: { scan_time: 'desc' }
    });

    // Calculate activity stats
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const thisMonthVisits = accessLogs.filter(log => 
      new Date(log.scan_time) >= currentMonth
    ).length;
    
    const lastMonthVisits = accessLogs.filter(log => {
      const logDate = new Date(log.scan_time);
      return logDate >= lastMonth && logDate < currentMonth;
    }).length;

    // Calculate streak
    let currentStreak = 0;
    const today = new Date().toDateString();
    const sortedLogs = accessLogs.sort((a, b) => new Date(b.scan_time) - new Date(a.scan_time));
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].scan_time).toDateString();
      const expectedDate = new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toDateString();
      
      if (logDate === expectedDate) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Get active membership
    const activeMembership = member.memberships[0];
    const daysUntilExpiration = activeMembership ? 
      Math.ceil((new Date(activeMembership.expiration_date) - now) / (1000 * 60 * 60 * 24)) : 0;

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where: { member_id: memberId },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    res.json({
      member: {
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone_number: member.phone_number,
        member_since: member.member_since,
        qr_code: member.qr_code
      },
      membership: activeMembership ? {
        type: activeMembership.membership_type,
        purchase_date: activeMembership.purchase_date,
        expiration_date: activeMembership.expiration_date,
        days_until_expiration: daysUntilExpiration
      } : null,
      stats: {
        total_visits: accessLogs.length,
        this_month_visits: thisMonthVisits,
        last_month_visits: lastMonthVisits,
        current_streak: currentStreak,
        activity_percentage: Math.min(100, (thisMonthVisits / 30) * 100) // Assuming 30 visits = 100%
      },
      badges: member.member_badges.map(mb => ({
        name: mb.badge.name,
        description: mb.badge.description,
        icon_url: mb.badge.icon_url,
        earned_date: mb.earned_date
      })),
      notifications: notifications.map(n => ({
        id: n.notification_id,
        title: n.title,
        message: n.message,
        type: n.type,
        is_read: n.is_read,
        created_at: n.created_at
      }))
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user QR code
app.get('/api/user/qr-code', authenticateToken, async (req, res) => {
  try {
    const memberId = req.user.memberId;
    const role = req.user.role;

    if (role !== 'member') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const member = await prisma.member.findUnique({
      where: { member_id: memberId }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const qrCodeDataURL = await QRCode.toDataURL(member.qr_code, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      qr_code: member.qr_code,
      qr_code_image: qrCodeDataURL
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user activity calendar
app.get('/api/user/activity-calendar', authenticateToken, async (req, res) => {
  try {
    const memberId = req.user.memberId;
    const role = req.user.role;

    if (role !== 'member') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { year, month } = req.query;
    const targetDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()) - 1, 1);
    
    const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    const accessLogs = await prisma.accessLog.findMany({
      where: {
        member_id: memberId,
        result: 'GRANTED',
        scan_time: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Group by date
    const activityByDate = {};
    accessLogs.forEach(log => {
      const date = new Date(log.scan_time).toDateString();
      activityByDate[date] = (activityByDate[date] || 0) + 1;
    });

    res.json({
      year: targetDate.getFullYear(),
      month: targetDate.getMonth() + 1,
      activity: activityByDate
    });
  } catch (error) {
    console.error('Activity calendar error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
app.patch('/api/user/notifications/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const memberId = req.user.memberId;
    const role = req.user.role;

    if (role !== 'member') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const notification = await prisma.notification.updateMany({
      where: {
        notification_id: notificationId,
        member_id: memberId
      },
      data: {
        is_read: true
      }
    });

    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== GAMIFICATION ENDPOINTS ====================

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { type = 'all', limit = 50 } = req.query;
    
    let whereClause = {};
    let orderBy = { total_points: 'desc' };
    
    if (type === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      whereClause = {
        last_visit_date: {
          gte: weekAgo
        }
      };
    } else if (type === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      whereClause = {
        last_visit_date: {
          gte: monthAgo
        }
      };
    }
    
    const leaderboard = await prisma.member.findMany({
      where: whereClause,
      orderBy: orderBy,
      take: parseInt(limit),
      select: {
        member_id: true,
        username: true,
        first_name: true,
        last_name: true,
        total_points: true,
        current_streak: true,
        level: true,
        avatar_url: true
      }
    });
    
    res.json({
      leaderboard: leaderboard.map((member, index) => ({
        ...member,
        rank: index + 1,
        display_name: member.username || `${member.first_name} ${member.last_name}`
      })),
      type,
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile with stats
app.get('/api/user/profile/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    
    const member = await prisma.member.findUnique({
      where: { member_id: memberId },
      include: {
        member_badges: {
          include: {
            badge: true
          },
          orderBy: {
            earned_date: 'desc'
          }
        },
        daily_points: {
          orderBy: {
            date: 'desc'
          },
          take: 30
        }
      }
    });
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    // Calculate rank
    const rank = await prisma.member.count({
      where: {
        total_points: {
          gt: member.total_points
        }
      }
    }) + 1;
    
    // Calculate experience to next level
    const currentLevelExp = (member.level - 1) * 1000;
    const nextLevelExp = member.level * 1000;
    const expToNext = nextLevelExp - member.experience;
    
    res.json({
      member: {
        member_id: member.member_id,
        username: member.username,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        avatar_url: member.avatar_url,
        bio: member.bio,
        total_points: member.total_points,
        current_streak: member.current_streak,
        longest_streak: member.longest_streak,
        level: member.level,
        experience: member.experience,
        exp_to_next_level: expToNext,
        rank: rank,
        member_since: member.member_since
      },
      badges: member.member_badges.map(mb => ({
        ...mb.badge,
        earned_date: mb.earned_date
      })),
      recent_points: member.daily_points
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
app.patch('/api/user/profile/:memberId', [
  body('bio').optional().isLength({ max: 500 }),
  body('avatar_url').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { memberId } = req.params;
    const { bio, avatar_url } = req.body;
    
    const updatedMember = await prisma.member.update({
      where: { member_id: memberId },
      data: {
        bio: bio || undefined,
        avatar_url: avatar_url || undefined
      },
      select: {
        member_id: true,
        username: true,
        first_name: true,
        last_name: true,
        bio: true,
        avatar_url: true
      }
    });
    
    res.json({ member: updatedMember });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
app.get('/api/user/stats/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    
    const member = await prisma.member.findUnique({
      where: { member_id: memberId },
      include: {
        access_logs: {
          where: {
            result: 'GRANTED'
          }
        },
        daily_points: true
      }
    });
    
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    // Calculate statistics
    const totalVisits = member.access_logs.length;
    const totalDaysWithPoints = member.daily_points.length;
    
    // Calculate weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyVisits = member.access_logs.filter(log => 
      new Date(log.scan_time) >= weekAgo
    ).length;
    
    // Calculate monthly stats
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthlyVisits = member.access_logs.filter(log => 
      new Date(log.scan_time) >= monthAgo
    ).length;
    
    // Calculate average points per visit
    const avgPointsPerVisit = totalVisits > 0 ? member.total_points / totalVisits : 0;
    
    res.json({
      total_visits: totalVisits,
      total_days_with_points: totalDaysWithPoints,
      weekly_visits: weeklyVisits,
      monthly_visits: monthlyVisits,
      total_points: member.total_points,
      current_streak: member.current_streak,
      longest_streak: member.longest_streak,
      level: member.level,
      experience: member.experience,
      avg_points_per_visit: Math.round(avgPointsPerVisit * 100) / 100
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user notifications
app.get('/api/user/notifications/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    const { unread_only = false } = req.query;
    
    const notifications = await prisma.notification.findMany({
      where: {
        member_id: memberId,
        ...(unread_only === 'true' && { is_read: false })
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 50
    });
    
    res.json({ notifications });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
app.patch('/api/user/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await prisma.notification.update({
      where: { notification_id: notificationId },
      data: { is_read: true }
    });
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Award badge to user (admin only)
app.post('/api/admin/badges/award', [
  body('member_id').isString(),
  body('badge_id').isString()
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { member_id, badge_id } = req.body;
    
    // Check if member already has this badge
    const existingBadge = await prisma.memberBadge.findFirst({
      where: {
        member_id,
        badge_id
      }
    });
    
    if (existingBadge) {
      return res.status(400).json({ error: 'Member already has this badge' });
    }
    
    // Get badge details
    const badge = await prisma.badge.findUnique({
      where: { badge_id }
    });
    
    if (!badge) {
      return res.status(404).json({ error: 'Badge not found' });
    }
    
    // Award badge
    const memberBadge = await prisma.memberBadge.create({
      data: {
        member_id,
        badge_id,
        earned_date: new Date()
      },
      include: {
        badge: true
      }
    });
    
    // Award points for badge
    const member = await prisma.member.findUnique({
      where: { member_id }
    });
    
    if (member) {
      const newTotalPoints = member.total_points + badge.point_value;
      const newExperience = member.experience + badge.point_value;
      const newLevel = Math.floor(newExperience / 1000) + 1;
      
      await prisma.member.update({
        where: { member_id },
        data: {
          total_points: newTotalPoints,
          experience: newExperience,
          level: newLevel
        }
      });
      
      // Create notification
      await prisma.notification.create({
        data: {
          member_id,
          title: 'New Badge Earned! 🏆',
          message: `Congratulations! You've earned the "${badge.name}" badge and received ${badge.point_value} points!`,
          type: 'ACHIEVEMENT'
        }
      });
    }
    
    res.json({
      message: 'Badge awarded successfully',
      member_badge: memberBadge,
      points_awarded: badge.point_value
    });
  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
