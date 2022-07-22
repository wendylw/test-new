import dsBridge from 'dsbridge';
import _isPlainObject from 'lodash/isPlainObject';
import _once from 'lodash/once';
import tids from './tracing-id';
import businessName from '../business-name';
import Utils from '../utils';
import debug from '../debug';

const { REACT_APP_LOG_SERVICE_TAG, REACT_APP_LOG_SERVICE_URL, REACT_APP_LOG_SERVICE_TOKEN } = process.env;

const IS_DEV_ENV = process.env.NODE_ENV === 'development';

const getDeviceId = _once(() => {
  try {
    if (!Utils.isWebview()) {
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
  if (Utils.isTNGMiniProgram()) {
    return 'tng-mini-program';
  }

  return Utils.isAndroidWebview() ? 'android' : Utils.isIOSWebview() ? 'ios' : 'web';
};

const send = async (data, tags = '') => {
  debug('[Logger]\n%o', data);

  if (!REACT_APP_LOG_SERVICE_URL || !REACT_APP_LOG_SERVICE_TOKEN) {
    return;
  }
  const tagString = `${(REACT_APP_LOG_SERVICE_TAG || '').replace(/ /g, '')}${tags && `,${tags}`}`;
  const tagArray = tagString ? tagString.split(',') : [];
  const body = JSON.stringify({
    ...data,
    tags: tagArray,
  });
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

const track = async (name, data, meta = {}) => {
  try {
    if (!name || typeof name !== 'string') {
      throw new Error('name should not be empty');
    }
    if (!_isPlainObject(data)) {
      throw new Error('data should be plain object');
    }

    const dataToSend = {
      ...tids,
      business: businessName || 'beepit.com', // fixme: there's some problem with the domain starts with 'scan'
      action: name,
      path: window.location.pathname,
      app_plt: getAppPlatform(),
      ts: new Date().valueOf(),
      deviceId: getDeviceId(),
      data,
    };
    // todo: business name, page url, user agent, env, client timestamp, ...
    dataToSend.level = meta.level || 'info';

    const tags = meta.tags ? (Array.isArray(meta.tags) ? meta.tags.join(',') : meta.tags) : '';
    if (tags && !/^\w+(,\w+)?$/.test(tags)) {
      throw new Error('Incorrect log tags format');
    }

    send(dataToSend, tags);
  } catch (e) {
    console.warn(e.message);
    if (IS_DEV_ENV) {
      throw e;
    }
  }
};

const log = (name, data = {}, meta = {}) => track(name, data, { level: 'info', ...meta });
const warn = (name, data = {}, meta = {}) => track(name, data, { level: 'warning', ...meta });
const error = (name, data = {}, meta = {}) => track(name, data, { level: 'error', ...meta });

export default { log, warn, error };
