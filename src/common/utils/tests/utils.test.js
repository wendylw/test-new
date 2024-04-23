import qs from 'qs';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import * as timeLib from '../../../utils/time-lib';
import { SHIPPING_TYPES, SOURCE_TYPE, PATH_NAME_MAPPING, ORDER_SOURCE, CLIENTS } from '../constants';
import {
  attemptLoad,
  setCookieVariable,
  getCookieVariable,
  removeCookieVariable,
  setSessionVariable,
  getSessionVariable,
  removeSessionVariable,
  getLocalStorageVariable,
  setLocalStorageVariable,
  removeLocalStorageVariable,
  isURL,
  isValidUrl,
  checkEmailIsValid,
  getFileExtension,
  copyDataToClipboard,
  getUserAgentInfo,
  getQueryString,
  getFilteredQueryString,
  getQueryObject,
  isIOSWebview,
  isAndroidWebview,
  isWebview,
  isTNGMiniProgram,
  getClient,
  judgeClient,
  submitForm,
  isJSON,
  getUUID,
  getBeepAppVersion,
  notHomeOrLocationPath,
  getBeepSubdomain,
  isSiteApp,
  getStoreId,
  getStoreHashCode,
  getApiRequestShippingType,
  saveSourceUrlToSessionStorage,
  getSourceUrlFromSessionStorage,
  isSharedLink,
  getShippingTypeFromUrl,
  isFromBeepSite,
  isFromBeepSiteOrderHistory,
  isFromFoodCourt,
  isDeliveryType,
  isPickUpType,
  isDineInType,
  isDigitalType,
  isTakeAwayType,
  isDeliveryOrder,
  isQROrder,
  isProductSoldOut,
  getExpectedDeliveryDateFromSession,
  removeExpectedDeliveryTime,
  setExpectedDeliveryTime,
  getMerchantStoreUrl,
  getFulfillDate,
  getOpeningHours,
  getCountry,
  getPhoneNumberWithCode,
  getFullAddress,
  getDeliveryInfo,
  getOrderSource,
  getOrderSourceForCleverTap,
  getRegistrationTouchPoint,
  getRegistrationSource,
  extractDataAttributes,
  windowSize,
  mainTop,
  marginBottom,
  containerHeight,
  getPrice,
  toCapitalize,
} from '../index';

dayjs.extend(utc);

describe('attemptLoad', () => {
  it('should resolve with the result of the provided function', async () => {
    const result = await attemptLoad(() => Promise.resolve('success'));
    expect(result).toEqual('success');
  });

  it('should reject with the error thrown by the provided function', async () => {
    const error = new Error('failure');
    await expect(attemptLoad(() => Promise.reject(error))).rejects.toThrow(error);
  });

  it('should retry the provided function if it throws a ChunkLoadError', async () => {
    const error = new Error('failure');

    error.name = 'ChunkLoadError';

    const fn = jest.fn(() => Promise.reject(error));

    await expect(attemptLoad(fn, 3, 0)).rejects.toThrow(error);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should not retry the provided function if it throws an error other than ChunkLoadError', async () => {
    const error = new Error('failure');
    const fn = jest.fn(() => Promise.reject(error));

    await expect(attemptLoad(fn, 3, 0)).rejects.toThrow(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should not retry the provided function if the maximum number of retries is reached', async () => {
    const error = new Error('failure');

    error.name = 'ChunkLoadError';
    const fn = jest.fn(() => Promise.reject(error));

    await expect(attemptLoad(fn, 10, 0)).rejects.toThrow(error);
    expect(fn).toHaveBeenCalledTimes(10);
  });
});

describe('setCookieVariable', () => {
  const originalCookies = document.cookie;

  afterEach(() => {
    Object.defineProperty(document, 'cookie', {
      value: originalCookies,
      writable: true,
    });
  });

  it('sets a cookie with the given name and value', () => {
    const name = 'testCookie';
    const value = 'testValue';
    setCookieVariable(name, value);
    expect(Cookies.get(name)).toEqual(value);
    Cookies.remove(name);
  });

  it('sets a cookie with the given attributes', () => {
    const name = 'testCookie';
    const value = 'testValue';
    const attributes = { expires: 7 };
    const expiresDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7).toGMTString();

    setCookieVariable(name, value, attributes);

    expect(document.cookie).not.toContain(`${name}=${value} expires=${expiresDate}`);
    Cookies.remove(name);
  });
});

describe('getCookieVariable', () => {
  it('should get the correct cookie variable', () => {
    const cookieName = 'myCookie';
    const cookieValue = 'myValue';

    document.cookie = `${cookieName}=${cookieValue}`;
    expect(getCookieVariable(cookieName)).toEqual(cookieValue);
  });
});

describe('removeCookieVariable', () => {
  it('removes a cookie variable', () => {
    document.cookie = 'test=123';
    removeCookieVariable('test');

    expect(
      document.cookie
        .split('; ')
        .find(row => row.startsWith('test='))
        ?.split('=')[1]
    ).toEqual('');
  });
});

describe('setSessionVariable', () => {
  const originalSessionStorage = window.sessionStorage;
  const originalDocument = document;

  afterEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });

    Object.defineProperty(document, 'cookie', {
      value: originalDocument,
      writable: true,
    });
  });

  it('should set sessionStorage variable', () => {
    const name = 'testName';
    const value = 'testValue';
    setSessionVariable(name, value);
    expect(sessionStorage.getItem(name)).toEqual(value);
  });

  it('should set a cookie variable if session storage is not available', () => {
    Object.defineProperty(window, 'sessionStorage', {
      value: null,
      writable: true,
    });
    Object.defineProperty(document, 'cookie', {
      value: '',
      writable: true,
    });

    setSessionVariable('test', 'value');
    expect(document.cookie).toContain('sessionStorage_test=value; path=/');
  });

  it('should set empty string if value is not provided', () => {
    const name = 'testName';
    setSessionVariable(name);
    expect(sessionStorage.getItem(name)).toEqual('');
  });
});

describe('getSessionVariable', () => {
  const originalSessionStorage = window.sessionStorage;

  afterEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });
  });

  it('should return null if sessionStorage is not available and cookie is not set', () => {
    sessionStorage.getItem = jest.fn(() => {
      throw new Error('sessionStorage is not available');
    });
    expect(getSessionVariable('test')).toBeNull();
  });

  it('should return the value from sessionStorage if available', () => {
    const name = 'test';
    const value = 'value from sessionStorage';

    sessionStorage.setItem(name, value || '');
    expect(getSessionVariable(name)).toBe(value);
    sessionStorage.removeItem(name);
  });

  it('should return the value from cookie if sessionStorage is not available', () => {
    Object.defineProperty(window, 'sessionStorage', {
      value: null,
      writable: true,
    });

    document.cookie = 'sessionStorage_test=value from cookie';
    expect(getSessionVariable('test')).toBe('value from cookie');
  });
});

describe('removeSessionVariable', () => {
  const originalSessionStorage = window.sessionStorage;
  const originalDocument = document;

  afterEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });

    Object.defineProperty(document, 'cookie', {
      value: originalDocument,
      writable: true,
    });
  });

  it('should remove session storage item if it exists', () => {
    const name = 'test';
    sessionStorage.setItem(name, 'value');
    removeSessionVariable(name);
    expect(sessionStorage.getItem(name)).toBeNull();
  });

  it('should remove cookie storage item if session storage does not exist', () => {
    Object.defineProperty(window, 'sessionStorage', {
      value: null,
      writable: true,
    });

    const name = 'test';
    const cookieName = `sessionStorage_${name}`;
    document.cookie = `${cookieName}=value`;
    const removeCookieVariable = jest.spyOn(Cookies, 'remove');

    removeSessionVariable(name);
    expect(removeCookieVariable).toHaveBeenCalled();
  });

  it('should not throw an error if session storage is not available and cookie storage does not exist', () => {
    Object.defineProperty(window, 'sessionStorage', {
      value: null,
      writable: true,
    });
    Object.defineProperty(document, 'cookie', {
      value: '',
      writable: true,
    });

    const name = 'test';
    expect(() => removeSessionVariable(name)).not.toThrow();
  });
});

describe('getLocalStorageVariable', () => {
  const originalLocalStorage = window.localStorage;

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });

  it('should return the value from localStorage if it exists', () => {
    const name = 'test';
    const value = 'value';
    localStorage.setItem(name, value);
    expect(getLocalStorageVariable(name)).toEqual(value);
    localStorage.removeItem(name);
  });

  it('should return the value from cookie if localStorage throws an error', () => {
    const name = 'test';
    const value = 'value';
    const cookieName = `localStorage_${name}`;

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: null,
      },
    });
    document.cookie = `${cookieName}=${value}`;

    expect(getLocalStorageVariable(name)).toEqual(value);
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
});

describe('setLocalStorageVariable', () => {
  const originalLocalStorage = window.localStorage;
  const originalDocument = document;

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });

    Object.defineProperty(document, 'cookie', {
      value: originalDocument,
      writable: true,
    });
  });

  it('should set the value in localStorage', () => {
    const name = 'testName';
    const value = 'testValue';
    setLocalStorageVariable(name, value);
    expect(localStorage.getItem(name)).toEqual(value);
  });

  it('should set an empty string in localStorage if value is not provided', () => {
    const name = 'testName';
    setLocalStorageVariable(name);
    expect(localStorage.getItem(name)).toEqual('');
  });

  it('should set the value in a cookie if localStorage is not available', () => {
    Object.defineProperty(window, 'localStorage', {
      value: null,
      writable: true,
    });
    Object.defineProperty(document, 'cookie', {
      value: '',
      writable: true,
    });

    setLocalStorageVariable('test', 'value');
    expect(document.cookie).toContain('localStorage_test=value; path=/');
  });
});

describe('removeLocalStorageVariable', () => {
  const originalLocalStorage = window.localStorage;

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });

  it('should remove the variable from localStorage if it exists', () => {
    const name = 'testVariable';
    localStorage.setItem(name, 'testValue');
    removeLocalStorageVariable(name);
    expect(localStorage.getItem(name)).toBeNull();
  });

  it('should remove the variable from cookies if localStorage throws an error', () => {
    Object.defineProperty(window, 'localStorage', {
      value: null,
      writable: true,
    });

    const name = 'test';
    const cookieName = `localStorage_${name}`;
    document.cookie = `${cookieName}=value`;
    const removeCookieVariable = jest.spyOn(Cookies, 'remove');

    removeLocalStorageVariable(name);
    expect(removeCookieVariable).toHaveBeenCalled();
  });
});

describe('isURL', () => {
  it('should return true if url is valid', () => {
    expect(isURL('https://www.google.com')).toBe(true);
  });

  it('should return false if url is invalid', () => {
    expect(isURL('https://')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('should return true for a valid url', () => {
    expect(isValidUrl('https://www.google.com')).toBe(true);
    expect(isValidUrl('http://www.google.com')).toBe(true);
  });

  it('should return false for an invalid url', () => {
    const url = 'not a url';
    expect(isValidUrl(url)).toBe(false);
  });

  it('should return true for a valid url with a path', () => {
    const url = 'https://www.google.com/search?q=github+copilot';
    expect(isValidUrl(url)).toBe(true);
  });

  it('should return false for a url without a protocol', () => {
    const url = 'www.google.com';
    expect(isValidUrl(url)).toBe(false);
  });
});

describe('checkEmailIsValid', () => {
  it('should return true for valid email addresses', () => {
    expect(checkEmailIsValid('test@example.com')).toBe(true);
    expect(checkEmailIsValid('test+123@example.com')).toBe(true);
    expect(checkEmailIsValid('test@example.co.uk')).toBe(true);
    expect(checkEmailIsValid('test@example.io')).toBe(true);
  });

  it('should return false for invalid email addresses', () => {
    expect(checkEmailIsValid('test')).toBe(false);
    expect(checkEmailIsValid('test@')).toBe(false);
    expect(checkEmailIsValid('test@example')).toBe(false);
    expect(checkEmailIsValid('test@example.')).toBe(false);
    expect(checkEmailIsValid('test@.com')).toBe(false);
    expect(checkEmailIsValid('test@.')).toBe(false);
    expect(checkEmailIsValid('@example.com')).toBe(false);
    expect(checkEmailIsValid('test@example.com.')).toBe(false);
  });
});

describe('getFileExtension', function() {
  it('should return the file extension when it exists', function() {
    const file = { name: 'test.jpg', type: 'image/jpeg' };
    expect(getFileExtension(file)).toEqual('jpg');
  });

  it('should return the file type when the extension does not exist', function() {
    const file = { name: 'test', type: 'image/jpeg' };
    expect(getFileExtension(file)).toEqual('jpeg');
  });

  it('should throw an error when the file object is invalid', function() {
    expect(() => getFileExtension({ type: 'image/jpeg' })).toThrow();
    expect(() => getFileExtension(undefined)).toThrow();
  });
});

describe('copyDataToClipboard', () => {
  const originalClipboard = navigator.clipboard;
  const originalExecCommand = document.execCommand;
  const originalCreateElement = document.createElement;
  const originalAppendChild = document.body.appendChild;
  const originalRemoveChild = document.body.removeChild;

  beforeEach(() => {
    navigator.clipboard = {
      write: jest.fn(),
    };
    document.execCommand = jest.fn();
    document.createElement = jest.fn(() => ({
      setAttribute: jest.fn(),
      select: jest.fn(),
      value: jest.fn(),
      setSelectionRange: jest.fn(),
      addEventListener: jest.fn(),
    }));
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  afterEach(() => {
    navigator.clipboard = originalClipboard;
    document.execCommand = originalExecCommand;
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
  });

  it('should copy text to clipboard using Clipboard API', async () => {
    const windowSpy = jest.spyOn(window, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      ClipboardItem: jest.fn(),
    }));
    const text = 'test text';
    const data = [new global.window.ClipboardItem({ 'text/plain': text })];

    await copyDataToClipboard(text);

    expect(navigator.clipboard.write).toHaveBeenCalledWith(data);
    windowSpy.mockRestore();
  });

  it('should copy text to clipboard using document.execCommand if Clipboard API is not available', async () => {
    const windowSpy = jest.spyOn(window, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      ClipboardItem: () => new Error('ClipboardItem is not defined'),
    }));
    document.execCommand.mockReturnValue(true);

    const text = 'Hello, world!';
    navigator.clipboard = undefined;
    const result = await copyDataToClipboard(text);

    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(document.createElement).toHaveBeenCalledWith('input');
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
    expect(result).toBe(true);
    windowSpy.mockRestore();
  });

  it('should return false if document.execCommand is not available', async () => {
    const windowSpy = jest.spyOn(window, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      ClipboardItem: () => new Error('ClipboardItem is not defined'),
    }));
    document.execCommand.mockReturnValue(undefined);

    const text = 'Hello, world!';
    navigator.clipboard = undefined;
    const result = await copyDataToClipboard(text);

    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(result).toBe(false);
    windowSpy.mockRestore();
  });

  it('should return true if text is copied successfully', async () => {
    const windowSpy = jest.spyOn(window, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      ClipboardItem: jest.fn(),
    }));
    const text = 'test text';
    const result = await copyDataToClipboard(text);

    expect(result).toBe(true);
    windowSpy.mockRestore();
  });

  it('should return false if text is not copied successfully', async () => {
    const text = 'test text';

    navigator.clipboard.write.mockRejectedValueOnce(new Error());

    const result = await copyDataToClipboard(text);

    expect(result).toBe(false);
  });
});

describe('getUserAgentInfo', () => {
  let windowSpy;

  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  it('should return an object with isMobile and browser properties', () => {
    const userAgentInfo = getUserAgentInfo();
    expect(userAgentInfo).toHaveProperty('isMobile');
    expect(userAgentInfo).toHaveProperty('browser');
  });

  it('detects mobile devices correctly', () => {
    const userAgentInfo = getUserAgentInfo();
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
      navigator.userAgent
    );
    expect(userAgentInfo.isMobile).toEqual(isMobile);
  });

  it('detects the browser correctly', () => {
    const userAgentInfo = getUserAgentInfo();
    const regex = /(MSIE|Trident|(?!Gecko.+)Firefox|(?!AppleWebKit.+Chrome.+)Safari(?!.+Edge)|(?!AppleWebKit.+)Chrome(?!.+Edge)|(?!AppleWebKit.+Chrome.+Safari.+)Edge|AppleWebKit(?!.+Chrome|.+Safari)|Gecko(?!.+Firefox))(?: |\/)([\d.apre]+)/g;
    const browsers = navigator.userAgent.match(regex);

    expect(userAgentInfo.browser).toEqual(browsers ? browsers[0] : '');
  });
});

describe('getQueryString', () => {
  it('should return null if key is not found', () => {
    const result = getQueryString('foo');
    expect(result).toBeNull();
  });

  it('should return the value of the key if found', () => {
    const url = 'https://example.com/?foo=bar&baz=qux';
    Object.defineProperty(window, 'location', {
      value: new URL(url),
    });

    const result = getQueryString('foo');
    expect(result).toEqual('bar');
  });

  it('should return all queries if no key is provided', () => {
    const url = 'https://example.com/?foo=bar&baz=qux';
    Object.defineProperty(window, 'location', {
      value: new URL(url),
    });

    const result = getQueryString();
    expect(result).toEqual({ foo: 'bar', baz: 'qux' });
  });
});

describe('getFilteredQueryString', () => {
  it('should remove a single key from the query string', () => {
    const queryString = '?foo=bar&baz=qux';
    const result = getFilteredQueryString('foo', queryString);
    expect(result).toEqual('?baz=qux');
  });

  it('should remove multiple keys from the query string', () => {
    const queryString = '?foo=bar&baz=qux&quux=corge';
    const result = getFilteredQueryString(['foo', 'quux'], queryString);
    expect(result).toEqual('?baz=qux');
  });

  it('should return the original query string if no keys are provided', () => {
    const queryString = '?foo=bar&baz=qux';
    const result = getFilteredQueryString(null, queryString);
    expect(result).toEqual(queryString);
  });

  it('should return an empty query string if the original query string is empty', () => {
    const queryString = '';
    const result = getFilteredQueryString('foo', queryString);
    expect(result).toEqual('');
  });
});

describe('getQueryObject', () => {
  it('should return null if history location search is empty', () => {
    const history = { location: { search: '' } };
    const paramName = 'test';
    expect(getQueryObject(history, paramName)).toBeNull();
  });

  it('should return null if paramName is not found in search params', () => {
    const history = { location: { search: '?foo=bar' } };
    const paramName = 'test';
    expect(getQueryObject(history, paramName)).toBeNull();
  });

  it('should return the value of paramName in search params', () => {
    const history = { location: { search: '?foo=bar&test=baz' } };
    const paramName = 'test';
    expect(getQueryObject(history, paramName)).toEqual('baz');
  });
});

describe('isIOSWebview', () => {
  const originalWebViewSource = window.webViewSource;

  afterEach(() => {
    window.webViewSource = originalWebViewSource;
  });

  it('returns true when window.webViewSource is iOS', () => {
    window.webViewSource = 'iOS';
    expect(isIOSWebview()).toBe(true);
  });

  it('returns false when window.webViewSource is not iOS', () => {
    window.webViewSource = 'Android';
    expect(isIOSWebview()).toBe(false);
  });
});

describe('isAndroidWebview', () => {
  const originalWebViewSource = window.webViewSource;

  afterEach(() => {
    window.webViewSource = originalWebViewSource;
  });

  it('returns true when window.webViewSource is Android', () => {
    window.webViewSource = 'Android';
    expect(isAndroidWebview()).toBe(true);
  });

  it('returns false when window.webViewSource is not Android', () => {
    window.webViewSource = 'iOS';
    expect(isAndroidWebview()).toBe(false);
  });
});

describe('isWebview', () => {
  const originalWebViewSource = window.webViewSource;

  afterEach(() => {
    window.webViewSource = originalWebViewSource;
  });

  it('should return true for Android webview', () => {
    window.webViewSource = 'Android';

    // Act
    const result = isWebview();

    // Assert
    expect(result).toBe(true);
  });

  it('should return true for iOS webview', () => {
    window.webViewSource = 'iOS';

    // Act
    const result = isWebview();

    // Assert
    expect(result).toBe(true);
  });

  it('should return false for regular browser', () => {
    // Act
    const result = isWebview();

    // Assert
    expect(result).toBe(false);
  });
});

describe('isTNGMiniProgram', () => {
  const originalIsTNGMiniProgram = window._isTNGMiniProgram_;

  afterEach(() => {
    window._isTNGMiniProgram_ = originalIsTNGMiniProgram;
  });

  it('should return the value of window._isTNGMiniProgram_', () => {
    window._isTNGMiniProgram_ = true;
    expect(isTNGMiniProgram()).toBe(true);

    window._isTNGMiniProgram_ = false;
    expect(isTNGMiniProgram()).toBe(false);
  });
});

describe('getClient', () => {
  const originalTNGMiniProgram = window._isTNGMiniProgram_;

  beforeEach(() => {
    Object.defineProperty(window, '_isTNGMiniProgram_', {
      value: '',
      writable: true,
    });

    Object.defineProperty(window, 'webViewSource', {
      value: '',
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, '_isTNGMiniProgram_', {
      value: originalTNGMiniProgram,
      writable: true,
    });

    Object.defineProperty(window, 'webViewSource', {
      value: '',
      writable: true,
    });
  });

  it('should return TNG_MINI_PROGRAM client when isTNGMiniProgram is true', () => {
    Object.defineProperty(window, '_isTNGMiniProgram_', {
      value: true,
      writable: true,
    });
    expect(getClient()).toEqual(CLIENTS.TNG_MINI_PROGRAM);
  });

  it('should return ANDROID client when isAndroidWebview is true', () => {
    Object.defineProperty(window, 'webViewSource', {
      value: 'Android',
      writable: true,
    });
    expect(getClient()).toEqual(CLIENTS.ANDROID);
  });

  it('should return IOS client when isIOSWebview is true', () => {
    Object.defineProperty(window, 'webViewSource', {
      value: 'iOS',
      writable: true,
    });
    expect(getClient()).toEqual(CLIENTS.IOS);
  });

  it('should return WEB client when none of the conditions are met', () => {
    expect(getClient()).toEqual(CLIENTS.WEB);
  });
});

describe('judgeClient', () => {
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: '',
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
    });
  });

  it("should return 'iOS' when user agent is an iOS device", () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      writable: true,
    });
    expect(judgeClient()).toEqual('iOS');
  });

  it("should return 'Android' when user agent is an Android device", () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Linux; Android 11; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Mobile Safari/537.36',
      writable: true,
    });
    expect(judgeClient()).toEqual('Android');
  });

  it("should return 'Mac' when user agent is a Mac device", () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
      writable: true,
    });
    expect(judgeClient()).toEqual('Mac');
  });

  it("should return 'PC' when user agent is not recognized", () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
      writable: true,
    });
    expect(judgeClient()).toEqual('PC');
  });
});

describe('submitForm', () => {
  const originalCreateElement = document.createElement;
  const originalBody = document.body;

  beforeEach(() => {
    Object.defineProperty(document, 'body', {
      value: {
        appendChild: jest.fn(),
        removeChild: jest.fn(),
      },
      writable: true,
    });

    document.createElement = jest.fn(key => {
      if (key === 'form') {
        return {
          style: {},
          appendChild: jest.fn(),
          submit: jest.fn(),
          method: '',
          action: '',
        };
      } else if (key === 'input') {
        return {
          name: '',
          value: '',
          type: '',
        };
      }
    });
  });

  afterEach(() => {
    Object.defineProperty(document.body, 'appendChild', {
      value: originalBody.appendChild,
      writable: true,
    });

    document.createElement = originalCreateElement;
  });

  it('should create a form with the correct action and method', () => {
    const action = '/test';
    const data = { foo: 'bar' };
    submitForm(action, data);

    expect(document.createElement).toHaveBeenCalledWith('form');

    const form = document.createElement.mock.results[0].value;

    expect(form.action).toBe(action);
    expect(form.method).toBe('POST');
  });

  it('should create a hidden input for each key in the data object', () => {
    const data = { foo: 'bar', baz: 'qux' };
    submitForm('/test', data);

    const form = document.createElement.mock.results[0].value;
    const inputs = [document.createElement.mock.results[1].value, document.createElement.mock.results[2].value];

    expect(document.createElement).toHaveBeenCalledWith('form');
    expect(document.createElement).toHaveBeenCalledWith('input');
    expect(form.appendChild).toHaveBeenCalledTimes(2);
    expect(inputs[0].name).toBe('foo');
    expect(inputs[0].value).toBe('bar');
    expect(inputs[1].name).toBe('baz');
    expect(inputs[1].value).toBe('qux');
  });

  it('should append the form to the document body, submit it, and remove it', () => {
    submitForm('/test');

    const form = document.createElement.mock.results[0].value;

    expect(document.body.appendChild).toHaveBeenCalledWith(form);
    expect(form.submit).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalledWith(form);
  });
});

describe('isJSON', () => {
  it('should return true for valid JSON', () => {
    expect(isJSON('{"name": "John", "age": 30, "city": "New York"}')).toBe(true);
  });

  it('should return false for invalid JSON', () => {
    expect(isJSON("{name: 'John', age: 30, city: 'New York'}")).toBe(false);
  });

  it('should return true for JSON.parese parseable input', () => {
    expect(isJSON('123')).toBe(true);
    expect(isJSON(123)).toBe(true);
  });

  it('should return false for Non-JSON.parese parseable input', () => {
    expect(isJSON('test')).toBe(false);
  });
});

describe('getUUID', () => {
  let windowSpy;

  const expectedUUID = 'fce2af57-3610-48f1-bbfb-bc0d72213718';
  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  // By default, window.crypto is not available on jsdom
  it('should return expected UUID', () => {
    windowSpy.mockImplementation(() => ({
      crypto: {
        randomUUID: () => expectedUUID,
      },
    }));

    expect(window.crypto.randomUUID()).toEqual(expectedUUID);
  });

  test('return uuid when window.crypto is available', () => {
    expect(getUUID()).toMatch(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
  });

  test('return uuid when window.crypto is not available', () => {
    windowSpy.mockImplementation(() => ({
      crypto: undefined,
    }));
    expect(window.crypto).toBeUndefined();
    expect(getUUID()).toMatch(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
  });
});

// Business Utils
describe('getBeepAppVersion', () => {
  const originalBeepAppVersion = window.beepAppVersion;

  afterEach(() => {
    window.beepAppVersion = originalBeepAppVersion;
  });

  it('should return the beep app version from the window object', () => {
    window.beepAppVersion = '1.0.0';
    expect(getBeepAppVersion()).toEqual('1.0.0');
  });

  it('should return undefined if the beep app version is not set', () => {
    window.beepAppVersion = undefined;
    expect(getBeepAppVersion()).toBeUndefined();
  });
});

describe('notHomeOrLocationPath', () => {
  it('should return false for /ordering', () => {
    expect(notHomeOrLocationPath('/ordering')).toBe(false);
  });

  it('should return false for /ordering/location-date', () => {
    expect(notHomeOrLocationPath('/ordering/location-date')).toBe(false);
  });

  it('should return false for /ordering/location-date/', () => {
    expect(notHomeOrLocationPath('/ordering/location-date/')).toBe(false);
  });

  it('should return true for /ordering/123', () => {
    expect(notHomeOrLocationPath('/ordering/123')).toBe(true);
  });

  it('should return true for /ordering/location-date/123', () => {
    expect(notHomeOrLocationPath('/ordering/location-date/123')).toBe(true);
  });

  it('should return true for /home', () => {
    expect(notHomeOrLocationPath('/home')).toBe(true);
  });
});

describe('getBeepSubdomain', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: {
        hostname: '',
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('returns correct domain for www.beepit.com', () => {
    // Set up the window location hostname
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'www.beepit.com',
      },
      writable: true,
    });

    expect(getBeepSubdomain()).toBe('beepit.com');
  });

  it('returns correct domain for beepit.com', () => {
    // Set up the window location hostname
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'beepit.com',
      },
      writable: true,
    });

    expect(getBeepSubdomain()).toBe('beepit.com');
  });

  it('returns correct domain beepit.co', () => {
    // Set up the window location hostname
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'beepit.co',
      },
      writable: true,
    });

    expect(getBeepSubdomain()).toBe('beepit.co');
  });

  it('returns correct domain if multiple subdomains', () => {
    // Set up the window location hostname
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'wendy.beep.test13.shub.us',
      },
      writable: true,
    });

    expect(getBeepSubdomain()).toBe('beep.test13.shub.us');
  });

  it('returns empty string if no subdomain', () => {
    // Set up the window location hostname
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'beep.com',
      },
      writable: true,
    });

    expect(getBeepSubdomain()).toBe('');
  });
});

describe('isSiteApp', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    delete window.location;
    window.location = { hostname: 'beepit.co' };
  });

  afterEach(() => {
    delete process.env.REACT_APP_QR_SCAN_DOMAINS;
    window.location = originalLocation;
  });

  it('should return true if the current domain is in the list of domains', () => {
    process.env.REACT_APP_QR_SCAN_DOMAINS = 'beepit.co, foo.com, bar.com';
    expect(isSiteApp()).toBe(true);
  });

  it('should return false if the current domain is not in the list of domains', () => {
    process.env.REACT_APP_QR_SCAN_DOMAINS = 'foo.com, bar.com';
    expect(isSiteApp()).toBe(false);
  });

  it('should return false if the list of domains is empty', () => {
    process.env.REACT_APP_QR_SCAN_DOMAINS = '';
    expect(isSiteApp()).toBe(false);
  });

  it('should use the provided domain if one is given', () => {
    process.env.REACT_APP_QR_SCAN_DOMAINS = 'beepit.co';
    expect(isSiteApp('beepit.co')).toBe(true);
    expect(isSiteApp('foo.com')).toBe(false);
  });

  it('should ignore leading/trailing whitespace in the list of domains', () => {
    process.env.REACT_APP_QR_SCAN_DOMAINS = '  beepit.co  ,  foo.com  ';
    expect(isSiteApp('beepit.co')).toBe(true);
    expect(isSiteApp('foo.com')).toBe(true);
    expect(isSiteApp('bar.com')).toBe(false);
  });

  it('should ignore case when comparing domains', () => {
    process.env.REACT_APP_QR_SCAN_DOMAINS = 'BEEPIT.CO, foo.com';
    expect(isSiteApp('beepit.co')).toBe(true);
    expect(isSiteApp('Foo.com')).toBe(true);
    expect(isSiteApp('bar.com')).toBe(false);
  });
});

describe('getStoreId', () => {
  const originalCookies = document.cookie;

  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      value: '',
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(document, 'cookie', {
      value: originalCookies,
      writable: true,
    });
  });

  it('returns the value of the __s cookie', () => {
    // Set up a fake cookie with the value '123'
    Object.defineProperty(document, 'cookie', {
      value: '__s=123',
      writable: true,
    });

    // Call the getStoreId function and expect it to return '123'
    expect(getStoreId()).toEqual('123');
  });

  it('returns an empty string if the __s cookie is not set', () => {
    // Clear any existing __s cookie
    Object.defineProperty(document, 'cookie', {
      value: '__s=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;',
      writable: true,
    });

    // Call the getStoreId function and expect it to return an empty string
    expect(getStoreId()).toEqual('');
  });
});

describe('getStoreHashCode', () => {
  const originalCookies = document.cookie;

  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      value: '',
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(document, 'cookie', {
      value: originalCookies,
      writable: true,
    });
  });

  it('returns the value of the __h cookie', () => {
    // Set up the document.cookie value to include the __h cookie
    Object.defineProperty(document, 'cookie', {
      value: '__h=abc123',
      writable: true,
    });

    // Call the getStoreHashCode function and expect it to return the correct value
    expect(getStoreHashCode()).toEqual('abc123');
  });

  it('returns undefined if the __h cookie is not set', () => {
    // Set up the document.cookie value to not include the __h cookie
    Object.defineProperty(document, 'cookie', {
      value: 'other_cookie=def456',
      writable: true,
    });

    // Call the getStoreHashCode function and expect it to return undefined
    expect(getStoreHashCode()).toBeUndefined();
  });
});

describe('getApiRequestShippingType', () => {
  const originalQueryString = window.location.search;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: {
        search: originalQueryString,
      },
      writable: true,
    });
  });

  it('should return "dineIn" when shippingType is SHIPPING_TYPES.DINE_IN', () => {
    const result = getApiRequestShippingType(SHIPPING_TYPES.DINE_IN);
    expect(result).toEqual('dineIn');
  });

  it('should return argument value when shippingType is other value', () => {
    const shippingType = 'test';
    const result = getApiRequestShippingType(shippingType);
    expect(result).toEqual(shippingType);
  });

  it('should return the value of the "type" query parameter when shippingType is null or undefined', () => {
    Object.defineProperty(window.location, 'search', {
      value: '?type=pickup',
      writable: true,
    });
    const getQueryStringSpy = jest.spyOn(qs, 'parse');
    const result = getApiRequestShippingType(null);
    expect(getQueryStringSpy).toHaveBeenCalledWith(window.location.search, { ignoreQueryPrefix: true });
    expect(result).toEqual('pickup');
    getQueryStringSpy.mockRestore();
  });
});

describe('saveSourceUrlToSessionStorage', () => {
  it('saves source URL to session storage', () => {
    const sourceUrl = 'https://example.com';
    saveSourceUrlToSessionStorage(sourceUrl);
    expect(window.sessionStorage.getItem('BeepOrderingSourceUrl')).toEqual(sourceUrl);
  });

  it('should call window.sessionStorage.setItem with arguments (BeepOrdering and sourceUrl)', () => {
    const originalSessionStorage = window.sessionStorage;
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
      },
      writable: true,
    });

    const sourceUrl = 'https://example.com';
    const sessionStorageSetSpy = jest.spyOn(window.sessionStorage, 'setItem');

    saveSourceUrlToSessionStorage(sourceUrl);

    expect(sessionStorageSetSpy).toHaveBeenCalledWith('BeepOrderingSourceUrl', sourceUrl);
    expect(window.sessionStorage.setItem).toHaveBeenCalledTimes(1);

    sessionStorageSetSpy.mockRestore();
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });
  });
});

describe('getSourceUrlFromSessionStorage', () => {
  it('should return the value of BeepOrderingSourceUrl from session storage', () => {
    const expected = 'https://example.com';
    sessionStorage.setItem('BeepOrderingSourceUrl', expected);
    const result = getSourceUrlFromSessionStorage();
    expect(result).toEqual(expected);
    sessionStorage.removeItem('BeepOrderingSourceUrl');
  });

  it('should return null if BeepOrderingSourceUrl is not set in session storage', () => {
    const result = getSourceUrlFromSessionStorage();
    expect(result).toBeNull();
  });
});

describe('isSharedLink', () => {
  const originalSessionStorage = window.sessionStorage;

  beforeEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });
  });

  it('returns true when BeepOrderingSource is SOURCE_TYPE.SHARED_LINK', () => {
    // Arrange
    const getSessionVariable = jest.spyOn(window.sessionStorage, 'getItem').mockReturnValue(SOURCE_TYPE.SHARED_LINK);

    // Act
    const result = isSharedLink();

    // Assert
    expect(result).toBe(true);
    expect(getSessionVariable).toHaveBeenCalledWith('BeepOrderingSource');
  });

  it('returns false when BeepOrderingSource is not SOURCE_TYPE.SHARED_LINK', () => {
    // Arrange
    const getSessionVariable = jest.spyOn(window.sessionStorage, 'getItem').mockReturnValue('test');

    // Act
    const result = isSharedLink(getSessionVariable);

    // Assert
    expect(result).toBe(false);
    expect(getSessionVariable).toHaveBeenCalledWith('BeepOrderingSource');
  });
});

describe('getShippingTypeFromUrl', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('should return empty string when no type is present in the url', () => {
    const url = 'https://example.com';
    Object.defineProperty(window, 'location', {
      value: new URL(url),
    });

    expect(getShippingTypeFromUrl()).toEqual('');
  });

  it('should return the type when it is present in the url', () => {
    const url = 'https://example.com/?type=express';
    Object.defineProperty(window, 'location', {
      value: new URL(url),
    });

    expect(getShippingTypeFromUrl()).toEqual('express');
  });
});

describe('isFromBeepSite', () => {
  const originalSessionStorage = window.sessionStorage;

  beforeEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    delete process.env.REACT_APP_QR_SCAN_DOMAINS;
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });
  });

  it('should return false when no source url is found', () => {
    window.sessionStorage.getItem.mockReturnValueOnce(null);
    expect(isFromBeepSite()).toBe(false);
  });

  it('should return false when the source url is not from beep site', () => {
    window.sessionStorage.getItem.mockReturnValueOnce('https://www.google.com');
    expect(isFromBeepSite()).toBe(false);
  });

  it('should return true when the source url is from beep site', () => {
    process.env.REACT_APP_QR_SCAN_DOMAINS = 'beepit.co, beepit.com';
    window.sessionStorage.getItem.mockReturnValueOnce('https://beepit.com');
    expect(isFromBeepSite()).toBe(true);
  });

  it('should catch and log errors, if any error happen', () => {
    const originalURL = global.URL;
    const error = new Error('test error');
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(() => {
          return 'https://beepit.com';
        }),
      },
      writable: true,
    });
    Object.defineProperty(global, 'URL', {
      value: {
        hostname: 'beepit.com',
        toString: jest.fn(() => {
          throw error;
        }),
      },
      writable: true,
    });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(isFromBeepSite()).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    console.error.mockRestore();
    Object.defineProperty(global, 'URL', {
      value: originalURL,
      writable: true,
    });
  });
});

describe('isFromBeepSiteOrderHistory', () => {
  const originalSessionStorage = window.sessionStorage;

  beforeEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    delete process.env.REACT_APP_QR_SCAN_DOMAINS;
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });
  });

  it('should return false when no source url is found', () => {
    window.sessionStorage.getItem.mockReturnValueOnce(null);
    expect(isFromBeepSiteOrderHistory()).toBe(false);
  });

  it('should return false when the source url is not from beep site', () => {
    window.sessionStorage.getItem.mockReturnValueOnce('https://www.google.com');
    expect(isFromBeepSiteOrderHistory()).toBe(false);
  });

  it('should return true when the source url is from beep order history', () => {
    window.sessionStorage.getItem.mockReturnValueOnce(`https://beepit.com${PATH_NAME_MAPPING.ORDER_HISTORY}`);
    expect(isFromBeepSiteOrderHistory()).toBe(true);
  });

  it('should catch and log errors, if any error happen', () => {
    const originalURL = global.URL;
    const error = new Error('test error');
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(() => {
          return 'https://beep.com';
        }),
      },
      writable: true,
    });
    Object.defineProperty(global, 'URL', {
      value: {
        hostname: 'beep.com',
        toString: jest.fn(() => {
          throw error;
        }),
      },
      writable: true,
    });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(isFromBeepSiteOrderHistory()).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    console.error.mockRestore();
    Object.defineProperty(global, 'URL', {
      value: originalURL,
      writable: true,
    });
  });
});

describe('isFromFoodCourt', () => {
  const originalSessionStorage = window.sessionStorage;

  beforeEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    delete process.env.REACT_APP_QR_SCAN_DOMAINS;
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });
  });

  it('should return false when no source url is found', () => {
    window.sessionStorage.getItem.mockReturnValueOnce(null);
    expect(isFromFoodCourt()).toBe(false);
  });

  it('should return false when the source url is not from beep site', () => {
    window.sessionStorage.getItem.mockReturnValueOnce('https://www.google.com');
    expect(isFromFoodCourt()).toBe(false);
  });

  it('should return true when the source url is from food court landing page', () => {
    window.sessionStorage.getItem.mockReturnValueOnce(
      `https://jw.beepit.com${PATH_NAME_MAPPING.ORDERING_BASE}${PATH_NAME_MAPPING.FOOD_COURT}`
    );
    expect(isFromFoodCourt()).toBe(true);
  });

  it('should catch and log errors, if any error happen', () => {
    const originalURL = global.URL;
    const error = new Error('test error');
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(() => {
          return 'https://beep.com';
        }),
      },
      writable: true,
    });
    Object.defineProperty(global, 'URL', {
      value: {
        hostname: 'beep.com',
        toString: jest.fn(() => {
          throw error;
        }),
      },
      writable: true,
    });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(isFromFoodCourt()).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    console.error.mockRestore();
    Object.defineProperty(global, 'URL', {
      value: originalURL,
      writable: true,
    });
  });
});

describe('isDeliveryType', () => {
  let getQueryStringSpy;
  const originalQueryString = window.location.search;

  beforeEach(() => {
    getQueryStringSpy = jest.spyOn(qs, 'parse');
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
      },
      writable: true,
    });
  });

  afterEach(() => {
    getQueryStringSpy.mockRestore();
    Object.defineProperty(window, 'location', {
      value: {
        search: originalQueryString,
      },
      writable: true,
    });
  });

  it('should return true when shipping type is delivery', () => {
    Object.defineProperty(window.location, 'search', {
      value: '?type=delivery',
      writable: true,
    });

    const result = isDeliveryType();
    expect(getQueryStringSpy).toHaveBeenCalledWith(window.location.search, { ignoreQueryPrefix: true });
    expect(result).toBe(true);
  });

  it('should return false when shipping type is not delivery', () => {
    Object.defineProperty(window.location, 'search', {
      value: '?type=pickup',
      writable: true,
    });

    const result = isDeliveryType();
    expect(getQueryStringSpy).toHaveBeenCalledWith(window.location.search, { ignoreQueryPrefix: true });
    expect(result).toBe(false);
  });
});

describe('isPickUpType', () => {
  let getQueryStringSpy;
  const originalQueryString = window.location.search;

  beforeEach(() => {
    getQueryStringSpy = jest.spyOn(qs, 'parse');
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
      },
      writable: true,
    });
  });

  afterEach(() => {
    getQueryStringSpy.mockRestore();
    Object.defineProperty(window, 'location', {
      value: {
        search: originalQueryString,
      },
      writable: true,
    });
  });

  it('should return true when shipping type is pickup', () => {
    Object.defineProperty(window.location, 'search', {
      value: '?type=pickup',
      writable: true,
    });

    const result = isPickUpType();
    expect(getQueryStringSpy).toHaveBeenCalledWith(window.location.search, { ignoreQueryPrefix: true });
    expect(result).toBe(true);
  });

  it('should return false when shipping type is not pickup', () => {
    Object.defineProperty(window.location, 'search', {
      value: '?type=delivery',
      writable: true,
    });

    const result = isPickUpType();
    expect(getQueryStringSpy).toHaveBeenCalledWith(window.location.search, { ignoreQueryPrefix: true });
    expect(result).toBe(false);
  });
});

describe('isDineInType', () => {
  let getQueryStringSpy;
  const originalQueryString = window.location.search;

  beforeEach(() => {
    getQueryStringSpy = jest.spyOn(qs, 'parse');
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
      },
      writable: true,
    });
  });

  afterEach(() => {
    getQueryStringSpy.mockRestore();
    Object.defineProperty(window, 'location', {
      value: {
        search: originalQueryString,
      },
      writable: true,
    });
  });

  it('should return true when shipping type is dine-in', () => {
    Object.defineProperty(window.location, 'search', {
      value: '?type=dine-in',
      writable: true,
    });

    const result = isDineInType();
    expect(getQueryStringSpy).toHaveBeenCalledWith(window.location.search, { ignoreQueryPrefix: true });
    expect(result).toBe(true);
  });

  it('should return false when shipping type is not dine-in', () => {
    Object.defineProperty(window.location, 'search', {
      value: '?type=delivery',
      writable: true,
    });

    const result = isDineInType();
    expect(getQueryStringSpy).toHaveBeenCalledWith(window.location.search, { ignoreQueryPrefix: true });
    expect(result).toBe(false);
  });
});

describe('isDigitalType', () => {
  let getQueryStringSpy;
  const originalQueryString = window.location.search;

  beforeEach(() => {
    getQueryStringSpy = jest.spyOn(qs, 'parse');
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
      },
      writable: true,
    });
  });

  afterEach(() => {
    getQueryStringSpy.mockRestore();
    Object.defineProperty(window, 'location', {
      value: {
        search: originalQueryString,
      },
      writable: true,
    });
  });

  it('should return true when shipping type is digital', () => {
    Object.defineProperty(window.location, 'search', {
      value: '?type=digital',
      writable: true,
    });

    const result = isDigitalType();
    expect(getQueryStringSpy).toHaveBeenCalledWith(window.location.search, { ignoreQueryPrefix: true });
    expect(result).toBe(true);
  });

  it('should return false when shipping type is not digital', () => {
    Object.defineProperty(window.location, 'search', {
      value: '?type=delivery',
      writable: true,
    });

    const result = isDigitalType();
    expect(getQueryStringSpy).toHaveBeenCalledWith(window.location.search, { ignoreQueryPrefix: true });
    expect(result).toBe(false);
  });
});

describe('isTakeAwayType', () => {
  let getQueryStringSpy;
  const originalQueryString = window.location.search;

  beforeEach(() => {
    getQueryStringSpy = jest.spyOn(qs, 'parse');
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
      },
      writable: true,
    });
  });

  afterEach(() => {
    getQueryStringSpy.mockRestore();
    Object.defineProperty(window, 'location', {
      value: {
        search: originalQueryString,
      },
      writable: true,
    });
  });

  it('should return true when shipping type is takeaway', () => {
    Object.defineProperty(window.location, 'search', {
      value: '?type=takeaway',
      writable: true,
    });

    const result = isTakeAwayType();
    expect(getQueryStringSpy).toHaveBeenCalledWith(window.location.search, { ignoreQueryPrefix: true });
    expect(result).toBe(true);
  });

  it('should return false when shipping type is not takeaway', () => {
    Object.defineProperty(window.location, 'search', {
      value: '?type=delivery',
      writable: true,
    });

    const result = isTakeAwayType();
    expect(getQueryStringSpy).toHaveBeenCalledWith(window.location.search, { ignoreQueryPrefix: true });
    expect(result).toBe(false);
  });
});

describe('isDeliveryOrder', () => {
  let getQueryStringSpy;
  const originalQueryString = window.location.search;

  beforeEach(() => {
    getQueryStringSpy = jest.spyOn(qs, 'parse');
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
      },
      writable: true,
    });
  });

  afterEach(() => {
    getQueryStringSpy.mockRestore();
    Object.defineProperty(window, 'location', {
      value: {
        search: originalQueryString,
      },
      writable: true,
    });
  });

  it('should return true when shipping type is pickup or delivery', () => {
    Object.defineProperty(window.location, 'search', {
      value: '?type=pickup',
      writable: true,
    });

    const pickupResult = isDeliveryOrder();
    expect(getQueryStringSpy).toHaveBeenCalledWith(window.location.search, { ignoreQueryPrefix: true });
    expect(pickupResult).toBe(true);

    Object.defineProperty(window.location, 'search', {
      value: '?type=pickup',
      writable: true,
    });

    const deliveryResult = isDeliveryOrder();
    expect(getQueryStringSpy).toHaveBeenCalledWith(window.location.search, { ignoreQueryPrefix: true });
    expect(deliveryResult).toBe(true);
  });

  it('should return false when shipping type is not pickup and delivery', () => {
    Object.defineProperty(window.location, 'search', {
      value: '?type=',
      writable: true,
    });

    const result = isDeliveryOrder();
    expect(getQueryStringSpy).toHaveBeenCalledWith(window.location.search, { ignoreQueryPrefix: true });
    expect(result).toBe(false);
  });
});

describe('isQROrder', () => {
  let getQueryStringSpy;
  const originalQueryString = window.location.search;

  beforeEach(() => {
    getQueryStringSpy = jest.spyOn(qs, 'parse');
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
      },
      writable: true,
    });
  });

  afterEach(() => {
    getQueryStringSpy.mockRestore();
    Object.defineProperty(window, 'location', {
      value: {
        search: originalQueryString,
      },
      writable: true,
    });
  });

  it('should return true when shipping type is dine-in or takeaway', () => {
    Object.defineProperty(window.location, 'search', {
      value: '?type=dine-in',
      writable: true,
    });

    const dineInResult = isQROrder();
    expect(getQueryStringSpy).toHaveBeenCalledWith(window.location.search, { ignoreQueryPrefix: true });
    expect(dineInResult).toBe(true);

    Object.defineProperty(window.location, 'search', {
      value: '?type=takeaway',
      writable: true,
    });

    const takeawayResult = isQROrder();
    expect(getQueryStringSpy).toHaveBeenCalledWith(window.location.search, { ignoreQueryPrefix: true });
    expect(takeawayResult).toBe(true);
  });

  it('should return false when shipping type is not dine-in and takeaway', () => {
    Object.defineProperty(window.location, 'search', {
      value: '?type=',
      writable: true,
    });

    const result = isQROrder();
    expect(getQueryStringSpy).toHaveBeenCalledWith(window.location.search, { ignoreQueryPrefix: true });
    expect(result).toBe(false);
  });
});

describe('isProductSoldOut', () => {
  it('should return true if stockStatus is outOfStock', () => {
    const product = { stockStatus: 'outOfStock', variations: [] };
    expect(isProductSoldOut(product)).toBe(true);
  });

  it('should return true if all variations are sold out', () => {
    const product = {
      stockStatus: 'IN_STOCK',
      variations: [
        {
          variationType: 'SingleChoice',
          optionValues: [{ markedSoldOut: true }, { markedSoldOut: true }, { markedSoldOut: true }],
        },
      ],
    };
    expect(isProductSoldOut(product)).toBe(true);
  });

  it('should return false if at least one variation is not sold out', () => {
    const product = {
      stockStatus: 'IN_STOCK',
      variations: [
        {
          variationType: 'SingleChoice',
          optionValues: [{ markedSoldOut: true }, { markedSoldOut: false }, { markedSoldOut: true }],
        },
      ],
    };
    expect(isProductSoldOut(product)).toBe(false);
  });

  it('should return false if there are no variations', () => {
    const product = { stockStatus: 'IN_STOCK', variations: [] };
    expect(isProductSoldOut(product)).toBe(false);
  });
});

describe('getExpectedDeliveryDateFromSession', () => {
  const originalSessionStorage = window.sessionStorage;

  beforeEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });
  });

  it('should return an object with date and hour properties', () => {
    // Arrange
    const expectedDeliveryDate = {
      date: { date: '2023-10-23T16:00:00.000Z', isOpen: true, isToday: true },
      hour: { from: '21:00', to: '22:00' },
    };
    const sessionStorageGetItemSpy = jest.spyOn(window.sessionStorage, 'getItem');

    sessionStorageGetItemSpy.mockImplementation(key => {
      if (key === 'expectedDeliveryDate') {
        return JSON.stringify(expectedDeliveryDate.date);
      } else if (key === 'expectedDeliveryHour') {
        return JSON.stringify(expectedDeliveryDate.hour);
      }
    });

    // Act
    const result = getExpectedDeliveryDateFromSession();

    // Assert
    expect(sessionStorageGetItemSpy).toHaveBeenCalledWith('expectedDeliveryDate');
    expect(window.sessionStorage.getItem('expectedDeliveryDate')).toEqual(JSON.stringify(expectedDeliveryDate.date));
    expect(sessionStorageGetItemSpy).toHaveBeenCalledWith('expectedDeliveryHour');
    expect(window.sessionStorage.getItem('expectedDeliveryHour')).toEqual(JSON.stringify(expectedDeliveryDate.hour));
    expect(result).toEqual(expectedDeliveryDate);
    sessionStorageGetItemSpy.mockRestore();
  });

  it('should return an empty object if no session variables are set', () => {
    // Act
    const result = getExpectedDeliveryDateFromSession();
    const sessionStorageGetItemSpy = jest.spyOn(window.sessionStorage, 'getItem');

    // Assert
    expect(sessionStorageGetItemSpy).toHaveBeenCalledWith('expectedDeliveryDate');
    expect(sessionStorageGetItemSpy).toHaveBeenCalledWith('expectedDeliveryHour');
    expect(result).toEqual({ date: {}, hour: {} });
    sessionStorageGetItemSpy.mockRestore();
  });
});

describe('removeExpectedDeliveryTime', () => {
  it('should remove expectedDeliveryDate and expectedDeliveryHour from session variables', () => {
    // Set up
    window.sessionStorage.setItem('expectedDeliveryDate', '2022-01-01');
    window.sessionStorage.setItem('expectedDeliveryHour', '12:00');

    // Call function
    removeExpectedDeliveryTime();

    // Check that session variables were removed
    expect(window.sessionStorage.getItem('expectedDeliveryDate')).toBeNull();
    expect(window.sessionStorage.getItem('expectedDeliveryHour')).toBeNull();
  });
});

describe('setExpectedDeliveryTime', () => {
  it('should set expected delivery date and hour in session storage', () => {
    const date = { date: new Date('2022-01-01').toISOString(), isOpen: true, isToday: true };
    const hour = { from: '21:00', to: '22:00' };
    setExpectedDeliveryTime({ date, hour });
    expect(JSON.parse(window.sessionStorage.getItem('expectedDeliveryDate'))).toEqual(date);
    expect(JSON.parse(window.sessionStorage.getItem('expectedDeliveryHour'))).toEqual(hour);
  });
});

describe('getMerchantStoreUrl', () => {
  let business;
  let queryObject;

  beforeEach(() => {
    business = 'my-business';
    queryObject = { source: 'my-source', foo: 'bar' };
    process.env.REACT_APP_MERCHANT_STORE_URL = 'https://%business%.beep.com';
  });

  afterEach(() => {
    business = undefined;
    queryObject = undefined;
    delete process.env.REACT_APP_MERCHANT_STORE_URL;
  });

  it('returns the correct URL without query parameters', () => {
    const expectedUrl = 'https://my-business.beep.com/ordering';
    const actualUrl = getMerchantStoreUrl(business, null);
    expect(actualUrl).toEqual(expectedUrl);
  });

  it('returns the correct URL with empty query parameters', () => {
    const expectedUrl = 'https://my-business.beep.com/ordering';
    const actualUrl = getMerchantStoreUrl(business, {});
    expect(actualUrl).toEqual(expectedUrl);
  });

  it('returns the correct URL with query parameters', () => {
    const expectedUrl = 'https://my-business.beep.com/ordering/?source=my-source&foo=bar';
    const actualUrl = getMerchantStoreUrl(business, queryObject);
    expect(actualUrl).toEqual(expectedUrl);
  });

  it('returns the correct URL with encode URL in query parameters', () => {
    queryObject = { source: 'https://beepit.com', foo: 'bar' };
    const expectedUrl = `https://my-business.beep.com/ordering/?source=${encodeURIComponent(
      queryObject.source
    )}&foo=bar`;
    const actualUrl = getMerchantStoreUrl(business, queryObject);
    expect(actualUrl).toEqual(expectedUrl);
  });
});

describe('getFulfillDate', () => {
  const originalSessionStorage = window.sessionStorage;

  beforeEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });
  });

  it('should return null if expected date or expected from time is not defined', () => {
    const result = getFulfillDate();
    expect(result).toBeNull();
  });

  it('should return null if expected from time is TIME_SLOT_NOW', () => {
    const result = getFulfillDate(480);
    expect(result).toBeNull();
  });

  it('should return the expected fulfill date in ISO string format', () => {
    const businessUTCOffset = 480;
    const expectedDeliveryDateFromSession = {
      date: {
        date: '2023-11-03T08:15:52.873Z',
      },
      hour: {
        from: '10:00',
      },
    };
    const sessionStorageGetItemSpy = jest.spyOn(window.sessionStorage, 'getItem').mockImplementation(key => {
      if (key === 'expectedDeliveryDate') {
        return JSON.stringify(expectedDeliveryDateFromSession.date);
      } else if (key === 'expectedDeliveryHour') {
        return JSON.stringify(expectedDeliveryDateFromSession.hour);
      }
    });

    const result = getFulfillDate(businessUTCOffset);
    const mockFulfillDateResult = timeLib
      .setDateTime(
        expectedDeliveryDateFromSession.hour.from,
        dayjs(new Date(expectedDeliveryDateFromSession.date.date)).utcOffset(businessUTCOffset)
      )
      .toISOString();

    expect(sessionStorageGetItemSpy).toHaveBeenCalledWith('expectedDeliveryDate');
    expect(sessionStorageGetItemSpy).toHaveBeenCalledWith('expectedDeliveryHour');
    expect(result).toEqual(mockFulfillDateResult);
    sessionStorageGetItemSpy.mockRestore();
  });

  it('should return null if an error occurs', () => {
    const error = new Error('test error');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const expectedDeliveryDateFromSession = {
      date: {
        date: '2023-11-03T08:15:52.873Z',
      },
      hour: {
        from: '10:00',
      },
    };
    const sessionStorageGetItemSpy = jest.spyOn(window.sessionStorage, 'getItem').mockImplementation(key => {
      if (key === 'expectedDeliveryDate') {
        return JSON.stringify(expectedDeliveryDateFromSession.date);
      } else if (key === 'expectedDeliveryHour') {
        return JSON.stringify(expectedDeliveryDateFromSession.hour);
      }
    });
    const utcOffsetSpy = jest.spyOn(timeLib, 'setDateTime').mockImplementation(() => {
      throw error;
    });

    const result = getFulfillDate(480);

    expect(sessionStorageGetItemSpy).toHaveBeenCalledWith('expectedDeliveryDate');
    expect(sessionStorageGetItemSpy).toHaveBeenCalledWith('expectedDeliveryHour');
    expect(utcOffsetSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
    sessionStorageGetItemSpy.mockRestore();
    utcOffsetSpy.mockRestore();
  });
});

describe('getOpeningHours', () => {
  it('returns an empty array if validTimeFrom is greater than or equal to breakTimeFrom and validTimeTo is less than or equal to breakTimeTo', () => {
    const openingHours = getOpeningHours({
      breakTimeFrom: '12:00',
      breakTimeTo: '14:00',
      validTimeFrom: '13:00',
      validTimeTo: '13:30',
    });
    expect(openingHours).toEqual([]);
  });

  it('returns an array with one element if breakTimeFrom and breakTimeTo are not provided or validTimeFrom is greater than or equal to breakTimeTo or validTimeTo is less than or equal to breakTimeTo and breakTimeFrom equals breakTimeTo', () => {
    const openingHours = getOpeningHours({
      validTimeFrom: '08:00',
      validTimeTo: '18:00',
    });
    expect(openingHours).toEqual(['8:00 AM - 6:00 PM']);
  });

  it('returns an array with two elements if validTimeFrom is less than breakTimeFrom and validTimeTo is greater than breakTimeTo and breakTimeFrom does not equal breakTimeTo', () => {
    const openingHours = getOpeningHours({
      breakTimeFrom: '12:00',
      breakTimeTo: '14:00',
      validTimeFrom: '10:00',
      validTimeTo: '16:00',
    });
    expect(openingHours).toEqual(['10:00 AM - 12:00 PM', '2:00 PM - 4:00 PM']);
  });

  it('returns an array with one element if validTimeFrom is greater than or equal to breakTimeFrom and validTimeFrom is less than or equal to breakTimeTo and breakTimeTo is less than validTimeTo', () => {
    const openingHours = getOpeningHours({
      breakTimeFrom: '12:00',
      breakTimeTo: '14:00',
      validTimeFrom: '13:00',
      validTimeTo: '16:00',
    });
    expect(openingHours).toEqual(['2:00 PM - 4:00 PM']);
  });

  it('returns an array with one element if validTimeTo is less than or equal to breakTimeTo and validTimeTo is greater than or equal to breakTimeFrom and breakTimeFrom is greater than validTimeFrom', () => {
    const openingHours = getOpeningHours({
      breakTimeFrom: '12:00',
      breakTimeTo: '14:00',
      validTimeFrom: '10:00',
      validTimeTo: '13:00',
    });
    expect(openingHours).toEqual(['10:00 AM - 12:00 PM']);
  });

  it('returns an array with one element if none of the above conditions are met', () => {
    const openingHours = getOpeningHours({
      breakTimeFrom: '12:00',
      breakTimeTo: '14:00',
      validTimeFrom: '10:00',
      validTimeTo: '16:00',
    });
    expect(openingHours).toEqual(['10:00 AM - 12:00 PM', '2:00 PM - 4:00 PM']);
  });
});

describe('getCountry', () => {
  let countries;
  let defaultCountry;

  beforeEach(() => {
    countries = ['us', 'ca', 'mx'];
    defaultCountry = 'us';
  });

  afterEach(() => {
    countries = undefined;
    defaultCountry = undefined;
  });

  it('should return an empty string if phone is provided', () => {
    const result = getCountry('1234567890', 'en-US', countries, defaultCountry);
    expect(result).toEqual('');
  });

  it('should return defaultCountry if language is not provided', () => {
    expect(getCountry(null, '', countries, defaultCountry)).toEqual(defaultCountry);
    expect(getCountry(null, null, countries, defaultCountry)).toEqual(defaultCountry);
    expect(getCountry(null, undefined, countries, defaultCountry)).toEqual(defaultCountry);
  });

  it('should return undefined if language is not in the list of countries', () => {
    const result = getCountry(null, 'fr-FR', countries, defaultCountry);
    expect(result).toBeUndefined();
  });

  it('should return the language prefix as country code if language prefix is in the list of countries', () => {
    const result = getCountry(null, 'mx-es', countries, defaultCountry);
    expect(result).toEqual('MX');
  });

  it('should return the language suffix as country code if language suffix is in the list of countries', () => {
    const result = getCountry(null, 'fr-ca', countries, defaultCountry);
    expect(result).toEqual('CA');
  });
});

describe('getPhoneNumberWithCode', () => {
  let phone;
  let countryCode;

  beforeEach(() => {
    phone = '1234567890';
    countryCode = '91';
  });

  afterEach(() => {
    phone = undefined;
    countryCode = undefined;
  });

  it('should return phone if countryCode is not provided', () => {
    countryCode = undefined;
    expect(getPhoneNumberWithCode(phone, countryCode)).toEqual(phone);
  });

  it('should return phone if countryCode is empty', () => {
    countryCode = '';
    expect(getPhoneNumberWithCode(phone, countryCode)).toEqual(phone);
  });

  it('should return phone if countryCode is not in phone', () => {
    expect(getPhoneNumberWithCode(phone, countryCode)).toEqual(phone);
  });

  it('should return phone with countryCode if countryCode is in phone', () => {
    phone = '911234567890';
    expect(getPhoneNumberWithCode(phone, countryCode)).toEqual(`+${phone}`);
  });

  it('should return phone with countryCode if countryCode is in phone and phone has +', () => {
    phone = '+911234567890';
    expect(getPhoneNumberWithCode(phone, countryCode)).toEqual(phone);
  });

  it('should return phone with countryCode if countryCode is in phone and phone has extra digits', () => {
    phone = '911234567890';
    expect(getPhoneNumberWithCode(phone, countryCode)).toEqual('+911234567890');
  });
});

describe('getFullAddress', () => {
  it('should return empty string when addressInfo is empty', () => {
    const addressInfo = {};
    const splitLength = 6;
    const result = getFullAddress(addressInfo, splitLength);
    expect(result).toEqual('');
  });

  it('should return full address when splitLength is greater than the number of address keys', () => {
    const addressInfo = {
      street1: '123 Main St',
      street2: 'Apt 4',
      postalCode: '12345',
      city: 'Anytown',
      state: 'CA',
      country: 'USA',
    };
    const splitLength = 10;
    const result = getFullAddress(addressInfo, splitLength);
    expect(result).toEqual('123 Main St, Apt 4, 12345, Anytown, CA, USA');
  });

  it('should return partial address when splitLength is less than the number of address keys', () => {
    const addressInfo = {
      street1: '123 Main St',
      street2: 'Apt 4',
      postalCode: '12345',
      city: 'Anytown',
      state: 'CA',
      country: 'USA',
    };
    const splitLength = 3;
    const result = getFullAddress(addressInfo, splitLength);
    expect(result).toEqual('123 Main St, Apt 4, 12345');
  });

  it('should ignore empty address keys', () => {
    const addressInfo = {
      street1: '123 Main St',
      street2: '',
      postalCode: '12345',
      city: 'Anytown',
      state: '',
      country: 'USA',
    };
    const splitLength = 6;
    const result = getFullAddress(addressInfo, splitLength);
    expect(result).toEqual('123 Main St, 12345, Anytown, USA');
  });
});

describe('getDeliveryInfo', () => {
  it('returns default values when businessInfo is undefined', () => {
    const deliveryInfo = getDeliveryInfo(undefined);
    expect(deliveryInfo.deliveryFee).toEqual(0);
    expect(deliveryInfo.useStorehubLogistics).toBeFalsy();
    expect(deliveryInfo.minOrder).toEqual(0);
    expect(deliveryInfo.storeAddress).toEqual('');
    expect(deliveryInfo.telephone).toBeUndefined();
    expect(deliveryInfo.validDays).toBeUndefined();
    expect(deliveryInfo.validTimeFrom).toBeUndefined();
    expect(deliveryInfo.validTimeTo).toBeUndefined();
    expect(deliveryInfo.freeShippingMinAmount).toBeUndefined();
    expect(deliveryInfo.enableConditionalFreeShipping).toBeUndefined();
    expect(deliveryInfo.enableLiveOnline).toBeUndefined();
    expect(deliveryInfo.enablePreOrder).toBeUndefined();
    expect(deliveryInfo.sellAlcohol).toBeUndefined();
    expect(deliveryInfo.disableTodayPreOrder).toBeUndefined();
    expect(deliveryInfo.disableOnDemandOrder).toBeUndefined();
    expect(deliveryInfo.breakTimeFrom).toBeUndefined();
    expect(deliveryInfo.breakTimeTo).toBeUndefined();
    expect(deliveryInfo.vacations).toBeUndefined();
    expect(deliveryInfo.logisticsValidTimeFrom).toBeUndefined();
    expect(deliveryInfo.logisticsValidTimeTo).toBeUndefined();
  });

  it('returns default values when qrOrderingSettings is undefined', () => {
    const deliveryInfo = getDeliveryInfo({});
    expect(deliveryInfo.deliveryFee).toEqual(0);
    expect(deliveryInfo.useStorehubLogistics).toBeFalsy();
    expect(deliveryInfo.minOrder).toEqual(0);
    expect(deliveryInfo.storeAddress).toEqual('');
    expect(deliveryInfo.telephone).toBeUndefined();
    expect(deliveryInfo.validDays).toBeUndefined();
    expect(deliveryInfo.validTimeFrom).toBeUndefined();
    expect(deliveryInfo.validTimeTo).toBeUndefined();
    expect(deliveryInfo.freeShippingMinAmount).toBeUndefined();
    expect(deliveryInfo.enableConditionalFreeShipping).toBeUndefined();
    expect(deliveryInfo.enableLiveOnline).toBeUndefined();
    expect(deliveryInfo.enablePreOrder).toBeUndefined();
    expect(deliveryInfo.sellAlcohol).toBeUndefined();
    expect(deliveryInfo.disableTodayPreOrder).toBeUndefined();
    expect(deliveryInfo.disableOnDemandOrder).toBeUndefined();
    expect(deliveryInfo.breakTimeFrom).toBeUndefined();
    expect(deliveryInfo.breakTimeTo).toBeUndefined();
    expect(deliveryInfo.vacations).toBeUndefined();
    expect(deliveryInfo.logisticsValidTimeFrom).toBeUndefined();
    expect(deliveryInfo.logisticsValidTimeTo).toBeUndefined();
  });

  it('returns expected values when qrOrderingSettings is defined', () => {
    const businessInfo = {
      stores: [
        {
          phone: '123-456-7890',
        },
      ],
    };
    const qrOrderingSettings = {
      defaultShippingZone: {
        defaultShippingZoneMethod: {
          rate: 5,
          freeShippingMinAmount: 50,
          enableConditionalFreeShipping: true,
        },
      },
      minimumConsumption: 20,
      validDays: [1, 2, 3],
      validTimeFrom: '10:00',
      validTimeTo: '20:00',
      enableLiveOnline: true,
      enablePreOrder: true,
      sellAlcohol: true,
      disableTodayPreOrder: true,
      disableOnDemandOrder: true,
      breakTimeFrom: '12:00',
      breakTimeTo: '13:00',
      vacations: ['2022-01-01', '2022-02-01'],
      useStorehubLogistics: true,
    };
    const deliveryInfo = getDeliveryInfo({ stores: businessInfo.stores, qrOrderingSettings });
    expect(deliveryInfo.deliveryFee).toEqual(5);
    expect(deliveryInfo.useStorehubLogistics).toBeTruthy();
    expect(deliveryInfo.minOrder).toEqual(20);
    expect(deliveryInfo.storeAddress).toEqual('');
    expect(deliveryInfo.telephone).toEqual('123-456-7890');
    expect(deliveryInfo.validDays).toEqual([1, 2, 3]);
    expect(deliveryInfo.validTimeFrom).toEqual('10:00');
    expect(deliveryInfo.validTimeTo).toEqual('20:00');
    expect(deliveryInfo.freeShippingMinAmount).toEqual(50);
    expect(deliveryInfo.enableConditionalFreeShipping).toBeTruthy();
    expect(deliveryInfo.enableLiveOnline).toBeTruthy();
    expect(deliveryInfo.enablePreOrder).toBeTruthy();
    expect(deliveryInfo.sellAlcohol).toBeTruthy();
    expect(deliveryInfo.disableTodayPreOrder).toBeTruthy();
    expect(deliveryInfo.disableOnDemandOrder).toBeTruthy();
    expect(deliveryInfo.breakTimeFrom).toEqual('12:00');
    expect(deliveryInfo.breakTimeTo).toEqual('13:00');
    expect(deliveryInfo.vacations).toEqual(['2022-01-01', '2022-02-01']);
    expect(deliveryInfo.logisticsValidTimeFrom).toEqual('10:00');
    expect(deliveryInfo.logisticsValidTimeTo).toEqual('20:00');
  });

  it('uses storeHub Logistics valid time when useStorehubLogistics is true and out of valid time', () => {
    const qrOrderingSettings = {
      validTimeFrom: '08:00',
      validTimeTo: '23:00',
      useStorehubLogistics: true,
    };
    const deliveryInfo = getDeliveryInfo({ qrOrderingSettings });
    expect(deliveryInfo.logisticsValidTimeFrom).toEqual('09:00');
    expect(deliveryInfo.logisticsValidTimeTo).toEqual('21:00');
  });

  it('uses store Logistics valid time when useStorehubLogistics is true and within valid time', () => {
    const qrOrderingSettings = {
      validTimeFrom: '09:30',
      validTimeTo: '20:30',
      useStorehubLogistics: true,
    };
    const deliveryInfo = getDeliveryInfo({ qrOrderingSettings });
    expect(deliveryInfo.logisticsValidTimeFrom).toEqual('09:30');
    expect(deliveryInfo.logisticsValidTimeTo).toEqual('20:30');
  });

  it('does not use storeHub Logistics valid time when useStorehubLogistics is false', () => {
    const qrOrderingSettings = {
      validTimeFrom: '10:00',
      validTimeTo: '20:00',
      useStorehubLogistics: false,
    };
    const deliveryInfo = getDeliveryInfo({ qrOrderingSettings });
    expect(deliveryInfo.logisticsValidTimeFrom).toEqual('10:00');
    expect(deliveryInfo.logisticsValidTimeTo).toEqual('20:00');
  });
});

describe('getOrderSource', () => {
  const originalWindow = window;

  beforeEach(() => {
    Object.defineProperty(window, '_isTNGMiniProgram_', {
      value: false,
      writable: true,
    });

    Object.defineProperty(window, 'webViewSource', {
      value: null,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, '_isTNGMiniProgram_', {
      value: originalWindow._isTNGMiniProgram_,
      writable: true,
    });

    Object.defineProperty(window, 'webViewSource', {
      value: originalWindow.webViewSource,
      writable: true,
    });
  });

  it('should return TNG_MINI_PROGRAM when isTNGMiniProgram returns true', () => {
    Object.defineProperty(window, '_isTNGMiniProgram_', {
      value: true,
      writable: true,
    });
    expect(getOrderSource()).toEqual(ORDER_SOURCE.TNG_MINI_PROGRAM);
  });

  it('should return BEEP_APP when isWebview returns true', () => {
    Object.defineProperty(window, 'webViewSource', {
      value: 'iOS',
      writable: true,
    });
    expect(getOrderSource()).toEqual(ORDER_SOURCE.BEEP_APP);

    Object.defineProperty(window, 'webViewSource', {
      value: 'Android',
      writable: true,
    });
    expect(getOrderSource()).toEqual(ORDER_SOURCE.BEEP_APP);
  });

  it('should return BEEP_SITE when isFromBeepSite returns true', () => {
    const originalSessionStorage = window.sessionStorage;
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
      },
      writable: true,
    });

    process.env.REACT_APP_QR_SCAN_DOMAINS = 'beepit.co, beep.com';
    window.sessionStorage.getItem.mockReturnValueOnce('https://beep.com');
    expect(getOrderSource()).toEqual(ORDER_SOURCE.BEEP_SITE);

    delete process.env.REACT_APP_QR_SCAN_DOMAINS;
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });
  });

  it('should return BEEP_STORE when none of the conditions are met', () => {
    expect(getOrderSource()).toEqual(ORDER_SOURCE.BEEP_STORE);
  });
});

describe('getOrderSourceForCleverTap', () => {
  const originalWindow = window;

  beforeEach(() => {
    Object.defineProperty(window, '_isTNGMiniProgram_', {
      value: false,
      writable: true,
    });

    Object.defineProperty(window, 'webViewSource', {
      value: null,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, '_isTNGMiniProgram_', {
      value: originalWindow._isTNGMiniProgram_,
      writable: true,
    });

    Object.defineProperty(window, 'webViewSource', {
      value: originalWindow.webViewSource,
      writable: true,
    });
  });

  it('should return "TNG Mini Program" when order source is TNG_MINI_PROGRAM', () => {
    Object.defineProperty(window, '_isTNGMiniProgram_', {
      value: true,
      writable: true,
    });
    const result = getOrderSourceForCleverTap();
    expect(result).toBe('TNG Mini Program');
  });

  it('should return "App" when order source is iOS', () => {
    Object.defineProperty(window, 'webViewSource', {
      value: 'iOS',
      writable: true,
    });
    const result = getOrderSourceForCleverTap();
    expect(result).toBe('App');

    Object.defineProperty(window, 'webViewSource', {
      value: 'Android',
      writable: true,
    });
    const androidResult = getOrderSourceForCleverTap();
    expect(androidResult).toBe('App');
  });

  it('should return "beepit.com" when order source is BEEP_SITE', () => {
    const originalSessionStorage = window.sessionStorage;
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
      },
      writable: true,
    });

    process.env.REACT_APP_QR_SCAN_DOMAINS = 'beepit.co, beep.com';
    window.sessionStorage.getItem.mockReturnValueOnce('https://beep.com');

    const result = getOrderSourceForCleverTap();
    expect(result).toBe('beepit.com');

    delete process.env.REACT_APP_QR_SCAN_DOMAINS;
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });
  });

  it('should return "Store URL" when order source is BEEP_STORE', () => {
    const result = getOrderSourceForCleverTap();
    expect(result).toBe('Store URL');
  });
});

describe('getRegistrationTouchPoint', () => {
  const originalWindow = window;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '',
        search: '',
      },
      writable: true,
    });

    Object.defineProperty(window, '_isTNGMiniProgram_', {
      value: false,
      writable: true,
    });

    Object.defineProperty(window, 'webViewSource', {
      value: null,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalWindow.location,
      writable: true,
    });

    Object.defineProperty(window, '_isTNGMiniProgram_', {
      value: originalWindow._isTNGMiniProgram_,
      writable: true,
    });

    Object.defineProperty(window, 'webViewSource', {
      value: originalWindow.webViewSource,
      writable: true,
    });
  });

  it('returns CLAIM_CASHBACK when on cashback page', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/loyalty',
      },
      writable: true,
    });
    expect(getRegistrationTouchPoint()).toEqual('ClaimCashback');
  });

  it('returns QROrder when on QR order page', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/ordering',
        search: '?type=dine-in',
      },
      writable: true,
    });
    expect(getRegistrationTouchPoint()).toEqual('QROrder');

    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/ordering',
        search: '?type=takeaway',
      },
      writable: true,
    });
    expect(getRegistrationTouchPoint()).toEqual('QROrder');
  });

  it('returns TNG when on TNG mini program order history page', () => {
    Object.defineProperty(window, '_isTNGMiniProgram_', {
      value: true,
      writable: true,
    });
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/order-history',
      },
      writable: true,
    });
    expect(getRegistrationTouchPoint()).toEqual('TNG');
  });

  it('returns ONLINE_ORDER when on any other page', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/home',
      },
      writable: true,
    });
    expect(getRegistrationTouchPoint()).toEqual('OnlineOrder');
  });
});

describe('getRegistrationSource', () => {
  const originalWindow = window;

  beforeEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
      },
      writable: true,
    });

    Object.defineProperty(window, 'location', {
      value: {
        pathname: '',
        search: '',
      },
      writable: true,
    });

    Object.defineProperty(window, '_isTNGMiniProgram_', {
      value: false,
      writable: true,
    });

    Object.defineProperty(window, 'webViewSource', {
      value: null,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: originalWindow.sessionStorage,
      writable: true,
    });
    Object.defineProperty(window, 'location', {
      value: originalWindow.location,
      writable: true,
    });

    Object.defineProperty(window, '_isTNGMiniProgram_', {
      value: originalWindow._isTNGMiniProgram_,
      writable: true,
    });

    Object.defineProperty(window, 'webViewSource', {
      value: originalWindow.webViewSource,
      writable: true,
    });
  });

  it('returns `BeepApp` when registrationTouchPoint is `ClaimCashback` and isWebview is true', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/loyalty',
      },
      writable: true,
    });

    Object.defineProperty(window, 'webViewSource', {
      value: 'iOS',
      writable: true,
    });

    expect(getRegistrationSource()).toEqual('BeepApp');

    Object.defineProperty(window, 'webViewSource', {
      value: 'Android',
      writable: true,
    });

    expect(getRegistrationSource()).toEqual('BeepApp');
  });

  it('returns `Receipt` when registrationTouchPoint is `ClaimCashback` and isWebview is false', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/loyalty',
      },
      writable: true,
    });

    expect(getRegistrationSource()).toEqual('Receipt');
  });

  it('returns `SharedLink` when registrationTouchPoint is `QROrder` and isSharedLink is true', () => {
    const sessionStorageGetItemSpy = jest.spyOn(window.sessionStorage, 'getItem').mockImplementation(key => {
      if (key === 'BeepOrderingSource') {
        return 'SharedLink';
      }
    });
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/ordering',
        search: '?type=dine-in',
      },
      writable: true,
    });
    expect(getRegistrationSource()).toEqual('SharedLink');

    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/ordering',
        search: '?type=takeaway',
      },
      writable: true,
    });

    const result = getRegistrationSource();

    expect(sessionStorageGetItemSpy).toHaveBeenCalledWith('BeepOrderingSource');
    expect(result).toEqual('SharedLink');

    sessionStorageGetItemSpy.mockRestore();
  });

  it('returns `SharedLink` when registrationTouchPoint is `OnlineOrder` and isSharedLink is true', () => {
    const sessionStorageGetItemSpy = jest.spyOn(window.sessionStorage, 'getItem').mockImplementation(key => {
      if (key === 'BeepOrderingSource') {
        return 'SharedLink';
      }
    });

    const result = getRegistrationSource();

    expect(sessionStorageGetItemSpy).toHaveBeenCalledWith('BeepOrderingSource');
    expect(result).toEqual('SharedLink');

    sessionStorageGetItemSpy.mockRestore();
  });

  it('returns `BeepTngMiniProgram` when isTNGMiniProgram is true', () => {
    Object.defineProperty(window, '_isTNGMiniProgram_', {
      value: true,
      writable: true,
    });

    expect(getRegistrationSource()).toEqual('BeepTngMiniProgram');
  });

  it('returns `BeepApp` when isWebview is true', () => {
    Object.defineProperty(window, 'webViewSource', {
      value: 'iOS',
      writable: true,
    });
    const iOSResult = getRegistrationSource();

    expect(iOSResult).toEqual('BeepApp');

    Object.defineProperty(window, 'webViewSource', {
      value: 'Android',
      writable: true,
    });
    const AndroidResult = getRegistrationSource();

    expect(AndroidResult).toEqual('BeepApp');
  });

  it('returns `BeepSite` when isFromBeepSite is true', () => {
    process.env.REACT_APP_QR_SCAN_DOMAINS = 'beepit.com, foo.com, bar.com';
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/home',
        hostname: 'beepit.com',
      },
      writable: true,
    });
    const sessionStorageGetItemSpy = jest.spyOn(window.sessionStorage, 'getItem').mockImplementation(key => {
      if (key === 'BeepOrderingSourceUrl') {
        return 'https://beepit.com';
      }
    });
    const urlSpy = jest.spyOn(global, 'URL').mockImplementation(() => {
      return {
        hostname: 'beepit.com',
      };
    });

    const result = getRegistrationSource();

    expect(sessionStorageGetItemSpy).toHaveBeenCalledWith('BeepOrderingSourceUrl');
    expect(result).toEqual('BeepSite');
    delete process.env.REACT_APP_QR_SCAN_DOMAINS;
    sessionStorageGetItemSpy.mockRestore();
    urlSpy.mockRestore();
  });

  it('returns `BeepStore` when none of the conditions are met', () => {
    expect(getRegistrationSource()).toEqual('BeepStore');
  });
});

describe('extractDataAttributes', () => {
  it('should return an empty object when no props are passed', () => {
    const result = extractDataAttributes();
    expect(result).toEqual({});
  });

  it('should return an empty object when no data attributes are present', () => {
    const props = { foo: 'bar', baz: 'qux' };
    const result = extractDataAttributes(props);
    expect(result).toEqual({});
  });

  it('should return an object with data attributes when present', () => {
    const props = {
      'data-foo': 'bar',
      'data-baz': 'qux',
      'data-quux': 'corge',
      notData: 'grault',
    };
    const result = extractDataAttributes(props);
    expect(result).toEqual({
      'data-foo': 'bar',
      'data-baz': 'qux',
      'data-quux': 'corge',
    });
  });
});

describe('windowSize', () => {
  it('should return an object with width and height properties', () => {
    const size = windowSize();
    expect(size).toHaveProperty('width');
    expect(size).toHaveProperty('height');
  });

  it('should return the correct window size', () => {
    const size = windowSize();
    expect(size.width).toBe(window.innerWidth);
    expect(size.height).toBe(window.innerHeight);
  });
});

describe('mainTop', function() {
  it('returns 0 when no header elements are provided', () => {
    const top = mainTop({});
    expect(top).toEqual(0);
  });

  it('returns the sum of the heights of the provided header elements', () => {
    const headerEls = [{ clientHeight: 10 }, { offsetHeight: 20 }, { clientHeight: 30, offsetHeight: 40 }];
    const top = mainTop({ headerEls });
    expect(top).toEqual(60);
  });

  it('ignores null or undefined header elements', () => {
    const headerEls = [{ clientHeight: 10 }, null, { offsetHeight: 20 }, undefined, { offsetHeight: 40 }];
    const top = mainTop({ headerEls });
    expect(top).toEqual(70);
  });
});

describe('marginBottom', function() {
  it('returns 0 when footerEls is an empty array', () => {
    const bottom = marginBottom({ footerEls: [] });
    expect(bottom).toEqual(0);
  });

  it('returns the sum of the clientHeight or offsetHeight of all footerEls', () => {
    const footerEls = [{ clientHeight: 10 }, { offsetHeight: 20 }, { clientHeight: 30, offsetHeight: 40 }, null];
    const bottom = marginBottom({ footerEls });
    expect(bottom).toEqual(60);
  });

  it('ignores null or undefined footer elements', () => {
    const footerEls = [{ clientHeight: 10 }, null, { offsetHeight: 20 }, undefined, { offsetHeight: 40 }];
    const bottom = marginBottom({ footerEls });
    expect(bottom).toEqual(70);
  });
});

describe('containerHeight', function() {
  it("returns a 768px with 'px' suffix", () => {
    const result = containerHeight({ headerEls: [], footerEls: [] });
    expect(result).toBe('768px');
    expect(result.endsWith('px')).toBeTruthy();
  });

  it('calculates the container height correctly', () => {
    const headerEls = ['header1', 'header2'];
    const footerEls = ['footer1', 'footer2'];
    const expectedHeight = `${window.innerHeight - mainTop({ headerEls }) - marginBottom({ footerEls })}px`;
    expect(containerHeight({ headerEls, footerEls })).toEqual(expectedHeight);
  });
});

describe('getPrice', () => {
  it('should return the formatted price with currency', () => {
    const number = 10.99;
    const options = {
      locale: 'en-US',
      currency: 'USD',
      country: 'US',
      withCurrency: true,
    };
    const result = getPrice(number, options);
    expect(result).toEqual('$ 10.99');
  });

  it('should return the formatted price without currency', () => {
    const number = 10.99;
    const options = {
      locale: 'en-US',
      currency: 'USD',
      country: 'US',
      withCurrency: false,
    };
    const result = getPrice(number, options);
    expect(result).toEqual('10.99');
  });

  it('should return the formatted price with default locale and currency', () => {
    const number = 10.99;
    const options = {};
    const result = getPrice(number, options);
    expect(result).toEqual('10.99');
  });

  it('should return the formatted price with default locale and currency when country is not provided', () => {
    const number = 10.99;
    const options = {
      country: 'Unknown',
    };
    const result = getPrice(number, options);
    expect(result).toEqual('10.99');
  });

  it('should return the formatted price with default locale and currency when locale or currency is not provided', () => {
    const number = 10.99;
    const options = {
      locale: 'en-US',
    };
    const result = getPrice(number, options);
    expect(result).toEqual('10.99');
  });

  it('should return the formatted price with default locale and currency when locale or currency is not provided', () => {
    const number = 10.99;
    const options = {
      currency: 'USD',
    };
    const result = getPrice(number, options);
    expect(result).toEqual('10.99');
  });

  it('should return the formatted price with default locale and currency when locale and currency are not provided', () => {
    const number = 10.99;
    const options = {
      locale: undefined,
      currency: undefined,
    };
    const result = getPrice(number, options);
    expect(result).toEqual('10.99');
  });

  it('should return the formatted price with default locale and currency when locale and currency are not provided', () => {
    const number = 10.99;
    const options = {
      locale: null,
      currency: null,
    };
    const result = getPrice(number, options);
    expect(result).toEqual('10.99');
  });
});

// Generated by CodiumAI

describe('toCapitalize', () => {
  // Returns a capitalized string when given a lowercase string
  it('should return a capitalized string when given a lowercase string', () => {
    const input = 'hello';
    const expectedOutput = 'Hello';

    const result = toCapitalize(input);

    expect(result).toBe(expectedOutput);
  });

  // Returns a capitalized string when given an uppercase string
  it('should return a capitalized string when given an uppercase string', () => {
    const input = 'HELLO';
    const expectedOutput = 'HELLO';

    const result = toCapitalize(input);

    expect(result).toBe(expectedOutput);
  });

  // Returns a capitalized string when given a mixed case string
  it('should return a capitalized string when given a mixed case string', () => {
    const input = 'HeLlO';
    const expectedOutput = 'HeLlO';

    const result = toCapitalize(input);

    expect(result).toBe(expectedOutput);
  });

  // Returns an empty string when given an empty string
  it('should return an empty string when given an empty string', () => {
    const input = '';
    const expectedOutput = '';

    const result = toCapitalize(input);

    expect(result).toBe(expectedOutput);
  });

  // Returns the same string when given a single character string
  it('should return the same string when given a single character string', () => {
    const input = 'a';
    const expectedOutput = 'A';

    const result = toCapitalize(input);

    expect(result).toBe(expectedOutput);
  });

  // Returns the same input when given a number
  it('should return the same input when given a number', () => {
    const input = 123;
    const expectedOutput = 123;

    const result = toCapitalize(input);

    expect(result).toBe(expectedOutput);
  });

  // Returns the same input when given a boolean
  it('should return the same input when given a boolean', () => {
    const input = true;
    const expectedOutput = true;

    const result = toCapitalize(input);

    expect(result).toBe(expectedOutput);
  });
});
