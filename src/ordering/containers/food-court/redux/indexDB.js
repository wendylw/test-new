const BeepWebDB = (dbName = 'beep', version = 1, storeName) => {
  this.dbName = dbName;
  this.version = version;
  this.storeName = storeName;
  this.getDB = async () => {
    const request = window.indexedDB.open(this.dbName, this.version);

    request.onupgradeneeded = event => {
      const db = event.target.result;
      let objectStore;

      if (!db.objectStoreNames.contains(this.storeName)) {
        // { keyPath: 'id' } 主键（key）是默认建立索引的属性
        // { autoIncrement: true } 如果数据记录里面没有合适作为主键的属性，那么可以让 IndexedDB 自动生成主键
        objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
      }

      objectStore.createIndex('image', 'image', { unique: false });
      objectStore.createIndex('title', 'title', { unique: false });
      objectStore.createIndex('tags', 'tags', { unique: false });
      objectStore.createIndex('redirectUrl', 'redirectUrl', { unique: true });
    };
  };
};

const db = new BeepWebDB({ storeName: 'foodCourtList' });

// const initialBeepIndexDB = () => window.indexedDB.open('beep', 1);

// const create = (db, data) => {
//   const request = db
//     .transaction(['foodCourtList'], 'readwrite')
//     .objectStore('foodCourtList')
//     .add(data);

//   request.onerror = () => {
//     console.error('data write failed for beep');
//   };
// };

// const read = (db, key) => {
//   const transaction = db.transaction(['foodCourtList']);
//   const objectStore = transaction.objectStore('foodCourtList');
//   const request = objectStore.get(key);

//   request.onerror = () => {
//     console.error('data read failed for beep');
//   };

//   request.onsuccess = () => {
//     if (request.result) {
//       console.log(request.result);
//     } else {
//       console.log('no this data');
//     }
//   };
// };

// function update(db, data) {
//   const request = db
//     .transaction(['foodCourtList'], 'readwrite')
//     .objectStore('foodCourtList')
//     .put(data);

//   request.onerror = () => {
//     console.log('data update failed for beep');
//   };
// }

// const beepIndexDB = (data, options) => {
//   const request = initialBeepIndexDB();
//   let db;

//   request.onerror = () => {
//     console.error('open db failed');
//   };

//   request.onsuccess = () => {
//     db = request.result;
//   };

//   request.onupgradeneeded = event => {
//     db = event.target.result;
//     let objectStore;

//     if (!db.objectStoreNames.contains('foodCourtList')) {
//       // { keyPath: 'id' } 主键（key）是默认建立索引的属性
//       // { autoIncrement: true } 如果数据记录里面没有合适作为主键的属性，那么可以让 IndexedDB 自动生成主键
//       objectStore = db.createObjectStore('foodCourtList', options.createObjectStore);
//     }

//     objectStore.createIndex('image', 'image', { unique: false });
//     objectStore.createIndex('title', 'title', { unique: false });
//     objectStore.createIndex('tags', 'tags', { unique: false });
//     objectStore.createIndex('redirectUrl', 'redirectUrl', { unique: true });
//   };
// };
