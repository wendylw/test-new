import { getMerchantID, getFormattedTags, getFormattedActionName } from './logger';
import { getUUID } from '../../common/utils';

const oldWindowLocation = window.location;

beforeAll(() => {
  delete window.location;

  Object.defineProperty(window, 'location', {
    value: {
      hostname: oldWindowLocation.hostname,
    },
    writable: true,
  });
});

afterAll(() => {
  // restore `window.location` to the `jsdom` `Location` object
  window.location = oldWindowLocation;
});

describe('utils/monitoring/logger', () => {
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

  describe('get getMerchantID function', () => {
    test('return business name from merchant URL', () => {
      window.location.hostname = 'mickeymouseclubhouse.beep.test17.shub.us';
      expect(getMerchantID()).toBe('mickeymouseclubhouse');
    });
    test('from beepit.com from site URL', () => {
      window.location.hostname = 'www.beep.local.shub.us';
      expect(getMerchantID()).toBe('beepit.com');
    });
  });
});
