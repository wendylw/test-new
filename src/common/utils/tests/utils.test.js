import qs from 'qs';
import Cookies from 'js-cookie';
import { SHIPPING_TYPES, SOURCE_TYPE } from '../constants';
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
  getUUID,
  isValidUrl,
  checkEmailIsValid,
  getFileExtension,
  copyDataToClipboard,
  getUserAgentInfo,
  getQueryString,
  getFilteredQueryString,
  getQueryObject,
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
  getOpeningHours,
} from '../index';

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
    const file = { type: 'image/jpeg' };
    expect(() => getFileExtension(file)).toThrow();
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
    process.env.REACT_APP_QR_SCAN_DOMAINS = 'beepit.co, beep.com';
    window.sessionStorage.getItem.mockReturnValueOnce('https://beep.com');
    expect(isFromBeepSite()).toBe(true);
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

    expect(isFromBeepSite()).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    console.error.mockRestore();
    Object.defineProperty(global, 'URL', {
      value: originalURL,
      writable: true,
    });
  });
});
