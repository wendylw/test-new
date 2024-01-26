import originalKy from 'ky';
import qs from 'qs';
import Utils from '../utils';
import ApiFetchError from './api-fetch-error';
import { ERROR_TYPES } from './constants';
import logger from '../monitoring/logger';

const ky = originalKy.create({
  hooks: {
    // Update headers when consumer enter beep from different client
    beforeRequest: [req => req.headers.set('client', Utils.getClient())],
  },
  // TODO: There is a RETRY strategy in ky, but it might not work well with our use case.
  // Need to monitor it and decide whether to use it.
  // Reference: https://github.com/sindresorhus/ky#retry
  credentials: 'include',
});

/**
 *
 * @param {object} response : {headers: '', json: () => {}, text: () => {}}
 * @returns {{data: {}} | dataObject}
 */
async function parseResponse(response) {
  const rawContentType = response.headers.get('content-type');
  let body = response;

  if (rawContentType.includes('application/json')) {
    body = await response.json();
  } else if (['text/plain', 'text/html'].some(type => rawContentType.includes(type))) {
    body = await response.text();
  } else {
    logger.error('Tool_ApiFetch_parseResponseError', {
      message: `Unexpected content type: ${rawContentType}, will respond with raw Response object.`,
    });
  }

  return body;
}

/**
 *
 * @param {string} eventName
 * @param {string} url
 * @param {object} opts : {searchParams: string; method: string}
 * @param {object} extraDetail
 */
function windowDispatchEvent(eventName, url, opts, extraDetail) {
  const queryStr = qs.stringify(opts.searchParams, { addQueryPrefix: true });
  const requestStart = new Date().valueOf();
  const requestUrl = queryStr.length === 0 ? url : `${url}${queryStr}`;
  const detail = {
    type: opts.method,
    request: requestUrl,
    requestStart,
    ...extraDetail,
  };

  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

/**
 * @param {string} url url for the request
 * @param {object} opts : {type: '', payload: {}, headers: {}, queryParams, ...others: {credentials: ''}}
 * @param {any} options.payload data in request
 * @param {object} options.queryParams query parameters in url
 * @param {object} options.headers headers in request
 */
// eslint-disable-next-line no-underscore-dangle
async function _fetch(url, opts) {
  try {
    // Response will throw HTTPError, if response status is not in the range of 200...299: https://github.com/sindresorhus/ky#kyinput-options
    const response = await ky(url, opts);
    const parsedResponseData = await parseResponse(response);
    // Not v3 api will return {data: {}} as response data, so no need to extract the data
    const result = url.startsWith('/api/v3/') && parsedResponseData.data ? parsedResponseData.data : parsedResponseData;

    // Send log to Log service
    windowDispatchEvent('sh-api-success', url, opts, { status: response.status });

    return result;
  } catch (error) {
    if (!error.response) {
      // Send log to Log service
      windowDispatchEvent('sh-fetch-error', url, opts, { error: error?.message || '' });

      let category = '';
      if (error.name === 'AbortError') {
        category = ERROR_TYPES.ABORT_ERROR;
      } else if (error.name === 'TimeoutError') {
        category = ERROR_TYPES.TIMEOUT_ERROR;
      }
      const errorOptions = {
        category: category || ERROR_TYPES.NETWORK_ERROR,
      };
      throw new ApiFetchError(error?.message, errorOptions);
    }

    const { response, message: apiMessage } = error;
    const { status } = response;
    const errorBody = await parseResponse(response);
    const { message, code, extra, extraInfo, error: apiUnknownError } =
      typeof errorBody === 'object' && errorBody ? errorBody : {};
    const errorMessage = code ? message : apiMessage;
    const errorOptions = {
      category: ERROR_TYPES.UNKNOWN_ERROR,
      code: code || '50000',
      status,
      extra,
      extraInfo,
      error: apiUnknownError,
    };

    if (status >= 400 && status < 499) {
      errorOptions.category = ERROR_TYPES.BAD_REQUEST_ERROR;
    } else if (status >= 500 && status < 599) {
      errorOptions.category = ERROR_TYPES.SERVER_ERROR;
    }

    // Send log to Log service
    windowDispatchEvent('sh-api-failure', url, opts, {
      code: code ? code.toString() : '99999',
      error: errorMessage,
      status,
    });

    console.log('errorMessage', errorMessage);
    console.log('errorOptions', errorOptions);

    throw new ApiFetchError(errorMessage, errorOptions);
  }
}

/**
 *
 * @param {object} options : {type = 'json', payload, headers, queryParams, ...othersOptions}
 * @returns {{
 *  body | json: any | json string,
 *  searchParams: string,
 *  hooks: {
 *    beforeRequest: Function[]
 *  },
 *  headers: object
 * }}
 */
function convertOptions(options) {
  // include is general credential value. if api fetching need Cross-domain without cookie that the value needs set `omit` in others.
  const { type = 'json', payload, headers, queryParams, hooks, ...others } = options;

  if (headers && typeof headers !== 'object') {
    logger.error('Tool_ApiFetch_convertOptionsHeaderTypeError', {
      message: 'headers should be an object',
    });

    throw new ApiFetchError('requestHeadersNotObject', { category: ERROR_TYPES.PARAMETER_ERROR });
  }

  const currentHooks = hooks || {};
  const currentOptions = {
    ...others,
    hooks: {
      ...currentHooks,
      beforeRequest: currentHooks.beforeRequest || [],
    },
  };

  if (type === 'json') {
    if (payload && typeof payload !== 'object') {
      logger.error('Tool_ApiFetch_convertOptionsTypePayloadNotMatch', {
        message: `Server only accepts array or object for json request. You provide "${typeof payload}". Won't send as json.`,
      });

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

  if (headers) {
    // adding headers should be at the front of the hooks, so that other hooks have chance to modify the headers.
    currentOptions.hooks.beforeRequest.unshift(req => {
      Object.keys(headers).forEach(key => {
        req.headers.set(key, headers[key]);
      });
    });
  }

  return currentOptions;
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
