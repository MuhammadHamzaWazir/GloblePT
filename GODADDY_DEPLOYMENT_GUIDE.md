# 🚀 GoDaddy Deployment Guide - Global Pharma Trading System

This guide will walk you through deploying your pharmacy management system on GoDaddy hosting with your custom domain.

## 📋 Prerequisites

- GoDaddy hosting account (Shared/VPS/Dedicated)
- Domain name registered with GoDaddy or transferred to GoDaddy
- Access to GoDaddy cPanel/Hosting Control Panel
- MySQL database (included with most GoDaddy hosting plans)

## 🎯 Deployment Process

### Phase 1: Prepare Your Application for Production

#### 1. Build Your Application
```bash
# In your local project directory
npm run build
```

#### 2. Create Production Environment File
Create `.env.production` with your production settings:
```bash
# Database Configuration (GoDaddy MySQL)
DATABASE_URL="mysql://your_db_user:your_db_password@localhost:3306/your_database_name"

# JWT Secret (generate a secure 32+ character string)
JWT_SECRET="your-super-secure-jwt-secret-key-32-chars-minimum"

# Next.js Configuration
NEXTAUTH_SECRET="your-nextauth-secret-32-chars-minimum"
NEXTAUTH_URL="https://yourdomain.com"

# App Configuration
APP_NAME="Global Pharma Trading"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Email Configuration (using GoDaddy email or external SMTP)
EMAIL_HOST="smtpout.secureserver.net"  # GoDaddy SMTP
EMAIL_PORT="465"
EMAIL_USER="noreply@yourdomain.com"
EMAIL_PASS="your-email-password"
EMAIL_FROM="noreply@yourdomain.com"

# Stripe Configuration (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_public_key"
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"

# Environment
NODE_ENV="production"
```

### Phase 2: GoDaddy Hosting Setup

#### Option A: Traditional Shared/VPS Hosting (Static Export)

If you're using GoDaddy's traditional hosting, you'll need to export your Next.js app as static files.

1. **Update next.config.ts for static export:**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
```

2. **Build and export:**
```bash
npm run build
```

3. **Upload files:**
   - Locate the `out` folder created after build
   - Upload all contents of the `out` folder to your GoDaddy `public_html` directory
   - Use File Manager in cPanel or FTP client

#### Option B: GoDaddy VPS/Dedicated with Node.js Support

If you have VPS or dedicated hosting with Node.js support:

1. **Enable Node.js in cPanel:**
   - Log into your GoDaddy cPanel
   - Find "Node.js" in the Software section
   - Create a new Node.js app
   - Set Node.js version to 18+ 
   - Set startup file to `server.js`

2. **Upload your project:**
   - Upload your entire project folder via File Manager or FTP
   - Make sure `package.json` is in the root directory

### Phase 3: Database Setup (MySQL)

#### 1. Create MySQL Database in GoDaddy cPanel

1. **Access MySQL Databases:**
   - Log into GoDaddy cPanel
   - Go to "MySQL Databases"
   - Create a new database (e.g., `pharmacy_db`)
   - Create a database user with full privileges
   - Note down: database name, username, password

2. **Get Database Connection Details:**
   - Database Host: Usually `localhost` or provided by GoDaddy
   - Port: Usually `3306`
   - Database Name: `your_account_pharmacy_db`
   - Username: `your_account_dbuser`
   - Password: `your_chosen_password`

#### 2. Initialize Database Schema

Since GoDaddy hosting may not support direct Prisma commands, we'll create an SQL export:

```bash
# In your local environment, generate SQL schema
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > schema.sql
```

**Upload and run the schema:**
1. Go to cPanel → phpMyAdmin
2. Select your database
3. Go to "Import" tab
4. Upload the `schema.sql` file
5. Execute the import

#### 3. Seed Production Data

Create a web-based seeding script that you can run once:

```bash
# Create a temporary seeding endpoint
# This will be accessible at yourdomain.com/api/seed-once
```

### Phase 4: Domain Configuration

#### 1. Domain DNS Settings

1. **Access DNS Management:**
   - Log into your GoDaddy account
   - Go to "My Products" → "DNS"
   - Select your domain

2. **Configure DNS Records:**
   ```
   Type: A
   Name: @
   Value: [Your hosting IP address]
   TTL: 600

   Type: CNAME
   Name: www
   Value: @
   TTL: 600
   ```

3. **SSL Certificate:**
   - GoDaddy usually provides free SSL
   - Go to cPanel → "SSL/TLS"
   - Enable "Force HTTPS Redirect"

### Phase 5: Environment Variables Setup

#### For Traditional Hosting (using .htaccess):

Create `.htaccess` file in your `public_html`:
```apache
RewriteEngine On

# Environment variables (if supported)
SetEnv NODE_ENV production
SetEnv NEXTAUTH_URL https://yourdomain.com

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Handle Next.js routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### For VPS/Dedicated with Node.js:

Upload your `.env.production` file to the server root directory.

### Phase 6: Deploy and Test

#### 1. Upload Your Application

**For Static Export (Traditional Hosting):**
```bash
# After building locally
# Upload contents of 'out' folder to public_html via:
# - cPanel File Manager
# - FTP client (FileZilla)
# - GoDaddy's built-in file upload
```

**For Node.js Hosting:**
```bash
# Upload entire project
# Install dependencies via SSH or cPanel Terminal:
npm install --production

# Start the application
npm start
```

#### 2. Run Database Seeding

Since you can't run npm scripts directly on shared hosting, access your seeding endpoint:
```
https://yourdomain.com/api/seed-production
```

#### 3. Test Your Application

Visit: `https://yourdomain.com`

**Test these key features:**
- ✅ Homepage loads correctly
- ✅ Login functionality works
- ✅ Admin dashboard accessible
- ✅ Database connectivity
- ✅ All API endpoints respond

## 🔧 GoDaddy-Specific Configurations

### File Structure for GoDaddy:
```
public_html/
├── _next/
├── api/
├── static/
├── index.html
├── 404.html
├── .htaccess
└── [other static files]
```

### Performance Optimization:
```bash
# Add to .htaccess for caching
<IfModule mod_expires.c>
ExpiresActive On
ExpiresByType text/css "access plus 1 year"
ExpiresByType application/javascript "access plus 1 year"
ExpiresByType image/png "access plus 1 year"
ExpiresByType image/jpg "access plus 1 year"
ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

## 🚨 Important Notes for GoDaddy:

1. **Shared Hosting Limitations:**
   - No server-side rendering
   - Limited to static files
   - API routes need alternative implementation

2. **Database Naming:**
   - GoDaddy prefixes database names with your account name
   - Update your DATABASE_URL accordingly

3. **File Permissions:**
   - Set correct permissions (755 for directories, 644 for files)
   - Some features may require specific permissions

4. **Email Configuration:**
   - Use GoDaddy's SMTP server for best delivery
   - Configure SPF and DKIM records for better deliverability

## 📞 Alternative Solutions:

If you encounter limitations with traditional GoDaddy hosting:

### Option 1: Use Vercel (Recommended)
- Deploy on Vercel (free tier available)
- Point your GoDaddy domain to Vercel
- Much easier for Next.js applications

### Option 2: GoDaddy VPS
- Upgrade to VPS for full Node.js support
- More expensive but full functionality

### Option 3: Hybrid Approach
- Frontend on GoDaddy (static)
- Backend API on separate service (Railway, Heroku)

## 🔑 Default Login Credentials:

After deployment and seeding:
- **Admin**: admin@pharmacy.com / password123
- **Staff**: sarah.johnson@pharmacy.com / password123
- **Customer**: alice.smith@gmail.com / password123

## 🆘 Troubleshooting:

**Common Issues:**
1. **500 Internal Server Error:** Check file permissions and .htaccess
2. **Database Connection Failed:** Verify DATABASE_URL format
3. **API Routes Not Working:** Use static export for shared hosting
4. **SSL Issues:** Enable Force HTTPS in cPanel

**Support Resources:**
- GoDaddy Support: 24/7 available
- cPanel Documentation
- Check error logs in cPanel → Error Logs

---

**🎉 Once deployed successfully, your pharmacy management system will be live at your GoDaddy domain with full functionality!**
