//Deal with every single action that has FETCH_REQUEST field.
export default store => next => action => {
  const {
    types,
    requestPromise, // very important field
    ...other
  } = action;

  if (!requestPromise) {
    return next(action);
  }
  if (!Array.isArray(types) && types.length !== 3) {
    throw new Error('types is required as actions');
  }
  if (typeof requestPromise.then !== 'function') {
    throw new Error('requestPromise must be a request promise');
  }

  console.debug('[redux/middleware/request] types =', types);

  const [requestType, successType, failureType, cancelType] = types;
  next({ ...other, type: requestType });
  return requestPromise
    .then(response => {
      const { error } = response || {};
      // handle error filed when 200 status
      if (error) {
        return next({ ...other, type: failureType, error });
      }

      if (!response) {
        console.warn('requestPromise returns nothing in promise.then() when types =', types);
      }
      return next({ ...other, type: successType, response });
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        return next({ ...other, type: cancelType || failureType, error });
      }
      console.error(error);
      return next({ ...other, type: failureType, error });
    });
};
