import qs from 'qs';
import _once from 'lodash/once';
import Cookies from 'js-cookie';
import { WEB_VIEW_SOURCE, SHIPPING_TYPES } from './constants';

// todo: make old legacy utils to import function from here, rather than define same functions twice

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

export const isDeliveryType = () => getShippingTypeFromUrl() === SHIPPING_TYPES.DELIVERY;

export const isPickUpType = () => getShippingTypeFromUrl() === SHIPPING_TYPES.PICKUP;

export const isDineInType = () => getShippingTypeFromUrl() === SHIPPING_TYPES.DINE_IN;

export const isDigitalType = () => getShippingTypeFromUrl() === SHIPPING_TYPES.DIGITAL;

export const isTakeAwayType = () => getShippingTypeFromUrl() === SHIPPING_TYPES.TAKE_AWAY;

export const isDeliveryOrder = () => isDeliveryType() || isPickUpType();

export const isQROrder = () => isDineInType() || isTakeAwayType();

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

// eslint-disable-next-line no-underscore-dangle
export const isTNGMiniProgram = () => window._isTNGMiniProgram_;

export const getCookieVariable = name => Cookies.get(name);

// eslint-disable-next-line consistent-return
export const getSessionVariable = name => {
  try {
    return sessionStorage.getItem(name);
  } catch (e) {
    const cookieNameOfSessionStorage = `sessionStorage_${name}`;

    return getCookieVariable(cookieNameOfSessionStorage);
  }
};

export const getExpectedDeliveryDateFromSession = () => {
  const selectedDate = JSON.parse(getSessionVariable('expectedDeliveryDate') || '{}');
  const selectedHour = JSON.parse(getSessionVariable('expectedDeliveryHour') || '{}');

  return {
    date: selectedDate,
    hour: selectedHour,
  };
};

export const getStoreHashCode = () => getCookieVariable('__h');

export const removeHtmlTag = str => {
  if (!str) {
    return '';
  }

  return str.replace(/<[^>]+>/g, '');
};

export const getSourceUrlFromSessionStorage = () => getSessionVariable('BeepOrderingSourceUrl');

export const getApiRequestShippingType = shippingType => {
  const type = shippingType || getQueryString('type');

  switch (type) {
    case SHIPPING_TYPES.DINE_IN:
      return 'dineIn';
    default:
      return type;
  }
};
