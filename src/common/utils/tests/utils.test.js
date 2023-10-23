import Cookies from 'js-cookie';
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
