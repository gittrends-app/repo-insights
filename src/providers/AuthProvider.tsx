'use client';

import { Actor } from '@/core';
import { createService } from '@/helpers/github/browser';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createContext, useEffect, useMemo, useRef } from 'react';
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

  const code = useMemo(() => searchParams.get('code'), [searchParams]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storeRef = useRef<any | null>(null);

  if (!storeRef.current) {
    storeRef.current = createStore(
      persist<UserProfile>(
        (set) => ({
          user: null,
          signIn: async (accessToken: string) => {
            const user = await createService('profile', accessToken, false).viewer();
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
    if (code) {
      const controller = new AbortController();
      fetch('/api/auth/github/access_token?code=' + code, { signal: controller.signal })
        .then((response) => response.json())
        .then((response) => {
          if (!controller.signal.aborted && response.access_token) store.signIn(response.access_token);
        })
        .finally(() => router.push(pathname));

      return () => controller.abort();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return <AuthContext.Provider value={storeRef.current}>{children}</AuthContext.Provider>;
};
