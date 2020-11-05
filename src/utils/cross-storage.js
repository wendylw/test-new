import { CrossStorageClient } from 'cross-storage';

const storage = new CrossStorageClient('/cross-storage/hub.html', { timeout: 5000 });

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
  console.error(`cannot establish cross domain storage: ${e}`);
  storage.close();
});
