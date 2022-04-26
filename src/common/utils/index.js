import qs from 'qs';
import _once from 'lodash/once';
import Cookies from 'js-cookie';
import { WEB_VIEW_SOURCE, SHIPPING_TYPES } from './constants';

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

export const isSiteApp = (domain = document.location.hostname) => {
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
