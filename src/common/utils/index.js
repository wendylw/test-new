import _get from 'lodash/get';
import qs from 'qs';
import _once from 'lodash/once';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import config from '../../config';
import { setDateTime } from '../../utils/time-lib';
import {
  WEB_VIEW_SOURCE,
  SHIPPING_TYPES,
  PATH_NAME_MAPPING,
  CLIENTS,
  PRODUCT_STOCK_STATUS,
  TIME_SLOT_NOW,
  REGISTRATION_TOUCH_POINT,
  SOURCE_TYPE,
  ORDER_SOURCE,
  REGISTRATION_SOURCE,
  COUNTRIES_DEFAULT_LOCALE,
  COUNTRIES_DEFAULT_CURRENCIES,
} from './constants';

// todo: make old legacy utils to import function from here, rather than define same functions twice

export const setCookieVariable = (name, value, attributes) => Cookies.set(name, value, attributes);

export const getCookieVariable = name => Cookies.get(name);

// IMPORTANT! When deleting a cookie and you're not relying on the default attributes, you must pass the exact same path and domain attributes that were used to set the cookie
export const removeCookieVariable = (name, attributes) => Cookies.remove(name, attributes);

/* If sessionStorage is not operational, cookies will be used to store global variables */
export const setSessionVariable = (name, value) => {
  try {
    sessionStorage.setItem(name, value || '');
  } catch (e) {
    const cookieNameOfSessionStorage = `sessionStorage_${name}`;

    setCookieVariable(cookieNameOfSessionStorage, value);
  }
};

export const getSessionVariable = name => {
  try {
    return sessionStorage.getItem(name);
  } catch (e) {
    const cookieNameOfSessionStorage = `sessionStorage_${name}`;

    return getCookieVariable(cookieNameOfSessionStorage);
  }
};

export const removeSessionVariable = name => {
  try {
    sessionStorage.removeItem(name);
  } catch (e) {
    const cookieNameOfSessionStorage = `sessionStorage_${name}`;
    removeCookieVariable(cookieNameOfSessionStorage);
  }
};

export const getUserAgentInfo = _once(() => {
  /* https://www.regextester.com/97574 */
  const regex = /(MSIE|Trident|(?!Gecko.+)Firefox|(?!AppleWebKit.+Chrome.+)Safari(?!.+Edge)|(?!AppleWebKit.+)Chrome(?!.+Edge)|(?!AppleWebKit.+Chrome.+Safari.+)Edge|AppleWebKit(?!.+Chrome|.+Safari)|Gecko(?!.+Firefox))(?: |\/)([\d.apre]+)/g;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
    navigator.userAgent
  );
  const browsers = navigator.userAgent.match(regex);

  return {
    isMobile,
    browser: browsers ? browsers[0] : '',
  };
});

export const isSafari = _once(() => getUserAgentInfo().browser.includes('Safari'));

export const isMobile = () => getUserAgentInfo().isMobile;

// still need to distinguish ios webview and android webview
export const isIOSWebview = () => window.webViewSource === WEB_VIEW_SOURCE.IOS;

export const isAndroidWebview = () => window.webViewSource === WEB_VIEW_SOURCE.Android;

export const isWebview = () => isAndroidWebview() || isIOSWebview();

export const isSiteApp = (domain = window.location.hostname) => {
  const domainList = (process.env.REACT_APP_QR_SCAN_DOMAINS || '')
    .split(',')
    .map(d => d.trim())
    .filter(d => d);
  return domainList.some(d => domain.toLowerCase() === d.toLowerCase());
};

// eslint-disable-next-line no-underscore-dangle
export const isTNGMiniProgram = () => window._isTNGMiniProgram_;

// eslint-disable-next-line no-underscore-dangle
export const isGCashMiniProgram = () => window._isGCashMiniProgram_;

export const getClient = () => {
  if (isTNGMiniProgram()) {
    return CLIENTS.TNG_MINI_PROGRAM;
  }

  if (isGCashMiniProgram()) {
    return CLIENTS.GCASH_MINI_PROGRAM;
  }

  if (isAndroidWebview()) {
    return CLIENTS.ANDROID;
  }

  if (isIOSWebview()) {
    return CLIENTS.IOS;
  }

  return CLIENTS.WEB;
};

export const judgeClient = () => {
  let client = '';
  if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
    // 判断iPhone|iPad|iPod|iOS
    client = 'iOS';
  } else if (/(Android)/i.test(navigator.userAgent)) {
    // 判断Android
    client = 'Android';
  } else if (/(Mac)/i.test(navigator.userAgent)) {
    client = 'Mac';
  } else {
    client = 'PC';
  }
  return client;
};

export const getIsDesktopClients = client => [CLIENTS.PC, CLIENTS.MAC].includes(client);

export const isProductSoldOut = product => {
  const { stockStatus, variations } = product;

  if (stockStatus === PRODUCT_STOCK_STATUS.OUT_OF_STOCK) {
    return true;
  }

  if (Array.isArray(variations) && variations.length > 0) {
    let soldOut = false;

    const firstVariation = variations[0];

    if (firstVariation && firstVariation.variationType === 'SingleChoice') {
      const soldOutOptions = firstVariation.optionValues.filter(optionValue => optionValue.markedSoldOut);

      if (soldOutOptions.length === firstVariation.optionValues.length) {
        soldOut = true;
      }
    }

    return soldOut;
  }

  return false;
};

export const getExpectedDeliveryDateFromSession = () => {
  const selectedDate = JSON.parse(getSessionVariable('expectedDeliveryDate') || '{}');
  const selectedHour = JSON.parse(getSessionVariable('expectedDeliveryHour') || '{}');

  return {
    date: selectedDate,
    hour: selectedHour,
  };
};

export const removeExpectedDeliveryTime = () => {
  removeSessionVariable('expectedDeliveryDate');
  removeSessionVariable('expectedDeliveryHour');
};

export const setExpectedDeliveryTime = ({ date, hour }) => {
  setSessionVariable('expectedDeliveryDate', JSON.stringify(date));
  setSessionVariable('expectedDeliveryHour', JSON.stringify(hour));
};

export const getStoreId = () => getCookieVariable('__s');

export const getStoreHashCode = () => getCookieVariable('__h');

export const saveSourceUrlToSessionStorage = sourceUrl => {
  setSessionVariable('BeepOrderingSourceUrl', sourceUrl);
};

export const getSourceUrlFromSessionStorage = () => getSessionVariable('BeepOrderingSourceUrl');

export const getQueryString = key => {
  const queries = qs.parse(window.location.search, { ignoreQueryPrefix: true });

  if (key) {
    return queries[key] || null;
  }

  return queries;
};

export const getShippingTypeFromUrl = () => {
  const { type = '' } = qs.parse(window.location.search, { ignoreQueryPrefix: true });
  return type;
};

export const isURL = url => {
  try {
    return !!new URL(url);
  } catch {
    return false;
  }
};

export const isFromBeepSite = () => {
  try {
    const beepOrderingSourceUrl = getSourceUrlFromSessionStorage();
    if (!beepOrderingSourceUrl) {
      return false;
    }
    const urlObj = new URL(beepOrderingSourceUrl);
    const { hostname } = urlObj;

    return isSiteApp(hostname);
  } catch (error) {
    console.error('Common Utils isFromBeepSite:', error?.message || '');

    return false;
  }
};

export const isFromBeepSiteOrderHistory = () => {
  try {
    const beepOrderingSourceUrl = getSourceUrlFromSessionStorage();
    if (!beepOrderingSourceUrl) {
      return false;
    }
    const urlObj = new URL(beepOrderingSourceUrl);
    const { pathname } = urlObj;

    return pathname === PATH_NAME_MAPPING.ORDER_HISTORY;
  } catch (error) {
    console.error('Common Utils isFromBeepSiteOrderHistory:', error?.message || '');

    return false;
  }
};

export const isFromFoodCourt = () => {
  try {
    const beepOrderingSourceUrl = getSourceUrlFromSessionStorage();
    if (!beepOrderingSourceUrl) {
      return false;
    }
    const urlObj = new URL(beepOrderingSourceUrl);
    const { pathname } = urlObj;
    const { ORDERING_BASE, FOOD_COURT } = PATH_NAME_MAPPING;

    return pathname === `${ORDERING_BASE}${FOOD_COURT}`;
  } catch (error) {
    console.error('Common Utils isFromFoodCourt:', error?.message || '');

    return false;
  }
};

export const isDeliveryType = () => getShippingTypeFromUrl() === SHIPPING_TYPES.DELIVERY;

export const isPickUpType = () => getShippingTypeFromUrl() === SHIPPING_TYPES.PICKUP;

export const isDineInType = () => getShippingTypeFromUrl() === SHIPPING_TYPES.DINE_IN;

export const isDigitalType = () => getShippingTypeFromUrl() === SHIPPING_TYPES.DIGITAL;

export const isTakeAwayType = () => getShippingTypeFromUrl() === SHIPPING_TYPES.TAKE_AWAY;

export const isDeliveryOrder = () => isDeliveryType() || isPickUpType();

export const isQROrder = () => isDineInType() || isTakeAwayType();

export const removeHtmlTag = str => {
  if (!str) {
    return '';
  }

  return str.replace(/<[^>]+>/g, '');
};

export const getApiRequestShippingType = shippingType => {
  const type = shippingType || getQueryString('type');

  switch (type) {
    case SHIPPING_TYPES.DINE_IN:
      return 'dineIn';
    default:
      return type;
  }
};

export const getMerchantStoreUrl = ({ business, hash, source = '', type = '' }) => {
  let storeUrl = `${config.beepOnlineStoreUrl(business)}/ordering/?h=${hash}`;
  if (type) storeUrl += `&type=${type}`;
  if (source) storeUrl += `&source=${encodeURIComponent(source)}`;
  return storeUrl;
};

export const submitForm = (action, data = {}) => {
  const form = document.createElement('form');
  form.action = action;
  form.method = 'POST';
  form.style.height = 0;
  form.style.width = 0;
  form.style.overflow = 'hidden';
  form.style.visibility = 'hidden';

  Object.keys(data).forEach(key => {
    const input = document.createElement('input');
    input.name = key;
    input.value = data[key];
    input.type = 'hidden';
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();

  document.body.removeChild(form);
};

export const getFilteredQueryString = (keys, queryString = window.location.search) => {
  const query = qs.parse(queryString, { ignoreQueryPrefix: true });

  // Only deal with string or array.
  if (typeof keys === 'string') {
    delete query[keys];
  }
  if (Array.isArray(keys)) {
    keys.forEach(key => delete query[key]);
  }

  return qs.stringify(query, { addQueryPrefix: true });
};

export const getFulfillDate = (businessUTCOffset = 480) => {
  try {
    const { date, hour } = getExpectedDeliveryDateFromSession();
    const expectedDate = _get(date, 'date', null);
    const expectedFromTime = _get(hour, 'from', null);

    if (!expectedDate || !expectedFromTime) {
      return null;
    }

    if (expectedFromTime === TIME_SLOT_NOW) {
      return null;
    }

    const expectedDayjs = dayjs(new Date(expectedDate)).utcOffset(businessUTCOffset);
    const fulfillDayjs = setDateTime(expectedFromTime, expectedDayjs);

    return fulfillDayjs.toISOString();
  } catch (error) {
    console.error('Common Utils getFulfillDate:', error?.message || '');
    return null;
  }
};

export const getOpeningHours = ({
  breakTimeFrom,
  breakTimeTo,
  validTimeFrom = '00:00',
  validTimeTo = '24:00',
  formatBreakTimes,
  formatValidTimes = ['12am', '12am'],
}) => {
  if (validTimeFrom >= breakTimeFrom && validTimeTo <= breakTimeTo) {
    return [];
  }

  if (
    !breakTimeFrom ||
    !breakTimeTo ||
    validTimeFrom >= breakTimeTo ||
    (validTimeTo <= breakTimeTo && breakTimeFrom === breakTimeTo)
  ) {
    return [`${formatValidTimes[0]} - ${formatValidTimes[1]}`];
  }

  if (validTimeFrom < breakTimeFrom && validTimeTo > breakTimeTo && breakTimeFrom !== breakTimeTo) {
    return [`${formatValidTimes[0]} - ${formatBreakTimes[0]}`, `${formatBreakTimes[1]} - ${formatValidTimes[1]}`];
  }

  if (validTimeFrom >= breakTimeFrom && validTimeFrom <= breakTimeTo && breakTimeTo < validTimeTo) {
    return [`${formatBreakTimes[1]} - ${formatValidTimes[1]}`];
  }

  if (validTimeTo <= breakTimeTo && validTimeTo >= breakTimeFrom && breakTimeFrom > validTimeFrom) {
    return [`${formatValidTimes[0]} - ${formatBreakTimes[0]}`];
  }

  return [`${formatValidTimes[0]} - ${formatValidTimes[1]}`];
};

export const getBeepAppVersion = () => window.beepAppVersion;

export const getUUID = () => {
  try {
    return crypto.randomUUID();
  } catch {
    // Our application is not mission-critical, so Broofa's answer is good enough for us as a backup plan since it is pretty slick and effective.
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      /* eslint-disable no-bitwise */
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      /* eslint-enable */
      return v.toString(16);
    });
  }
};

export const getCountry = (phone, language, countries, defaultCountry) => {
  if (phone) {
    return '';
  }

  if (!language || (!language.split('-')[1] && !language.split('-')[0])) {
    return defaultCountry;
  }

  if (countries.includes(language.split('-')[1])) {
    return language.split('-')[1];
  }

  if (countries.includes(language.split('-')[0])) {
    return language.split('-')[0];
  }

  return undefined;
};

export const getRegistrationTouchPoint = () => {
  const isOnCashbackPage = window.location.pathname.startsWith(PATH_NAME_MAPPING.CASHBACK_BASE);
  const isOnOrderHistory = window.location.pathname.startsWith(PATH_NAME_MAPPING.ORDER_HISTORY);

  if (isOnCashbackPage) {
    return REGISTRATION_TOUCH_POINT.CLAIM_CASHBACK;
  }

  if (isQROrder()) {
    return REGISTRATION_TOUCH_POINT.QR_ORDER;
  }

  if (isTNGMiniProgram() && isOnOrderHistory) {
    return REGISTRATION_TOUCH_POINT.TNG;
  }

  if (isGCashMiniProgram() && isOnOrderHistory) {
    return REGISTRATION_TOUCH_POINT.GCash;
  }

  return REGISTRATION_TOUCH_POINT.ONLINE_ORDER;
};

export const isSharedLink = () => getSessionVariable('BeepOrderingSource') === SOURCE_TYPE.SHARED_LINK;

export const getRegistrationSource = () => {
  const registrationTouchPoint = getRegistrationTouchPoint();

  switch (registrationTouchPoint) {
    case REGISTRATION_TOUCH_POINT.CLAIM_CASHBACK:
      if (isWebview()) {
        return REGISTRATION_SOURCE.BEEP_APP;
      }

      return REGISTRATION_SOURCE.RECEIPT;
    case REGISTRATION_TOUCH_POINT.QR_ORDER:
      if (isSharedLink()) {
        return REGISTRATION_SOURCE.SHARED_LINK;
      }
    // eslint-disable-next-line no-fallthrough
    case REGISTRATION_TOUCH_POINT.ONLINE_ORDER:
      if (isSharedLink()) {
        return REGISTRATION_SOURCE.SHARED_LINK;
      }
    // eslint-disable-next-line no-fallthrough
    default:
      if (isTNGMiniProgram()) {
        return REGISTRATION_SOURCE.TNGD_MINI_PROGRAM;
      }

      if (isGCashMiniProgram()) {
        return REGISTRATION_SOURCE.GCASH_MINI_PROGRAM;
      }

      if (isWebview()) {
        return REGISTRATION_SOURCE.BEEP_APP;
      }

      if (isFromBeepSite()) {
        return REGISTRATION_SOURCE.BEEP_SITE;
      }

      return REGISTRATION_SOURCE.BEEP_STORE;
  }
};

export const getOrderSource = () => {
  if (isTNGMiniProgram()) {
    return ORDER_SOURCE.TNG_MINI_PROGRAM;
  }

  if (isGCashMiniProgram()) {
    return ORDER_SOURCE.GCASH_MINI_PROGRAM;
  }

  if (isWebview()) {
    return ORDER_SOURCE.BEEP_APP;
  }

  if (isFromBeepSite()) {
    return ORDER_SOURCE.BEEP_SITE;
  }

  return ORDER_SOURCE.BEEP_STORE;
};

export const getOrderSourceForCleverTap = () => {
  const orderSource = getOrderSource();

  const mapping = {
    [ORDER_SOURCE.TNG_MINI_PROGRAM]: 'TNG Mini Program',
    [ORDER_SOURCE.GCASH_MINI_PROGRAM]: 'GCash Mini Program',
    [ORDER_SOURCE.BEEP_APP]: 'App',
    [ORDER_SOURCE.BEEP_SITE]: 'beepit.com',
    [ORDER_SOURCE.BEEP_STORE]: 'Store URL',
  };

  return mapping[orderSource];
};

export const extractDataAttributes = (props = {}) => {
  const dataAttributes = {};
  Object.keys(props).forEach(key => {
    if (key.startsWith('data-')) {
      dataAttributes[key] = props[key];
    }
  });
  return dataAttributes;
};

export const isJSON = value => {
  try {
    JSON.parse(value);

    return true;
  } catch (error) {
    return false;
  }
};

export const getIsThePageHidden = () =>
  window.document.hidden || window.document.mozHidden || window.document.msHidden || window.document.webkitHidden;

export const getDecimalNumber = (number = 0) => {
  const scientificNotationRegex = /^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/;
  const isScientificNotation = scientificNotationRegex.test(number);

  if (!isScientificNotation) {
    return number;
  }

  return Math.round(number * 100) / 100;
};

export const getPrice = (number = 0, { locale, currency, country, withCurrency = true }) => {
  let price = '';
  const countryLocale = locale || COUNTRIES_DEFAULT_LOCALE[country];
  const countryCurrency = currency || COUNTRIES_DEFAULT_CURRENCIES[country];
  const numberToFixed = value => parseFloat(value).toFixed(2);

  try {
    if (!countryLocale || !countryCurrency) {
      return numberToFixed(number);
    }

    if (!withCurrency && !isSafari()) {
      price = Intl.NumberFormat(countryLocale, {
        style: 'decimal',
        currency: countryCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(parseFloat(number));
    } else {
      price = Intl.NumberFormat(countryLocale, { style: 'currency', currency: countryCurrency }).format(
        parseFloat(number)
      );
    }

    return (!price ? numberToFixed(number) : price).replace(/^(\D+)/, '$1 ');
  } catch (error) {
    return numberToFixed(number);
  }
};

export const getHostNameSubDomain = () => {
  const { hostname } = window.location;

  if (!hostname) {
    return null;
  }

  const hostnameSubDomain = hostname.split('.')[0];

  return hostnameSubDomain;
};

export const getEncodeURIComponent = value => {
  try {
    const decodedValue = decodeURIComponent(value);

    if (decodedValue !== value) {
      return value;
    }

    return encodeURIComponent(value);
  } catch (error) {
    return value;
  }
};
