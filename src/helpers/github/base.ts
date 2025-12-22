import retry from 'fetch-retry';
import pLimit from 'p-limit';
import { Constructor } from 'type-fest';
import { Cache, CacheService, GithubClient, GithubService } from '@/core';

/**
 *
 */
function limiter(func: typeof fetch) {
  const limit = pLimit(2);

  return async (...args: Parameters<typeof fetch>) => {
    return limit(() => func(...args));
  };
}

const fetcher = limiter(
  retry(fetch, {
    retries: 3,
    retryDelay: (attempt) => 2 ** attempt * 1000,
    retryOn: (_attempt, error, response) => {
      return !!(error !== null || response?.status === 403);
    }
  })
);

/**
 *  Create a service
 */
export function createService(namespace?: string, token?: string): GithubService;
export function createService(namespace?: string, token?: string, Cache?: Constructor<Cache>): CacheService;
export function createService(namespace: string = 'public', token?: string, Cache?: Constructor<Cache>) {
  const client = new GithubClient('https://api.github.com', { apiToken: token, fetcher });

  const baseService = new GithubService(client, {
    fields: {
      actors: {
        name: true,
        email: true,
        company: true,
        location: true,
        created_at: true,
        followers_count: true,
        following_count: true,
        social_accounts: true,
        is_hireable: true,
        is_github_star: true,
        is_campus_expert: true
      },
      repositories: false
    }
  });

  return Cache ? new CacheService(baseService, new Cache(namespace.toLowerCase())) : baseService;
}
