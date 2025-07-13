# Production Deployment Guide

## Prerequisites
- Node.js 18+ 
- MySQL Database
- Environment variables configured

## Environment Variables Required

Create `.env.production` file:

```env
# Database
DATABASE_URL="mysql://username:password@host:port/database_name"

# Application
NODE_ENV="production"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secret-key-here"

# JWT
JWT_SECRET="your-jwt-secret-key-here"

# Email Configuration (for notifications)
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-email@domain.com"
SMTP_PASSWORD="your-email-password"

# File Upload (if using cloud storage)
UPLOAD_DIR="/app/uploads"

# Rate Limiting
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="15"
```

## Deployment Steps

### 1. Database Setup
```bash
# Apply all migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed production data
npm run seed:production
```

### 2. Build Application
```bash
# Install dependencies
npm ci --only=production

# Build the application
npm run build
```

### 3. Start Production Server
```bash
# Start the production server
npm start
```

## Docker Deployment (Recommended)

### Build Docker Image
```bash
docker build -t pharmacy-app .
```

### Run with Docker Compose
```bash
docker-compose up -d
```

## Health Checks

### API Health Check
```bash
curl https://your-domain.com/api/health
```

### Database Connection
```bash
curl https://your-domain.com/api/db-health
```

## Security Checklist

- ✅ All environment variables set
- ✅ Database credentials secure
- ✅ JWT secrets are strong
- ✅ HTTPS enabled
- ✅ Rate limiting configured
- ✅ File upload restrictions in place
- ✅ CORS configured for production domain
- ✅ Security headers enabled

## Monitoring

- Monitor application logs
- Set up database performance monitoring
- Configure alerting for errors
- Monitor disk space for uploads
- Track API response times

## Backup Strategy

### Database Backup
```bash
# Daily backup script
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql
```

### File Backup
- Backup uploaded files regularly
- Store backups in separate location

## Post-Deployment Testing

1. Test user registration and login
2. Test prescription submission flow
3. Test admin functionality
4. Test payment processing
5. Test email notifications
6. Test file uploads
7. Verify database connectivity
8. Check performance under load

## Default Admin Credentials

**IMPORTANT: Change these immediately after deployment!**

- Admin: admin@globalpharmacy.com / admin123!
- Super Admin: superadmin@globalpharmacy.com / admin123!
- Pharmacist: pharmacist@globalpharmacy.com / staff123!

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL format
   - Verify database server is running
   - Check firewall/security group settings

2. **Migration Errors**
   - Ensure database user has proper permissions
   - Check for schema conflicts
   - Review migration logs

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check for TypeScript errors
   - Verify all dependencies are compatible

4. **Performance Issues**
   - Enable database query logging
   - Monitor memory usage
   - Check for N+1 queries
   - Optimize database indexes

## Support

For deployment support, check:
- Application logs in `/var/log/pharmacy/`
- Database logs
- Error reporting dashboard
- Performance monitoring tools
