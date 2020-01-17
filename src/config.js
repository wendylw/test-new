const getTableId = () => {
  try {
    return document.cookie
      .split(';')
      .find(s => s.includes('__t'))
      .split('=')[1];
  } catch (e) {
    return null;
  }
};

const getStoreId = () => {
  try {
    return document.cookie
      .split(';')
      .find(s => s.includes('__s'))
      .split('=')[1];
  } catch (e) {
    return null;
  }
};

const getConsumerId = () => {
  try {
    return document.cookie
      .split(';')
      .find(s => s.includes('__cid'))
      .split('=')[1];
  } catch (e) {
    return null;
  }
};

const business = (d => (d.length > 2 ? d.shift() : null))(window.location.hostname.split('.'));

const config = {
  termsPrivacyURLS: {
    terms: process.env.REACT_APP_TERMS_URL,
    privacy: process.env.REACT_APP_PRIVACY_URL,
  },
  storeHubPaymentEntryURL: process.env.REACT_APP_STOREHUB_PAYMENT_ENTRY,
  storehubPaymentResponseURL: process.env.REACT_APP_STOREHUB_PAYMENT_RESPONSE_URL,
  storehubPaymentBackendResponseURL: process.env.REACT_APP_STOREHUB_PAYMENT_BACKEND_RESPONSE_URL,
  storehubPaymentScriptSrc: process.env.REACT_APP_STOREHUB_PAYMENT_SCRIPT_SRC,
  imageS3Domain: process.env.REACT_APP_IMAGE_S3_DOMAIN,
  imageCompressionDomain: process.env.REACT_APP_IMAGE_COMPRESSION_DOMAIN,
  authApiUrl: process.env.REACT_APP_AUTH_API_URL,
  verticalMenuBusinesses: (process.env.REACT_APP_VERTICAL_MENU_BUSINESSES || '').split(','),
  h() {
    try {
      return document.cookie
        .split(';')
        .find(s => s.includes('__h'))
        .split('=')[1];
    } catch (e) {
      return null;
    }
  },
  business,
  table: getTableId(),
  storeId: getStoreId(),
  consumerId: getConsumerId(),
};

Object.defineProperty(config, 'peopleCount', {
  get() {
    return JSON.parse(localStorage.getItem('peopleCount'));
  },
  set(value) {
    localStorage.setItem('peopleCount', JSON.stringify(Number(value)));
  },
});

export default config;
