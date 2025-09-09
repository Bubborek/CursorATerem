# 🎲 Random User Generator for Gym Access Control

This system now supports username-based registration and includes a comprehensive random user generator for testing and development purposes.

## 🆕 New Features

### 1. Username Support
- **Database Schema**: Added `username` field to the `Member` model
- **Registration**: Both user self-registration and admin member creation now require usernames
- **Validation**: Usernames must be 3-20 characters, containing only letters, numbers, and underscores
- **Uniqueness**: Usernames are unique across the system

### 2. Random User Generator
- **10 Random Users**: Automatically generates 10 diverse test users
- **Random Data**: Each user gets randomized personal information, membership types, and badges
- **Realistic Scenarios**: Mix of active and expired memberships for comprehensive testing

## 🚀 Quick Start

### Generate Random Users
```bash
# From the server directory
node generate-random-users.js

# Or run the seed script directly
node prisma/seed-random-users.js
```

### What Gets Generated

#### 👥 User Data
- **Random Names**: Generated from pools of first and last names
- **Unique Usernames**: Format: `firstnamelastname123` (e.g., `cameronwilliams902`)
- **Random Emails**: Various domains (gmail.com, yahoo.com, etc.)
- **Phone Numbers**: Random US phone numbers
- **QR Codes**: Unique UUIDs for each user

#### 🎫 Membership Types
- **DAILY**: 1-day memberships
- **WEEKLY**: 7-day memberships  
- **MONTHLY**: 30-day memberships
- **YEARLY**: 365-day memberships

#### 📅 Expiration Dates
- **Active Memberships**: Expire in the future
- **Expired Memberships**: Expired in the past
- **Realistic Dates**: Random purchase and expiration dates over the past year

#### 🏆 Badges (18 Different Types)
- **First Entry**: Welcome badge for new members
- **Top 10 Weekly**: For active weekly users
- **Annual Member**: For yearly membership holders
- **Early Bird**: Morning workout enthusiasts
- **Night Owl**: Late-night gym goers
- **Weekend Warrior**: Weekend-focused users
- **Consistent Visitor**: Regular attendance
- **Fitness Enthusiast**: Passionate about fitness
- **Gym Regular**: Familiar faces
- **Motivation Master**: Inspiring others
- **Strength Seeker**: Focused on strength training
- **Cardio Champion**: Cardiovascular exercise lovers
- **Flexibility Fan**: Mobility and flexibility focused
- **Wellness Warrior**: Holistic health approach
- **Health Hero**: Health and wellness champions
- **Fitness Fanatic**: Extreme fitness dedication
- **Gym Guru**: Knowledgeable about fitness
- **Workout Wizard**: Magical workout skills

#### 📊 Access Logs
- **Random Entries**: 1-10 access logs per user
- **Realistic Results**: GRANTED for active members, DENIED for expired
- **Historical Data**: Logs spread across membership periods

## 🔧 Technical Details

### Database Schema Changes
```sql
-- Added username field to members table
ALTER TABLE members ADD COLUMN username TEXT NOT NULL UNIQUE;
```

### API Endpoints Updated
- `POST /api/auth/user/register` - Now requires username
- `POST /api/members` - Admin member creation now requires username

### Frontend Updates
- **User Registration Form**: Added username field with validation
- **Admin Member Management**: Added username field to member creation
- **Validation**: Client-side validation for username format

## 📋 Generated User Examples

Here's what you'll see after running the generator:

```
👤 User 1:
   Username: cameronwilliams902
   Name: Cameron Williams
   Email: cameron.williams@gmail.com
   Membership: DAILY (EXPIRED)
   Expires: 2025. 06. 01.
   Badges: Monthly Champion, Cardio Champion
   Access Logs: 4 entries

👤 User 2:
   Username: finleyperez397
   Name: Finley Perez
   Email: finley.perez@yahoo.com
   Membership: MONTHLY (EXPIRED)
   Expires: 2025. 08. 19.
   Badges: First Entry
   Access Logs: 2 entries
```

## 🔑 Login Credentials

After generation, you can login with:

- **Admin**: `admin@gym.com` / `admin123`
- **Staff**: `staff@gym.com` / `staff123`
- **Users**: Any email from the generated list / `password123`

## 🧪 Testing Scenarios

The random data provides excellent test coverage for:

1. **Active Members**: Can access the gym successfully
2. **Expired Members**: Access denied with appropriate messaging
3. **Badge System**: Various badge combinations and achievements
4. **Access Logs**: Historical data for reporting and analytics
5. **Username Validation**: Unique username requirements
6. **QR Code Scanning**: Each user has a unique QR code

## 🔄 Regenerating Users

To clear and regenerate users:

```bash
# This will clear all existing users and create 10 new ones
node generate-random-users.js
```

**Note**: Admin and staff accounts are preserved during regeneration.

## 🎯 Use Cases

Perfect for:
- **Development Testing**: Comprehensive test data
- **Demo Presentations**: Realistic user scenarios
- **Feature Testing**: Various membership states and badge combinations
- **Performance Testing**: Multiple users with access logs
- **UI/UX Testing**: Different user profiles and states

## 📁 File Structure

```
server/
├── prisma/
│   ├── schema.prisma              # Updated with username field
│   ├── seed-random-users.js       # Random user generation script
│   └── migrations/                # Database migrations
├── generate-random-users.js       # Easy-to-use generator script
└── RANDOM_USERS_README.md         # This documentation

client/src/components/
├── user/UserRegister.js           # Updated with username field
└── MemberManagement.js            # Updated admin member creation
```

## 🚨 Important Notes

1. **Data Loss**: Running the generator will clear all existing user data
2. **Admin/Staff Preserved**: Admin and staff accounts are not affected
3. **Unique Constraints**: Usernames and emails are guaranteed to be unique
4. **Realistic Data**: All generated data follows realistic patterns and constraints

## 🎉 Enjoy Your New Test Data!

The random user generator provides a rich, realistic dataset perfect for testing all aspects of your Gym Access Control system. Each run creates a unique set of users with diverse characteristics, making it ideal for comprehensive testing and development.
