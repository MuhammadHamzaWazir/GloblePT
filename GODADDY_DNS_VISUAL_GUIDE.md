# 📋 GODADDY DNS CONFIGURATION - VISUAL GUIDE
# Exact settings for: globalpharmatrading.co.uk

## 🎯 WHAT YOUR GODADDY DNS SHOULD LOOK LIKE

After adding the DNS records, your GoDaddy DNS management page should show:

```
DNS Records for globalpharmatrading.co.uk
===========================================

Type    Name    Value                   TTL
----    ----    -----                   ---
A       @       76.76.19.61            1 Hour
CNAME   www     cname.vercel-dns.com   1 Hour

Other records (keep these if they exist):
MX      @       (your email settings)  
TXT     @       (verification records)
```

---

## 🔧 STEP-BY-STEP DNS CONFIGURATION

### 1. Login and Navigate
```
GoDaddy.com → Login → My Products → globalpharmatrading.co.uk → DNS
```

### 2. Current vs Target Configuration

**BEFORE (Remove these if they exist):**
```
Type    Name    Value               Notes
----    ----    -----               -----
A       @       [Some other IP]     ← DELETE THIS
CNAME   www     [Some other URL]    ← DELETE THIS
```

**AFTER (Add these):**
```
Type    Name    Value                   Notes
----    ----    -----                   -----
A       @       76.76.19.61            ← ADD THIS
CNAME   www     cname.vercel-dns.com   ← ADD THIS
```

---

## 📝 EXACT VALUES TO ENTER

### Record 1: Root Domain A Record
```
Type: A
Name: @
Value: 76.76.19.61
TTL: 1 Hour (3600 seconds)
```

### Record 2: WWW Subdomain CNAME Record
```
Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: 1 Hour (3600 seconds)
```

---

## ✅ VERIFICATION COMMANDS

After saving DNS changes, you can verify with these commands:

### Check A Record
```bash
nslookup globalpharmatrading.co.uk
# Should return: 76.76.19.61
```

### Check CNAME Record
```bash
nslookup www.globalpharmatrading.co.uk
# Should return: cname.vercel-dns.com
```

### Check HTTP Response
```bash
curl -I https://globalpharmatrading.co.uk
# Should return: 200 OK (after DNS propagation)
```

---

## 🚨 IMPORTANT NOTES

### What NOT to Change
- **Don't delete MX records** (if you have email setup)
- **Don't delete TXT records** (verification records)
- **Only modify/delete A and CNAME records** for @ and www

### TTL Settings
- **1 Hour TTL** is recommended for initial setup
- Can be changed to longer (24 hours) after everything works
- Shorter TTL = faster changes, longer TTL = better performance

### Common Mistakes
- ❌ Using `globalpharmatrading.co.uk` instead of `@` for root domain
- ❌ Adding `http://` or `https://` to values (use raw IP/domain only)  
- ❌ Using wrong Vercel CNAME (must be `cname.vercel-dns.com`)
- ❌ Forgetting to save changes in GoDaddy

---

## 📞 TESTING CHECKLIST

After DNS configuration:

1. **Wait 5-30 minutes** for propagation
2. **Check Vercel dashboard** - domain should show "Valid"
3. **Test URLs:**
   - https://globalpharmatrading.co.uk
   - https://www.globalpharmatrading.co.uk
4. **Test login** with: admin@pharmacy.com / password123
5. **Verify all features** work correctly

---

## 🎉 SUCCESS INDICATORS

Your DNS is working correctly when:

- ✅ `nslookup globalpharmatrading.co.uk` returns `76.76.19.61`
- ✅ Vercel dashboard shows domain as "Valid"
- ✅ https://globalpharmatrading.co.uk loads your pharmacy system
- ✅ All application features work normally
- ✅ SSL certificate is automatically provisioned

**Once all checks pass, your pharmacy management system is live on your custom domain!** 🌟
