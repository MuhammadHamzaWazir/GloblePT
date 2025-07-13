# 🔐 PRODUCTION LOGIN CREDENTIALS

## Global Pharma Trading - Production Environment

**Application URL:** http://localhost:3000  
**Environment:** Production  
**Database Status:** ✅ Active with seed data  
**Date Created:** July 13, 2025  

---

## 👑 ADMIN ACCOUNTS

### Primary Administrator
- **Email:** `admin@globalpt.com`
- **Password:** `Admin@123`
- **Role:** Admin
- **Access Level:** Full system access
- **Phone:** +1-555-0001

### Super Administrator
- **Email:** `superadmin@globalpt.com`
- **Password:** `Admin@123`
- **Role:** Admin
- **Access Level:** Full system access
- **Phone:** +1-555-0002

---

## 👩‍⚕️ STAFF ACCOUNTS

### Senior Pharmacist
- **Email:** `sarah.pharmacist@globalpt.com`
- **Password:** `Staff@123`
- **Role:** Staff
- **Name:** Dr. Sarah Johnson
- **Phone:** +1-555-1001

### Pharmacist
- **Email:** `michael.pharmacist@globalpt.com`
- **Password:** `Staff@123`
- **Role:** Staff
- **Name:** Dr. Michael Chen
- **Phone:** +1-555-1002

### Pharmacy Assistant
- **Email:** `emily.assistant@globalpt.com`
- **Password:** `Staff@123`
- **Role:** Assistant
- **Name:** Emily Rodriguez
- **Phone:** +1-555-1003

---

## 👥 CUSTOMER ACCOUNTS

### Customer 1
- **Email:** `john.smith@email.com`
- **Password:** `Customer@123`
- **Name:** John Smith
- **Phone:** +1-555-2001
- **Address:** 123 Oak Street, City, State 12345

### Customer 2
- **Email:** `maria.garcia@email.com`
- **Password:** `Customer@123`
- **Name:** Maria Garcia
- **Phone:** +1-555-2002
- **Address:** 456 Pine Avenue, City, State 12345

### Customer 3
- **Email:** `david.wilson@email.com`
- **Password:** `Customer@123`
- **Name:** David Wilson
- **Phone:** +1-555-2003
- **Address:** 789 Elm Drive, City, State 12345

### Customer 4
- **Email:** `lisa.anderson@email.com`
- **Password:** `Customer@123`
- **Name:** Lisa Anderson
- **Phone:** +1-555-2004
- **Address:** 321 Maple Lane, City, State 12345

### Customer 5
- **Email:** `robert.taylor@email.com`
- **Password:** `Customer@123`
- **Name:** Robert Taylor
- **Phone:** +1-555-2005
- **Address:** 654 Cedar Court, City, State 12345

---

## 📊 SAMPLE DATA OVERVIEW

### Database Statistics
- **Total Users:** 10
- **Staff Records:** 2
- **Prescriptions:** 3
- **Orders:** 3
- **Complaints:** 2
- **Admin Users:** 2
- **Verified Users:** 10

### Sample Prescriptions
1. **Amoxicillin 500mg** (Delivered) - John Smith
2. **Lisinopril 10mg** (Ready to Ship) - Maria Garcia
3. **Metformin 850mg** (Pending) - David Wilson

### Sample Orders
1. **ORD-2024-001** - Delivered via FedEx Express
2. **ORD-2024-002** - Dispatched via UPS Ground
3. **ORD-2024-003** - Confirmed, awaiting processing

### Sample Complaints
1. **Delayed Prescription Delivery** - High Priority
2. **Incorrect Medication Received** - Urgent Priority

---

## 🚀 DEPLOYMENT COMMANDS

### Start Production Server
```bash
npm run start
```

### Start with Docker
```bash
docker-compose -f docker-compose.prod.yml up
```

### Health Check
```bash
npm run health:check
```

### Fresh Database Setup
```bash
npm run deploy:fresh
```

---

## 🔧 SYSTEM FEATURES

- ✅ User Management (Admin, Staff, Customer, Assistant)
- ✅ Prescription Processing with Courier Integration
- ✅ Order Management with Tracking
- ✅ Complaint System with Assignment
- ✅ Payment Integration (Stripe ready)
- ✅ Admin Dashboard with Statistics
- ✅ Role-based Access Control
- ✅ Email Verification System
- ✅ Production-ready Docker Setup
- ✅ Health Monitoring
- ✅ Database Migrations

---

## 🛡️ SECURITY FEATURES

- ✅ Password Hashing (bcrypt)
- ✅ JWT Authentication
- ✅ Role-based Authorization
- ✅ Account Status Verification
- ✅ Secure Headers (Production)
- ✅ Rate Limiting (Production)
- ✅ Input Validation
- ✅ HTTPS Ready

---

## 📞 SUPPORT

For any issues or questions regarding the production deployment:
- Check health status: `npm run health:check`
- View logs: Check terminal output
- Database issues: Verify connection strings
- Authentication issues: Confirm user credentials above

**Last Updated:** July 13, 2025  
**Version:** Production v1.0
