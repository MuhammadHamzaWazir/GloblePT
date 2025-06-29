# ✅ GoDaddy Deployment Checklist

## 🎯 RECOMMENDED: Vercel Deployment (Full Functionality)

### Pre-deployment Setup:
- [ ] Code is pushed to GitHub ✅ (Already done)
- [ ] Production seeding script ready ✅ (Already done)
- [ ] Environment variables documented ✅ (Already done)

### Vercel Deployment Steps:
- [ ] 1. Sign up at [vercel.com](https://vercel.com) with GitHub
- [ ] 2. Import your `pharmacy` repository
- [ ] 3. Deploy with default settings
- [ ] 4. Set up database (PlanetScale or Railway recommended)
- [ ] 5. Add environment variables in Vercel dashboard
- [ ] 6. Configure your GoDaddy domain to point to Vercel:
  - [ ] A record: `@` → `76.76.19.61`
  - [ ] CNAME record: `www` → `cname.vercel-dns.com`
- [ ] 7. Add custom domain in Vercel dashboard
- [ ] 8. Initialize database by visiting `/api/seed-production`
- [ ] 9. Test login with admin@pharmacy.com / password123
- [ ] 10. Remove seed endpoint for security

### Environment Variables Needed:
```bash
DATABASE_URL=mysql://user:pass@host:3306/db
JWT_SECRET=your-32-char-secret
NEXTAUTH_SECRET=your-32-char-secret  
NEXTAUTH_URL=https://yourdomain.com
APP_NAME=Global Pharma Trading
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

---

## 📁 ALTERNATIVE: GoDaddy Static (Demo Only)

### ⚠️ WARNING: Limited Functionality
- ❌ No login system
- ❌ No database features
- ❌ No admin dashboard
- ❌ No prescription management
- ✅ Static pages only

### Static Upload Steps:
- [ ] 1. Log into GoDaddy cPanel
- [ ] 2. Open File Manager
- [ ] 3. Navigate to `public_html`
- [ ] 4. Delete existing files (backup first)
- [ ] 5. Upload ALL contents from `out` folder:
  - [ ] index.html
  - [ ] _next/ folder
  - [ ] 404.html
  - [ ] .htaccess
  - [ ] All other files and folders
- [ ] 6. Test static site at your domain

---

## 🧪 Testing Checklist

### For Vercel Deployment:
- [ ] Homepage loads at https://yourdomain.com
- [ ] HTTPS redirect works
- [ ] Login page accessible
- [ ] Can login with test credentials
- [ ] Admin dashboard loads
- [ ] Database features work
- [ ] API endpoints respond

### For Static Deployment:
- [ ] Homepage loads at https://yourdomain.com  
- [ ] HTTPS redirect works
- [ ] Static pages navigate correctly
- [ ] Images and assets load properly
- [ ] (Login will NOT work - expected)

---

## 🚀 Post-Deployment

### Security:
- [ ] Change default passwords
- [ ] Remove seed endpoint (if used)
- [ ] Set up SSL certificate (auto with Vercel/GoDaddy)
- [ ] Configure proper environment variables

### Optional Enhancements:
- [ ] Set up email notifications
- [ ] Configure Stripe for payments
- [ ] Set up monitoring/analytics
- [ ] Create database backups

---

## 📞 Need Help?

### Common Issues:
- **Domain not pointing:** DNS changes take 24-48 hours
- **Database connection errors:** Check environment variables
- **Build failures:** Usually missing dependencies
- **SSL issues:** Both Vercel and GoDaddy provide free SSL

### Resources:
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Next.js Documentation: [nextjs.org/docs](https://nextjs.org/docs)
- Your deployment files: Check `COMPLETE_GODADDY_DEPLOYMENT_GUIDE.md`

---

**🎯 RECOMMENDATION: Use Vercel for full pharmacy management functionality!**
