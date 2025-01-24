import { AuthContext } from '@/providers/AuthProvider';
import { useContext } from 'react';
import { useStore } from 'zustand';

/**
 *  Hook to use the authentication store
 */
export default function useAuth() {
  const store = useContext(AuthContext);
  if (!store) throw new Error('useAuth must be used within a StoreProvider');

  return useStore(store);
}
