'use client';

import ProfilePage from '@/app/components/ProfilePage';

export default function AdminProfile() {
  return (
    <ProfilePage 
      title="Admin Profile" 
      redirectPath="/admin/dashboard" 
    />
  );
}
