export const ERROR_TYPES = {
  BAD_REQUEST_ERROR: 'badRequestError', // get 4xx error
  SERVER_ERROR: 'serverError', // get 5xx error
  PARAMETER_ERROR: 'parameterError', // before request, params error
  NETWORK_ERROR: 'networkError', // requested but no response, e.g., Failed to fetch
  ABORT_ERROR: 'abortError', // customer cancelled this requesting
  TIMEOUT_ERROR: 'timeoutError', // request timeout Error
};
