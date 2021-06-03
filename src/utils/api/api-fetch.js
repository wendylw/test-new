import originalKy from 'ky';
import { getClientSource } from './api-utils';

export const ky = originalKy.create({
  hooks: {
    // Update headers when consumer enter beep from different client
    beforeRequest: [req => req.headers.set('client', getClientSource().name)],
    retry: {
      limit: 1,
      methods: ['get'],
      statusCodes: ['200'],
    },
  },
  credentials: 'include',
});

async function parseResponse(url, resp) {
  const rawContentType = resp.headers.get('content-type');
  let body = resp;

  if (!rawContentType) {
    return body;
  }

  if (rawContentType.includes('application/json')) {
    const respBody = await resp.json();

    body = url.startsWith('/api/v3/') && respBody.data ? respBody.data : respBody;
  } else if (['text/plain', 'text/html'].some(type => rawContentType.includes(type))) {
    body = await resp.text();
  } else {
    console.warn(`Unexpected content type: ${rawContentType}, will respond with raw Response object.`);
  }

  return body;
}

function convertOptions(options) {
  // include is general credential value. if api fetching need Cross-domain without cookie that the value needs set `omit` in others.
  const { type = 'json', payload, headers, queryParams, ...others } = options;
  const currentOptions = {
    ...others,
  };

  if (type === 'json') {
    if (payload && typeof payload !== 'object') {
      console.warn(
        `Server only accepts array or object for json request. You provide "${typeof payload}". Won't send as json.`
      );
      currentOptions.body = payload;
    } else {
      currentOptions.json = payload;
    }
  } else {
    currentOptions.body = payload;
  }

  if (queryParams) {
    currentOptions.searchParams = queryParams;
  }

  currentOptions.hooks = currentOptions.hooks || {};
  currentOptions.hooks.beforeRequest = currentOptions.hooks.beforeRequest || [];

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

  return currentOptions;
}

/**
 * @param {string} url url for the request
 * @param {object} opts : {type: '', payload: {}, headers: {}, queryParams, ...others: {credentials: ''}}
 * @param {any} options.payload data in request
 * @param {object} options.queryParams query parameters in url
 * @param {object} options.headers headers in request
 */
async function _fetch(url, opts) {
  try {
    const resp = await ky(url, opts);

    return await parseResponse(resp);
  } catch (e) {
    let error = {};

    if (e.response) {
      const body = await parseResponse(e.response);

      if (typeof body === 'object' && body.code) {
        error = body;
      } else if (typeof body === 'string' || (typeof body === 'object' && !body.code)) {
        error = {
          code: '50000',
          status: e.status,
          message: typeof body === 'string' ? body : JSON.stringify(body),
        };
      }
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

/**
 * @param {object} payload : data in request. if payload is empty but options is required, pls set payload as `undefined`
 */
export function post(url, payload, options = {}) {
  return _fetch(
    url,
    convertOptions({
      ...options,
      payload,
      method: 'post',
    })
  );
}

/**
 * @param {object} payload : data in request. if payload is empty but options is required, pls set payload as `undefined`
 */
export function put(url, payload, options = {}) {
  return _fetch(
    url,
    convertOptions({
      ...options,
      payload,
      method: 'put',
    })
  );
}

/**
 * @param {object} payload : data in request. if payload is empty but options is required, pls set payload as `undefined`
 */
export function patch(url, payload, options = {}) {
  return _fetch(
    url,
    convertOptions({
      ...options,
      payload,
      method: 'patch',
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
