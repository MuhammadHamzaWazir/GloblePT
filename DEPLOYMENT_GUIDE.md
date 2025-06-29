# 🚀 Deployment Guide - Global Pharma Trading System

This guide will help you deploy the pharmacy management system to production.

## 📋 Prerequisites

- Node.js 18+ installed
- A MySQL database (PlanetScale, Railway, or any cloud MySQL provider)
- Vercel account (for deployment)
- Domain name (optional)

## 🔧 Environment Setup

### 1. Database Setup

#### Option A: PlanetScale (Recommended)
1. Create account at [planetscale.com](https://planetscale.com)
2. Create a new database
3. Get the connection string from the dashboard
4. Add to your environment variables

#### Option B: Railway
1. Create account at [railway.app](https://railway.app)
2. Create a MySQL database
3. Get the connection string
4. Add to your environment variables

#### Option C: AWS RDS / Google Cloud SQL
1. Create a MySQL instance
2. Configure security groups/firewall
3. Get the connection string

### 2. Environment Variables

Create a `.env.local` file in your project root:

```bash
# Database Configuration
DATABASE_URL="mysql://username:password@host:port/database"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"

# Next.js Configuration
NEXTAUTH_SECRET="your-nextauth-secret-key-minimum-32-characters"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Email Configuration (for notifications)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="noreply@your-domain.com"

# Stripe Configuration (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_public_key"
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# App Configuration
APP_NAME="Global Pharma Trading"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"

# Environment
NODE_ENV="production"
```

## 🚀 Deployment Steps

### 1. Local Testing

First, test everything locally:

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate:deploy

# Seed the database with production data
npm run db:seed:prod

# Build the application
npm run build

# Start the production server
npm run start
```

### 2. Test All APIs

Run the comprehensive API test suite:

```bash
# Make sure your app is running locally
npm run dev

# In another terminal, run API tests
npm run test:api
```

### 3. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: GitHub Integration
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### 4. Configure Environment Variables in Vercel

In your Vercel dashboard:
1. Go to Project Settings
2. Go to Environment Variables
3. Add all variables from your `.env.local` file
4. Make sure to set the environment to "Production"

### 5. Run Database Setup on Production

After deployment, run these commands once:

```bash
# Generate Prisma client
vercel env pull .env.local
npm run db:generate

# Deploy migrations
npm run db:migrate:deploy

# Seed production database
npm run db:seed:prod
```

## 🔐 Default Login Credentials

After seeding, you can use these credentials:

- **Admin**: admin@pharmacy.com / password123
- **Supervisor**: supervisor@pharmacy.com / password123
- **Staff**: sarah.johnson@pharmacy.com / password123
- **Customer**: alice.smith@gmail.com / password123

## 📊 Database Schema

The system includes:
- **Users** (with role-based access)
- **Roles & Permissions**
- **Staff Management**
- **Customer Management**
- **Prescription System**
- **Complaint Management**

## 🧪 Testing After Deployment

### Automatic API Testing
```bash
# Set your production URL
export APP_URL="https://your-domain.vercel.app"

# Run API tests against production
npm run test:api
```

### Manual Testing Checklist

- [ ] Can login as admin
- [ ] Can login as staff
- [ ] Can login as customer
- [ ] Admin can manage users
- [ ] Staff can view prescriptions
- [ ] Customers can submit complaints
- [ ] Email notifications work
- [ ] Prescription workflow works
- [ ] Complaint system works
- [ ] Dashboard loads correctly
- [ ] All API endpoints respond

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check your DATABASE_URL format
   - Ensure database accepts connections from Vercel IPs
   - Verify credentials

2. **JWT/Auth Issues**
   - Ensure JWT_SECRET is set and secure
   - Check NEXTAUTH_URL matches your domain

3. **Build Failures**
   - Run `npm run type-check` locally
   - Fix any TypeScript errors
   - Ensure all dependencies are installed

4. **API Errors**
   - Check server logs in Vercel dashboard
   - Verify environment variables are set
   - Run API tests to identify issues

### Database Issues

If you need to reset the database:

```bash
# Reset and reseed (CAREFUL - this deletes all data)
npm run db:reset
npm run db:seed:prod
```

## 🔄 Updating the Application

1. Make your changes locally
2. Test thoroughly
3. Commit and push to GitHub
4. Vercel will automatically deploy
5. Run post-deployment tests

## 📈 Monitoring

- Monitor application performance in Vercel dashboard
- Check error logs regularly
- Set up alerts for critical issues
- Monitor database performance

## 🔒 Security Considerations

- Use strong, unique passwords for all accounts
- Enable SSL/HTTPS (automatic with Vercel)
- Regular security updates
- Monitor for suspicious activities
- Implement rate limiting if needed

## 📱 Mobile Optimization

The application is responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones

## 🎯 Performance Optimization

- Images are optimized with Next.js Image component
- Code splitting is handled automatically
- Database queries are optimized
- Caching is implemented where appropriate

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review logs in Vercel dashboard
3. Run the API test suite
4. Check database connectivity

## 📞 Contact

For technical support or questions about the pharmacy system, contact the development team.

---

🎉 **Congratulations!** Your pharmacy management system is now deployed and ready for production use!
