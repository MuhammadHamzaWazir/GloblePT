# 🎯 SPECIFIC DEPLOYMENT GUIDE FOR globalpharmatrading.co.uk

## 🌟 RECOMMENDED APPROACH: GoDaddy Domain → Vercel

This approach gives you:
- ✅ Your custom domain (globalpharmatrading.co.uk)
- ✅ Full application functionality (login, prescriptions, payments)
- ✅ Excellent performance and reliability
- ✅ Free hosting on Vercel
- ✅ Automatic SSL certificates
- ✅ Global CDN distribution

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### STEP 1: Configure Domain in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Login with your account

2. **Open Your Project**
   - Find and click on: **pharmacy-management-system**

3. **Add Your Domain**
   - Click on **Settings** (in the top navigation)
   - Click on **Domains** (in the left sidebar)
   - Click **Add Domain** button
   - Enter: `globalpharmatrading.co.uk`
   - Click **Add**

4. **Add WWW Subdomain**
   - Click **Add Domain** again
   - Enter: `www.globalpharmatrading.co.uk`
   - Click **Add**

5. **Note the DNS Information**
   - Vercel will show you the DNS records needed
   - Keep this tab open for the next step

### STEP 2: Configure DNS in GoDaddy

1. **Login to GoDaddy**
   - Go to: https://godaddy.com
   - Login to your account

2. **Access DNS Management**
   - Go to **My Products**
   - Find **globalpharmatrading.co.uk**
   - Click **DNS** (or **Manage DNS**)

3. **Clear Existing Records**
   - Delete any existing **A** records
   - Delete any existing **CNAME** records for **www**
   - Keep other records (MX, TXT, etc.) if you have email setup

4. **Add New DNS Records**

   **Root Domain (globalpharmatrading.co.uk):**
   ```
   Type: A
   Name: @
   Value: 76.76.19.61
   TTL: 1 Hour
   ```

   **WWW Subdomain (www.globalpharmatrading.co.uk):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 1 Hour
   ```

5. **Save Changes**
   - Click **Save** or **Save All Changes**

### STEP 3: Wait for DNS Propagation

1. **Initial Wait**
   - DNS changes take 5-30 minutes to propagate
   - Sometimes up to 48 hours for full global propagation

2. **Check Vercel Status**
   - Return to Vercel dashboard
   - Check if domain status shows as "Valid"
   - If not, wait a bit longer

### STEP 4: Verify Your Deployment

1. **Test Your Domain**
   - Visit: https://globalpharmatrading.co.uk
   - Should show your pharmacy management system

2. **Test WWW Version**
   - Visit: https://www.globalpharmatrading.co.uk
   - Should redirect to the main domain

3. **Test Login**
   - Use these credentials:
   - **Email:** admin@pharmacy.com
   - **Password:** password123

---

## 🧪 TESTING YOUR DEPLOYMENT

### Use the DNS Checker Tool
```bash
node scripts/check-dns.js globalpharmatrading.co.uk
```

This will verify:
- DNS resolution
- HTTP/HTTPS responses
- SSL certificate status

### Manual Testing Checklist

- [ ] https://globalpharmatrading.co.uk loads
- [ ] https://www.globalpharmatrading.co.uk redirects properly
- [ ] Login page works
- [ ] Admin dashboard accessible
- [ ] Prescription system functional
- [ ] Payment system working
- [ ] All API endpoints responding

---

## 🚨 TROUBLESHOOTING

### If Domain Doesn't Load
1. **Check DNS Propagation**
   - Use: https://dnschecker.org
   - Enter: globalpharmatrading.co.uk
   - Check if A record shows: 76.76.19.61

2. **Verify GoDaddy Settings**
   - Ensure A record: @ → 76.76.19.61
   - Ensure CNAME: www → cname.vercel-dns.com

3. **Check Vercel Status**
   - Domain should show as "Valid" in Vercel dashboard
   - If "Invalid", check DNS settings

### If SSL Certificate Issues
1. Wait 24 hours for automatic SSL provisioning
2. Check Vercel dashboard for SSL status
3. Try accessing with http:// first, then https://

### If Login Doesn't Work
1. Check that you're using the production database
2. Verify environment variables in Vercel
3. Test with admin credentials: admin@pharmacy.com / password123

---

## 🎉 SUCCESS INDICATORS

When everything is working correctly:

1. **Domain Access**
   - https://globalpharmatrading.co.uk loads your pharmacy system
   - Secure SSL certificate (green lock icon)

2. **Full Functionality**
   - User login/registration works
   - Admin dashboard accessible
   - Prescription management functional
   - Payment processing available
   - All API endpoints responding

3. **Performance**
   - Fast loading times (global CDN)
   - Responsive design on all devices
   - Search engine friendly URLs

---

## 📞 SUPPORT

### If You Need Help
1. **Check Vercel Logs**
   - Go to Vercel dashboard → Functions → View Function Logs

2. **Test Database Connection**
   ```bash
   node scripts/test-production-apis.js
   ```

3. **Verify Environment Variables**
   - Check Vercel dashboard → Settings → Environment Variables

### Contact Information
- **Domain Issues**: GoDaddy Support
- **Hosting Issues**: Vercel Support
- **Application Issues**: Check deployment logs

---

## 🏆 FINAL RESULT

Once complete, you'll have:
- ✅ **Custom Domain**: globalpharmatrading.co.uk
- ✅ **Professional Pharmacy System**: Full-featured web application
- ✅ **Secure Access**: HTTPS with automatic SSL
- ✅ **Global Performance**: CDN-powered fast loading
- ✅ **Complete Functionality**: All features working perfectly

**Your pharmacy management system will be live and accessible to customers worldwide!** 🌍

---

*Configuration Date: June 30, 2025*
*Domain: globalpharmatrading.co.uk*
*Deployment: Vercel + GoDaddy DNS*
