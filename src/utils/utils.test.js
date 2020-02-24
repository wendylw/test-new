import Utils from './utils';
import { addressInfo, soldingProduct, soldoutProduct } from './__fixtures__/utils.fixtures';

beforeEach(() => {
  jest.useFakeTimers();
});

describe('utils/utils', () => {
  const {
    getQueryString,
    isWebview,
    debounce,
    elementPartialOffsetTop,
    getCookieVariable,
    setCookieVariable,
    removeCookieVariable,
    getLocalStorageVariable,
    setLocalStorageVariable,
    removeLocalStorageVariable,
    getSessionVariable,
    setSessionVariable,
    removeSessionVariable,
    isProductSoldOut,
    getFormatPhoneNumber,
    DateFormatter,
    getValidAddress,
    creditCardDetector,
    getQueryObject,
    initSmoothAnimation,
    getUserAgentInfo,
  } = Utils;

  it('getQueryString', () => {
    const search = '?utm_source=infoq_web&utm_medium=menu';

    // --Begin-- Refer to https://github.com/facebook/jest/issues/5124 @jackharrhy
    // This one of solutions no needs to replace whole window object from JSDOM.
    const oldLocation = window.location;
    delete window.location;
    window.location = {
      ...oldLocation,
      search,
    };
    // ---End--- Refer to https://github.com/facebook/jest/issues/5124 @jackharrhy

    expect(getQueryString('utm_source')).toBe('infoq_web');
    expect(getQueryString('utm_medium')).toBe('menu');
    expect(getQueryString('not_exist')).toBeNull();

    // --Begin-- Refer to https://github.com/facebook/jest/issues/5124 @jackharrhy
    window.location = oldLocation;
    // ---End--- Refer to https://github.com/facebook/jest/issues/5124 @jackharrhy
  });

  it('queryString back to normal', () => {
    expect(window.location.search).not.toBe('?utm_source=infoq_web&utm_medium=menu');
  });

  describe('utils.isWebview', () => {
    it('isWebview:should return false', () => {
      expect(isWebview()).toBeFalsy();
    });

    it('isWebView:should return true', () => {
      const oldReactNativeWebView = window.ReactNativeWebView;
      delete window.ReactNativeWebView;
      window.ReactNativeWebView = {
        postMessage: jest.fn(),
      };
      expect(isWebview()).toBeTruthy();
      window.ReactNativeWebView = oldReactNativeWebView;
    });
  });

  it('debounce', () => {
    const mockFn = jest.fn();
    const debounced = debounce(mockFn, 1000);

    debounced();
    debounced();

    jest.runAllTimers();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  describe('utils.Cookie', () => {
    let originGlobalDocument = null;

    beforeAll(() => {
      const document = {
        cookie: '',
      };

      originGlobalDocument = global.document;
      global.document = document;
    });
    afterAll(() => {
      global.document = originGlobalDocument;
    });

    it('getCookieVariable: request key does not exist', () => {
      expect(getCookieVariable('years', 'localStorage')).toBeNull();
      expect(getCookieVariable('years', 'sessionStorage')).toBeNull();
    });

    it('setCookieVariable: sets the value of item', () => {
      setCookieVariable('years', '10', 'localStorage');
      setCookieVariable('years', '2010', 'sessionStorage');
      expect(getCookieVariable('years', 'localStorage')).toBe('10');
      expect(getCookieVariable('years', 'sessionStorage')).toBe('2010');
    });

    it('getCookieVariable: get the value of item', () => {
      setCookieVariable('years', '10', 'localStorage');
      setCookieVariable('years', '2010', 'sessionStorage');
      expect(getCookieVariable('years', 'localStorage')).toBe('10');
      expect(getCookieVariable('years', 'sessionStorage')).toBe('2010');
    });

    it('removeCookieVariable', () => {
      setCookieVariable('years', '10', 'localStorage');
      setCookieVariable('years', '2010', 'sessionStorage');
      removeCookieVariable('years', 'localStorage');
      expect(getCookieVariable('years', 'localStorage')).toBeNull();
      removeCookieVariable('years', 'sessionStorage');
      expect(getCookieVariable('years', 'sessionStorage')).toBeNull();
    });
  });

  describe('utils.localStorage', () => {
    class LocalStorageMock {
      constructor() {
        this.store = {};
      }

      clear() {
        this.store = {};
      }

      getItem(key) {
        return this.store[key] || null;
      }

      setItem(key, value) {
        this.store[key] = value.toString();
      }

      removeItem(key) {
        delete this.store[key];
      }
    }

    global.localStorage = new LocalStorageMock();

    beforeEach(() => global.localStorage.clear());
    afterAll(() => {
      global.localStorage.clear();
    });

    it('getLocalStorageVariable: request key does not exist', () => {
      expect(getLocalStorageVariable('years')).toBeNull();
    });

    it('setLocalStorageVariable: sets the value of item', () => {
      setLocalStorageVariable('years', '10');
      expect(getLocalStorageVariable('years')).toBe('10');
    });

    it('getLocalStorageVariable: get the value of item', () => {
      setLocalStorageVariable('years', '10');
      expect(getLocalStorageVariable('years')).toBe('10');
    });

    it('removeLocalStorageVariable', () => {
      setLocalStorageVariable('years', '10');
      removeLocalStorageVariable('years');
      expect(getLocalStorageVariable('years')).toBeNull();
    });
  });

  describe('utils.sessionStorage', () => {
    class sessionStorageMock {
      constructor() {
        this.store = {};
      }

      clear() {
        this.store = {};
      }

      getItem(key) {
        return this.store[key] || null;
      }

      setItem(key, value) {
        this.store[key] = value.toString();
      }

      removeItem(key) {
        delete this.store[key];
      }
    }

    global.sessionStorage = new sessionStorageMock();

    beforeEach(() => sessionStorage.clear());
    afterAll(() => sessionStorage.clear());

    it('getSessionVariable:request key does not exist', () => {
      expect(getSessionVariable('years')).toBeNull();
    });

    it('setSessionVariable: sets the value of item', () => {
      setSessionVariable('years', '10');
      expect(getSessionVariable('years')).toBe('10');
    });

    it('getSessionVariable:get the value of item', () => {
      setSessionVariable('years', '10');
      expect(getSessionVariable('years')).toBe('10');
    });

    it('removeSessionVariable', () => {
      setSessionVariable('years', '10');
      removeSessionVariable('years');
      expect(getSessionVariable('years')).toBeNull();
    });
  });

  describe('utils.isProductSoldOut', () => {
    it('isProductSoldOut: should be soldout', () => {
      expect(isProductSoldOut(soldoutProduct)).toBeTruthy();
    });

    it('isProductSoldOut: should not be soldout', () => {
      expect(isProductSoldOut(soldingProduct)).toBeFalsy();
    });
  });

  describe('utils.getFormatPhoneNumber', () => {
    it('getFormatPhoneNumber: without countryCode', () => {
      const phone = '18799998888';
      expect(getFormatPhoneNumber(phone)).toBe(phone);
    });

    it('getFormatPhoneNumber: with countryCode', () => {
      const phone = '18799998888';
      const countryCode = '86';
      expect(getFormatPhoneNumber(phone, countryCode)).toBe(phone);
    });

    it('getFormatPhoneNumber: repeat countryCode in the phone value', () => {
      const phone = '+868618799998888';
      const countryCode = '86';
      expect(getFormatPhoneNumber(phone, countryCode)).toBe('+8618799998888');
    });
  });

  it('DateFormatter', () => {
    expect(DateFormatter('15/10')).toBe('12 / 10');
    expect(DateFormatter('12/101')).toBe('12 / 10');
    expect(DateFormatter('13/993')).toBe('12 / 99');
  });

  describe('utils.creditCardDetector', () => {
    it('creditCardDetector: not digital', () => {
      const card = creditCardDetector('hello');
      expect(card.formattedCardNumber).toBe('');
    });

    it('creditCardDetector: visa', () => {
      const cardNumberString = '4111 1111 1111 1111';
      const card = creditCardDetector(cardNumberString);
      expect(card.formattedCardNumber).toBe(cardNumberString);
      expect(card.type).toBe('visa');
    });

    it('creditCardDetector: mastercard', () => {
      const cardNumberString = '5155 1111 1111 1111';
      const card = creditCardDetector(cardNumberString);
      expect(card.formattedCardNumber).toBe(cardNumberString);
      expect(card.type).toBe('mastercard');
    });
  });

  it('getQueryObject', () => {
    const search = '?utm_source=infoq_web&utm_medium=menu';
    const history = {
      location: { search },
    };
    expect(getQueryObject(history, 'utm_source')).toBe('infoq_web');
    expect(getQueryObject(history, 'not_exist')).toBeNull();
  });

  it('getValidAddress', () => {
    const rightAddress = '10 Boulevard, 47400 Jalan Kenanga, Damansara, Selangor, Malaysia., universe';
    expect(getValidAddress(addressInfo, 4)).toBe(rightAddress);
  });

  it('getUserAgentInfo: only test isMobile', () => {
    const userAgentInfo = getUserAgentInfo();
    expect(userAgentInfo.isMobile).toBeFalsy();
  });
});
