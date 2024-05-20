import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import * as UtilsV2 from '../common/utils';

dayjs.extend(utc);

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

// eslint-disable-next-line consistent-return
Utils.getLocalStorageVariable = UtilsV2.getLocalStorageVariable;

/* If localStorage is not operational, cookies will be used to store global variables */
Utils.setLocalStorageVariable = UtilsV2.setLocalStorageVariable;

Utils.removeLocalStorageVariable = UtilsV2.removeLocalStorageVariable;

Utils.getSessionVariable = UtilsV2.getSessionVariable;

/* If sessionStorage is not operational, cookies will be used to store global variables */
Utils.setSessionVariable = UtilsV2.setSessionVariable;

Utils.removeSessionVariable = UtilsV2.removeSessionVariable;

Utils.getFormatPhoneNumber = UtilsV2.getPhoneNumberWithCode;

Utils.getCountry = UtilsV2.getCountry;

Utils.getValidAddress = UtilsV2.getFullAddress;

Utils.getQueryObject = UtilsV2.getQueryObject;

Utils.getUserAgentInfo = UtilsV2.getUserAgentInfo;

Utils.isSafari = UtilsV2.isSafari;

export const { isValidUrl } = UtilsV2;

Utils.getOrderTypeFromUrl = UtilsV2.getShippingTypeFromUrl;

Utils.isDeliveryType = UtilsV2.isDeliveryType;

Utils.isPickUpType = UtilsV2.isPickUpType;

Utils.isDineInType = UtilsV2.isDineInType;

Utils.isDigitalType = UtilsV2.isDigitalType;

Utils.isTakeAwayType = UtilsV2.isTakeAwayType;

Utils.isDeliveryOrder = UtilsV2.isDeliveryOrder;

Utils.isQROrder = UtilsV2.isQROrder;

Utils.getDeliveryInfo = UtilsV2.getDeliveryInfo;

Utils.getExpectedDeliveryDateFromSession = UtilsV2.getExpectedDeliveryDateFromSession;

Utils.setExpectedDeliveryTime = UtilsV2.setExpectedDeliveryTime;

Utils.removeExpectedDeliveryTime = UtilsV2.removeExpectedDeliveryTime;

Utils.isSiteApp = UtilsV2.isSiteApp;

Utils.getMerchantStoreUrl = UtilsV2.getMerchantStoreUrl;

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.warn('development mode. window.Utils is ready.');
  window.Utils = Utils;
}

Utils.notHomeOrLocationPath = UtilsV2.notHomeOrLocationPath;

Utils.checkEmailIsValid = UtilsV2.checkEmailIsValid;

Utils.getFileExtension = UtilsV2.getFileExtension;

Utils.getFulfillDate = UtilsV2.getFulfillDate;

// This function only retry when the error is ChunkLoadError, do NOT use it as a common promise retry util!
Utils.attemptLoad = UtilsV2.attemptLoad;

Utils.judgeClient = UtilsV2.judgeClient;

Utils.windowSize = UtilsV2.windowSize;

Utils.mainTop = UtilsV2.mainTop;

Utils.marginBottom = UtilsV2.marginBottom;

Utils.containerHeight = UtilsV2.containerHeight;

Utils.getOpeningHours = UtilsV2.getOpeningHours;

Utils.getOrderSource = UtilsV2.getOrderSource;

Utils.getOrderSourceForCleverTap = UtilsV2.getOrderSourceForCleverTap;

Utils.getClient = UtilsV2.getClient;

export const { copyDataToClipboard } = UtilsV2;

Utils.isFromBeepSite = UtilsV2.isFromBeepSite;

Utils.getRegistrationTouchPoint = UtilsV2.getRegistrationTouchPoint;

Utils.getRegistrationSource = UtilsV2.getRegistrationSource;

Utils.getMainDomain = UtilsV2.getBeepSubdomain;

Utils.getCookieVariable = UtilsV2.getCookieVariable;

Utils.setCookieVariable = UtilsV2.setCookieVariable;

// IMPORTANT! When deleting a cookie and you're not relying on the default attributes, you must pass the exact same path and domain attributes that were used to set the cookie
Utils.removeCookieVariable = UtilsV2.removeCookieVariable;

Utils.isTNGMiniProgram = UtilsV2.isTNGMiniProgram;

Utils.isSharedLink = UtilsV2.isSharedLink;

Utils.saveSourceUrlToSessionStorage = UtilsV2.saveSourceUrlToSessionStorage;

Utils.getSourceUrlFromSessionStorage = UtilsV2.getSourceUrlFromSessionStorage;

Utils.submitForm = UtilsV2.submitForm;

Utils.getStoreHashCode = UtilsV2.getStoreHashCode;

export default Utils;
