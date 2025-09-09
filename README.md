# Gym Access Control System

A comprehensive web application for managing gym member access using QR codes. This system allows staff to scan member QR codes, validate memberships, and manage member information through an intuitive admin dashboard.

## Features

### 🎯 Core Functionality
- **QR Code Scanner**: Real-time QR code scanning for member access validation
- **Member Management**: Add, edit, and manage gym members
- **Membership Management**: Assign different types of memberships (daily, monthly, yearly, custom)
- **Access Control**: Grant or deny access based on membership status
- **Access Logging**: Track all access attempts with detailed logs
- **Admin Dashboard**: Comprehensive overview of system statistics

### 🔐 Security Features
- **Staff Authentication**: Secure login system with JWT tokens
- **Role-based Access**: Staff-only access to admin functions
- **Input Validation**: Comprehensive validation on both frontend and backend
- **Secure API**: Protected endpoints with authentication middleware

### 📱 User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Real-time Feedback**: Instant notifications and status updates
- **Search & Filter**: Advanced search and filtering capabilities

## Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database with Prisma ORM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **QR Code generation** with qrcode library

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Toastify** for notifications
- **Lucide React** for icons

## Database Schema

### Tables
- **Members**: Store member information and unique QR codes
- **Memberships**: Track membership types, dates, and status
- **Staff**: Staff authentication and information
- **AccessLogs**: Record all access attempts and results

### Relationships
- One Member can have multiple Memberships (history)
- One Membership belongs to exactly one Member
- AccessLogs reference Members for tracking

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd gym-access-control
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all project dependencies
npm run install-all
```

### 3. Database Setup

#### Create PostgreSQL Database
```sql
CREATE DATABASE gym_access_control;
```

#### Configure Environment Variables
Copy the example environment file and update with your database credentials:
```bash
cp server/env.example server/.env
```

Update `server/.env` with your database URL:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/gym_access_control?schema=public"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=5000
NODE_ENV="development"
```

#### Run Database Migrations
```bash
npm run db:migrate
```

#### Seed the Database
```bash
npm run db:seed
```

### 4. Start the Application

#### Development Mode (Both Frontend and Backend)
```bash
npm run dev
```

#### Or Start Separately
```bash
# Backend only
npm run server

# Frontend only (in another terminal)
npm run client
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Demo Credentials

The seeded database includes demo staff accounts:

### Admin Account
- **Email**: admin@gym.com
- **Password**: admin123

### Staff Account
- **Email**: staff@gym.com
- **Password**: staff123

## API Endpoints

### Authentication
- `POST /api/auth/login` - Staff login

### Members
- `GET /api/members` - Get all members
- `POST /api/members` - Create new member
- `GET /api/members/search` - Search members
- `GET /api/members/:id/qr-code` - Get member QR code

### Memberships
- `POST /api/memberships` - Assign membership to member

### Access Control
- `POST /api/access/validate` - Validate QR code and check access
- `GET /api/access/logs` - Get access logs

## Usage Guide

### 1. Staff Login
- Navigate to the login page
- Use demo credentials or create new staff accounts
- Access the admin dashboard after successful login

### 2. Adding Members
- Go to "Members" section
- Click "Add Member" button
- Fill in member details (name, email, phone)
- System automatically generates unique QR code

### 3. Assigning Memberships
- Find the member in the members list
- Click the "+" button to add membership
- Select membership type and dates
- System automatically calculates expiration dates

### 4. QR Code Scanning
- Go to "QR Scanner" section
- Start camera or use manual input
- Scan member's QR code
- System displays access result and member information

### 5. Viewing Access Logs
- Navigate to "Access Logs" section
- View all access attempts with timestamps
- Filter by result, date range, or member
- Export logs to CSV for reporting

## Development

### Project Structure
```
gym-access-control/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── ...
├── server/                 # Node.js backend
│   ├── prisma/            # Database schema and migrations
│   ├── index.js           # Main server file
│   └── ...
└── package.json           # Root package configuration
```

### Available Scripts
- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start backend server only
- `npm run client` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio for database management

### Database Management
```bash
# Reset database (careful - this deletes all data)
npx prisma migrate reset

# View database in browser
npm run db:studio

# Generate new migration after schema changes
npx prisma migrate dev --name your-migration-name
```

## Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use a production PostgreSQL database
3. Set strong JWT secret
4. Configure proper CORS settings
5. Use HTTPS in production

### Build for Production
```bash
# Build frontend
npm run build

# Start production server
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please create an issue in the repository or contact the development team.

---

**Note**: This is a demo application. For production use, ensure proper security measures, error handling, and testing are implemented.
