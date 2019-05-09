const getTableId = () => {
  try {
    return document.cookie.split(';').find(s => s.includes('__t')).split('=')[1];
  } catch(e) {
    return null;
  }
};

const getStoreId = () => {
  try {
    return document.cookie.split(';').find(s => s.includes('__s')).split('=')[1];
  } catch(e) {
    return null;
  }
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
