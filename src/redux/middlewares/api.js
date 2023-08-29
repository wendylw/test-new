/* eslint-disable import/no-anonymous-default-export */
import { get, post, del, put } from '../../utils/request';

// Deal with every single action that has API_REQUEST field.
export const API_REQUEST = 'API REQUEST';

const methodMapToRequest = {
  get: url => get(url),
  post: (url, payload, options) => post(url, payload, options),
  del: (url, payload, options) => del(url, payload, options),
  put: (url, payload, options) => put(url, payload, options),
};

export default () => next => action => {
  const callAPI = action[API_REQUEST];

  if (!callAPI) {
    return next(action);
  }

  const { url, method, mode, types, params, payload } = callAPI;
  const requestParamsStr = params
    ? `?${Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&')}`
    : '';
  const requestUrl = `${url}${requestParamsStr}`;

  if (typeof url !== 'string') {
    throw new Error('url is required as string');
  }
  if (!Array.isArray(types) && types.length !== 3) {
    throw new Error('types is required as actions');
  }
  if (!types.every(type => typeof type === 'string')) {
    throw new Error('every type in types should be string');
  }

  const actionWith = responseData => {
    const finalAction = { ...action, ...responseData };

    delete finalAction[API_REQUEST];
    return finalAction;
  };

  const [requestType, successType, failureType] = types;

  next(actionWith({ type: requestType }));

  return methodMapToRequest[method](requestUrl, payload, { mode })
    .then(response => {
      const { error } = response;

      // handle error filed when 200 status
      if (error) {
        return next(
          actionWith({
            type: failureType,
            ...error,
          })
        );
      }

      return next(
        actionWith({
          type: successType,
          params: {
            ...payload,
            ...params,
          },
          response,
        })
      );
    })
    .catch(error =>
      next(
        actionWith({
          type: failureType,
          ...error,
        })
      )
    );
};
