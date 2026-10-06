'use client';

import { SessionProvider } from 'next-auth/react';
import { createContext, useContext } from 'react';
import { ProgressSync } from '@/progress/ProgressSync';

const AuthEnabled = createContext(false);
export const useAuthEnabled = () => useContext(AuthEnabled);

export function Providers({ authEnabled, children }: { authEnabled: boolean; children: React.ReactNode }) {
  return (
    <AuthEnabled.Provider value={authEnabled}>
      {authEnabled ? (
        <SessionProvider>
          <ProgressSync />
          {children}
        </SessionProvider>
      ) : (
        children
      )}
    </AuthEnabled.Provider>
  );
}
