import _isNull from 'lodash/isNull';
import _isUndefined from 'lodash/isUndefined';
import { isHttpSuccess, assembleUrl } from './api-utils';

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  // Fixed IE cache request
  Pragma: 'no-cache',
  'Cache-Control': 'no-cache',
};

function convertOptions(options) {
  const { payload, mode, method, headers, credentials = 'include', ...others } = options;
  const composeHeaders = new Headers({
    ...defaultHeaders,
    ...headers,
  });
  const currentOptions = {
    ...others,
    headers: composeHeaders,
    // include is general value. if api fetching need Cross-domain without cookie that the value needs set `omit`.
    credentials,
  };

  if (method === 'GET' || method === 'DELETE') {
    return currentOptions;
  }

  let body = '';

  if (!_isNull(payload) && !_isUndefined(payload)) {
    body = JSON.stringify(payload);
  }

  return Object.assign({}, { ...currentOptions, method }, { body });
}

/**
 * @param {*} url
 * @param {*} opts : {payload:{}, headers:{}, mode: '', ...others}
 */
function _fetch(url, opts) {
  return fetch(url, opts)
    .then(response => {
      const isJsonData = response.headers.get('Content-Type').includes('application/json');

      return new Promise(async function(resolve, reject) {
        if (response.status && isHttpSuccess(response.status)) {
          if (isJsonData) {
            resolve(response.json());
          } else {
            resolve(response.text());
          }
        } else {
          const { code } = isJsonData ? await response.json() : { code: '50000' };

          reject({
            code,
            status: response.status,
          });
        }
      });
    })
    .catch(e => {
      if (process.env.NODE_ENV !== 'production') {
        /* eslint-disable */
        console.log(e);
        /* eslint-enable */
      }

      return Promise.reject(e);
    });
}

export function get(url, options = {}) {
  const { queryParams } = options;

  return _fetch(
    assembleUrl(url, queryParams),
    convertOptions({
      ...options,
      method: 'GET',
    })
  );
}

export function post(url, options = {}) {
  const { queryParams } = options;

  return _fetch(
    assembleUrl(url, queryParams),
    convertOptions({
      ...options,
      method: 'POST',
    })
  );
}

export function put(url, options = {}) {
  const { queryParams } = options;

  return _fetch(
    assembleUrl(url, queryParams),
    convertOptions({
      ...options,
      method: 'PUT',
    })
  );
}

export function del(url, options = {}) {
  const { queryParams } = options;

  return _fetch(
    assembleUrl(url, queryParams),
    convertOptions({
      ...options,
      method: 'DELETE',
    })
  );
}
