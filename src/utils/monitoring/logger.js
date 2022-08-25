import dsBridge from 'dsbridge';
import _isEmpty from 'lodash/isEmpty';
import _isArray from 'lodash/isArray';
import _isString from 'lodash/isString';
import _isPlainObject from 'lodash/isPlainObject';
import _once from 'lodash/once';
import tids from './tracing-id';
import debug from '../debug';
import {
  guid,
  isWebview,
  isTNGMiniProgram,
  isSiteApp,
  isIOSWebview,
  isAndroidWebview,
  getBusinessName,
} from '../../common/utils';

const { REACT_APP_LOG_SERVICE_URL, REACT_APP_LOG_SERVICE_TOKEN } = process.env;

const IS_DEV_ENV = process.env.NODE_ENV === 'development';

const EVENT_LEVEL_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
};

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

const getAppPlatform = () => {
  if (isTNGMiniProgram()) {
    return 'tng-mini-program';
  }

  return isAndroidWebview() ? 'android' : isIOSWebview() ? 'ios' : 'web';
};

export const getUUID = () => {
  try {
    return crypto.randomUUID();
  } catch {
    // Our application is not mission-critical, so Broofa's answer is good enough for us as a backup plan since it is pretty slick and effective.
    return guid();
  }
};

export const getMerchantID = () => {
  if (isSiteApp()) {
    return 'beepit.com';
  }

  return getBusinessName();
};

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

  if (/\.+/.test(name)) {
    console.warn('separate words by the period mark is strongly prohibited. Please use underlines.');
    return name.replace(/\.+/g, '_');
  }

  return name;
};

const send = async data => {
  debug('[Logger]\n%o', data);

  if (!REACT_APP_LOG_SERVICE_URL || !REACT_APP_LOG_SERVICE_TOKEN) {
    return;
  }
  const body = JSON.stringify(data);

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
    if (IS_DEV_ENV) {
      throw e;
    }
  }
};

const track = async (name, data, options = {}) => {
  try {
    if (!_isPlainObject(data)) {
      throw new Error('data should be plain object');
    }

    const { level, tags } = options;
    const { sess_tid: sessTid, perm_tid: permTid } = tids;

    // NOTE: the log structure as per: https://docs.google.com/spreadsheets/d/1GxqTy_RR00qvrNKk3Np69uNYuYCghSbFtDsIj6dzsio/edit?usp=sharing
    const payload = {
      uuid: getUUID(),
      level,
      platform: 'Web',
      project: 'BeepV1Web',
      ts: new Date().valueOf(),
      action: getFormattedActionName(name),
      tags: getFormattedTags(tags),
      deviceId: getDeviceId(),
      business: getMerchantID(),
      publicData: {},
      webData: {
        sessTid,
        permTid,
        path: window.location.pathname,
        appPlatform: getAppPlatform(),
      },
      privateData: data,
    };

    send(payload);
  } catch (e) {
    console.warn(e.message);
    if (IS_DEV_ENV) {
      throw e;
    }
  }
};

const log = (name, data = {}, options = {}) => track(name, data, { level: EVENT_LEVEL_TYPES.INFO, ...options });
const warn = (name, data = {}, options = {}) => track(name, data, { level: EVENT_LEVEL_TYPES.WARNING, ...options });
const error = (name, data = {}, options = {}) => track(name, data, { level: EVENT_LEVEL_TYPES.ERROR, ...options });

export default { log, warn, error };
