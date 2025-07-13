# 🚀 Deployment Guide: GitHub + Vercel

## Step 1: Prepare for GitHub Upload

### 1.1 Add all files to git
```bash
git add .
```

### 1.2 Commit changes
```bash
git commit -m "feat: Complete pharmacy management system with production setup

- Enhanced admin dashboard with statistics
- Comprehensive user management system
- Prescription tracking with courier integration
- Order management and payment processing
- Complaint system with staff assignment
- Production-ready database seeding
- Docker containerization support
- Comprehensive authentication and authorization"
```

### 1.3 Push to GitHub
```bash
git push origin main
```

## Step 2: Database Setup for Production

### Option A: PlanetScale (Recommended)
1. Go to [PlanetScale](https://planetscale.com)
2. Create a new database
3. Get the connection string
4. Format: `mysql://username:password@aws.connect.psdb.cloud/database?sslaccept=strict`

### Option B: Supabase
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Get PostgreSQL connection string
4. Update Prisma schema to use PostgreSQL

### Option C: Railway
1. Go to [Railway](https://railway.app)
2. Create MySQL database
3. Get connection string

## Step 3: Vercel Deployment

### 3.1 Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Import the project
4. Vercel will auto-detect Next.js

### 3.2 Configure Environment Variables
In Vercel dashboard, add these environment variables:

```env
DATABASE_URL=your_production_database_url
JWT_SECRET=your_secure_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
STRIPE_SECRET_KEY=sk_live_your_stripe_key
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
NEXT_PUBLIC_API_URL=https://yourapp.vercel.app/api
```

### 3.3 Deploy
Click "Deploy" - Vercel will:
1. Install dependencies
2. Generate Prisma client
3. Build the application
4. Deploy to production

## Step 4: Post-Deployment Setup

### 4.1 Run Database Migrations
After deployment, you need to run migrations:

```bash
# Option 1: Use Vercel CLI
npx vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed

# Option 2: Add to package.json build script (already configured)
```

### 4.2 Access Your Application
- Frontend: `https://yourapp.vercel.app`
- Admin Panel: `https://yourapp.vercel.app/admin/dashboard`

### 4.3 Login Credentials
**Admin Account:**
- Email: admin@globalpt.com
- Password: Admin@123

**Staff Account:**
- Email: sarah.pharmacist@globalpt.com
- Password: Staff@123

**Customer Account:**
- Email: john.smith@email.com
- Password: Customer@123

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain
1. In Vercel dashboard, go to Project Settings
2. Click "Domains"
3. Add your custom domain
4. Configure DNS records as shown

### 5.2 Update Environment Variables
Update `NEXT_PUBLIC_APP_URL` to your custom domain

## 🔧 Production Configuration

### Database Optimization
- Enable connection pooling
- Set up read replicas if needed
- Configure backups

### Security
- Use HTTPS everywhere
- Set up proper CORS
- Configure rate limiting
- Enable security headers

### Monitoring
- Set up error tracking (Sentry)
- Configure analytics
- Monitor performance

## 🛠 Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check environment variables
   - Verify database connection
   - Check Prisma schema

2. **Database Connection Issues:**
   - Verify DATABASE_URL format
   - Check network access
   - Confirm SSL settings

3. **Authentication Issues:**
   - Verify JWT_SECRET is set
   - Check NEXTAUTH_SECRET
   - Confirm redirect URLs

### Support Commands:
```bash
# Check deployment logs
vercel logs

# Pull environment variables locally
vercel env pull

# Manual database operations
npx prisma studio
npx prisma migrate status
```

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables
3. Test database connection
4. Check API endpoints

Your pharmacy management system is now ready for production! 🎉
