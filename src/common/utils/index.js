import _get from 'lodash/get';
import qs from 'qs';
import dayjs from 'dayjs';
import _once from 'lodash/once';
import Cookies from 'js-cookie';
import { formatTime, setDateTime } from '../../utils/time-lib';
import config from '../../config';
import {
  WEB_VIEW_SOURCE,
  SHIPPING_TYPES,
  PATH_NAME_MAPPING,
  CLIENTS,
  PRODUCT_STOCK_STATUS,
  SH_LOGISTICS_VALID_TIME,
  ADDRESS_RANGE,
  TIME_SLOT,
  ORDER_SOURCE,
  REGISTRATION_TOUCH_POINT,
  REGISTRATION_SOURCE,
  SOURCE_TYPE,
  COUNTRIES_DEFAULT_LOCALE,
  COUNTRIES_DEFAULT_CURRENCIES,
} from './constants';

// Common Utils
export const attemptLoad = (fn, retriesLeft = 5, interval = 1500) =>
  new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch(error => {
        setTimeout(() => {
          // if the target module has some runtime error (for example, try to access window.notExistingObj.notExistingProp),
          // the promise will throw correct error for the first time, but will resolve an empty module next time, which makes
          // the entire module seems to be resolved, however it's actually not working. To avoid this kind of thing, we will
          // only deal with ChunkLoadError, which means the module cannot be loaded (mostly because of network issues).
          if ((error.name !== 'ChunkLoadError' && error.code !== 'CSS_CHUNK_LOAD_FAILED') || retriesLeft <= 1) {
            reject(error);
          } else {
            attemptLoad(fn, retriesLeft - 1, interval).then(resolve, reject);
          }
        }, interval);
      });
  });

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

export const getLocalStorageVariable = name => {
  try {
    return localStorage.getItem(name);
  } catch (e) {
    const cookieNameOfLocalStorage = `localStorage_${name}`;
    return getCookieVariable(cookieNameOfLocalStorage);
  }
};

/* If localStorage is not operational, cookies will be used to store global variables */
export const setLocalStorageVariable = (name, value) => {
  try {
    localStorage.setItem(name, value || '');
  } catch (e) {
    const cookieNameOfLocalStorage = `localStorage_${name}`;
    setCookieVariable(cookieNameOfLocalStorage, value);
  }
};

export const removeLocalStorageVariable = name => {
  try {
    localStorage.removeItem(name);
  } catch (e) {
    const cookieNameOfLocalStorage = `localStorage_${name}`;
    removeCookieVariable(cookieNameOfLocalStorage);
  }
};

export const isURL = url => {
  try {
    return !!new URL(url);
  } catch {
    return false;
  }
};

export const isValidUrl = url => {
  const domainRegex = /(http|https):\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g;
  return domainRegex.test(url);
};

export const checkEmailIsValid = email => {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

export const getFileExtension = file => {
  const fileNames = file.name.split('.');
  const fileNameExtension = fileNames.length > 1 && fileNames[fileNames.length - 1];

  return fileNameExtension || file.type.split('/')[1];
};

export const copyDataToClipboard = async text => {
  try {
    const data = [new window.ClipboardItem({ 'text/plain': text })];

    await navigator.clipboard.write(data);

    return true;
  } catch (e) {
    if (!document.execCommand || !document.execCommand('copy')) {
      return false;
    }

    const copyInput = document.createElement('input');

    copyInput.setAttribute('readonly', 'readonly');
    copyInput.setAttribute('style', 'position: absolute; top: -9999px; left: -9999px;');
    copyInput.setAttribute('value', text);
    document.body.appendChild(copyInput);
    copyInput.setSelectionRange(0, copyInput.value.length);
    copyInput.select();
    document.execCommand('copy');
    document.body.removeChild(copyInput);

    return true;
  }
};

export const getQueryString = key => {
  const queries = qs.parse(window.location.search, { ignoreQueryPrefix: true });

  if (key) {
    return queries[key] || null;
  }

  return queries;
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

export const getQueryObject = (history, paramName) => {
  if (!history.location.search) {
    return null;
  }

  const params = new URLSearchParams(history.location.search);

  return params.get(paramName);
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

export const isJSON = value => {
  try {
    JSON.parse(value);

    return true;
  } catch (error) {
    return false;
  }
};

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

// Business Utils
export const getBeepAppVersion = () => window.beepAppVersion;

export const notHomeOrLocationPath = pathname =>
  !(
    ['/ordering/', '/ordering'].includes(pathname) ||
    ['/ordering/location-date', '/ordering/location-date/'].includes(pathname)
  );

export const getBeepSubdomain = () => {
  const DOMAIN_REGEX_LIST = [/beepit.com/i, /beepit.co/i, /beep.*.shub.us/i];
  const hostName = window.location.hostname;
  const includedDomainIndex = DOMAIN_REGEX_LIST.findIndex(regex => regex.test(hostName));

  if (includedDomainIndex === -1) {
    return '';
  }

  return hostName.match(DOMAIN_REGEX_LIST[includedDomainIndex])[0];
};

export const isSiteApp = (domain = window.location.hostname) => {
  const domainList = (process.env.REACT_APP_QR_SCAN_DOMAINS || '')
    .split(',')
    .map(d => d.trim())
    .filter(d => d);

  return domainList.some(d => domain.toLowerCase() === d.toLowerCase());
};

export const getIsInRewards = (pathname = window.location.pathname) =>
  pathname.startsWith(PATH_NAME_MAPPING.REWARDS_BASE);

export const getStoreId = () => getCookieVariable('__s');

export const getStoreHashCode = () => getCookieVariable('__h');

export const getApiRequestShippingType = shippingType => {
  const type = shippingType || getQueryString('type');

  switch (type) {
    case SHIPPING_TYPES.DINE_IN:
      return 'dineIn';
    default:
      return type;
  }
};

export const saveSourceUrlToSessionStorage = sourceUrl => setSessionVariable('BeepOrderingSourceUrl', sourceUrl);

export const getSourceUrlFromSessionStorage = () => getSessionVariable('BeepOrderingSourceUrl');

export const isSharedLink = () => getSessionVariable('BeepOrderingSource') === SOURCE_TYPE.SHARED_LINK;

export const getShippingTypeFromUrl = () => {
  const { type = '' } = qs.parse(window.location.search, { ignoreQueryPrefix: true });

  return type;
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

// TODO: move to app selector file
export const getExpectedDeliveryDateFromSession = () => {
  const selectedDate = JSON.parse(getSessionVariable('expectedDeliveryDate') || '{}');
  const selectedHour = JSON.parse(getSessionVariable('expectedDeliveryHour') || '{}');

  return {
    date: selectedDate,
    hour: selectedHour,
  };
};

// TODO: move to app selector file
export const removeExpectedDeliveryTime = () => {
  removeSessionVariable('expectedDeliveryDate');
  removeSessionVariable('expectedDeliveryHour');
};

// TODO: move to app selector file
export const setExpectedDeliveryTime = ({ date, hour }) => {
  setSessionVariable('expectedDeliveryDate', JSON.stringify(date));
  setSessionVariable('expectedDeliveryHour', JSON.stringify(hour));
};

/**
 *
 * @param {*} business
 * @param {*} queryObject: Object
 * @returns
 */
export const getMerchantStoreUrl = (business, queryObject) => {
  const domain = config.beepOnlineStoreUrl(business);
  const pathname = PATH_NAME_MAPPING.ORDERING_BASE;

  if (!queryObject || Object.keys(queryObject).length === 0) {
    return `${domain}${pathname}`;
  }

  const queryList = Object.keys(queryObject).map(queryItemKey => `${queryItemKey}=${queryObject[queryItemKey]}`);

  return `${domain}${pathname}/?${queryList.join('&')}`;
};

export const getFulfillDate = (businessUTCOffset = 480) => {
  try {
    const { date, hour } = getExpectedDeliveryDateFromSession();
    const expectedDate = _get(date, 'date', null);
    const expectedFromTime = _get(hour, 'from', null);

    if (!expectedDate || !expectedFromTime) {
      return null;
    }

    if (expectedFromTime === TIME_SLOT.NOW) {
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

export const getOpeningHours = ({ breakTimeFrom, breakTimeTo, validTimeFrom = '00:00', validTimeTo = '24:00' }) => {
  const formatBreakTimes =
    breakTimeFrom && breakTimeTo ? [formatTime(breakTimeFrom), formatTime(breakTimeTo)] : undefined;
  const formatValidTimes = [formatTime(validTimeFrom), formatTime(validTimeTo)];

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

export const getCountry = (phone, language, countries, defaultCountry) => {
  if (phone) {
    return '';
  }

  if (!language) {
    return defaultCountry;
  }

  const languageSplit = language.split('-').map(l => l.toUpperCase());
  const upperCasesCountries = countries.map(c => c.toUpperCase());

  if (!languageSplit[0] && !languageSplit[1]) {
    return defaultCountry;
  }

  if (languageSplit[1] && upperCasesCountries.includes(languageSplit[1])) {
    return languageSplit[1];
  }

  if (languageSplit[0] && upperCasesCountries.includes(languageSplit[0])) {
    return languageSplit[0];
  }

  return undefined;
};

export const getPhoneNumberWithCode = (phone, countryCode) => {
  if (!countryCode || phone.startsWith(`+${countryCode}`)) {
    return phone;
  }

  if (phone.startsWith(countryCode)) {
    return `+${phone}`;
  }

  return phone;
};

export const getFullAddress = (addressInfo, splitLength) => {
  const addressList = [];
  const addressKeys = ['street1', 'street2', 'postalCode', 'city', 'state', 'country'];

  addressKeys.forEach((item, index) => {
    if (addressInfo[item] && Boolean(addressInfo[item]) && index < splitLength) {
      addressList.push(addressInfo[item]);
    }
  });

  return addressList.join(', ');
};

export const getDeliveryInfo = businessInfo => {
  const { stores, qrOrderingSettings } = businessInfo || {};
  const {
    defaultShippingZone,
    minimumConsumption,
    validDays,
    validTimeFrom,
    validTimeTo,
    enableLiveOnline,
    enableDeliveryLiveOnline,
    enablePreOrder,
    sellAlcohol,
    disableTodayPreOrder,
    disableOnDemandOrder,
    breakTimeFrom,
    breakTimeTo,
    vacations,
    useStorehubLogistics,
  } = qrOrderingSettings || {};

  let logisticsValidTimeFrom = validTimeFrom;
  let logisticsValidTimeTo = validTimeTo;

  // use storeHub Logistics valid time
  if (useStorehubLogistics) {
    logisticsValidTimeFrom =
      SH_LOGISTICS_VALID_TIME.FROM > validTimeFrom ? SH_LOGISTICS_VALID_TIME.FROM : validTimeFrom;
    logisticsValidTimeTo = SH_LOGISTICS_VALID_TIME.TO < validTimeTo ? SH_LOGISTICS_VALID_TIME.TO : validTimeTo;
  }

  const { defaultShippingZoneMethod } = defaultShippingZone || {};
  const { rate, freeShippingMinAmount, enableConditionalFreeShipping } = defaultShippingZoneMethod || {};
  const deliveryFee = rate || 0;
  const minOrder = minimumConsumption || 0;

  const { phone } = (stores && stores[0]) || {};
  const storeAddress = getFullAddress((stores && stores[0]) || {}, ADDRESS_RANGE.COUNTRY);

  return {
    deliveryFee,
    useStorehubLogistics,
    minOrder,
    storeAddress,
    telephone: phone,
    validDays,
    validTimeFrom,
    validTimeTo,
    freeShippingMinAmount,
    enableConditionalFreeShipping,
    enableLiveOnline,
    enableDeliveryLiveOnline,
    enablePreOrder,
    sellAlcohol,
    disableTodayPreOrder,
    disableOnDemandOrder,
    breakTimeFrom,
    breakTimeTo,
    vacations,
    logisticsValidTimeFrom,
    logisticsValidTimeTo,
  };
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

export const getRegistrationSource = () => {
  const registrationTouchPoint = getRegistrationTouchPoint();

  switch (registrationTouchPoint) {
    case REGISTRATION_TOUCH_POINT.CLAIM_CASHBACK:
      return isWebview() ? REGISTRATION_SOURCE.BEEP_APP : REGISTRATION_SOURCE.RECEIPT;

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

export const extractDataAttributes = (props = {}) => {
  const dataAttributes = {};
  Object.keys(props).forEach(key => {
    if (key.startsWith('data-')) {
      dataAttributes[key] = props[key];
    }
  });
  return dataAttributes;
};

// UI Utils
export const windowSize = () => ({
  width: document.body.clientWidth || window.innerWidth,
  height: document.body.clientHeight || window.innerHeight,
});

export const mainTop = ({ headerEls = [] }) => {
  let top = 0;

  if (headerEls.length) {
    headerEls.forEach(headerEl => {
      top += headerEl ? headerEl.clientHeight || headerEl.offsetHeight : 0;
    });
  }

  return top;
};

export const marginBottom = ({ footerEls = [] }) => {
  let bottom = 0;

  if (footerEls.length) {
    footerEls.forEach(footerEl => {
      bottom += footerEl ? footerEl.clientHeight || footerEl.offsetHeight : 0;
    });
  }

  return bottom;
};

export const containerHeight = ({ headerEls, footerEls }) =>
  `${windowSize().height -
    mainTop({
      headerEls,
    }) -
    marginBottom({
      footerEls,
    })}px`;

export const getIsThePageHidden = () =>
  window.document.hidden || window.document.mozHidden || window.document.msHidden || window.document.webkitHidden;

// The BE might return number in scientific notation format, like "1.2e3.4", convert to integers.
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

export const toCapitalize = (string = '') => {
  if (!string) {
    return '';
  }

  if (typeof string !== 'string') {
    return string;
  }

  const lowerCaseString = string.toLowerCase();

  return lowerCaseString.charAt(0).toUpperCase() + lowerCaseString.slice(1);
};
