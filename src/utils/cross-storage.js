/*
 * IMPORTANT WARNING: cross-storage may NOT work on Safari. It's can be only used to
 * enhance user experience on the browsers that supports it. Do NOT let your critical
 * features rely on it!!
 * Refer to: https://github.com/zendesk/cross-storage#compatibility
 */
import { captureException } from '@sentry/react';
import { CrossStorageClient } from 'cross-storage';

if (!process.env.REACT_APP_CROSS_STORAGE_BASE_URL) {
  throw new Error('cross-storage base url not specified!');
}

const storage = new CrossStorageClient(`${process.env.REACT_APP_CROSS_STORAGE_BASE_URL}/cross-storage/hub.html`, {
  timeout: 5000,
});

export const setItem = async (key, value) => {
  await storage.onConnect();
  return storage.set(key, value);
};
export const getItem = async key => {
  await storage.onConnect();
  return storage.get(key);
};
export const removeItem = async key => {
  await storage.onConnect();
  return storage.del(key);
};
export const getKeys = async () => {
  await storage.onConnect();
  return storage.getKeys();
};
export const clear = async () => {
  await storage.onConnect();
  return storage.clear();
};

storage.onConnect().catch(e => {
  captureException(e);
  storage.close();
});