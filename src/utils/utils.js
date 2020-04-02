import qs from 'qs';
import Constants from './constants';
const Utils = {};

Utils.getQueryString = key => {
  const queries = qs.parse(window.location.search, { ignoreQueryPrefix: true });

  if (key) {
    return queries[key] || null;
  }

  return queries;
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

Utils.creditCardDetector = function creditCardDetector(cardNumberString) {
  if (!cardNumberString) {
    return '';
  }

  const defaultBlock = [4, 4, 4, 4];
  const blocks = {
    mastercard: defaultBlock,
    visa: defaultBlock,
  };
  const re = {
    // starts with 51-55/2221–2720; 16 digits
    mastercard: /^(5[1-5]\d{0,2}|22[2-9]\d{0,1}|2[3-7]\d{0,2})\d{0,12}/,
    // starts with 4; 16 digits
    visa: /^4\d{0,15}/,
  };
  const card = {};
  const cardNumberSections = [];
  let cardNumber = cardNumberString.replace(/[^\d]/g, '').substring(0, 16);

  Object.assign(card, {
    type: Object.keys(re).find(key => re[key].test(cardNumber)) || '',
  });

  // Split the card number is groups of Block
  const usingBlocks = blocks[card.type] || defaultBlock;

  usingBlocks.forEach((block, index) => {
    if (cardNumber.substring(0, block) && cardNumber.substring(0, block).length) {
      const delimiter = cardNumber.substring(0, block).length === block && index !== usingBlocks.length - 1 ? ' ' : '';

      cardNumberSections.push(cardNumber.substring(0, block) + delimiter);
      cardNumber = cardNumber.substring(block);
    }
  });

  if (cardNumberSections !== null) {
    Object.assign(card, {
      formattedCardNumber: cardNumberSections.join(''),
    });
  }

  return card;
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

Utils.removeHtmlTag = function removeHtmlTag(str) {
  return str.replace(/<[^>]+>/g, '');
};

Utils.isDeliveryType = () => {
  const { type = '' } = qs.parse(window.location.search, { ignoreQueryPrefix: true });
  return type === 'delivery';
};
Utils.isPickUpType = () => {
  const { type = '' } = qs.parse(window.location.search, { ignoreQueryPrefix: true });
  return type === 'pickup';
};

Utils.isValidTimeToOrder = ({ validDays, validTimeFrom, validTimeTo }) => {
  const weekInfo = new Date().getDay() + 1;
  const hourInfo = new Date().getHours();
  const minutesInfo = new Date().getMinutes();
  const timeFrom = validTimeFrom ? validTimeFrom.split(':') : ['00', '00'];
  const timeTo = validTimeTo ? validTimeTo.split(':') : ['23', '59'];

  const isClosed =
    hourInfo < Number(timeFrom[0]) ||
    hourInfo > Number(timeTo[0]) ||
    (hourInfo === Number(timeFrom[0]) && (minutesInfo < Number(timeFrom[1]) || minutesInfo === Number(timeFrom[1]))) ||
    (hourInfo === Number(timeTo[0]) && (minutesInfo > Number(timeTo[1]) || minutesInfo === Number(timeTo[1])));

  if (validDays && validDays.includes(weekInfo) && !isClosed) {
    return true;
  } else {
    return false;
  }
};

Utils.getDeliveryInfo = ({ business, allBusinessInfo }) => {
  const originalInfo = allBusinessInfo[business] || {};
  const { stores } = originalInfo || {};
  const { qrOrderingSettings } = originalInfo || {};
  const { defaultShippingZone, minimumConsumption, validDays, validTimeFrom, validTimeTo, enableLiveOnline } =
    qrOrderingSettings || {};
  const { defaultShippingZoneMethod } = defaultShippingZone || {};
  const { rate, freeShippingMinAmount, enableConditionalFreeShipping } = defaultShippingZoneMethod || {};
  const deliveryFee = rate || 0;
  const minOrder = minimumConsumption || 0;

  const { phone } = (stores && stores[0]) || {};
  const storeAddress = Utils.getValidAddress((stores && stores[0]) || {}, Constants.ADDRESS_RANGE.COUNTRY);
  const { address: deliveryToAddress } = JSON.parse(Utils.getSessionVariable('deliveryAddress') || '{}');

  return {
    deliveryFee,
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
  };
};

Utils.isSiteApp = () => {
  return (process.env.REACT_APP_QR_SCAN_DOMAINS || '').split(',').includes(document.location.hostname);
};

// unicode string to base64
Utils.utoa = str => {
  return window.btoa(unescape(encodeURIComponent(str)));
};

// base64 to unicode string
Utils.atou = str => {
  return decodeURIComponent(escape(window.atob(str)));
};

// deliveryTo uses the placeInfo from <Location />
// use setDeliveryToCookie and getDeliveryToCookie to share user location between domains
//
// setDeliveryToCookie(deliveryAddress: PlaceInfo) => void
Utils.setDeliveryToCookie = deliveryAddress => {
  const placeInfoBase64 = Utils.utoa(JSON.stringify(deliveryAddress));
  const domain = (process.env.REACT_APP_MERCHANT_STORE_URL || '').split('%business%')[1];
  document.cookie = `deliveryAddress=${placeInfoBase64}; path=/; domain=${domain}`;
};

// getDeliveryToCookie(void) => PlaceInfo || undefined
Utils.getDeliveryAddressCookie = () => {
  const placeInfoBase64 = (document.cookie.split(';').find(kv => kv.trim().split('=')[0] === 'deliveryAddress') || '')
    .trim()
    .slice('deliveryAddress='.length);
  try {
    return JSON.parse(Utils.atou(placeInfoBase64));
  } catch (e) {
    return null;
  }
};

if (process.env.NODE_ENV !== 'production') {
  console.warn('development mode. window.Utils is ready.');
  window.Utils = Utils;
}

export default Utils;
