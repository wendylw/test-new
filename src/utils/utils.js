import _get from 'lodash/get';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Constants, { REGISTRATION_SOURCE, REGISTRATION_TOUCH_POINT, ORDER_SOURCE } from './constants';
import * as timeLib from './time-lib';
import * as UtilsV2 from '../common/utils';
import { SOURCE_TYPE } from '../common/utils/constants';

dayjs.extend(utc);

const { SH_LOGISTICS_VALID_TIME, ROUTER_PATHS } = Constants;
const Utils = {};

Utils.getQueryString = UtilsV2.getQueryString;

/**
 *
 * @param {string or string array} keys,
 * @returns {string}
 */
Utils.getFilteredQueryString = UtilsV2.getFilteredQueryString;

Utils.getApiRequestShippingType = UtilsV2.getApiRequestShippingType;

Utils.isWebview = UtilsV2.isWebview;

// still need to distinguish ios webview and android webview
Utils.isIOSWebview = UtilsV2.isIOSWebview;

Utils.isAndroidWebview = UtilsV2.isAndroidWebview;

// TODO: never be used to remove
Utils.debounce = function debounce(fn, timeout = 50) {
  let timer = null;
  return function newFn(...args) {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => fn.apply(fn, args), timeout);
  };
};

Utils.elementPartialOffsetTop = function elementPartialOffsetTop(el, topAdjustment = 0, windowScrolledTop = 0) {
  const isSafari = Utils.getUserAgentInfo().browser.includes('Safari');
  const height = isSafari ? el.getBoundingClientRect().height : el.offsetHeight;
  let top = windowScrolledTop + el.getBoundingClientRect().top;

  if (!isSafari) {
    let currentParent = el.offsetParent;

    top = el.offsetTop;

    while (currentParent !== null) {
      top += currentParent.offsetTop;
      currentParent = currentParent.offsetParent;
    }
  }

  return top + height - windowScrolledTop - topAdjustment;
};

// eslint-disable-next-line consistent-return
Utils.getLocalStorageVariable = function getLocalStorageVariable(name) {
  try {
    return localStorage.getItem(name);
  } catch (e) {
    const { getCookieVariable } = Utils;
    const cookieNameOfLocalStorage = `localStorage_${name}`;
    getCookieVariable(cookieNameOfLocalStorage);
  }
};

/* If localStorage is not operational, cookies will be used to store global variables */
Utils.setLocalStorageVariable = function setLocalStorageVariable(name, value) {
  try {
    localStorage.setItem(name, value || '');
  } catch (e) {
    const { setCookieVariable } = Utils;
    const cookieNameOfLocalStorage = `localStorage_${name}`;
    setCookieVariable(cookieNameOfLocalStorage, value);
  }
};

Utils.removeLocalStorageVariable = function removeLocalStorageVariable(name) {
  try {
    localStorage.removeItem(name);
  } catch (e) {
    const { removeCookieVariable } = Utils;
    const cookieNameOfLocalStorage = `localStorage_${name}`;
    removeCookieVariable(cookieNameOfLocalStorage);
  }
};

Utils.getSessionVariable = UtilsV2.getSessionVariable;

/* If sessionStorage is not operational, cookies will be used to store global variables */
Utils.setSessionVariable = UtilsV2.setSessionVariable;

Utils.removeSessionVariable = UtilsV2.removeSessionVariable;

Utils.getFormatPhoneNumber = function getFormatPhoneNumber(phone, countryCode) {
  if (!countryCode) {
    return phone;
  }

  const startIndex = countryCode.length + ((phone || '')[0] === '+' ? 1 : 0);
  const currentPhone = (phone || '').substring(startIndex);

  if (countryCode && !currentPhone.indexOf(countryCode)) {
    return `+${countryCode}${currentPhone.substring(countryCode.length)}`;
  }

  return phone;
};

Utils.getCountry = UtilsV2.getCountry;

Utils.DateFormatter = function DateFormatter(dateString, deletedDelimiter) {
  if (!dateString) {
    return '';
  }

  const datePattern = ['m', 'y'];
  const blocks = [2, 2];
  let date = dateString.replace(/[^\d]/g, '');
  const dateArray = [];

  if (!date.length) {
    return '';
  }

  // Split the card number is groups of Block
  blocks.forEach(block => {
    if (date.substring(0, block) && date.substring(0, block).length) {
      dateArray.push(date.substring(0, block));
      date = date.substring(block);
    }
  });

  datePattern.forEach((pattern, index) => {
    if (pattern === 'm') {
      if (dateArray[index] === '00') {
        dateArray[index] = '01';
      } else if (parseInt(dateArray[index].slice(0, 1), 10) > 1) {
        dateArray[index] = `0${dateArray[index].slice(0, 1)}`;
      } else if (parseInt(dateArray[index], 10) > 12) {
        dateArray[index] = '12';
      }
    } else if (pattern === 'y') {
      if (parseInt(dateArray[index], 10) < 0) {
        dateArray[index] = '00';
      } else if (parseInt(dateArray[index], 10) > 99) {
        dateArray[index] = '99';
      }
    }

    if (index !== datePattern.length - 1) {
      dateArray[index] =
        dateArray[index].length === blocks[index] && !deletedDelimiter ? `${dateArray[index]} / ` : dateArray[index][0];
    }
  });

  return dateArray.join('');
};

Utils.getValidAddress = function getValidAddress(addressInfo, splitLength) {
  const addressList = [];
  const addressKeys = ['street1', 'street2', 'postalCode', 'city', 'state', 'country'];

  addressKeys.forEach((item, index) => {
    if (addressInfo[item] && Boolean(addressInfo[item]) && index < splitLength) {
      addressList.push(addressInfo[item]);
    }
  });

  return addressList.join(', ');
};

Utils.getQueryObject = function getQueryObject(history, paramName) {
  if (!history.location.search) {
    return null;
  }

  const params = new URLSearchParams(history.location.search);

  return params.get(paramName);
};

Utils.getUserAgentInfo = UtilsV2.getUserAgentInfo;

Utils.isSafari = UtilsV2.isSafari;

export const isValidUrl = url => {
  const domainRegex = /(http|https):\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g;
  return domainRegex.test(url);
};

Utils.removeHtmlTag = UtilsV2.removeHtmlTag;

Utils.getOrderTypeFromUrl = UtilsV2.getShippingTypeFromUrl;

Utils.isDeliveryType = () => Utils.getOrderTypeFromUrl() === Constants.DELIVERY_METHOD.DELIVERY;

Utils.isPickUpType = () => Utils.getOrderTypeFromUrl() === Constants.DELIVERY_METHOD.PICKUP;

Utils.isDineInType = () => Utils.getOrderTypeFromUrl() === Constants.DELIVERY_METHOD.DINE_IN;

Utils.isDigitalType = () => Utils.getOrderTypeFromUrl() === Constants.DELIVERY_METHOD.DIGITAL;

Utils.isTakeAwayType = () => Utils.getOrderTypeFromUrl() === Constants.DELIVERY_METHOD.TAKE_AWAY;

Utils.isDeliveryOrder = () => Utils.isDeliveryType() || Utils.isPickUpType();

Utils.isQROrder = () => Utils.isDineInType() || Utils.isTakeAwayType();

Utils.getLogisticsValidTime = ({ validTimeFrom, validTimeTo, useStorehubLogistics }) => {
  let logisticsValidTimeFrom = validTimeFrom;
  let logisticsValidTimeTo = validTimeTo;

  // use storeHub Logistics valid time
  if (useStorehubLogistics) {
    logisticsValidTimeFrom =
      SH_LOGISTICS_VALID_TIME.FROM > validTimeFrom ? SH_LOGISTICS_VALID_TIME.FROM : validTimeFrom;
    logisticsValidTimeTo = SH_LOGISTICS_VALID_TIME.TO < validTimeTo ? SH_LOGISTICS_VALID_TIME.TO : validTimeTo;
  }

  return {
    logisticsValidTimeFrom,
    logisticsValidTimeTo,
  };
};

Utils.getDeliveryInfo = businessInfo => {
  const { stores, qrOrderingSettings } = businessInfo || {};
  const {
    defaultShippingZone,
    minimumConsumption,
    validDays,
    validTimeFrom,
    validTimeTo,
    enableLiveOnline,
    enablePreOrder,
    sellAlcohol,
    disableTodayPreOrder,
    disableOnDemandOrder,
    breakTimeFrom,
    breakTimeTo,
    vacations,
    useStorehubLogistics,
  } = qrOrderingSettings || {};

  const { logisticsValidTimeFrom, logisticsValidTimeTo } = Utils.getLogisticsValidTime({
    validTimeFrom,
    validTimeTo,
    useStorehubLogistics,
  });

  const { defaultShippingZoneMethod } = defaultShippingZone || {};
  const { rate, freeShippingMinAmount, enableConditionalFreeShipping } = defaultShippingZoneMethod || {};
  const deliveryFee = rate || 0;
  const minOrder = minimumConsumption || 0;

  const { phone } = (stores && stores[0]) || {};
  const storeAddress = Utils.getValidAddress((stores && stores[0]) || {}, Constants.ADDRESS_RANGE.COUNTRY);

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

Utils.formatTimeWithColon = time => {
  const minute = (time && time.split(':')[1]) || '00';
  const hour = time && time.split(':')[0];

  return `${hour}:${minute}`;
};

Utils.getHourAndMinuteFromString = timeString => ({
  hour: timeString.split(':')[0],
  minute: timeString.split(':')[1],
});

Utils.formatHour = (hour = 0) => {
  if (hour >= 12) {
    return `${hour}:00 PM`;
  }

  return `${hour}:00 AM`;
};

Utils.isPreOrderPage = () => {
  const enablePreOrder = Utils.getQueryString('isPreOrder');
  return enablePreOrder === 'true' || false;
};

// eslint-disable-next-line consistent-return
Utils.isPreOrder = () => {
  const isPreOrderPage = Utils.isPreOrderPage();
  if (isPreOrderPage) {
    const { date = {} } = Utils.getExpectedDeliveryDateFromSession();

    return !(date.date && date.date.isToday);
  }
};

Utils.getExpectedDeliveryDateFromSession = UtilsV2.getExpectedDeliveryDateFromSession;

Utils.setExpectedDeliveryTime = UtilsV2.setExpectedDeliveryTime;

Utils.removeExpectedDeliveryTime = UtilsV2.removeExpectedDeliveryTime;

Utils.isSiteApp = UtilsV2.isSiteApp;

// unicode string to base64
Utils.utoa = str => window.btoa(unescape(encodeURIComponent(str)));

// base64 to unicode string
Utils.atou = str => decodeURIComponent(escape(window.atob(str)));

Utils.getMerchantStoreUrl = UtilsV2.getMerchantStoreUrl;

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.warn('development mode. window.Utils is ready.');
  window.Utils = Utils;
}

Utils.notHomeOrLocationPath = pathname =>
  !(
    ['/ordering/', '/ordering'].includes(pathname) ||
    ['/ordering/location-date', '/ordering/location-date/'].includes(pathname)
  );

Utils.checkEmailIsValid = email => {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

Utils.getFileExtension = file => {
  const fileNames = file.name.split('.');
  const fileNameExtension = fileNames.length > 1 && fileNames[fileNames.length - 1];

  return fileNameExtension || file.type.split('/')[1];
};

Utils.getContainerElementHeight = (headerEls, footerEl) => {
  const windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
  let headerFooterHeight = 0;

  if (headerEls && headerEls.length) {
    headerEls.forEach(el => {
      headerFooterHeight += el.clientHeight || el.offsetHeight;
    });
  }

  if (footerEl) {
    headerFooterHeight += footerEl.clientHeight || footerEl.offsetHeight;
  }

  return windowHeight - headerFooterHeight;
};

Utils.getFulfillDate = (businessUTCOffset = 480) => {
  try {
    const { date, hour } = Utils.getExpectedDeliveryDateFromSession();
    const expectedDate = _get(date, 'date', null);
    const expectedFromTime = _get(hour, 'from', null);

    if (!expectedDate || !expectedFromTime) {
      return null;
    }

    if (expectedFromTime === Constants.TIME_SLOT_NOW) {
      return null;
    }

    const expectedDayjs = dayjs(new Date(expectedDate)).utcOffset(businessUTCOffset);
    const fulfillDayjs = timeLib.setDateTime(expectedFromTime, expectedDayjs);

    return fulfillDayjs.toISOString();
  } catch (error) {
    console.error('Common Utils getFulfillDate:', error?.message || '');
    return null;
  }
};

// This function only retry when the error is ChunkLoadError, do NOT use it as a common promise retry util!
Utils.attemptLoad = (fn, retriesLeft = 5, interval = 1500) =>
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
            Utils.attemptLoad(fn, retriesLeft - 1, interval).then(resolve, reject);
          }
        }, interval);
      });
  });

Utils.judgeClient = UtilsV2.judgeClient;

Utils.windowSize = () => ({
  width: document.body.clientWidth || window.innerWidth,
  height: document.body.clientHeight || window.innerHeight,
});

Utils.mainTop = ({ headerEls = [] }) => {
  let top = 0;

  if (headerEls.length) {
    headerEls.forEach(headerEl => {
      top += headerEl ? headerEl.clientHeight || headerEl.offsetHeight : 0;
    });
  }

  return top;
};

Utils.marginBottom = ({ footerEls = [] }) => {
  let bottom = 0;

  if (footerEls.length) {
    footerEls.forEach(footerEl => {
      bottom += footerEl ? footerEl.clientHeight || footerEl.offsetHeight : 0;
    });
  }

  return bottom;
};

Utils.containerHeight = ({ headerEls, footerEls }) =>
  `${Utils.windowSize().height -
    Utils.mainTop({
      headerEls,
    }) -
    Utils.marginBottom({
      footerEls,
    })}px`;

Utils.formatHour = (hourString = '') => {
  const [hour, minute] = hourString ? hourString.split(':') : [];
  const hourRemainder = Number(hour) % 12;
  const localeMeridiem = Number(hour) > 11 && Number(hour) < 24 ? 'pm' : 'am';

  if (Number.isNaN(hourRemainder)) {
    return '';
  }

  return `${hourRemainder || 12}${Number(minute) ? `:${minute}` : ''}${localeMeridiem}`;
};

Utils.getOpeningHours = UtilsV2.getOpeningHours;

Utils.getOrderSource = () => {
  if (Utils.isTNGMiniProgram()) {
    return ORDER_SOURCE.TNG_MINI_PROGRAM;
  }

  if (Utils.isWebview()) {
    return ORDER_SOURCE.BEEP_APP;
  }

  if (Utils.isFromBeepSite()) {
    return ORDER_SOURCE.BEEP_SITE;
  }

  return ORDER_SOURCE.BEEP_STORE;
};

Utils.getOrderSourceForCleverTab = () => {
  const orderSource = Utils.getOrderSource();

  const mapping = {
    [ORDER_SOURCE.TNG_MINI_PROGRAM]: 'TNG Mini Program',
    [ORDER_SOURCE.BEEP_APP]: 'App',
    [ORDER_SOURCE.BEEP_SITE]: 'beepit.com',
    [ORDER_SOURCE.BEEP_STORE]: 'Store URL',
  };

  return mapping[orderSource];
};

Utils.getClient = UtilsV2.getClient;

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

Utils.isFromBeepSite = UtilsV2.isFromBeepSite;

Utils.getRegistrationTouchPoint = () => {
  const isOnCashbackPage = window.location.pathname.startsWith(ROUTER_PATHS.CASHBACK_BASE);
  const isOnOrderHistory = window.location.pathname.startsWith(ROUTER_PATHS.ORDER_HISTORY);

  if (isOnCashbackPage) {
    return REGISTRATION_TOUCH_POINT.CLAIM_CASHBACK;
  }

  if (Utils.isQROrder()) {
    return REGISTRATION_TOUCH_POINT.QR_ORDER;
  }

  if (Utils.isTNGMiniProgram() && isOnOrderHistory) {
    return REGISTRATION_TOUCH_POINT.TNG;
  }

  return REGISTRATION_TOUCH_POINT.ONLINE_ORDER;
};

Utils.getRegistrationSource = () => {
  const registrationTouchPoint = Utils.getRegistrationTouchPoint();

  switch (registrationTouchPoint) {
    case REGISTRATION_TOUCH_POINT.CLAIM_CASHBACK:
      return Utils.isWebview() ? REGISTRATION_SOURCE.BEEP_APP : REGISTRATION_SOURCE.RECEIPT;

    case REGISTRATION_TOUCH_POINT.QR_ORDER:
      if (Utils.isSharedLink()) {
        return REGISTRATION_SOURCE.SHARED_LINK;
      }
    // eslint-disable-next-line no-fallthrough
    case REGISTRATION_TOUCH_POINT.ONLINE_ORDER:
      if (Utils.isSharedLink()) {
        return REGISTRATION_SOURCE.SHARED_LINK;
      }
    // eslint-disable-next-line no-fallthrough
    default:
      if (Utils.isTNGMiniProgram()) {
        return REGISTRATION_SOURCE.TNGD_MINI_PROGRAM;
      }

      if (Utils.isWebview()) {
        return REGISTRATION_SOURCE.BEEP_APP;
      }

      if (Utils.isFromBeepSite()) {
        return REGISTRATION_SOURCE.BEEP_SITE;
      }

      return REGISTRATION_SOURCE.BEEP_STORE;
  }
};

Utils.getMainDomain = () => {
  const hostName = window.location.hostname;
  const arr = hostName.split('.');
  arr.shift();
  const result = arr.join('.');
  return result;
};

Utils.getCookieVariable = UtilsV2.getCookieVariable;

Utils.setCookieVariable = UtilsV2.setCookieVariable;

// IMPORTANT! When deleting a cookie and you're not relying on the default attributes, you must pass the exact same path and domain attributes that were used to set the cookie
Utils.removeCookieVariable = UtilsV2.removeCookieVariable;

Utils.isTNGMiniProgram = UtilsV2.isTNGMiniProgram;

Utils.isSharedLink = () => Utils.getSessionVariable('BeepOrderingSource') === SOURCE_TYPE.SHARED_LINK;

Utils.saveSourceUrlToSessionStorage = UtilsV2.saveSourceUrlToSessionStorage;

Utils.getSourceUrlFromSessionStorage = UtilsV2.getSourceUrlFromSessionStorage;

Utils.submitForm = UtilsV2.submitForm;

Utils.getStoreHashCode = UtilsV2.getStoreHashCode;

export default Utils;
