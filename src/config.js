const getTableId = () => {
  return document.cookie.split(';').find(s => s.includes('table')).split('=')[1];
};

const getStoreId = () => {
  return document.cookie.split(';').find(s => s.includes('storeId')).split('=')[1];
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
