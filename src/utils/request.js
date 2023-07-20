import Constants from './constants';
import Utils from './utils';
import ApiFetchError from './api/api-fetch-error';
import { ERROR_TYPES } from './api/constants';

const { REQUEST_ERROR_KEYS } = Constants;
const headers = new Headers({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  client: Utils.getClient(),
});

const MAINTENANCE_PAGE_URL = process.env.REACT_APP_MAINTENANCE_PAGE_URL;

async function handleResponse(url, response, method, requestStart) {
  if (response.status === 200) {
    return response.json().then(data => {
      window.dispatchEvent(
        new CustomEvent('sh-api-success', {
          detail: {
            type: method,
            request: url,
            requestStart,
            status: 200,
          },
        })
      );
      return Promise.resolve(data);
    });
  }

  if (response.status === 401) {
    return response
      .json()
      .catch(e => {
        window.dispatchEvent(
          new CustomEvent('sh-api-failure', {
            detail: {
              type: method,
              request: url,
              code: '99999',
              error: e.message,
              requestStart,
              status: response.status,
            },
          })
        );
        const errorOptions = {
          category: ERROR_TYPES.BAD_REQUEST_ERROR,
          code: '50000',
          status: response.status,
        };
        return Promise.reject(new ApiFetchError(e?.message, errorOptions));
      })
      .then(body => {
        const code = response.status;
        const { message, extra, extraInfo } = body;
        window.dispatchEvent(
          new CustomEvent('sh-api-failure', {
            detail: {
              type: method,
              request: url,
              error: REQUEST_ERROR_KEYS[code],
              code: body.code?.toString(),
              requestStart,
              status: 401,
            },
          })
        );
        const errorOptions = {
          category: ERROR_TYPES.BAD_REQUEST_ERROR,
          code,
          status: response.status,
          extra,
          extraInfo,
        };
        return Promise.reject(new ApiFetchError(message, errorOptions));
      });
  }

  if (response.status === 400 || (response.status >= 402 && response.status < 499)) {
    return response
      .json()
      .catch(e => {
        window.dispatchEvent(
          new CustomEvent('sh-api-failure', {
            detail: {
              type: method,
              request: url,
              code: '99999',
              error: e.message,
              requestStart,
              status: response.status,
            },
          })
        );
        const errorOptions = {
          category: ERROR_TYPES.BAD_REQUEST_ERROR,
          code: '50000',
          status: response.status,
        };
        return Promise.reject(new ApiFetchError(e?.message, errorOptions));
      })
      .then(body => {
        const code = body.code || response.status;
        const errorCode = body.code?.toString();
        const { message, extra, extraInfo } = body;
        window.dispatchEvent(
          new CustomEvent('sh-api-failure', {
            detail: {
              type: method,
              request: url,
              error: REQUEST_ERROR_KEYS[code],
              code: errorCode,
              status: response.status,
              requestStart,
            },
          })
        );
        const errorOptions = {
          category: ERROR_TYPES.BAD_REQUEST_ERROR,
          code,
          status: response.status,
          extra,
          extraInfo,
        };
        return Promise.reject(new ApiFetchError(message, errorOptions));
      });
  }

  return response
    .json()
    .catch(e => {
      window.dispatchEvent(
        new CustomEvent('sh-api-failure', {
          detail: {
            type: method,
            request: url,
            code: '99999',
            error: e.message,
            status: response.status,
            requestStart,
          },
        })
      );
      const errorOptions = {
        category: ERROR_TYPES.SERVER_ERROR,
        code: '50000',
        status: response.status,
      };
      return Promise.reject(new ApiFetchError(e?.message, errorOptions));
    })
    .then(body => {
      // NOTE: Don't change the code if you don't understand it.
      const code = body.code || response.status;
      const errorCode = body.code?.toString();
      const { message, extra, extraInfo } = body;
      window.dispatchEvent(
        new CustomEvent('sh-api-failure', {
          detail: {
            type: method,
            request: url,
            error: REQUEST_ERROR_KEYS[code],
            code: errorCode,
            status: response.status,
            requestStart,
          },
        })
      );
      const errorOptions = {
        category: ERROR_TYPES.SERVER_ERROR,
        code,
        status: response.status,
        extra,
        extraInfo,
      };
      return Promise.reject(new ApiFetchError(message, errorOptions));
    });
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
      return handleResponse(url, response, 'get', requestStart);
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
      let category = '';
      if (error.name === 'AbortError') {
        category = ERROR_TYPES.ABORT_ERROR;
      } else if (error.name === 'TimeoutError') {
        category = ERROR_TYPES.TIMEOUT_ERROR;
      }
      const errorOptions = {
        category: category || ERROR_TYPES.NETWORK_ERROR,
      };

      return Promise.reject(new ApiFetchError(error?.message, errorOptions));
    });
}

const fetchData = (url, requestOptions) => {
  const requestStart = new Date().valueOf();
  const { method, data, options } = requestOptions;
  return fetch(url, {
    method,
    headers,
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
      return handleResponse(url, response, method.toLowerCase(), requestStart);
    })
    .catch(error => {
      // NOTE: If the error is an instance of ApiFetchError, it means that the error has been handled by the handleResponse function.
      if (error instanceof ApiFetchError) {
        return Promise.reject(error);
      }
      // NOTE: There are only 2 kinds of exceptions: AbortError or TypeError.
      // AbortError is called by ourselves so it shouldn't be treated as an error, that is why we only check the TypeError instances.
      // Refer to: https://developer.mozilla.org/en-US/docs/Web/API/fetch
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
      let category = '';
      if (error.name === 'AbortError') {
        category = ERROR_TYPES.ABORT_ERROR;
      } else if (error.name === 'TimeoutError') {
        category = ERROR_TYPES.TIMEOUT_ERROR;
      }
      const errorOptions = {
        category: category || ERROR_TYPES.NETWORK_ERROR,
      };

      return Promise.reject(new ApiFetchError(error?.message, errorOptions));
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

export { get, post, put, del };
