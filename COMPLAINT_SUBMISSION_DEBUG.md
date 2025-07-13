## 🚨 COMPLAINT SUBMISSION ISSUE DIAGNOSIS

### Problem Identified:
The complaint submission is failing because the user is not properly authenticated. The form shows "Failed to submit complaint" because:

1. **Authentication Required**: The `/api/complaints` endpoint requires a valid JWT token in the `pharmacy_auth` cookie
2. **User Not Logged In**: The user needs to be logged in to submit complaints
3. **Missing Authentication State**: The auth context is not finding a valid user session

### Solution Steps:

#### Step 1: Login to the System
1. Go to: `http://localhost:3000/auth/login`
2. Use existing credentials:
   - **Admin**: `admin@globalpharmatrading.co.uk` / `admin123`
   - **Staff**: `pharmacist@globalpharmatrading.co.uk` / `staff123`
   - **Customer**: Any existing customer credentials

#### Step 2: Test Complaint Submission
1. After logging in, navigate to: `http://localhost:3000/complaints`
2. Fill out the complaint form:
   - **Title**: "Test Complaint"
   - **Description**: "This is a test complaint"
   - **Category**: Select any category
   - **Priority**: Select any priority
3. Click "Submit Complaint"

#### Step 3: Verify Success
1. Check browser console for debugging logs
2. Visit customer dashboard: `http://localhost:3000/dashboard/complaints`
3. Verify complaint appears in the table

### Enhanced Error Handling:

I've added comprehensive debugging logs to both:
- **Frontend**: `/complaints/page.tsx` - Shows detailed console logs
- **Backend**: `/api/complaints/route.ts` - Shows authentication flow

### Authentication Flow:
```
1. User logs in → JWT token created → Stored in 'pharmacy_auth' cookie
2. User submits complaint → Cookie sent with request → Token verified
3. If valid → Complaint created → Success response
4. If invalid → 401 error → "Authentication required"
```

### Quick Fix Test:
Run this in browser console while on the complaints page:
```javascript
// Check if user is authenticated
console.log('User:', window.user);
console.log('Cookies:', document.cookie);
```

### Expected Result:
- ✅ User should be authenticated
- ✅ Complaint form should submit successfully
- ✅ Complaint should appear in customer dashboard
- ✅ Admin should see complaint in admin dashboard

### If Still Failing:
1. Clear browser cookies
2. Login again
3. Try submitting complaint
4. Check browser console for specific error messages
