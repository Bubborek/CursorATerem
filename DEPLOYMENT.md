# Deployment Guide

## Railway Deployment

This project is configured to deploy on Railway with the following setup:

### Files Added for Deployment:
- `railway.json` - Railway configuration
- `.nixpacks` - Build configuration
- `Procfile` - Process definition
- `.gitignore` - Excludes unnecessary files

### Environment Variables Required:
Set these in your Railway dashboard:

```
JWT_SECRET=your_secure_jwt_secret_here
PORT=5000
DATABASE_URL=file:./dev.db
```

### How it Works:
1. Railway builds the React client app (`npm run build`)
2. Installs server dependencies (`npm ci --only=production`)
3. Starts the server which serves both API and static files
4. The server serves the built React app for all non-API routes

### Database:
- Uses SQLite with Prisma
- Database file: `server/prisma/dev.db`
- Migrations run automatically on deployment

### Access:
- Your app will be available at: `https://your-app-name.railway.app`
- API endpoints: `https://your-app-name.railway.app/api/*`
- Frontend: `https://your-app-name.railway.app/`

### Troubleshooting:
If deployment fails:
1. Check that all environment variables are set
2. Ensure the database file is included in the repository
3. Check Railway logs for specific error messages
