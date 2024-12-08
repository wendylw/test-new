import dsBridge from 'dsbridge';
import _isEmpty from 'lodash/isEmpty';
import _isArray from 'lodash/isArray';
import _isString from 'lodash/isString';
import _isPlainObject from 'lodash/isPlainObject';
import _once from 'lodash/once';
import _get from 'lodash/get';
import Bowser from 'bowser';
import tids from './tracing-id';
import debug from '../debug';
import { isWebview, isSiteApp, getBeepAppVersion, getUUID, getQueryString } from '../../common/utils';
import { getAppPlatform, getIsDebugMode } from './utils';
import { getBusinessName } from '../../config';

const { serializeError } = require('serialize-error');

const { REACT_APP_LOG_SERVICE_URL, REACT_APP_LOG_SERVICE_TOKEN } = process.env;

const EVENT_LEVEL_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
};

const PROJECT_NAME = 'BeepV1Web';

const getDeviceId = _once(() => {
  try {
    if (!isWebview()) {
      return undefined;
    }

    const stringifyResult = dsBridge.call('callNative', { method: 'userModule-getUserInfo' });

    debug('Get deviceId from Native\nresult: %s', stringifyResult);

    const { data } = JSON.parse(stringifyResult);

    return data?.deviceId || undefined;
  } catch {
    return undefined;
  }
});

export const getMerchantID = () => {
  if (isSiteApp()) {
    return 'beepit.com';
  }

  return getBusinessName();
};

export const getClientInfo = _once(() => {
  const browserInfo = Bowser.parse(window.navigator.userAgent);

  return {
    browserName: _get(browserInfo, 'browser.name', ''),
    browserVersion: _get(browserInfo, 'browser.version', ''),
    osName: _get(browserInfo, 'os.name', ''),
    osVersion: _get(browserInfo, 'os.version', ''),
  };
});

export const getFormattedTags = tags => {
  const getCustomTags = () => {
    if (!tags) return [];

    const isTypeSupported = _isArray(tags) || _isString(tags);

    if (!isTypeSupported) {
      throw new Error('tags should be array or string!');
    }

    if (_isString(tags)) return [tags];

    return tags;
  };

  const getDefaultTags = () => {
    const tagString = (process.env.REACT_APP_LOG_SERVICE_TAG || '').replace(/ /g, '');
    return _isEmpty(tagString) ? [] : tagString.split(',');
  };

  const customTags = getCustomTags();
  const defaultTags = getDefaultTags();

  return [...customTags, ...defaultTags];
};

export const getFormattedActionName = name => {
  if (!name || typeof name !== 'string') {
    throw new Error('name should not be empty');
  }

  // For the name contains anything other than a letter, digit, or underscore, format the name and print a warning on the console.
  const regexFormatRule = /\W+/g;

  if (regexFormatRule.test(name)) {
    // eslint-disable-next-line no-console
    getIsDebugMode() && console.warn(`Illegal character in action name: ${name}`);
    return name.replace(regexFormatRule, '_');
  }

  return name;
};

export const getStringifiedJSON = data =>
  JSON.stringify(data, (_, value) => (value instanceof Error ? serializeError(value) : value));

const send = async data => {
  debug('[Logger]\n%o', data);

  if (!REACT_APP_LOG_SERVICE_URL || !REACT_APP_LOG_SERVICE_TOKEN) {
    return;
  }

  const body = getStringifiedJSON(data);

  const endpoint = `${REACT_APP_LOG_SERVICE_URL}?token=${REACT_APP_LOG_SERVICE_TOKEN}`;
  try {
    await fetch(endpoint, {
      method: 'POST',
      // content-type=text/plain can make the request a simple request and avoid to send preflight (OPTIONS) requests before the actual CORS request
      // Refer to: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#simple_requests
      headers: { 'Content-Type': 'text/plain' },
      body,
      priority: 'low',
      credentials: 'omit',
    });
  } catch (e) {
    if (getIsDebugMode()) {
      throw e;
    }
  }
};

const track = async (name, data, options = {}) => {
  try {
    // For Error type object, can ignore the plain object checking
    if (!(_isPlainObject(data) || data instanceof Error)) {
      throw new Error('data should be plain object');
    }

    const { level, tags, publicData, bizFlow, errorCategory } = options;
    const { sess_tid: sessTid, perm_tid: permTid } = tids;
    const shippingType = getQueryString('type');
    const action = getFormattedActionName(name);

    if (!(_isEmpty(publicData) || _isPlainObject(publicData))) {
      throw new Error('public data should be plain object');
    }

    // NOTE: the log structure as per: https://docs.google.com/spreadsheets/d/1GxqTy_RR00qvrNKk3Np69uNYuYCghSbFtDsIj6dzsio/edit?usp=sharing
    const payload = {
      uuid: getUUID(),
      level,
      platform: 'Web',
      project: PROJECT_NAME,
      ts: new Date().valueOf(),
      action,
      tags: getFormattedTags(tags),
      deviceId: getDeviceId(),
      business: getMerchantID(),
      publicData,
      webData: {
        sessTid,
        permTid,
        path: window.location.pathname,
        appPlatform: getAppPlatform(),
        appVersion: getBeepAppVersion(),
        beepData: {
          bizFlow,
          shippingType,
          errorCategory,
        },
        clientInfo: getClientInfo(),
      },
      privateData: {
        [PROJECT_NAME]: data,
      },
    };

    send(payload);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(e.message);
    if (getIsDebugMode()) {
      throw e;
    }
  }
};

const log = (name, data = {}, options = {}) => track(name, data, { level: EVENT_LEVEL_TYPES.INFO, ...options });
const warn = (name, data = {}, options = {}) => track(name, data, { level: EVENT_LEVEL_TYPES.WARNING, ...options });
const error = (name, data = {}, options = {}) => track(name, data, { level: EVENT_LEVEL_TYPES.ERROR, ...options });

export default { log, warn, error };
