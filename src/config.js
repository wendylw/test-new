const getTableId = () => {
  const tableId = (m => m ? parseInt(m[1]) : null)(window.location.hash.match(/\btable\b=(\d+)/));
  
  if (tableId) {
    localStorage.setItem('tableId', tableId);
    return tableId;
  }

  return localStorage.getItem('tableId');
};

const getStoreId = () => {
  const storeId = (m => m ? m[1] : null)(window.location.hash.match(/\bstoreId\b=([^&=?#]+)/));

  if (storeId) {
    localStorage.setItem('storeId', storeId);
    return storeId;
  }

  return localStorage.getItem('storeId');
};

const config = {
  storehubPaymentEntryURL: process.env.REACT_APP_STOREHUB_PAYMENT_ENTRY,
  storehubPaymentResponseURL: process.env.REACT_APP_STOREHUB_PAYMENT_RESPONSE_URL,
  storehubPaymentBackendResponseURL: process.env.REACT_APP_STOREHUB_PAYMENT_BACKEND_RESPONSE_URL,
  business: (d => d.length > 2 ? d.shift() : null)(window.location.hostname.split('.')),
  table: getTableId(),
  storeId: getStoreId(),
};

Object.defineProperty(config, 'peopleCount', {
  get() {
    return JSON.parse(localStorage.getItem('peopleCount'));
  },
  set(value) {
    localStorage.setItem('peopleCount', JSON.stringify(Number(value)));
  }
})

export default config;
