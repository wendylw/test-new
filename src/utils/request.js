import Constants from './constants';
import Utils from './utils';
import { ERROR_MAPPING } from './feedback.js';

const { REQUEST_ERROR_KEYS } = Constants;
const headers = new Headers({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  client: Utils.getHeaderClient(),
});

const MAINTENANCE_PAGE_URL = process.env.REACT_APP_MAINTENANCE_PAGE_URL;
class RequestError extends Error {
  constructor(message, code, extraInfo) {
    super();

    this.message = message;
    this.code = code;
    this.extraInfo = extraInfo;
  }
}

function get(url, options = {}) {
  const requestStart = new Date().valueOf();
  return fetch(url, {
    headers,
    credentials: 'include',
    ...options,
    method: 'GET',
  })
    .then(response => {
      // NOTE: to make the redirection work, the maintenance page must support CORS, and the Access-Control-Allow-Origin
      // must be the same as the request's origin (cannot be *).
      if (MAINTENANCE_PAGE_URL && response.redirected === true && response.url.startsWith(MAINTENANCE_PAGE_URL)) {
        window.location = response.url;
      }
      return handleResponse(url, response, 'get', requestStart, options.options);
    })
    .catch(error => {
      if (error instanceof TypeError) {
        window.dispatchEvent(
          new CustomEvent('sh-fetch-error', {
            detail: {
              type: 'get',
              request: url,
              error: error.message,
              requestStart,
            },
          })
        );
      }
      return Promise.reject(error);
    });
}

const fetchData = function(url, requestOptions) {
  const requestStart = new Date().valueOf();
  const { method, data, options } = requestOptions;
  return fetch(url, {
    method,
    headers: headers,
    credentials: options && options.mode ? 'omit' : 'include',
    body: JSON.stringify(data),
    ...options,
  })
    .then(response => {
      // NOTE: to make the redirection work, the maintenance page must support CORS, and the Access-Control-Allow-Origin
      // must be the same as the request's origin (cannot be *).
      if (MAINTENANCE_PAGE_URL && response.redirected === true && response.url.startsWith(MAINTENANCE_PAGE_URL)) {
        window.location = response.url;
      }
      return handleResponse(url, response, method.toLowerCase(), requestStart, options);
    })
    .catch(error => {
      if (error instanceof TypeError) {
        window.dispatchEvent(
          new CustomEvent('sh-fetch-error', {
            detail: {
              type: method.toLowerCase(),
              request: url,
              error: error.toString(),
              requestStart,
            },
          })
        );
      }
      return Promise.reject(error);
    });
};

function post(url, data, options) {
  return fetchData(url, {
    method: 'POST',
    data,
    options,
  });
}

function put(url, data, options) {
  return fetchData(url, {
    method: 'PUT',
    data,
    options,
  });
}

function del(url, data, options) {
  return fetchData(url, {
    method: 'DELETE',
    data,
    options,
  });
}

async function handleResponse(url, response, method, requestStart, requestOptions) {
  const customEventDetail = {
    type: method,
    request: url,
    requestStart,
  };

  if (response.status === 200) {
    return response.json().then(data => {
      window.dispatchEvent(
        new CustomEvent('sh-api-success', {
          detail: customEventDetail,
        })
      );

      return Promise.resolve(data);
    });
  } else {
    return response
      .json()
      .catch(e => {
        console.error(e);

        // Send log to Loggly
        window.dispatchEvent(
          new CustomEvent('sh-api-failure', {
            detail: {
              ...customEventDetail,
              error: e.message,
            },
          })
        );

        return Promise.reject(new RequestError('Error Page', '50000'));
      })
      .then(function(body) {
        const { extraInfo } = body;
        const error = {
          message: REQUEST_ERROR_KEYS[body.code],
          code: body.code || response.status,
        };
        const { enableDefaultError = false } = requestOptions || {};
        const showDefaultError =
          typeof enableDefaultError === 'function' ? enableDefaultError(error.code) || false : enableDefaultError;

        console.log(requestOptions);
        console.log(ERROR_MAPPING[error.code]);

        // Call feedback API
        if (showDefaultError && ERROR_MAPPING[error.code]) {
          ERROR_MAPPING[error.code]();
        }

        // Send log to Loggly
        window.dispatchEvent(
          new CustomEvent('sh-api-failure', {
            detail: {
              ...customEventDetail,
              error: error.message,
              code: error.code,
            },
          })
        );

        const requestError = new RequestError(error.message, error.code, extraInfo);

        return Promise.reject(requestError);
      });
  }
}

export { get, post, put, del, RequestError };
