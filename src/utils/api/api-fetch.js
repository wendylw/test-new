import originalKy from 'ky';
import { getClientSource } from './api-utils';

export const ky = originalKy.create({
  hooks: {
    // Update headers when consumer enter beep from different client
    beforeRequest: [req => req.headers.set('client', getClientSource())],
  },
  credentials: 'include',
});

async function parseResponse(resp) {
  const rawContentType = resp.headers.get('content-type');
  let body = resp;

  if (!rawContentType) {
    return body;
  }

  if (rawContentType.includes('application/json')) {
    body = await resp.json();
  } else if (['text/plain', 'text/html'].includes(rawContentType)) {
    body = await resp.text();
  } else {
    console.warn(`Unexpected content type: ${type}, will respond with raw Response object.`);
  }

  return body;
}

function convertOptions(options) {
  const { type = 'json', payload, headers, credentials, queryParams, ...others } = options;
  const currentOptions = {
    ...others,
  };

  if (headers) {
    if (typeof headers !== 'object') {
      throw new Error('headers should be an object');
    }
    // adding headers should be at the front of the hooks, so that other hooks have chance to modify the headers.
    currentOptions.hooks.beforeRequest.unshift(req => {
      Object.keys(headers).forEach(key => {
        req.headers.set(key, headers[key]);
      });
    });
  }

  // include is general value. if api fetching need Cross-domain without cookie that the value needs set `omit`.
  if (credentials) {
    currentOptions.credentials = credentials;
  }

  if (type === 'json') {
    if (payload && typeof payload !== 'object') {
      console.warn(
        `Server only accepts array or object for json request. You provide "${typeof payload}". Won't send as json.`
      );
      currentOptions.body = payload;
    } else {
      others.json = payload;
    }
  } else {
    currentOptions.body = payload;
  }

  if (queryParams) {
    currentOptions.searchParams = queryParams;
  }

  currentOptions.hooks = others.hooks || {};
  currentOptions.hooks.beforeRequest = others.hooks.beforeRequest || [];

  return currentOptions;
}

/**
 * @param {string} url url for the request
 * @param {object} opts : {type: '', payload: {}, headers: {}, credentials: '', queryParams, ...others}
 * @param {any} options.payload data in request
 * @param {object} options.queryParams query parameters in url
 * @param {object} options.headers headers in request
 */
async function _fetch(url, opts) {
  try {
    const resp = await ky(url, opts);

    return await parseResponse(resp);
  } catch (e) {
    console.error('Request Failed! \n', e);

    let error = {};

    if (typeof e === 'object') {
      error = e;
    } else if (typeof e === 'string') {
      error = {
        code: '50000',
        status: e.status,
        message: e,
      };
    }

    throw error;
  }
}

export function get(url, options = {}) {
  return _fetch(
    url,
    convertOptions({
      ...options,
      method: 'get',
    })
  );
}

export function post(url, options = {}) {
  return _fetch(
    url,
    convertOptions({
      ...options,
      method: 'post',
    })
  );
}

export function put(url, options = {}) {
  return _fetch(
    url,
    convertOptions({
      ...options,
      method: 'put',
    })
  );
}

export function del(url, options = {}) {
  return _fetch(
    url,
    convertOptions({
      ...options,
      method: 'delete',
    })
  );
}
