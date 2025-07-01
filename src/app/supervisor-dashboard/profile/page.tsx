'use client';

import ProfilePage from '@/app/components/ProfilePage';

export default function SupervisorProfile() {
  return (
    <ProfilePage 
      title="Supervisor Profile" 
      redirectPath="/supervisor-dashboard" 
    />
  );
}
