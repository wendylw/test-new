import tids from './tracing-id';
import _isPlainObject from 'lodash/isPlainObject';
import businessName from '../business-name';
import Utils from '../utils';
import debug from '../debug';
const { REACT_APP_LOGGLY_SERVICE_URL, REACT_APP_LOGGLY_TOKEN, REACT_APP_LOGGLY_TAG } = process.env;

const IS_DEV_ENV = process.env.NODE_ENV === 'development';

const getAppPlatform = () => {
  return Utils.isAndroidWebview() ? 'android' : Utils.isIOSWebview() ? 'ios' : 'web';
};

const send = async (data, tags = '') => {
  const body = JSON.stringify(data);

  debug(`[LOGGLY] %s`, body);

  if (!REACT_APP_LOGGLY_SERVICE_URL || !REACT_APP_LOGGLY_TOKEN || !REACT_APP_LOGGLY_TAG) {
    return;
  }
  const endpoint = `${REACT_APP_LOGGLY_SERVICE_URL}/inputs/${REACT_APP_LOGGLY_TOKEN}/tag/${REACT_APP_LOGGLY_TAG.replace(
    / /g,
    ''
  )}${tags && `,${tags}`}/`;

  const headers = new Headers({ 'Content-Type': 'application/json' });

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers,
      body,
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
      data,
    };
    // todo: business name, page url, user agent, env, client timestamp, ...
    dataToSend.level = meta.level || 'info';

    let tags = meta.tags ? (Array.isArray(meta.tags) ? meta.tags.join('') : meta.tags) : '';
    if (tags && !/^\w+(,\w+)?$/.test(tags)) {
      throw new Error('Incorrect loggly tags format');
    }
    return send(dataToSend, tags);
  } catch (e) {
    console.warn(e.message);
    if (IS_DEV_ENV) {
      throw e;
    }
  }
};

export const log = async (name, data = {}, meta = {}) => {
  return track(name, data, { level: 'info', ...meta });
};
export const warn = async (name, data = {}, meta = {}) => {
  return track(name, data, { level: 'warning', ...meta });
};
export const error = async (name, data = {}, meta = {}) => {
  return track(name, data, { level: 'error', ...meta });
};

export default { log, warn, error };