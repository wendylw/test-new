import Constants from './constants';

const { REQUEST_ERROR_KEYS } = Constants;
const headers = new Headers({
  Accept: 'application/json',
  'Content-Type': 'application/json',
});

class RequestError extends Error {
  constructor(message, code, extraInfo) {
    super();

    this.message = message;
    this.code = code;
    this.extraInfo = extraInfo;
  }
}

function get(url, options = {}) {
  return fetch(url, {
    headers,
    credentials: 'include',
    ...options,
    method: 'GET',
  })
    .then(response => {
      return handleResponse(url, response);
    })
    .catch(error => {
      return Promise.reject(error);
    });
}

const fetchData = function(url, requestOptions) {
  const { method, data, options } = requestOptions;
  const MAINTENANCE_PAGE_URL = process.env.REACT_APP_MAINTENANCE_PAGE_URL;
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
      return handleResponse(url, response);
    })
    .catch(error => {
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

async function handleResponse(url, response) {
  if (response.status === 200) {
    return response.json();
  } else if (response.status === 401) {
    return response
      .json()
      .catch(e => {
        console.error(e);

        return Promise.reject(new RequestError('Error Page', '50000'));
      })
      .then(function(body) {
        const code = response.status;
        return Promise.reject(new RequestError(REQUEST_ERROR_KEYS[code], code));
      });
  } else {
    return response
      .json()
      .catch(e => {
        console.error(e);

        return Promise.reject(new RequestError('Error Page', '50000'));
      })
      .then(function(body) {
        const code = body.code || response.status;
        const { extraInfo } = body;

        return Promise.reject(new RequestError(REQUEST_ERROR_KEYS[code], code, extraInfo));
      });
  }
}

export { get, post, put, del, RequestError };
