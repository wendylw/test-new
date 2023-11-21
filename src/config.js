export const getBusinessName = (hostname = window.location.hostname) => {
  const hostNameArray = hostname.split('.');
  return hostNameArray.length > 2 ? hostNameArray.shift() : null;
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

const getIsGuest = () => {
  try {
    const isGuest = document.cookie
      .split(';')
      .find(s => s.includes('__sh_is_guest'))
      .split('=')[1];

    return isGuest === 'true';
  } catch (e) {
    return null;
  }
};

const getUrlType = () => {
  try {
    const urlType = document.cookie
      .split(';')
      .find(s => s.includes('__sh_url_type'))
      .split('=')[1];

    return urlType;
  } catch (e) {
    return null;
  }
};

const getIsUrlExpired = () => {
  try {
    const isUrlExpired = document.cookie
      .split(';')
      .find(s => s.includes('__sh_url_expired'))
      .split('=')[1];

    return isUrlExpired === 'true';
  } catch (e) {
    return null;
  }
};

const config = {
  beepOnlineStoreUrl: business => (process.env.REACT_APP_MERCHANT_STORE_URL || '').replace('%business%', business),
  storehubPaymentResponseURL: process.env.REACT_APP_STOREHUB_PAYMENT_RESPONSE_URL,
  storehubPaymentBackendResponseURL: process.env.REACT_APP_STOREHUB_PAYMENT_BACKEND_RESPONSE_URL,
  storehubPaymentScriptSrc: process.env.REACT_APP_STOREHUB_PAYMENT_SCRIPT_SRC,
  imageS3Domain: process.env.REACT_APP_IMAGE_S3_DOMAIN,
  imageCompressionDomain: process.env.REACT_APP_IMAGE_COMPRESSION_DOMAIN,
  authApiUrl: process.env.REACT_APP_AUTH_API_URL,
  beepitComUrl: `https://${(process.env.REACT_APP_QR_SCAN_DOMAINS || '').split(',')[0]}`,
  qrScanPageUrl: `https://${(process.env.REACT_APP_QR_SCAN_DOMAINS || '').split(',')[0]}/qrscan`,
  removePickupMerchantList: (process.env.REACT_APP_REMOVE_PICKUP_MERCHANT_LIST || '').split(','),
  growthBookAPIHost: process.env.REACT_APP_GROWTHBOOK_API_HOST,
  growthBookClientKey: process.env.REACT_APP_GROWTHBOOK_CLIENT_KEY,
  growthBookEnabled: process.env.REACT_APP_GROWTHBOOK_ENABLED === 'true',
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
  business: getBusinessName(),
  table: getTableId(),
  storeId: getStoreId(),
  consumerId: getConsumerId(),
  isGuest: getIsGuest(),
  urlType: getUrlType(),
  isUrlExpired: getIsUrlExpired(),
  PUBLIC_URL: process.env.PUBLIC_URL || '',
  googleMapsAPIKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  googleRecaptchaSiteKey: process.env.REACT_APP_GOOGLE_RECAPTCHA_SITE_KEY,
  recaptchaEnabled: process.env.REACT_APP_RECAPTCHA_ENABLED === 'true',
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
