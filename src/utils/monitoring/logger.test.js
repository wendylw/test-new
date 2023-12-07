/* eslint-disable dot-notation */
import { getMerchantID, getFormattedTags, getFormattedActionName, getStringifiedJSON } from './logger';
import { get as requestGet } from '../request';
import { get as apiFetchGet } from '../api/api-fetch';
import RequestError from '../api/request-error';
import { NativeAPIError } from '../native-methods';

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

  describe('test getFormattedActionName function', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterAll(() => {
      // Reset
      process.env.NODE_ENV = originalNodeEnv;
    });

    describe('show warning if it is development mode', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'development';
        console.warn = jest.fn();
      });

      test('return underline-concatenated action name if the words that are separated by underlines', () => {
        expect(getFormattedActionName('location_data_continue')).toEqual('location_data_continue');
      });

      test('return underline-concatenated action name if the words that are separated by white space', () => {
        expect(getFormattedActionName('load core stores failed on location page')).toEqual(
          'load_core_stores_failed_on_location_page'
        );
        expect(console.warn).toHaveBeenCalledTimes(1);
      });

      test('return underline-concatenated action name if the words that are separated by period mark', () => {
        expect(getFormattedActionName('location-data.continue')).toEqual('location_data_continue');
        expect(console.warn).toHaveBeenCalledTimes(1);
      });
    });

    describe('hide warning if it is production mode', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production';
        console.warn = jest.fn();
      });

      test('return underline-concatenated action name if the words that are separated by underlines', () => {
        expect(getFormattedActionName('location_data_continue')).toEqual('location_data_continue');
      });

      test('return underline-concatenated action name if the words that are separated by white space', () => {
        expect(getFormattedActionName('load core stores failed on location page')).toEqual(
          'load_core_stores_failed_on_location_page'
        );
        expect(console.warn).toHaveBeenCalledTimes(0);
      });

      test('return underline-concatenated action name if the words that are separated by period mark', () => {
        expect(getFormattedActionName('location-data.continue')).toEqual('location_data_continue');
        expect(console.warn).toHaveBeenCalledTimes(0);
      });
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
      window.location.hostname = 'beepit.co';
      process.env.REACT_APP_QR_SCAN_DOMAINS = 'beepit.co,www.beepit.co,beepit.com,www.beepit.com';

      expect(getMerchantID()).toBe('beepit.com');

      delete process.env.REACT_APP_QR_SCAN_DOMAINS;
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
        error: 'Request failed with status code 500 Internal Server Error',
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

  describe('test getStringifiedJSON function', () => {
    const payload = {
      uuid: 'c90528b7-2412-427f-ab9f-396d132af7e0',
      level: 'info',
      platform: 'Web',
      project: 'BeepV1Web',
      ts: 1662012968975,
      action: 'Common_HttpRequest',
      tags: ['beep-web', 'test'],
      business: 'mickeymouseclubhouse',
      publicData: {
        httpInfo: {
          result: 'Succeed',
          method: 'get',
          url: '/api/v3/storage/selected-address',
          path: '/api/v3/storage/selected-address',
          responseTime: 706,
          httpStatusCode: 200,
        },
      },
      webData: {
        sessTid: 'trnowCjfNo93cNxRm27Mhx',
        permTid: 'bYnsS5JXu2AbTqT8B4bVKk',
        path: '/ordering/',
        appPlatform: 'web',
      },
      privateData: {},
    };

    beforeEach(() => {
      payload.privateData = {};
    });

    test('return value should be the same if no private data', () => {
      expect(getStringifiedJSON(payload)).toEqual(JSON.stringify(payload));
    });

    test("return value should be the same if the private data doesn't contain any error", () => {
      payload.privateData['BeepV1Web_common_page_navigation'] = {
        type: 'pageloaded',
        query: '?type=delivery',
      };

      expect(getStringifiedJSON(payload)).toEqual(JSON.stringify(payload));
    });

    describe('return value should have error info if the private data contains error', () => {
      describe('private data is Error type', () => {
        test('return value should have error info if the private data contains native error', () => {
          payload.privateData['BeepV1Web_common_error'] = new Error('Unexpected error');

          const stringifiedJSON = getStringifiedJSON(payload);
          expect(JSON.parse(stringifiedJSON)).toMatchObject({
            ...payload,
            privateData: {
              BeepV1Web_common_error: {
                message: 'Unexpected error',
                name: 'Error',
              },
            },
          });
        });

        test('return value should have error info if the private data contains custom error (with toJSON getter)', () => {
          payload.privateData['BeepV1Web_native_error'] = new NativeAPIError('JSON parse error');

          const stringifiedJSON = getStringifiedJSON(payload);
          expect(JSON.parse(stringifiedJSON)).toMatchObject({
            ...payload,
            privateData: {
              BeepV1Web_native_error: {
                code: 'B0001',
                message: 'JSON parse error',
              },
            },
          });
        });

        test('return value should have error info if the private data contains custom error (without toJSON getter)', () => {
          payload.privateData['BeepV1Web_native_error'] = new RequestError('API request error', {});

          const stringifiedJSON = getStringifiedJSON(payload);
          expect(JSON.parse(stringifiedJSON)).toMatchObject({
            ...payload,
            privateData: {
              BeepV1Web_native_error: {
                name: 'Error',
                message: 'API request error',
              },
            },
          });
        });
      });

      describe('private data contains Error field', () => {
        test('return value should have error info if the field contains native error', () => {
          payload.privateData['BeepV1Web_common_error'] = new Error('Unexpected error');

          const stringifiedJSON = getStringifiedJSON(payload);
          expect(JSON.parse(stringifiedJSON)).toMatchObject({
            ...payload,
            privateData: {
              BeepV1Web_common_error: {
                message: 'Unexpected error',
                name: 'Error',
              },
            },
          });
        });

        test('return value should have error info if the field contains custom error (with toJSON getter)', () => {
          payload.privateData['BeepV1Web_native_error'] = {
            method: 'get-address',
            e: new NativeAPIError('JSON parse error'),
          };

          const stringifiedJSON = getStringifiedJSON(payload);
          expect(JSON.parse(stringifiedJSON)).toMatchObject({
            ...payload,
            privateData: {
              BeepV1Web_native_error: {
                method: 'get-address',
                e: {
                  code: 'B0001',
                  message: 'JSON parse error',
                },
              },
            },
          });
        });

        test('return value should have error info if the field contains custom error (without toJSON getter)', () => {
          payload.privateData['BeepV1Web_payment_error'] = {
            paymentMethod: 'Stripe',
            e: new RequestError('API request error', {}),
          };

          const stringifiedJSON = getStringifiedJSON(payload);
          expect(JSON.parse(stringifiedJSON)).toMatchObject({
            ...payload,
            privateData: {
              BeepV1Web_payment_error: {
                paymentMethod: 'Stripe',
                e: {
                  name: 'Error',
                  message: 'API request error',
                },
              },
            },
          });
        });
      });
    });
  });
});
