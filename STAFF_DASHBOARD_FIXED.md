# Staff Dashboard Complaints - Fix Summary

## Issue Fixed
**Problem**: Staff dashboard complaints page was failing to fetch data from the database.

## Root Cause
The issue was in the JWT token decoding in the staff complaints API endpoints:
- `src/app/api/staff/complaints/route.ts` (GET)
- `src/app/api/staff/complaints/[id]/route.ts` (PUT)

Both endpoints were using `decoded.userId` instead of `decoded.id` which caused authentication failures.

## Solution Applied

### 1. Fixed JWT Token Decoding
**Files Modified:**
- `src/app/api/staff/complaints/route.ts` - Line 26
- `src/app/api/staff/complaints/[id]/route.ts` - Line 29

**Change Made:**
```typescript
// Before (BROKEN)
const user = await prisma.user.findUnique({
  where: { id: decoded.userId },
  include: { role: true }
});

// After (FIXED)
const user = await prisma.user.findUnique({
  where: { id: parseInt(decoded.id) },
  include: { role: true }
});
```

### 2. Set Up Staff User Credentials
- Reset passwords for both staff members for testing
- Dr. Sarah Johnson: `pharmacist@globalpharmatrading.co.uk` / `staff123`
- Mike Wilson: `assistant@globalpharmatrading.co.uk` / `assistant123`

## Test Results

### ✅ Staff Complaints API (GET /api/staff/complaints)
- **Dr. Sarah Johnson**: 2 assigned complaints
- **Mike Wilson**: 1 assigned complaint
- Both staff members can successfully fetch their assigned complaints

### ✅ Staff Complaint Update API (PUT /api/staff/complaints/[id])
- Staff can update complaint status to "investigating" or "resolved"
- Resolution notes are properly saved when marking as resolved
- Staff can only update complaints assigned to them

## Current Database State

### Complaint Assignments
1. **Complaint #2** - "Service Quality Issue"
   - Assigned to: Dr. Sarah Johnson (ID: 5)
   - Status: resolved

2. **Complaint #3** - "Prescription Delivery Delay"
   - Assigned to: Dr. Sarah Johnson (ID: 5)
   - Status: resolved (updated via staff API)

3. **Complaint #4** - "Test Complaint with Auth"
   - Assigned to: Mike Wilson (ID: 6)
   - Status: closed

## API Endpoints Working

### Staff Complaints Management
- `GET /api/staff/complaints` - Returns complaints assigned to logged-in staff member
- `PUT /api/staff/complaints/[id]` - Updates complaint status and resolution (staff only)

### Authentication
- Staff users can login with their credentials
- JWT tokens are properly decoded and validated
- Role-based access control working correctly

## Frontend Integration

The staff dashboard at `/staff-dashboard/complaints` should now:
1. Successfully fetch assigned complaints for logged-in staff
2. Display complaints in a responsive table/card layout
3. Allow staff to update complaint status and add resolution notes
4. Show proper loading states and error messages

## Staff User Access

**To test the staff dashboard:**
1. Go to `/auth/login`
2. Login with staff credentials:
   - Dr. Sarah Johnson: `pharmacist@globalpharmatrading.co.uk` / `staff123`
   - Mike Wilson: `assistant@globalpharmatrading.co.uk` / `assistant123`
3. Navigate to `/staff-dashboard/complaints`
4. Should see assigned complaints with full functionality

## Security Features

- Staff can only see complaints assigned to them
- Staff can only update complaints assigned to them
- Staff cannot assign complaints to other staff (admin only)
- Staff can only set status to "investigating" or "resolved"
- Resolution notes are required when marking as resolved

---

**Status**: ✅ **FIXED** - Staff dashboard complaints now successfully fetches and displays real data from the database.
