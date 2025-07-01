'use client';

import ProfilePage from '@/app/components/ProfilePage';

export default function CustomerProfile() {
  return (
    <ProfilePage 
      title="My Profile" 
      redirectPath="/dashboard" 
    />
  );
}
