import Utils from './utils/utils';

let business = (d => (d.length > 2 ? d.shift() : null))(window.location.hostname.split('.'));

/* eslint-disable */
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
/* eslint-enable */

const getClientSID = () => {
  try {
    return (
      Utils.getSessionVariable('client.sid') ||
      (function generateSID() {
        const clientSID = guid();
        Utils.setSessionVariable('client.sid', clientSID);
        console.info('client.sid generated! [%s]', clientSID);
        return clientSID;
      })()
    );
  } catch (e) {
    return null;
  }
};

const getTableId = () => {
  try {
    return decodeURIComponent(
      document.cookie
        .split(';')
        .find(s => s.includes('__t='))
        .split('=')[1]
    );
  } catch (e) {
    return null;
  }
};

const getStoreId = () => {
  try {
    return document.cookie
      .split(';')
      .find(s => s.includes('__s='))
      .split('=')[1];
  } catch (e) {
    return null;
  }
};

const getConsumerId = () => {
  try {
    return document.cookie
      .split(';')
      .find(s => s.includes('__cid='))
      .split('=')[1];
  } catch (e) {
    return null;
  }
};

const config = {
  termsPrivacyURLS: {
    terms: process.env.REACT_APP_TERMS_URL,
    privacy: process.env.REACT_APP_PRIVACY_URL,
  },
  beepOnlineStoreUrl: business => (process.env.REACT_APP_MERCHANT_STORE_URL || '').replace('%business%', business),
  storeHubPaymentEntryURL: process.env.REACT_APP_STOREHUB_PAYMENT_ENTRY,
  storehubPaymentResponseURL: process.env.REACT_APP_STOREHUB_PAYMENT_RESPONSE_URL,
  storehubPaymentBackendResponseURL: process.env.REACT_APP_STOREHUB_PAYMENT_BACKEND_RESPONSE_URL,
  storehubPaymentScriptSrc: process.env.REACT_APP_STOREHUB_PAYMENT_SCRIPT_SRC,
  imageS3Domain: process.env.REACT_APP_IMAGE_S3_DOMAIN,
  imageCompressionDomain: process.env.REACT_APP_IMAGE_COMPRESSION_DOMAIN,
  authApiUrl: process.env.REACT_APP_AUTH_API_URL,
  verticalMenuBusinesses: (process.env.REACT_APP_VERTICAL_MENU_BUSINESSES || '').split(','),
  beepitComUrl: `https://${(process.env.REACT_APP_QR_SCAN_DOMAINS || '').split(',')[0]}`,
  qrScanPageUrl: `https://${(process.env.REACT_APP_QR_SCAN_DOMAINS || '').split(',')[0]}/qrscan`,
  removePickupMerchantList: (process.env.REACT_APP_REMOVE_PICKUP_MERCHANT_LIST || '').split(','),
  h() {
    try {
      return document.cookie
        .split(';')
        .find(s => s.includes('__h='))
        .split('=')[1];
    } catch (e) {
      return null;
    }
  },
  business,
  table: getTableId(),
  storeId: getStoreId(),
  clientSID: getClientSID(),
  consumerId: getConsumerId(),
  PUBLIC_URL: process.env.PUBLIC_URL || '',
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
