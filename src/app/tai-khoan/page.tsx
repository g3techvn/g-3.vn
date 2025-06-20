'use client';

import React from 'react';
import UserProfile from '@/components/features/auth/UserProfile';
import MobileHomeHeader from '@/components/mobile/MobileHomeHeader';

export default function AccountPage() {
  return (
    <>
      <MobileHomeHeader />
      <UserProfile />
    </>
  );
} 