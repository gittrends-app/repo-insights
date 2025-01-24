import { NextConfig } from 'next';

export default {
  pageExtensions: ['tsx', 'ts'],
  experimental: {
    webpackMemoryOptimizations: true
  }
} satisfies NextConfig;
