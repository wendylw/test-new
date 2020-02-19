import Constants from './constants';

const { REQUEST_ERROR_KEYS } = Constants;
const headers = new Headers({
  Accept: 'application/json',
  'Content-Type': 'application/json',
});

class RequestError extends Error {
  constructor(message, code) {
    super();

    this.message = message;
    this.code = code;
  }
}

function get(url) {
  return fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include',
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

  return fetch(url, {
    method,
    headers: headers,
    credentials: options && options.mode ? 'omit' : 'include',
    body: JSON.stringify(data),
    ...options,
  })
    .then(response => {
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

function handleResponse(url, response) {
  if (response.status === 200) {
    return response.json();
  } else {
    const code = response.code || response.status;

    return Promise.reject(new RequestError(REQUEST_ERROR_KEYS[code], code));
  }
}

export { get, post, put, del, RequestError };
