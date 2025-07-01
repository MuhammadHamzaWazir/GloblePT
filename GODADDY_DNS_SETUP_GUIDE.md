# 🌐 STEP-BY-STEP: Add DNS Settings to GoDaddy
# For: globalpharmatrading.co.uk → Vercel Deployment

## 🎯 WHAT WE'RE DOING

You're going to configure your GoDaddy DNS to point your domain (`globalpharmatrading.co.uk`) to your Vercel deployment. This gives you:
- ✅ Your custom domain
- ✅ Full functionality (all features work)
- ✅ Professional appearance
- ✅ Free Vercel hosting

---

## 📋 STEP 1: Configure Domain in Vercel First

Before changing GoDaddy DNS, you need to tell Vercel about your domain:

1. **Open Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Login with your account

2. **Find Your Project**
   - Look for: **pharmacy-management-system**
   - Click on it

3. **Add Your Domain**
   - Click **Settings** (top navigation)
   - Click **Domains** (left sidebar)
   - Click **Add Domain** button
   - Type: `globalpharmatrading.co.uk`
   - Click **Add**

4. **Add WWW Version**
   - Click **Add Domain** again
   - Type: `www.globalpharmatrading.co.uk`
   - Click **Add**

5. **Note the Status**
   - Vercel will show "Invalid" status initially
   - This is normal - we'll fix it with DNS settings
   - Keep this tab open

---

## 🌐 STEP 2: Add DNS Settings in GoDaddy

Now let's configure your GoDaddy DNS:

### Access GoDaddy DNS Management

1. **Login to GoDaddy**
   - Go to: https://godaddy.com
   - Login to your account

2. **Navigate to DNS**
   - Click **My Products** (or **My Account**)
   - Find **globalpharmatrading.co.uk**
   - Click **DNS** (or **Manage DNS**)

### Clear Existing Records (Important!)

3. **Remove Conflicting Records**
   - Look for existing **A** records with name **@**
   - Look for existing **CNAME** records with name **www**
   - **Delete** these records (click trash/delete icon)
   - Keep other records (MX, TXT, etc.) if you have email setup

### Add New DNS Records

4. **Add Root Domain A Record**
   ```
   Type: A
   Name: @
   Value: 76.76.19.61
   TTL: 1 Hour
   ```
   
   **Steps:**
   - Click **Add Record** or **Add**
   - Select **Type**: A
   - **Name**: @ (this represents your root domain)
   - **Value**: 76.76.19.61
   - **TTL**: 1 Hour (or 3600 seconds)
   - Click **Save**

5. **Add WWW CNAME Record**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 1 Hour
   ```
   
   **Steps:**
   - Click **Add Record** or **Add**
   - Select **Type**: CNAME
   - **Name**: www
   - **Value**: cname.vercel-dns.com
   - **TTL**: 1 Hour (or 3600 seconds)
   - Click **Save**

6. **Save All Changes**
   - Click **Save** or **Save All Changes**
   - Confirm any prompts

---

## ⏰ STEP 3: Wait for DNS Propagation

DNS changes take time to spread across the internet:

1. **Initial Wait**
   - Minimum: 5-15 minutes
   - Typical: 30 minutes
   - Maximum: 24-48 hours (rare)

2. **Check Vercel Status**
   - Return to Vercel dashboard
   - Refresh the page
   - Domain status should change from "Invalid" to "Valid"

3. **Test Domain Resolution**
   - You can test if DNS is working:
   ```bash
   # Check if your domain points to Vercel
   nslookup globalpharmatrading.co.uk
   ```

---

## 🧪 STEP 4: Test Your Live Website

Once DNS propagates:

1. **Visit Your Domain**
   - https://globalpharmatrading.co.uk
   - Should show your pharmacy management system

2. **Test WWW Version**
   - https://www.globalpharmatrading.co.uk
   - Should redirect to main domain

3. **Test Login**
   - Email: `admin@pharmacy.com`
   - Password: `password123`

4. **Test Features**
   - Admin dashboard
   - Prescription management
   - User management
   - All API endpoints

---

## 🔍 VERIFY CONFIGURATION IS CORRECT

Use this command to check your DNS setup:

```bash
node scripts/check-dns.js globalpharmatrading.co.uk
```

Or use this to verify the full deployment:

```bash
node scripts/verify-globalpharmatrading.js
```

---

## 🚨 TROUBLESHOOTING

### If Domain Doesn't Work After 30 Minutes:

1. **Double-Check DNS Records in GoDaddy**
   - A Record: @ → 76.76.19.61
   - CNAME Record: www → cname.vercel-dns.com

2. **Check Vercel Dashboard**
   - Domain should show "Valid" status
   - If "Invalid", wait longer or check DNS

3. **Clear Browser Cache**
   - Hard refresh (Ctrl+F5)
   - Try incognito/private browsing
   - Test from different device

4. **Check DNS Propagation**
   - Use: https://dnschecker.org
   - Enter: globalpharmatrading.co.uk
   - Should show Vercel IP: 76.76.19.61

### Common Issues:

- **"Site can't be reached"**: DNS not propagated yet, wait longer
- **"Vercel page not found"**: Check domain is added in Vercel
- **"SSL error"**: Wait for SSL certificate provisioning (up to 24 hours)

---

## 📱 FINAL VERIFICATION CHECKLIST

- [ ] Added domain in Vercel dashboard
- [ ] Added A record in GoDaddy: @ → 76.76.19.61
- [ ] Added CNAME record in GoDaddy: www → cname.vercel-dns.com
- [ ] Waited for DNS propagation (5-30 minutes)
- [ ] Vercel shows domain as "Valid"
- [ ] https://globalpharmatrading.co.uk loads
- [ ] https://www.globalpharmatrading.co.uk redirects
- [ ] Can login with admin@pharmacy.com / password123
- [ ] All features work correctly

---

## 🎉 SUCCESS!

Once everything is working:

- **Your pharmacy system is live** at https://globalpharmatrading.co.uk
- **Professional custom domain** for your business
- **Full functionality** - all features work
- **Secure HTTPS** with automatic SSL certificates
- **Global performance** with Vercel's CDN

**Your customers can now access your pharmacy management system with your professional domain!** 🌟

---

*Need help? Run: `npm run configure:godaddy` for interactive assistance*
