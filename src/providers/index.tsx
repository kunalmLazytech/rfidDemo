import React from 'react';
import { AuthProvider } from '@modules/AuthContext';
import { DeviceInfoProvider } from '@modules/RFIDConnectionContext';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <DeviceInfoProvider>
      <AuthProvider>{children}</AuthProvider>
    </DeviceInfoProvider>
  );
};
