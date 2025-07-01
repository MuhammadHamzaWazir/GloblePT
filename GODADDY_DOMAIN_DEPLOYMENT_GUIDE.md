# 🌐 COMPLETE GODADDY DEPLOYMENT GUIDE
# Pharmacy Management System - GoDaddy Domain Deployment

## 📋 DEPLOYMENT OPTIONS

You have **3 deployment options** for your GoDaddy domain:

### Option 1: GoDaddy Domain → Vercel (RECOMMENDED ⭐)
- **Best Performance**: Use Vercel for hosting, GoDaddy for domain only
- **Full Functionality**: All features work (API, database, payments)
- **Easy Setup**: Simple DNS configuration
- **Cost**: Free Vercel hosting + domain cost

### Option 2: GoDaddy VPS/Dedicated Server
- **Full Control**: Complete server management
- **Full Functionality**: All features work
- **Cost**: VPS hosting fees + domain cost
- **Complexity**: Server setup required

### Option 3: GoDaddy Shared Hosting (LIMITED)
- **Limited Functionality**: Static files only, no API/database
- **Low Cost**: Basic shared hosting + domain cost
- **Restrictions**: No server-side features

---

## 🎯 OPTION 1: GODADDY DOMAIN → VERCEL (RECOMMENDED)

This is the **best approach** - use your GoDaddy domain to point to your Vercel deployment.

### Step 1: Configure Domain in Vercel

1. **Login to Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Navigate to your **pharmacy-management-system** project

2. **Add Custom Domain**
   - Go to **Settings** → **Domains**
   - Click **Add Domain**
   - Enter your GoDaddy domain (e.g., `yourdomain.com`)
   - Click **Add**

3. **Note the DNS Records**
   - Vercel will show you the required DNS records
   - Keep this tab open for the next step

### Step 2: Configure DNS in GoDaddy

1. **Login to GoDaddy**
   - Go to [godaddy.com](https://godaddy.com)
   - Login to your account
   - Go to **My Products** → **DNS**

2. **Add DNS Records**
   - Click **Manage DNS** for your domain
   - **Delete** existing A and CNAME records (if any)
   - **Add** the records provided by Vercel:

#### For Root Domain (yourdomain.com):
```
Type: A
Name: @
Value: 76.76.19.61
TTL: 1 Hour
```

#### For WWW Subdomain (www.yourdomain.com):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 1 Hour
```

3. **Save Changes**
   - Click **Save** in GoDaddy
   - Wait for DNS propagation (5-30 minutes)

### Step 3: Verify Domain Connection

1. **Check Vercel**
   - Return to Vercel dashboard
   - Wait for domain verification (may take up to 30 minutes)
   - Status should change to **Valid**

2. **Test Your Domain**
   - Visit `yourdomain.com`
   - Should redirect to your pharmacy application
   - Test login with: `admin@pharmacy.com` / `password123`

---

## 🖥️ OPTION 2: GODADDY VPS DEPLOYMENT

If you have GoDaddy VPS or dedicated hosting, follow these steps:

### Step 1: VPS Setup Requirements

Your GoDaddy VPS needs:
- **Node.js 18+** installed
- **MySQL** database
- **SSL Certificate** for HTTPS
- **Domain pointing** to VPS IP

### Step 2: Upload and Configure

1. **Upload Project Files**
   ```bash
   # On your VPS, clone or upload the project
   git clone https://github.com/your-username/pharmacy-management-system.git
   cd pharmacy-management-system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Create .env file with your VPS database details
   DATABASE_URL="mysql://username:password@localhost:3306/pharmacy_db"
   JWT_SECRET="your-jwt-secret-key"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="https://yourdomain.com"
   NODE_ENV="production"
   ```

4. **Setup Database**
   ```bash
   npm run db:migrate:deploy
   npm run db:seed:prod
   ```

5. **Build and Start**
   ```bash
   npm run build
   npm start
   ```

### Step 3: Configure Web Server (Apache/Nginx)

#### For Apache (.htaccess):
```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

#### For Nginx:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📁 OPTION 3: GODADDY SHARED HOSTING (STATIC)

⚠️ **Warning**: This option has **limited functionality** - no API, database, or server features.

### What Works:
- ✅ Static pages (Home, About, Contact)
- ✅ Basic styling and layout
- ✅ Client-side JavaScript

### What Doesn't Work:
- ❌ User login/authentication
- ❌ Database operations
- ❌ API endpoints
- ❌ Prescription management
- ❌ Payment processing

### If You Still Want Static Deployment:

1. **Generate Static Export**
   ```bash
   npm run build:static
   ```

2. **Upload Files**
   - Upload the `out/` folder contents to your GoDaddy hosting
   - Files go in the `public_html` directory

---

## 🔧 ADDITIONAL GODADDY CONFIGURATION

### SSL Certificate Setup
1. **In GoDaddy Control Panel**
   - Go to **SSL Certificates**
   - Purchase or enable free SSL
   - Follow installation instructions

### Email Configuration (Optional)
If you want to use your domain for emails:
1. **Setup Email Accounts** in GoDaddy
2. **Update Email Settings** in your app
3. **Configure SMTP** with GoDaddy email servers

### Subdomain Setup (Optional)
To create subdomains like `admin.yourdomain.com`:
1. **In GoDaddy DNS Management**
2. **Add CNAME Record**:
   ```
   Type: CNAME
   Name: admin
   Value: cname.vercel-dns.com (or your VPS IP)
   ```

---

## 🧪 TESTING YOUR DEPLOYMENT

### After DNS Configuration:
1. **Wait for Propagation** (5-30 minutes)
2. **Test Domain Access**:
   ```bash
   # Check if domain resolves
   nslookup yourdomain.com
   
   # Test HTTP response
   curl -I http://yourdomain.com
   ```

3. **Test Application**:
   - Visit your domain
   - Test login functionality
   - Verify all features work

### Troubleshooting:
- **DNS not resolving**: Wait longer, check DNS records
- **SSL errors**: Ensure SSL certificate is properly installed
- **Application errors**: Check server logs and environment variables

---

## 📞 NEXT STEPS

### For Option 1 (Recommended):
1. Choose your GoDaddy domain
2. Follow Vercel domain setup
3. Configure GoDaddy DNS records
4. Test and verify

### For Option 2 (VPS):
1. Ensure VPS meets requirements
2. Upload and configure application
3. Setup web server proxy
4. Configure SSL

### Questions to Consider:
- **What's your GoDaddy hosting type?** (Shared, VPS, Dedicated)
- **What's your domain name?** (so I can provide specific instructions)
- **Do you want full functionality?** (Option 1 recommended)

Let me know your preferences and I'll provide specific step-by-step instructions for your setup! 🚀
