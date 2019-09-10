import Constants from './constants';

const { REQUEST_ERROR_KEYS } = Constants;
const headers = new Headers({
  Accept: "application/json",
  "Content-Type": "application/json"
});

class RequestError extends Error {
  constructor(message, errorCode) {
    super();

    this.message = message;
    this.errorCode = errorCode;
  }
}

function get(url) {
  return fetch(url, {
    method: 'GET',
    headers: headers
  })
    .then(response => {
      return handleResponse(url, response);
    })
    .catch(error => {
      console.error(`Request failed. Url = ${url}. Message = ${error}`);
      return Promise.reject({ error: { message: 'Request failed.' } });
    });
}

function post(url, data) {
  return fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data)
  })
    .then(response => {
      return handleResponse(url, response);
    })
    .catch(error => {
      return Promise.reject(error);
    });
}

function handleResponse(url, response) {
  if (response.status === 200) {
    return response.json();
  } else {
    const errorCode = response.code || response.status;

    return Promise.reject(new RequestError(REQUEST_ERROR_KEYS[errorCode], errorCode));
  }
}

export { get, post };
