import { getMerchantID, getFormattedTags, getFormattedActionName, getFormattedPrivateDateKeyName } from './logger';
import { get as requestGet } from '../request';
import { get as apiFetchGet } from '../api/api-fetch';
import { getUUID, getAPIRequestRelativePath } from './utils';

describe('utils/monitoring/logger', () => {
  const originalWindowLocation = window.location;

  beforeAll(() => {
    delete window.location;

    Object.defineProperty(window, 'location', {
      value: {
        hostname: originalWindowLocation.hostname,
      },
      writable: true,
    });
  });

  afterAll(() => {
    // restore `window.location` to the `jsdom` `Location` object
    window.location = originalWindowLocation;
  });

  describe('test getUUID function', () => {
    // By default, window.crypto is not available on jsdom
    Object.defineProperty(window, 'crypto', {
      randomUUID() {
        return 'fce2af57-3610-48f1-bbfb-bc0d72213718';
      },
    });

    test('return uuid when window.crypto is available', () => {
      expect(getUUID()).toMatch(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
    });

    const cryptoObj = window.crypto;

    test('return uuid when window.crypto is not available', () => {
      window.crypto = undefined;
      expect(getUUID()).toMatch(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
      window.crypto = cryptoObj;
    });
  });

  describe('test getFormattedActionName function', () => {
    test('return underline-concatenated action name if the words that are separated by underlines', () => {
      expect(getFormattedActionName('location_data_continue')).toEqual('location_data_continue');
    });
    test('return underline-concatenated action name if the words that are separated by white space', () => {
      expect(getFormattedActionName('load core stores failed on location page')).toEqual(
        'load_core_stores_failed_on_location_page'
      );
    });
    test('return underline-concatenated action name if the words that are separated by period mark', () => {
      console.warn = jest.fn();
      expect(getFormattedActionName('location-data.continue')).toEqual('location_data_continue');
      expect(console.warn).toHaveBeenCalledWith('Illegal character in action name');
    });
  });

  describe('test getFormattedTags function', () => {
    test('return empty tag when both custom tag and default tags are empty', () => {
      process.env.REACT_APP_LOG_SERVICE_TAG = '';
      expect(getFormattedTags()).toEqual([]);
    });

    test('return tag when there are an empty custom tag and a default tag', () => {
      process.env.REACT_APP_LOG_SERVICE_TAG = 'beep-web';
      expect(getFormattedTags()).toEqual(['beep-web']);
    });

    test('return tags when there are an empty custom tag and default tags', () => {
      process.env.REACT_APP_LOG_SERVICE_TAG = 'beep-web,local';
      expect(getFormattedTags()).toEqual(['beep-web', 'local']);
    });

    test('return tag when there are a custom tag and an empty default tag', () => {
      process.env.REACT_APP_LOG_SERVICE_TAG = '';
      expect(getFormattedTags('test17')).toEqual(['test17']);
    });

    test('return tag when there are a custom tag and a default tag', () => {
      process.env.REACT_APP_LOG_SERVICE_TAG = 'beep-web';
      expect(getFormattedTags('test17')).toEqual(['test17', 'beep-web']);
    });

    test('return tag when there are a custom tag and default tags', () => {
      process.env.REACT_APP_LOG_SERVICE_TAG = 'beep-web,local';
      expect(getFormattedTags('test17')).toEqual(['test17', 'beep-web', 'local']);
    });

    test('return tag when there are custom tags and an empty default tag', () => {
      process.env.REACT_APP_LOG_SERVICE_TAG = '';
      expect(getFormattedTags(['test17', 'test20'])).toEqual(['test17', 'test20']);
    });

    test('return tag when there are custom tags and a default tag', () => {
      process.env.REACT_APP_LOG_SERVICE_TAG = 'beep-web';
      expect(getFormattedTags(['test17', 'test20'])).toEqual(['test17', 'test20', 'beep-web']);
    });

    test('return tag when there are custom tags and default tags', () => {
      process.env.REACT_APP_LOG_SERVICE_TAG = 'beep-web,local';
      expect(getFormattedTags(['test17', 'test20'])).toEqual(['test17', 'test20', 'beep-web', 'local']);
    });

    test('from invalid custom tag types', () => {
      process.env.REACT_APP_LOG_SERVICE_TAG = '';
      expect(() => getFormattedTags(17)).toThrowError(/^tags should be array or string!$/);
    });

    test('from default tags with redundant whitespace', () => {
      process.env.REACT_APP_LOG_SERVICE_TAG = ' beep-web, local ';
      expect(getFormattedTags()).toEqual(['beep-web', 'local']);
    });
  });

  describe('test getMerchantID function', () => {
    test('return business name from merchant URL', () => {
      window.location.hostname = 'mickeymouseclubhouse.beep.test17.shub.us';
      expect(getMerchantID()).toBe('mickeymouseclubhouse');
    });
    test('from beepit.com from site URL', () => {
      window.location.hostname = 'www.beep.local.shub.us';
      expect(getMerchantID()).toBe('beepit.com');
    });
  });

  describe('test getFormattedPrivateDateKey function', () => {
    test('return underline-concatenated private data key name if the action name is separated by underlines', () => {
      const actionName = getFormattedActionName('location_data_continue');
      expect(getFormattedPrivateDateKeyName(actionName)).toEqual('BeepV1Web_location_data_continue');
    });
    test('return underline-concatenated private data key name if the action name is separated by white space', () => {
      const actionName = getFormattedActionName('load core stores failed on location page');
      expect(getFormattedPrivateDateKeyName(actionName)).toEqual('BeepV1Web_load_core_stores_failed_on_location_page');
    });
    test('return underline-concatenated private data key name if the action name is separated by period mark', () => {
      const actionName = getFormattedActionName('google-maps-api.geocode-failure');
      expect(getFormattedPrivateDateKeyName(actionName)).toEqual('BeepV1Web_google_maps_api_geocode_failure');
    });
  });

  describe('test getAPIRequestRelativePath function', () => {
    // v2 API
    describe('test v2 APIs', () => {
      test("return '/api/ordering/stores/*' for getStoreIdHashCode url", () => {
        const getUrl = '/api/ordering/stores/62da7c6cc54471000742c9ab?a=redirectTo';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/ordering/stores/*');
      });

      test("return '/api/ordering/stores/*' for createStoreIdTableIdHashCode url", () => {
        const postUrl = '/api/ordering/stores/62da7c6cc54471000742c9ab';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/ordering/stores/*');
      });

      test("return '/api/ordering/stores/*' for postFoodCourtIdHashCode url", () => {
        const postUrl = '/api/ordering/stores/6260ddd8303ccb5ecd47e2d4';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/ordering/stores/*');
      });

      test("return '/api/consumers/*/address' for site getAddressList url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/address';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/address');
      });

      test("return '/api/consumers/*/address' for createAddress url", () => {
        const postUrl = '/api/consumers/616652c5e9bba31aeaf74789/address';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/consumers/*/address');
      });

      test("return '/api/consumers/*/profile' for updateProfileInfo url", () => {
        const putUrl = '/api/consumers/616652c5e9bba31aeaf74789/profile';
        expect(getAPIRequestRelativePath(putUrl)).toBe('/api/consumers/*/profile');
      });

      test("return '/api/consumers/*/profile' for getProfileInfo url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/profile';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/profile');
      });

      test("return '/api/consumers/*/customer' for getCustomProfileInfo url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/customer';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/customer');
      });

      test("return '/api/consumers/*/vouchers' for getCustomVoucherList url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/vouchers?';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/vouchers');
      });

      test("return '/api/consumers/*/vouchers' for getPromoInfo url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/vouchers?search=FREE&business=mickeymouseclubhouse';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/vouchers');
      });

      test("return '/api/transactions/*/status' for getV2TransactionStatus url", () => {
        const getUrl = '/api/transactions/544516540905750/status';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/transactions/*/status');
      });

      test("return '/api/consumers/*/address/*' for getUpdateDeliveryDetails url", () => {
        const putUrl = '/api/consumers/616652c5e9bba31aeaf74789/address/630dcd34d5a95bfbc12ba6b2';
        expect(getAPIRequestRelativePath(putUrl)).toBe('/api/consumers/*/address/*');
      });

      test("return '/api/consumers/*/address/*' for getUpdateAddressDetails url", () => {
        const putUrl = '/api/consumers/616652c5e9bba31aeaf74789/address/630dcd34d5a95bfbc12ba6b2';
        expect(getAPIRequestRelativePath(putUrl)).toBe('/api/consumers/*/address/*');
      });

      test("return '/api/cashback/hash/*/decode' for getDecodedHashData url", () => {
        const getUrl = '/api/cashback/hash/%2FNgSNqSiqLKugrwIw%2BrsvcGLo9AFP1KILG6SGoqi5xQ%3D%0A/decode';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/cashback/hash/*/decode');
      });

      test("return '/api/consumers/*/transactions' for getOrderHistory url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/transactions?page=1&pageSize=15';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/transactions');
      });

      test("return '/api/consumers/*/paymentMethods' for getOrderHistory url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/paymentMethods?provider=Stripe';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/paymentMethods');
      });

      test("return '/api/consumers/*/store/*/address' for ordering getAddressList url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/store/620a319b5926990007a9724c/address';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/store/*/address');
      });

      test("return '/api/consumers/*/store/*/address/*' for getDeliveryDetails url", () => {
        const getUrl =
          '/api/consumers/616652c5e9bba31aeaf74789/store/62dd8184c544710007431211/address/630dcd34d5a95bfbc12ba6b2';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/store/*/address/*');
      });

      test("return '/api/consumers/*/favorites/stores/*/status' for getStoreFavStatus url", () => {
        const getUrl = '/api/consumers/616652c5e9bba31aeaf74789/favorites/stores/5df314fce192cc5fa77c114c/status';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/consumers/*/favorites/stores/*/status');
      });

      test("return '/api/consumers/*/favorites/stores/*/status' for saveStoreFavStatus url", () => {
        const postUrl = '/api/consumers/616652c5e9bba31aeaf74789/favorites/stores/5df314fce192cc5fa77c114c/status';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/consumers/*/favorites/stores/*/status');
      });
    });

    // v3 API
    describe('test v3 APIs', () => {
      test("return '/api/v3/cart/items/*' for deleteCartItemsById url", () => {
        const deleteUrl = '/api/v3/cart/items/41bf7fdcd081bf025746b80854ba19cf?shippingType=dineIn';
        expect(getAPIRequestRelativePath(deleteUrl)).toBe('/api/v3/cart/items/*');
      });

      test("return '/api/v3/food-courts/*/stores' for getFoodCourtStoreList url", () => {
        const getUrl = '/api/v3/food-courts/6260ddd8303ccb5ecd47e2d4/stores';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/v3/food-courts/*/stores');
      });

      test("return '/api/v3/transactions/*/status' for getOrderSubmissionStatus url", () => {
        const getUrl = '/api/v3/transactions/544995588045974/status';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/v3/transactions/*/status');
      });

      test("return '/api/v3/cart/submission/*/status' for getCartSubmissionStatus url", () => {
        const getUrl = '/api/v3/cart/submission/6b90fa58-c088-4ef2-8389-1e31bed0fb3d/status';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/v3/cart/submission/*/status');
      });

      test("return '/api/v3/transactions/*/submission' for submitOrder url", () => {
        const postUrl = '/api/v3/transactions/544516157049082/submission';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/v3/transactions/*/submission');
      });

      test("return '/api/v3/transactions/*/calculation' for getOrderWithCashback url", () => {
        const getUrl = '/api/v3/transactions/544516540905750/calculation';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/v3/transactions/*/calculation');
      });

      test("return '/api/v3/transactions/*/status/cancel' for cancelOrder url", () => {
        const putUrl = '/api/v3/transactions/800861546562026/status/cancel';
        expect(getAPIRequestRelativePath(putUrl)).toBe('/api/v3/transactions/*/status/cancel');
      });

      test("return '/api/v3/transactions/*/apply-voucher' for applyVoucher url", () => {
        const postUrl = '/api/v3/transactions/544516540905750/apply-voucher';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/v3/transactions/*/apply-voucher');
      });

      test("return '/api/v3/transactions/*/remove-voucher' for applyVoucher url", () => {
        const postUrl = '/api/v3/transactions/544516540905750/remove-voucher';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/v3/transactions/*/remove-voucher');
      });

      test("return '/api/v3/transactions/*/apply-promotions' for applyPromotion url", () => {
        const postUrl = '/api/v3/transactions/544516540905750/apply-promotions';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/v3/transactions/*/apply-promotions');
      });

      test("return '/api/v3/transactions/*/remove-promotions' for removePromotion url", () => {
        const postUrl = '/api/v3/transactions/544516540905750/remove-promotions';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/v3/transactions/*/remove-promotions');
      });

      test("return '/api/v3/transactions/*/change-shipping-type' for updateOrderShippingType url", () => {
        const postUrl = '/api/v3/transactions/800488337730069/change-shipping-type';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/v3/transactions/*/change-shipping-type');
      });
    });

    // Non-wildcard API request case
    describe('test non-wildcard API request cases', () => {
      test("return '/api/gql/ProductDetail' for fetchProductDetail url", () => {
        const postUrl = '/api/gql/ProductDetail';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/gql/ProductDetail');
      });

      test("return '/api/v3/cart' for fetchShoppingCartInfo url", () => {
        const postUrl = '/api/v3/cart';
        expect(getAPIRequestRelativePath(postUrl)).toBe('/api/v3/cart');
      });
    });

    // Show warning if the path matches the wildcard patterns but is not in the pattern list
    describe('test missing wildcard pattern API request cases if it is in debug mode', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'development';
        console.warn = jest.fn();
      });

      test('return original path even it contains mongo object id', () => {
        const getUrl = '/api/mongodb/id/62da7c6cc54471000742c9ab';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/mongodb/id/62da7c6cc54471000742c9ab');
        expect(console.warn).toHaveBeenCalledTimes(1);
      });

      test('return original path even it contains UUID', () => {
        const getUrl = '/api/submission/id/6b90fa58-c088-4ef2-8389-1e31bed0fb3d';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/submission/id/6b90fa58-c088-4ef2-8389-1e31bed0fb3d');
        expect(console.warn).toHaveBeenCalledTimes(1);
      });

      test('return original path even it contains encoded hash', () => {
        const getUrl = '/api/hash/34%2FNgSNqSiqLKugrwIw%2BrsvcGLo9P1KILG6SGoqi5xQ%3D%0A';
        expect(getAPIRequestRelativePath(getUrl)).toBe(
          '/api/hash/34%2FNgSNqSiqLKugrwIw%2BrsvcGLo9P1KILG6SGoqi5xQ%3D%0A'
        );
        expect(console.warn).toHaveBeenCalledTimes(1);
      });

      test('return original path even it contains null value', () => {
        const getUrl = '/api/v3/submission/null/status';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/v3/submission/null/status');
        expect(console.warn).toHaveBeenCalledTimes(1);
      });
    });

    // Hide warning even if the path matches the wildcard patterns but is not in the pattern list
    describe('test missing wildcard pattern API request cases if it is in production mode', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production';
        console.warn = jest.fn();
      });

      test('return original path even it contains mongo object id', () => {
        const getUrl = '/api/mongodb/id/62da7c6cc54471000742c9ab';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/mongodb/id/62da7c6cc54471000742c9ab');
        expect(console.warn).toHaveBeenCalledTimes(0);
      });

      test('return original path even it contains UUID', () => {
        const getUrl = '/api/submission/id/6b90fa58-c088-4ef2-8389-1e31bed0fb3d';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/submission/id/6b90fa58-c088-4ef2-8389-1e31bed0fb3d');
        expect(console.warn).toHaveBeenCalledTimes(0);
      });

      test('return original path even it contains encoded hash', () => {
        const getUrl = '/api/hash/34%2FNgSNqSiqLKugrwIw%2BrsvcGLo9P1KILG6SGoqi5xQ%3D%0A';
        expect(getAPIRequestRelativePath(getUrl)).toBe(
          '/api/hash/34%2FNgSNqSiqLKugrwIw%2BrsvcGLo9P1KILG6SGoqi5xQ%3D%0A'
        );
        expect(console.warn).toHaveBeenCalledTimes(0);
      });

      test('return original path even it contains null value', () => {
        const getUrl = '/api/v3/submission/null/status';
        expect(getAPIRequestRelativePath(getUrl)).toBe('/api/v3/submission/null/status');
        expect(console.warn).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('test public data httpInfo payload', () => {
    const originalFetch = global.fetch;

    beforeAll(() => {
      global.fetch = fetch;
    });

    afterEach(() => {
      fetch.resetMocks();
      jest.restoreAllMocks();
    });

    afterAll(() => {
      global.fetch = originalFetch;
    });

    test('check sh-api-success payload from request module', async () => {
      fetch.mockResponseOnce(JSON.stringify({ login: true }));
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      await requestGet('api/ping').catch(() => {});
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe('sh-api-success');
      expect(dispatchEventSpy.mock.calls[0][0].detail).toMatchObject({
        request: 'api/ping',
        type: 'get',
        status: 200,
      });
    });

    test('check sh-fetch-error payload from request module', async () => {
      fetch.mockRejectOnce(new TypeError('Type Error'));
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      await requestGet('api/ping').catch(() => {});
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe('sh-fetch-error');
      expect(dispatchEventSpy.mock.calls[0][0].detail).toMatchObject({
        type: 'get',
        request: 'api/ping',
        error: 'Type Error',
      });
    });

    test('check HTTP status 400 payload from request module', async () => {
      fetch.mockResponseOnce(JSON.stringify({ code: 40005, message: 'No business' }), { status: 400 });
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      await requestGet('api/login').catch(() => {});
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe('sh-api-failure');
      expect(dispatchEventSpy.mock.calls[0][0].detail).toMatchObject({
        type: 'get',
        request: 'api/login',
        error: 'No Business',
        code: '40005',
        status: 400,
      });
    });

    test('check invalid HTTP status 400 payload from request module', async () => {
      fetch.mockResponseOnce({ code: 500, message: 'Server error' }, { status: 500 });
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      await requestGet('api/login').catch(() => {});
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe('sh-api-failure');
      expect(dispatchEventSpy.mock.calls[0][0].detail).toMatchObject({
        type: 'get',
        request: 'api/login',
        error: 'invalid json response body at  reason: Unexpected token o in JSON at position 1',
        code: '99999',
        status: 500,
      });
    });

    test('check HTTP status 401 payload from request module', async () => {
      fetch.mockResponseOnce(JSON.stringify({ code: 401, message: 'Token Expired' }), { status: 401 });
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      await requestGet('api/login').catch(() => {});
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe('sh-api-failure');
      expect(dispatchEventSpy.mock.calls[0][0].detail).toMatchObject({
        type: 'get',
        request: 'api/login',
        error: 'Token Expired',
        code: '401',
        status: 401,
      });
    });

    test('check invalid HTTP status 401 payload from request module', async () => {
      fetch.mockResponseOnce({ code: 401, message: 'Server error' }, { status: 401 });
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      await requestGet('api/login').catch(() => {});
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe('sh-api-failure');
      expect(dispatchEventSpy.mock.calls[0][0].detail).toMatchObject({
        type: 'get',
        request: 'api/login',
        error: 'invalid json response body at  reason: Unexpected token o in JSON at position 1',
        code: '99999',
        status: 401,
      });
    });

    test('check sh-api-success HTTP 200 payload from api-fetch module', async () => {
      fetch.mockResponse(
        JSON.stringify({
          code: 10000,
          message: 'OK',
          description: 'OK',
          pagination: null,
          data: {
            addressInfo: {
              savedAddressId: '62ff6243036cf415336581a9',
              shortName: 'Pavilion Shopping Centre',
              fullName:
                'Pavilion Kuala Lumpur, Bukit Bintang Street, Bukit Bintang, Kuala Lumpur, Federal Territory of Kuala Lumpur, Malaysia',
              coords: {
                lat: 3.148855799999999,
                lng: 101.7132547,
              },
              city: 'Kuala Lumpur',
              postCode: '55100',
              countryCode: 'MY',
            },
          },
          extra: null,
        })
      );
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      await apiFetchGet('api/v3/storage/selected-address');
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe('sh-api-success');
      expect(dispatchEventSpy.mock.calls[0][0].detail).toMatchObject({
        request: 'api/v3/storage/selected-address',
        type: 'get',
        status: 200,
      });
    });

    test('check sh-api-success HTTP 201 payload from api-fetch module', async () => {
      fetch.mockResponse(
        JSON.stringify({
          code: 10000,
          message: 'OK',
          description: 'OK',
          pagination: null,
          data: null,
          extra: null,
        }),
        {
          status: 201,
        }
      );
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      await apiFetchGet('api/v3/storage/selected-address');
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe('sh-api-success');
      expect(dispatchEventSpy.mock.calls[0][0].detail).toMatchObject({
        request: 'api/v3/storage/selected-address',
        type: 'get',
        status: 201,
      });
    });

    test('check sh-api-failure payload from api-fetch module with custom error code', async () => {
      fetch.mockResponse(JSON.stringify({ code: 40000, message: 'Service Unavailable' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      await apiFetchGet('api/v3/storage/selected-address').catch(() => {});
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe('sh-api-failure');
      expect(dispatchEventSpy.mock.calls[0][0].detail).toMatchObject({
        type: 'get',
        request: 'api/v3/storage/selected-address',
        code: '40000',
        error: 'Service Unavailable',
        status: 500,
      });
    });

    test('check sh-api-failure payload from api-fetch module without custom error code', async () => {
      fetch.mockResponse(JSON.stringify({ message: 'Service Unavailable' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      await apiFetchGet('api/v3/storage/selected-address').catch(() => {});
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe('sh-api-failure');
      expect(dispatchEventSpy.mock.calls[0][0].detail).toMatchObject({
        type: 'get',
        request: 'api/v3/storage/selected-address',
        code: '99999',
        error: '{"message":"Service Unavailable"}',
        status: 500,
      });
    });

    test('check sh-fetch-error payload from api-fetch module', async () => {
      fetch.mockReject(new Error('Unknown Error'), { status: 500 });
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      await apiFetchGet('api/v3/storage/selected-address').catch(() => {});
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      expect(dispatchEventSpy.mock.calls[0][0].type).toBe('sh-fetch-error');
      expect(dispatchEventSpy.mock.calls[0][0].detail).toMatchObject({
        type: 'get',
        request: 'api/v3/storage/selected-address',
        error: 'Unknown Error',
      });
    });
  });
});
