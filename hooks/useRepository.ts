import { createBrowserService } from '@/helpers/github/browser';
import { useAsync } from 'react-use';
import useAuth from './useAuth';

/**
 *  Hook to fetch a repository
 */
export default function useRepository(owner: string, name: string) {
  const { user } = useAuth();
  return useAsync(async () => createBrowserService(undefined, user?.__acess_token).repository(owner, name), [user]);
}
