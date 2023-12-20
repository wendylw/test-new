import Utils from './utils';
import { LocalStorageMock, SessionStorageMock } from './test.mock';
import { addressInfo } from './__fixtures__/utils.fixtures';

beforeEach(() => {
  jest.useFakeTimers();
});

describe('utils/utils', () => {
  const {
    getQueryString,
    getFilteredQueryString,
    debounce,
    getCookieVariable,
    setCookieVariable,
    removeCookieVariable,
    getLocalStorageVariable,
    setLocalStorageVariable,
    removeLocalStorageVariable,
    getSessionVariable,
    setSessionVariable,
    removeSessionVariable,
    getFormatPhoneNumber,
    DateFormatter,
    getValidAddress,
    getQueryObject,
    getUserAgentInfo,
    checkEmailIsValid,
    getFileExtension,
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

  it('getFilteredQueryString', () => {
    const mockQuery =
      '?h=U2FsdGVkX1%2FQuvwwVAwo86zaksrs1CTAp%2FtwS25fgiHhftafA8po%2Fy0SAmPH2JQc&type=delivery&source=shoppingCart';
    const oldLocation = window.location;

    delete window.location;
    window.location = {
      ...oldLocation,
      search: mockQuery,
    };

    // Test no key case
    expect(getFilteredQueryString()).toBe(mockQuery);
    // Test nonexistent case
    expect(getFilteredQueryString('')).toBe(mockQuery);
    // Test 1 key case
    expect(getFilteredQueryString('source')).toBe(
      '?h=U2FsdGVkX1%2FQuvwwVAwo86zaksrs1CTAp%2FtwS25fgiHhftafA8po%2Fy0SAmPH2JQc&type=delivery'
    );
    // Test multiple key test
    expect(getFilteredQueryString(['h', 'source'])).toBe('?type=delivery');
    // Test use different query string
    expect(
      getFilteredQueryString(
        'source',
        '?h=U2FsdGVkX19g2yqZcB3ycUaQWivvXMyIGg7nE5XUc%2Btit3ww3UbRHImfI1koRLPb&type=dine-in&source=shoppingCart'
      )
    ).toBe('?h=U2FsdGVkX19g2yqZcB3ycUaQWivvXMyIGg7nE5XUc%2Btit3ww3UbRHImfI1koRLPb&type=dine-in');
    // Reset to original state
    window.location = oldLocation;
  });

  it('queryString back to normal', () => {
    expect(window.location.search).not.toBe('?utm_source=infoq_web&utm_medium=menu');
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
    beforeEach(() => {
      global.document = {
        cookie: '',
      };
    });
    afterAll(() => {
      global.document = originGlobalDocument;
    });

    it('getCookieVariable: request key does not exist', () => {
      expect(getCookieVariable('years', 'localStorage')).toBeUndefined();
      expect(getCookieVariable('years', 'sessionStorage')).toBeUndefined();
    });

    it('setCookieVariable and getCookieVariable: sets the value of item', () => {
      setCookieVariable('years', '10', 'localStorage');
      expect(getCookieVariable('years', 'localStorage')).toBe('10');

      setCookieVariable('years', '2010', 'sessionStorage');
      expect(getCookieVariable('years', 'sessionStorage')).toBe('2010');
    });

    it('removeCookieVariable', () => {
      setCookieVariable('years', '10', 'localStorage');
      removeCookieVariable('years', 'localStorage');
      expect(getCookieVariable('years', 'localStorage')).toBeUndefined();

      setCookieVariable('years', '2010', 'sessionStorage');
      removeCookieVariable('years', 'sessionStorage');
      expect(getCookieVariable('years', 'sessionStorage')).toBeUndefined();
    });
  });

  describe('utils.localStorage', () => {
    global.localStorage = new LocalStorageMock();

    beforeEach(() => global.localStorage.clear());
    afterAll(() => {
      global.localStorage.clear();
    });

    it('getLocalStorageVariable: request key does not exist', () => {
      expect(getLocalStorageVariable('years')).toBeNull();
    });

    it('setLocalStorageVariable and getLocalStorageVariable: sets the value of item', () => {
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
    global.sessionStorage = new SessionStorageMock();

    beforeEach(() => sessionStorage.clear());
    afterAll(() => sessionStorage.clear());

    it('getSessionVariable:request key does not exist', () => {
      expect(getSessionVariable('years')).toBeNull();
    });

    it('setSessionVariable and getSessionVariable: sets the value of item', () => {
      setSessionVariable('years', '10');
      expect(getSessionVariable('years')).toBe('10');
    });

    it('removeSessionVariable', () => {
      setSessionVariable('years', '10');
      removeSessionVariable('years');
      expect(getSessionVariable('years')).toBeNull();
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

  describe('Utils.checkEmailIsValid', () => {
    it('check valid email', () => {
      expect(checkEmailIsValid('myemail@beep.com')).toBeTruthy();
      expect(checkEmailIsValid('my.email@beep.com')).toBeTruthy();
      expect(checkEmailIsValid('my-email@beep.com')).toBeTruthy();
      expect(checkEmailIsValid('my.email+beep@beep.com')).toBeTruthy();
      expect(checkEmailIsValid('my.email+beep@123.com')).toBeTruthy();
      expect(checkEmailIsValid('my-email+123@beep.com.cn')).toBeTruthy();
    });

    it('check invalid email', () => {
      expect(checkEmailIsValid('invalid@email')).toBeFalsy();
      expect(checkEmailIsValid('@email.com')).toBeFalsy();
      expect(checkEmailIsValid('invalid@')).toBeFalsy();
      expect(checkEmailIsValid('email@.com')).toBeFalsy();
    });

    it('check email is empty', () => {
      expect(checkEmailIsValid(null)).toBeFalsy();
      expect(checkEmailIsValid('')).toBeFalsy();
      expect(checkEmailIsValid()).toBeFalsy();
    });
  });

  describe('Utils.getFileExtension', () => {
    it('check get extension from file name first', () => {
      expect(
        getFileExtension({
          name: 'test.jpg',
          type: 'image/jpeg',
        })
      ).toBe('jpg');

      expect(
        getFileExtension({
          name: 'test-1-2-3.1.2.3.jpg',
          type: 'image/jpeg',
        })
      ).toBe('jpg');
    });

    it('check get extension from file type if file name not exist extension', () => {
      expect(
        getFileExtension({
          name: 'test',
          type: 'image/jpeg',
        })
      ).toBe('jpeg');
    });
  });
});
