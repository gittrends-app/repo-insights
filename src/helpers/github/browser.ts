import { BrowserCache } from '../cache/browser';
import { createService } from './base';

/**
 *  Create a browser service
 */
export function createBrowserService(namespace?: string, token?: string) {
  return createService(namespace, token, BrowserCache);
}
