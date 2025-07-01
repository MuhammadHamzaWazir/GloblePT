'use client';

import ProfilePage from '@/app/components/ProfilePage';

export default function StaffProfile() {
  return (
    <ProfilePage 
      title="Staff Profile" 
      redirectPath="/staff-dashboard" 
    />
  );
}
