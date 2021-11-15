import originalKy from 'ky';
import qs from 'qs';
import { ERROR_MAPPING } from '../feedback';
import { getClientSource, ApiError } from './api-utils';

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

async function parseResponse(resp) {
  const rawContentType = resp.headers.get('content-type');
  let body = resp;

  if (!rawContentType) {
    /**
     * The data returned by BFF must be guaranteed to be in json format
     */
    console.warn(`Unexpected content type: ${rawContentType}, will respond with raw Response object.`);

    return body;
  }

  return await body.json();
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

/* For the new version of the response data structure, and compatible with the old interface data return */
function formatResponseData(url, result) {
  return url.startsWith('/api/v3/') && result.data ? result.data : result;
}

/**
 * @param {string} url url for the request
 * @param {object} opts : {type: '', payload: {}, headers: {}, queryParams, ...others: {credentials: ''}}
 * @param {any} options.payload data in request
 * @param {object} options.queryParams query parameters in url
 * @param {object} options.headers headers in request
 */
async function _fetch(url, opts) {
  const queryStr = qs.stringify(opts.searchParams, { addQueryPrefix: true });
  const requestStart = new Date().valueOf();
  const requestUrl = `${url}${queryStr.length === 0 ? '' : queryStr}`;
  const customEventDetail = {
    type: opts.method,
    request: requestUrl,
    requestStart,
  };

  try {
    const resp = await ky(url, opts);

    // Send log to Loggly
    window.dispatchEvent(
      new CustomEvent('sh-api-success', {
        detail: customEventDetail,
      })
    );

    return formatResponseData(url, await parseResponse(resp));
  } catch (e) {
    /**
     * error data structures:
     * {errorCode}
     * {code}
     * {errors:[{code}]}
     *  */
    let error = new ApiError('90000', 'Network error');

    if (e.response) {
      const body = await parseResponse(e.response);
      const errorBody = body.errors && body.errors[0] ? body.errors[0] : body;
      const apiErrorCode = errorBody.code || errorBody.errorCode || '50000';

      error = new ApiError(apiErrorCode, errorBody.message, {
        status: errorBody.status,
        extraInfo: errorBody.extraInfo,
        response: e.response,
        responseBody: body,
      });
    }

    // Call feedback API
    const { enableDefaultError = true } = opts || {};
    const showDefaultError =
      typeof enableDefaultError === 'function' ? enableDefaultError(error.code) || true : enableDefaultError;

    if (showDefaultError && ERROR_MAPPING[error.code]) {
      ERROR_MAPPING[error.code]();
    }

    // Send log to Loggly
    if (error.code) {
      customEventDetail.code = error.code;
    }

    window.dispatchEvent(
      new CustomEvent(e.response ? 'sh-api-failure' : 'sh-fetch-error', {
        detail: {
          ...customEventDetail,
          error: error.message,
        },
      })
    );

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
