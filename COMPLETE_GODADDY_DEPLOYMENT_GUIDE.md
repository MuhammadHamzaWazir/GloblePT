# 🚀 Complete GoDaddy Deployment Guide for Pharmacy Management System

## 📋 Overview

You have **TWO deployment options** for your pharmacy management system:

1. **🌟 RECOMMENDED: Vercel (Full Functionality)** - FREE, full-featured
2. **📁 GoDaddy Static (Demo Only)** - Limited functionality

---

## 🌟 Option 1: Vercel Deployment (RECOMMENDED)

### Why Vercel is Better:
✅ **FREE hosting**  
✅ **Full pharmacy management features**  
✅ **Login and authentication system**  
✅ **Database connectivity**  
✅ **Admin dashboard**  
✅ **Prescription management**  
✅ **Staff and customer management**  
✅ **Payment processing**  
✅ **All API endpoints working**  

### Step-by-Step Vercel Deployment:

#### 1. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign up" and choose "Continue with GitHub"
3. Authorize Vercel to access your GitHub account
4. Click "Import Project"
5. Find your `pharmacy` repository and click "Import"
6. Vercel will automatically detect it's a Next.js project
7. Click "Deploy" (don't change any settings yet)
8. Wait for deployment to complete (2-3 minutes)

#### 2. Set Up Environment Variables
1. In your Vercel dashboard, go to your project
2. Click "Settings" → "Environment Variables"
3. Add these variables one by one:

```bash
# Database (you'll need to set up a database)
DATABASE_URL=mysql://your_user:password@your_host:3306/your_db

# Authentication
JWT_SECRET=your-super-secure-32-character-secret-key
NEXTAUTH_SECRET=another-super-secure-32-character-key
NEXTAUTH_URL=https://your-vercel-app.vercel.app

# App Settings
APP_NAME=Global Pharma Trading
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NODE_ENV=production

# Email (optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

#### 3. Set Up Database (Choose One)

**Option A: PlanetScale (Recommended - Free)**
1. Go to [planetscale.com](https://planetscale.com)
2. Sign up with GitHub
3. Create new database → name: `pharmacy-db`
4. Go to "Connect" → copy the DATABASE_URL
5. Add DATABASE_URL to Vercel environment variables

**Option B: Railway (Free tier)**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project → Add MySQL
4. Copy the DATABASE_URL from MySQL service
5. Add DATABASE_URL to Vercel environment variables

#### 4. Point Your GoDaddy Domain to Vercel
1. **In Vercel Dashboard:**
   - Go to your project → Settings → Domains
   - Add your domain: `yourdomain.com`
   - Add www subdomain: `www.yourdomain.com`

2. **In GoDaddy DNS Manager:**
   - Log into GoDaddy → My Products → DNS
   - Delete existing A and CNAME records for @ and www
   - Add these records:
     ```
     Type: A
     Name: @
     Value: 76.76.19.61
     TTL: 600

     Type: CNAME  
     Name: www
     Value: cname.vercel-dns.com
     TTL: 600
     ```

#### 5. Initialize Database
1. After deployment, visit: `https://yourdomain.com/api/seed-production`
2. This will create all tables and sample data
3. **Remove this endpoint after first use for security**

#### 6. Test Your Live Site
Visit `https://yourdomain.com` and test:
- ✅ Homepage loads
- ✅ Login works (admin@pharmacy.com / password123)
- ✅ Admin dashboard accessible
- ✅ All features working

---

## 📁 Option 2: GoDaddy Static Hosting (Demo Only)

### ⚠️ IMPORTANT LIMITATIONS:
- ❌ NO login/authentication
- ❌ NO database features
- ❌ NO admin dashboard
- ❌ NO prescription management
- ❌ Static pages ONLY
- ✅ Good for demo/presentation purposes

### Step-by-Step Static Upload:

#### 1. Upload Files to GoDaddy
1. **Log into GoDaddy:**
   - Go to [sso.godaddy.com](https://sso.godaddy.com)
   - Navigate to your hosting account
   - Open cPanel

2. **Access File Manager:**
   - In cPanel, click "File Manager"
   - Navigate to `public_html` directory
   - Delete existing files (backup first if needed)

3. **Upload Static Files:**
   - Go to your project folder → `out` directory
   - Select ALL files and folders in `out`
   - Upload to `public_html`
   - Ensure `.htaccess` file is uploaded (enable "Show Hidden Files")

#### 2. Files to Upload (from 'out' folder):
- `index.html` (homepage)
- `_next/` (Next.js assets)
- `404.html` (error page)
- `.htaccess` (URL rewriting)
- All other generated files

#### 3. Test Static Site:
- Visit: `https://yourdomain.com`
- ✅ Homepage should load
- ✅ Navigation should work
- ❌ Login will NOT work (static only)

---

## 🎯 Recommendation

**USE VERCEL** for your pharmacy management system because:

1. **It's FREE** (same cost as GoDaddy static)
2. **Full functionality** (login, database, admin features)
3. **Professional deployment** 
4. **Easy maintenance and updates**
5. **Better performance** and reliability

GoDaddy static hosting is only suitable for simple websites, not complex applications like your pharmacy management system.

---

## 📞 Support

If you need help with:
- **Vercel deployment:** Contact me or check Vercel documentation
- **Database setup:** Most issues are environment variable related
- **Domain configuration:** DNS changes take 24-48 hours to propagate
- **Static deployment:** Only use for demo purposes

---

## 🔐 Default Login Credentials (Vercel deployment only):
- **Admin:** admin@pharmacy.com / password123
- **Supervisor:** supervisor@pharmacy.com / password123  
- **Staff:** sarah.johnson@pharmacy.com / password123
- **Customer:** alice.smith@gmail.com / password123

**Change these passwords after first login!**

---

**🌟 STRONGLY RECOMMENDED: Use Vercel for full functionality!**
