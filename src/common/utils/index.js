import qs from 'qs';
import _once from 'lodash/once';
import Cookies from 'js-cookie';
import { WEB_VIEW_SOURCE, SHIPPING_TYPES, PATH_NAME_MAPPING } from './constants';
// eslint-disable-next-line import/no-cycle
import config from '../../config';

// todo: make old legacy utils to import function from here, rather than define same functions twice

export const setCookieVariable = (name, value, attributes) => Cookies.set(name, value, attributes);

export const getCookieVariable = name => Cookies.get(name);

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

export const getUserAgentInfo = _once(() => {
  /* eslint-disable */
  /* https://www.regextester.com/97574 */
  const regex = /(MSIE|Trident|(?!Gecko.+)Firefox|(?!AppleWebKit.+Chrome.+)Safari(?!.+Edge)|(?!AppleWebKit.+)Chrome(?!.+Edge)|(?!AppleWebKit.+Chrome.+Safari.+)Edge|AppleWebKit(?!.+Chrome|.+Safari)|Gecko(?!.+Firefox))(?: |\/)([\d\.apre]+)/g;
  /* eslint-enabled */
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
    navigator.userAgent
  );
  const browsers = navigator.userAgent.match(regex);

  return {
    isMobile,
    browser: browsers ? browsers[0] : '',
  };
});

export const isSafari = _once(() => {
  return getUserAgentInfo().browser.includes('Safari');
});

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

export const isTNGMiniProgram = () => window._isTNGMiniProgram_;

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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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

export const removeSessionVariable = name => {
  try {
    sessionStorage.removeItem(name);
  } catch (e) {
    const { removeCookieVariable } = Utils;
    const cookieNameOfSessionStorage = 'sessionStorage_' + name;
    removeCookieVariable(cookieNameOfSessionStorage);
  }
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

// Refer to: https://stackoverflow.com/a/21963136
/* eslint-disable */
export const guid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
/* eslint-enable */

export const getBusinessName = (hostname = window.location.hostname) => {
  const hostNameArray = hostname.split('.');
  return hostNameArray.length > 2 ? hostNameArray.shift() : null;
};
