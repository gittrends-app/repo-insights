'use client';

import { createBrowserService } from '@/helpers/github/browser';
import { Actor } from '@gittrends-app/core';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createContext, useEffect, useRef } from 'react';
import { createStore, StoreApi, useStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type UserProfile = {
  user: (Actor & { __acess_token: string }) | null;
  signIn: (accessToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<StoreApi<UserProfile> | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storeRef = useRef<any | null>(null);

  if (!storeRef.current) {
    storeRef.current = createStore(
      persist<UserProfile>(
        (set) => ({
          user: null,
          signIn: async (accessToken: string) => {
            const me = await fetch('https://api.github.com/user', {
              headers: { Authorization: `bearer ${accessToken}` }
            }).then(async (response) => {
              if (!response.ok) throw new Error('Failed to get user');
              return response.json();
            });

            const user = await createBrowserService('profile', accessToken).user(me.login, { byLogin: true });
            set({ user: { ...user!, __acess_token: accessToken } });
          },
          signOut: async () => set({ user: null })
        }),
        { name: 'profile-storage', storage: createJSONStorage(() => localStorage) }
      )
    );
  }

  const store = useStore(storeRef.current as StoreApi<UserProfile>);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      fetch('/api/auth/github/access_token?code=' + code)
        .then((response) => response.json())
        .then((response) => {
          if (response.access_token) store.signIn(response.access_token);
        })
        .finally(() => router.push(pathname));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, store]);

  return <AuthContext.Provider value={storeRef.current}>{children}</AuthContext.Provider>;
};
