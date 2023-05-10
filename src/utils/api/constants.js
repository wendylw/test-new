export const ERROR_TYPES = {
  BAD_REQUEST_ERROR: 'BadRequestError', // get 4xx error
  SERVER_ERROR: 'ServerError', // get 5xx error
  PARAMETER_ERROR: 'ParameterError', // before request, params error
  NETWORK_ERROR: 'NetworkError', // requested but no response, e.g., Failed to fetch
  ABORT_ERROR: 'AbortError', // customer cancelled this requesting
  TIMEOUT_ERROR: 'TimeoutError', // request timeout Error
  UNKNOWN_ERROR: 'UnknownError', // other error
};
