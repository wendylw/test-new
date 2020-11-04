import { CrossStorageClient } from 'cross-storage';

const storage = new CrossStorageClient('/cross-storage/hub.html', { timeout: 5000 });

storage
  .onConnect()
  .then(() => {
    console.log('storage connect');
  })
  .catch(e => {
    console.log('storage fail');
  });
