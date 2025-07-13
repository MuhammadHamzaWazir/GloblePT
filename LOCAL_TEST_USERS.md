# Local Test Users - Login Credentials

## 🎯 Quick Start Guide
1. Start local server: `npm run dev`
2. Visit: http://localhost:3000
3. Login with any of the credentials below
4. Test the complete pharmacy workflow

## 🔑 User Login Credentials

### 👑 ADMIN USER
- **Email**: admin@globalpharmatrading.co.uk
- **Password**: Admin@2024
- **Role**: Administrator
- **Access**: Full system access, user management, reports
- **Dashboard**: http://localhost:3000/admin/dashboard

### 💊 PHARMACIST (SUPERVISOR)
- **Email**: pharmacist@globalpharmatrading.co.uk
- **Password**: Pharmacist@2024
- **Role**: Senior Pharmacist
- **Access**: Prescription approval, staff management, reports
- **Dashboard**: http://localhost:3000/staff-dashboard

### 🔧 PHARMACY ASSISTANT
- **Email**: assistant@globalpharmatrading.co.uk
- **Password**: Assistant@2024
- **Role**: Pharmacy Assistant
- **Access**: Basic prescription handling, no approvals
- **Dashboard**: http://localhost:3000/staff-dashboard

### 👤 CUSTOMER 1
- **Email**: customer1@example.com
- **Password**: Customer@2024
- **Role**: Customer
- **Status**: Has approved prescription ready for payment (£12.99)
- **Dashboard**: http://localhost:3000/dashboard

### 👤 CUSTOMER 2
- **Email**: customer2@example.com
- **Password**: Customer@2024
- **Role**: Customer
- **Status**: Has pending prescription awaiting approval (£8.50)
- **Dashboard**: http://localhost:3000/dashboard

### 👤 TEST CUSTOMER
- **Email**: test@example.com
- **Password**: Test@2024
- **Role**: Customer
- **Status**: For testing email receipt system (£15.99)
- **Dashboard**: http://localhost:3000/dashboard

## 🧪 Testing Scenarios

### 📋 ADMIN TESTING
- Login: admin@globalpharmatrading.co.uk / Admin@2024
- Access admin dashboard at /admin/dashboard
- Manage users and staff
- View all prescriptions and orders
- Test nuclear logout functionality

### 💊 PHARMACIST TESTING
- Login: pharmacist@globalpharmatrading.co.uk / Pharmacist@2024
- Approve pending prescriptions
- Set prescription pricing
- Manage pharmacy staff
- View pharmacy reports

### 🔧 ASSISTANT TESTING
- Login: assistant@globalpharmatrading.co.uk / Assistant@2024
- View assigned prescriptions
- Process basic prescription tasks
- Limited access to system features

### 👤 CUSTOMER TESTING
- Login: customer1@example.com / Customer@2024 (approved prescription)
- Login: customer2@example.com / Customer@2024 (pending prescription)
- Login: test@example.com / Test@2024 (for email testing)
- Submit new prescriptions
- Make payments via Stripe
- Test email receipt system
- Track orders in dashboard

## 💳 Payment Testing
- Login as customer1@example.com
- Pay for approved prescription (£12.99)
- Use Stripe test card: **4242 4242 4242 4242**
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- Verify email receipt is sent
- Check order creation and tracking

## 🎉 What's Ready for Testing

✅ **All Users and Roles Created Successfully**
- 1 Admin User
- 1 Pharmacist (Supervisor)  
- 1 Pharmacy Assistant
- 3 Customer Users

✅ **Complete Pharmacy Workflow**
- User registration and authentication
- Prescription submission and approval
- Payment processing with Stripe
- Order creation and tracking
- Email receipt system

✅ **Payment and Order System**
- Stripe integration for payments
- Order creation on payment success
- Email receipts sent to customers
- Order status tracking

✅ **Authentication System**
- Role-based access control
- Nuclear logout functionality
- Secure cookie management
- Profile management

✅ **Email Receipt System**
- Payment confirmation emails
- Order status update emails
- Professional email templates

## 🚀 Deploy Status
- **Live Site**: https://globalpharmatrading.co.uk
- **Local Development**: http://localhost:3000
- **Authentication**: Fully functional with nuclear logout
- **Payment System**: Stripe integration complete
- **Email System**: Configured and tested

## 📧 Contact
For any issues or questions about the test users, refer to the comprehensive setup in `create-complete-users.js`.
