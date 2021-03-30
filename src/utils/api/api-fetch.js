import originalKy from 'ky';
import { object } from 'prop-types';
import { isHttpSuccess, getClientSource } from './api-utils';

export const ky = originalKy.create({
  hooks: {
    // Update headers when consumer enter beep from different client
    beforeRequest: [req => req.headers.set('client', getClientSource())],
  },
  credentials: 'include',
});

async function parseResponse(resp) {
  let body;
  const rawContentType = resp.headers.get('content-type');
  if (!rawContentType) {
    return resp;
  }
  const { type } = contentType.parse(rawContentType);
  switch (type) {
    case 'application/json':
      body = await resp.json();
      break;
    case 'text/plain':
    case 'text/html':
      body = await resp.text();
      break;
    default:
      console.warn(`Unexpected content type: ${type}, will respond with raw Response object.`);
      body = resp;
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
    // const messages = ['Request failed!'];
    // if (e.message) {
    //   messages.push(`Error message: ${e.message}`);
    // }
    // if (e.response) {
    //   const body = await parseResponse(e.response);
    //   e.responseBody = body;
    //   if (typeof body === 'string') {
    //     messages.push('Response body:');
    //     messages.push(body);
    //   } else if (typeof body === 'object' && !(body instanceof window.Response)) {
    //     messages.push('Response body:');
    //     messages.push(JSON.stringify(body, null, 2));
    //   }
    // }
    console.error('Request Failed! \n', e);

    let error = {};

    if (typeof e === 'object' && e.code) {
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

  // return fetch(url, opts)
  //   .then(response => {
  //     const isJsonData = response.headers.get('Content-Type').includes('application/json');

  //     return new Promise(function (resolve, reject) {
  //       if (response.status && isHttpSuccess(response.status)) {
  //         if (isJsonData) {
  //           resolve(response.json());
  //         } else {
  //           resolve(response.text());
  //         }
  //       } else {
  //         const { code } = isJsonData ? response.json() : { code: '50000' };

  //         reject({
  //           code,
  //           status: response.status,
  //         });
  //       }
  //     });
  //   })
  //   .catch(e => {
  //     if (process.env.NODE_ENV !== 'production') {
  //       /* eslint-disable */
  //       console.log(e);
  //       /* eslint-enable */
  //     }

  //     return Promise.reject(e);
  //   });
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
