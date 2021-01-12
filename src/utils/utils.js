import qs from 'qs';
import Constants from './constants';
import config from '../config';
import { captureException } from '@sentry/react';

const { SH_LOGISTICS_VALID_TIME } = Constants;
const Utils = {};
Utils.getQueryString = key => {
  const queries = qs.parse(window.location.search, { ignoreQueryPrefix: true });

  if (key) {
    return queries[key] || null;
  }

  return queries;
};

Utils.getApiRequestShippingType = () => {
  const type = Utils.getQueryVariable('type');
  return type ? Utils.mapString2camelCase(type) : undefined;
};

Utils.isWebview = function isWebview() {
  return Boolean(Utils.isIOSWebview() || Utils.isAndroidWebview());
};

Utils.isIOSWebview = function isIOSWebview() {
  return Boolean(
    window.webkit && window.webkit.messageHandlers.shareAction && window.webkit.messageHandlers.shareAction.postMessage
  );
};

Utils.isAndroidWebview = function isAndroidWebview() {
  return Boolean(window.androidInterface);
};

Utils.getQueryVariable = variable => {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (pair[0] === variable) {
      return pair[1];
    }
  }
  return false;
};

// Utils.isWebview = function isWebview() {
//   return Boolean(window.ReactNativeWebView && window.ReactNativeWebView.postMessage);
// };

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
  let height = isSafari ? el.getBoundingClientRect().height : el.offsetHeight;
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

Utils.getCookieVariable = function getCookieVariable(name, scope) {
  let keyEQ = scope + name + '=';
  let ca = document.cookie.split(';');

  for (let i = 0, len = ca.length; i < len; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(keyEQ) === 0 && c.substring(keyEQ.length, c.length) !== '')
      return c.substring(keyEQ.length, c.length);
  }

  return null;
};

Utils.setCookieVariable = function setCookieVariable(name, value, scope = '') {
  document.cookie = scope + name + '=' + value + '; path=/';
};

Utils.removeCookieVariable = function removeCookieVariable(name, scope) {
  document.cookie = scope + name + '=; path=/';
};

Utils.getLocalStorageVariable = function getLocalStorageVariable(name) {
  try {
    return localStorage.getItem(name);
  } catch (e) {
    Utils.getCookieVariable(name, 'localStorage_');
  }
};

/* If localStorage is not operational, cookies will be used to store global variables */
Utils.setLocalStorageVariable = function setLocalStorageVariable(name, value) {
  try {
    localStorage.setItem(name, value || '');
  } catch (e) {
    Utils.setCookieVariable(name, value, 'localStorage_');
  }
};

Utils.removeLocalStorageVariable = function removeLocalStorageVariable(name) {
  try {
    localStorage.removeItem(name);
  } catch (e) {
    Utils.removeCookieVariable(name, 'localStorage_');
  }
};

Utils.getSessionVariable = function getSessionVariable(name) {
  try {
    return sessionStorage.getItem(name);
  } catch (e) {
    Utils.getCookieVariable(name, 'sessionStorage_');
  }
};

/* If sessionStorage is not operational, cookies will be used to store global variables */
Utils.setSessionVariable = function setSessionVariable(name, value) {
  try {
    sessionStorage.setItem(name, value || '');
  } catch (e) {
    Utils.setCookieVariable(name, value, 'sessionStorage_');
  }
};

Utils.removeSessionVariable = function removeSessionVariable(name) {
  try {
    sessionStorage.removeItem(name);
  } catch (e) {
    Utils.removeCookieVariable(name, 'sessionStorage_');
  }
};

Utils.isProductSoldOut = product => {
  const { markedSoldOut, variations } = product;

  if (markedSoldOut) {
    return true;
  }

  if (Array.isArray(variations) && variations.length > 0) {
    let soldOut = false;

    const firstVariation = variations[0];

    if (firstVariation && firstVariation.variationType === 'SingleChoice') {
      const soldOutOptions = firstVariation.optionValues.filter(optionValue => {
        return optionValue.markedSoldOut;
      });

      if (soldOutOptions.length === firstVariation.optionValues.length) {
        soldOut = true;
      }
    }

    return soldOut;
  }

  return false;
};

Utils.getFormatPhoneNumber = function getFormatPhoneNumber(phone, countryCode) {
  if (!countryCode) {
    return phone;
  }

  const startIndex = countryCode.length + ((phone || '')[0] === '+' ? 1 : 0);
  const currentPhone = (phone || '').substring(startIndex);

  if (countryCode && !currentPhone.indexOf(countryCode)) {
    phone = '+' + countryCode + currentPhone.substring(countryCode.length);
  }

  return phone;
};

Utils.getCountry = function getCountry(phone, language, countries, defaultCountry) {
  if (phone) {
    return '';
  }

  if (!language || (!language.split('-')[1] && !language.split('-')[0])) {
    return defaultCountry;
  }

  if (countries.includes(language.split('-')[1])) {
    return language.split('-')[1];
  } else if (countries.includes(language.split('-')[0])) {
    return language.split('-')[0];
  }
};

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
        dateArray[index] = '0' + dateArray[index].slice(0, 1);
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

Utils.initSmoothAnimation = function initSmoothAnimation() {
  const vendors = ['webkit', 'moz'];
  let lastTime = 0;

  for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame =
      window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame']; // name has changed in Webkit
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
      var id = window.setTimeout(function() {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
};

Utils.getUserAgentInfo = function getUserAgentInfo() {
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
};

Utils.isSafari = function isSafari() {
  return Utils.getUserAgentInfo().browser.includes('Safari');
};

Utils.isValidUrl = function(url) {
  const domainRegex = /(http|https):\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g;
  return domainRegex.test(url);
};

Utils.removeHtmlTag = function removeHtmlTag(str) {
  if (!str) {
    return '';
  }

  return str.replace(/<[^>]+>/g, '');
};

Utils.getOrderTypeFromUrl = () => {
  const { type = '' } = qs.parse(window.location.search, { ignoreQueryPrefix: true });
  return type;
};

Utils.isDeliveryType = () => {
  return Utils.getOrderTypeFromUrl() === Constants.DELIVERY_METHOD.DELIVERY;
};

Utils.isPickUpType = () => {
  return Utils.getOrderTypeFromUrl() === Constants.DELIVERY_METHOD.PICKUP;
};

Utils.isDineInType = () => {
  return Utils.getOrderTypeFromUrl() === Constants.DELIVERY_METHOD.DINE_IN;
};

Utils.isDigitalType = () => {
  return Utils.getOrderTypeFromUrl() === Constants.DELIVERY_METHOD.DIGITAL;
};

Utils.isTakeAwayType = () => {
  return Utils.getOrderTypeFromUrl() === Constants.DELIVERY_METHOD.TAKE_AWAY;
};

Utils.getLogisticsValidTime = ({ validTimeFrom, validTimeTo, useStorehubLogistics }) => {
  let logisticsValidTimeFrom = validTimeFrom;
  let logisticsValidTimeTo = validTimeTo;

  // use storeHub Logistics valid time
  if (useStorehubLogistics) {
    logisticsValidTimeFrom =
      SH_LOGISTICS_VALID_TIME.FROM > validTimeFrom ? SH_LOGISTICS_VALID_TIME.FROM : validTimeFrom;
    //Hotfix_beep-Update-some-settins-for-merchants:
    // logisticsValidTimeTo = SH_LOGISTICS_VALID_TIME.TO < validTimeTo ? SH_LOGISTICS_VALID_TIME.TO : validTimeTo;
  }

  // Hotfix_beep-Update-some-settins-for-merchants: The logisticsValidTimeTo will move in merchant of useStorehubLogistics, this validTimeTo is just temp variable
  logisticsValidTimeTo = SH_LOGISTICS_VALID_TIME.TO < validTimeTo ? SH_LOGISTICS_VALID_TIME.TO : validTimeTo;

  return {
    logisticsValidTimeFrom,
    logisticsValidTimeTo,
  };
};

// TODO: we can directly pass in businessInfo, instead of allBusinessInfo and business id.
Utils.getDeliveryInfo = ({ business, allBusinessInfo }) => {
  const originalInfo = allBusinessInfo[business] || {};
  const { stores } = originalInfo || {};
  const { qrOrderingSettings } = originalInfo || {};
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
  const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');

  return {
    deliveryFee,
    useStorehubLogistics,
    minOrder,
    storeAddress,
    deliveryToAddress,
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

Utils.getHourAndMinuteFromString = timeString => {
  return {
    hour: timeString.split(':')[0],
    minute: timeString.split(':')[1],
  };
};

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

Utils.getDateNumber = date => {
  date = new Date(date);
  let y = date.getFullYear(),
    m = date.getMonth() + 1,
    d = date.getDate();
  m = m < 10 ? '0' + m : m;
  d = d < 10 ? '0' + d : d;

  return +`${y}${m}${d}`;
};

Utils.isPreOrder = () => {
  const isPreOrderPage = Utils.isPreOrderPage();
  if (isPreOrderPage) {
    const { date = {} } = Utils.getExpectedDeliveryDateFromSession();

    return !(date.date && date.date.isToday);
  }
};

Utils.getExpectedDeliveryDateFromSession = () => {
  const selectedDate = JSON.parse(Utils.getSessionVariable('expectedDeliveryDate') || '{}');
  const selectedHour = JSON.parse(Utils.getSessionVariable('expectedDeliveryHour') || '{}');

  return {
    date: selectedDate,
    hour: selectedHour,
  };
};

Utils.setExpectedDeliveryTime = ({ date, hour }) => {
  Utils.setSessionVariable('expectedDeliveryDate', JSON.stringify(date));
  Utils.setSessionVariable('expectedDeliveryHour', JSON.stringify(hour));
};

Utils.removeExpectedDeliveryTime = () => {
  Utils.removeSessionVariable('expectedDeliveryDate');
  Utils.removeSessionVariable('expectedDeliveryHour');
};

Utils.getDeliveryCoords = () => {
  try {
    const deliveryAddress = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');
    return deliveryAddress.coords;
  } catch (e) {
    console.error('Cannot get delivery coordinate', e);
    captureException(e);
    return undefined;
  }
};

Utils.isSiteApp = (domain = document.location.hostname) => {
  const domainList = (process.env.REACT_APP_QR_SCAN_DOMAINS || '')
    .split(',')
    .map(d => d.trim())
    .filter(d => d);
  return domainList.some(d => domain.toLowerCase() === d.toLowerCase());
};

// unicode string to base64
Utils.utoa = str => {
  return window.btoa(unescape(encodeURIComponent(str)));
};

// base64 to unicode string
Utils.atou = str => {
  return decodeURIComponent(escape(window.atob(str)));
};

Utils.getMerchantStoreUrl = ({ business, hash, source = '', type = '' }) => {
  let storeUrl = `${config.beepOnlineStoreUrl(business)}/ordering/?h=${hash}`;
  if (type) storeUrl += `&type=${type}`;
  if (source) storeUrl += `&source=${encodeURIComponent(source)}`;
  return storeUrl;
};

if (process.env.NODE_ENV !== 'production') {
  console.warn('development mode. window.Utils is ready.');
  window.Utils = Utils;
}

Utils.addParamToSearch = (key, value) => {
  const searchStr = window.location.search;
  var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  var separator = searchStr.indexOf('?') !== -1 ? '&' : '?';
  if (searchStr.match(re)) {
    return searchStr.replace(re, '$1' + key + '=' + value + '$2');
  } else {
    return searchStr + separator + key + '=' + value;
  }
};

Utils.mapString2camelCase = string => {
  const stringList = string.split('-');
  if (stringList.length > 1) {
    for (let i = 1; i < stringList.length; i++) {
      const itemList = stringList[i].split('');
      itemList[0] = itemList[0].toUpperCase();
      stringList[i] = itemList.join('');
    }
  }
  return stringList.join('');
};

Utils.removeParam = (key, sourceURL) => {
  let rtn = sourceURL.split('?')[0];
  let param;
  let params_arr = [];
  const queryString = sourceURL.indexOf('?') !== -1 ? sourceURL.split('?')[1] : '';

  if (queryString !== '') {
    params_arr = queryString.split('&');
    for (var i = params_arr.length - 1; i >= 0; i -= 1) {
      param = params_arr[i].split('=')[0];
      if (param === key) {
        params_arr.splice(i, 1);
      }
    }
    rtn = rtn + '?' + params_arr.join('&');
  }
  return rtn;
};

Utils.notHomeOrLocationPath = pathname => {
  return !(
    ['/ordering/', '/ordering'].includes(pathname) ||
    ['/ordering/location-date', '/ordering/location-date/'].includes(pathname)
  );
};

Utils.checkEmailIsValid = email => {
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

Utils.getTimeUnit = time => {
  try {
    const hour = new Date(time);
    return hour < 12 ? 'AM' : 'PM';
  } catch (e) {
    return null;
  }
};

Utils.getFileExtension = file => {
  const fileNames = file.name.split('.');
  const fileNameExtension = fileNames.length > 1 && fileNames[fileNames.length - 1];

  return fileNameExtension ? fileNameExtension : file.type.split('/')[1];
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

Utils.zero = num => (num < 10 ? '0' + num : num + '');

// function to get query date for pre-order
Utils.getFulfillDate = () => {
  const getExpectDeliveryDateInfo = (dateValue, hour1, hour2) => {
    const fromHour = hour1.split(':')[0];
    const fromMinute = hour1.split(':')[1];
    const d1 = new Date(dateValue);
    let d2, toHour, toMinute;

    if (hour2) {
      d2 = new Date(dateValue);
      toHour = hour2.split(':')[0];
      toMinute = hour2.split(':')[1];
      d2.setHours(Number(toHour), Number(toMinute), 0, 0);
    }
    d1.setHours(Number(fromHour), Number(fromMinute), 0, 0);
    return {
      expectDeliveryDateFrom: d1.toISOString(),
      expectDeliveryDateTo: d2 && d2.toISOString(),
    };
  };

  const expectedDeliveryHour = JSON.parse(Utils.getSessionVariable('expectedDeliveryHour')) || {};
  // => {"from":2,"to":3}
  const expectedDeliveryDate = JSON.parse(Utils.getSessionVariable('expectedDeliveryDate')) || {};
  // => {"date":"2020-03-31T12:18:30.370Z","isOpen":true,"isToday":false}

  if (expectedDeliveryHour.from !== Constants.PREORDER_IMMEDIATE_TAG.from) {
    return (
      (expectedDeliveryDate.date &&
        expectedDeliveryHour.from &&
        getExpectDeliveryDateInfo(expectedDeliveryDate.date, expectedDeliveryHour.from, expectedDeliveryHour.to)) ||
      {}
    );
  } else {
    return {};
  }
};

// This function only retry when the error is ChunkLoadError, do NOT use it as a common promise retry util!
Utils.attemptLoad = (fn, retriesLeft = 5, interval = 1500) => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch(error => {
        setTimeout(() => {
          // if the target module has some runtime error (for example, try to access window.notExistingObj.notExistingProp),
          // the promise will throw correct error for the first time, but will resolve an empty module next time, which makes
          // the entire module seems to be resolved, however it's actually not working. To avoid this kind of thing, we will
          // only deal with ChunkLoadError, which means the module cannot be loaded (mostly because of network issues).
          if (error.name !== 'ChunkLoadError' || retriesLeft <= 1) {
            reject(error);
          } else {
            Utils.attemptLoad(fn, retriesLeft - 1, interval).then(resolve, reject);
          }
        }, interval);
      });
  });
};

Utils.judgeClient = () => {
  let client = '';
  if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
    //判断iPhone|iPad|iPod|iOS
    client = 'iOS';
  } else if (/(Android)/i.test(navigator.userAgent)) {
    //判断Android
    client = 'Android';
  } else {
    client = 'PC';
  }
  return client;
};

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

Utils.containerHeight = ({ headerEls, footerEls }) => {
  return `${Utils.windowSize().height -
    Utils.mainTop({
      headerEls,
    }) -
    Utils.marginBottom({
      footerEls,
    })}px`;
};

Utils.formatHour = (hourString = '') => {
  const [hour, minute] = hourString ? hourString.split(':') : [];
  const hourRemainder = Number(hour) % 12;
  const localeMeridiem = Number(hour) > 11 && Number(hour) < 24 ? 'pm' : 'am';

  if (isNaN(hourRemainder)) {
    return '';
  }

  return `${hourRemainder || 12}${Number(minute) ? `:${minute}` : ''}${localeMeridiem}`;
};

Utils.getOpeningHours = function({
  breakTimeFrom,
  breakTimeTo,
  validTimeFrom = '00:00',
  validTimeTo = '24:00',
  formatBreakTimes,
  formatValidTimes = ['12am', '12am'],
}) {
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
    return [`${formatValidTimes[0]} - ${formatBreakTimes[0]}, ${formatBreakTimes[1]} - ${formatValidTimes[1]}`];
  }

  if (validTimeFrom >= breakTimeFrom && validTimeFrom <= breakTimeTo && breakTimeTo < validTimeTo) {
    return [`${formatBreakTimes[1]} - ${formatValidTimes[1]}`];
  }

  if (validTimeTo <= breakTimeTo && validTimeTo >= breakTimeFrom && breakTimeFrom > validTimeFrom) {
    return [`${formatValidTimes[0]} - ${formatBreakTimes[0]}`];
  }

  return [`${formatValidTimes[0]} - ${formatValidTimes[1]}`];
};

Utils.getOrderSource = () => {
  let orderSource = '';
  if (Utils.isWebview()) {
    orderSource = 'BeepApp';
  } else if (sessionStorage.getItem('orderSource')) {
    orderSource = 'BeepSite';
  } else {
    orderSource = 'BeepStore';
  }
  return orderSource;
};

export default Utils;
