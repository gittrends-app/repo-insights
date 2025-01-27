'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Cache, CacheService, ReleaseSchema, RepositorySchema, StargazerSchema } from '@/core';
import dayjs from 'dayjs';
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

    if (!value.__cached_at) return null;

    const diff = dayjs().diff(value.__cached_at, 'days', true);
    if (diff > 7) return null;

    if (key.startsWith(CacheService.REPOSITORY_PREFIX)) {
      if (diff > 1) return null;
      value = RepositorySchema.parse(value);
    } else if (key.startsWith(CacheService.RELEASES_PREFIX)) {
      Object.assign(value, { data: value.data.map((record: object) => ReleaseSchema.parse(record)) });
    } else if (key.startsWith(CacheService.STARGAZERS_PREFIX)) {
      Object.assign(value, { data: value.data.map((record: object) => StargazerSchema.parse(record)) });
    }

    return value;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await set(key, compress(Object.assign({ __cached_at: Date.now() }, value)), this.cache);
  }

  async remove(key: string): Promise<void> {
    await del(key, this.cache);
  }

  async clear(): Promise<void> {
    await clear(this.cache);
  }
}
