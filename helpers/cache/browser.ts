'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Cache, CacheService, ReleaseSchema, RepositorySchema, StargazerSchema } from '@gittrends-app/core';
import { clear, createStore, del, get, set, UseStore } from 'idb-keyval';
import lzString from 'lz-string';

/**
 *  Compress data
 */
function compress<T>(value: T): string {
  return lzString.compressToBase64(JSON.stringify(value));
}

/**
 *  Decompress data
 */
function decompress<T>(value: string): T {
  return JSON.parse(lzString.decompressFromBase64(value));
}

/**
 * Browser cache
 */
export class BrowserCache implements Cache {
  private readonly cache: UseStore;

  constructor(namespace: string = 'public') {
    this.cache = createStore(namespace.toLowerCase(), 'caching');
  }

  async get<T>(key: string): Promise<T | null> {
    let value: any = await get(key, this.cache);

    if (!value) return null;
    else value = Object.assign({ __cached: true }, decompress(value));

    if (key.startsWith(CacheService.REPOSITORY_PREFIX)) {
      value = RepositorySchema.parse(value);
    } else if (key.startsWith(CacheService.RELEASES_PREFIX)) {
      Object.assign(value, { data: value.data.map((record: object) => ReleaseSchema.parse(record)) });
    } else if (key.startsWith(CacheService.STARGAZERS_PREFIX)) {
      Object.assign(value, { data: value.data.map((record: object) => StargazerSchema.parse(record)) });
    }

    return value;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await set(key, compress(value), this.cache);
  }

  async remove(key: string): Promise<void> {
    await del(key, this.cache);
  }

  async clear(): Promise<void> {
    await clear(this.cache);
  }
}
