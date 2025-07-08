# 🚀 CORRECT DEPLOYMENT: Next.js → Vercel + Custom Domain

## Why Vercel (not GoDaddy public_html)?

✅ **Next.js is MADE by Vercel** - Perfect integration  
✅ **API routes work seamlessly** - No server configuration needed  
✅ **Automatic builds** - Git push = automatic deployment  
✅ **Environment variables** - Easy management through dashboard  
✅ **SSL certificates** - Automatic HTTPS for custom domains  
✅ **Edge functions** - Better performance  

## 🎯 STEP 1: Deploy to Vercel

### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (from your project root)
vercel

# Follow prompts:
# ? Set up and deploy "pharmacy"? [Y/n] y
# ? Which scope? [Your account]
# ? Link to existing project? [N/y] n
# ? What's your project's name? global-pharma-trading
# ? In which directory is your code located? ./
```

### Option B: Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `.next`

## 🎯 STEP 2: Add Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Database
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url

# Authentication
JWT_SECRET=your_jwt_secret
ENCRYPTION_SECRET=your_encryption_secret

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_FROM=noreply@globalpharmatrading.co.uk

# Payment
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable

# App
NEXT_PUBLIC_BASE_URL=https://globalpharmatrading.co.uk
NODE_ENV=production
```

## 🎯 STEP 3: Configure Custom Domain

### In Vercel Dashboard:
1. Go to **Project → Settings → Domains**
2. Add domain: `globalpharmatrading.co.uk`
3. Add domain: `www.globalpharmatrading.co.uk`

Vercel will provide DNS records to configure.

### In GoDaddy DNS:
1. **Login** to GoDaddy → My Products → globalpharmatrading.co.uk → DNS
2. **Delete all existing A/CNAME records** for @ and www
3. **Add Vercel's records**:

```
Type: A
Name: @
Value: 76.76.19.61
TTL: 1 hour

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: 1 hour
```

## 🎯 STEP 4: Verify Deployment

### Check these URLs work:
- ✅ https://globalpharmatrading.co.uk
- ✅ https://www.globalpharmatrading.co.uk  
- ✅ https://globalpharmatrading.co.uk/auth/login
- ✅ https://globalpharmatrading.co.uk/api/auth/me

### Test logout functionality:
1. Login to dashboard
2. Click logout button  
3. Verify cookies are cleared
4. Verify redirect to login page

## 🎯 STEP 5: Configure Automatic Deployments

Connect your Git repository to Vercel:
1. **Vercel Dashboard** → Project → Settings → Git
2. **Connect** your GitHub/GitLab repository
3. **Configure** branch: `main` or `master`

Now every `git push` automatically deploys!

## ✅ BENEFITS vs GoDaddy public_html:

| Feature | Vercel | GoDaddy public_html |
|---------|--------|-------------------|
| Next.js API routes | ✅ Works perfectly | ❌ Requires Node.js server |
| Automatic builds | ✅ Git push deploys | ❌ Manual file upload |
| SSL certificates | ✅ Automatic | ❌ Manual configuration |
| Environment variables | ✅ Dashboard UI | ❌ File-based config |
| Performance | ✅ Edge network | ❌ Single server |
| Database connections | ✅ Optimized | ❌ Manual setup |

## 🚀 QUICK DEPLOY COMMANDS:

```bash
# 1. Build and test locally
npm run build
npm run start

# 2. Deploy to Vercel
vercel --prod

# 3. Set up custom domain (in Vercel dashboard)
# 4. Configure GoDaddy DNS (see above)
# 5. Test: https://globalpharmatrading.co.uk
```

## ❓ WHY was I doing GoDaddy deployment?

Looking at your workspace, I found many deployment scripts targeting GoDaddy public_html. This was likely:
1. **Legacy approach** before Vercel integration
2. **Alternative option** for specific hosting requirements  
3. **Backup deployment** method

But for **Next.js with API routes**, Vercel is definitely the right choice!
