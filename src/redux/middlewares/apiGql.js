/* eslint-disable import/no-anonymous-default-export */
import { post } from '../../utils/request';

// Deal with every single action that has FETCH_GRAPHQL field.
export const FETCH_GRAPHQL = 'FETCH GRAPHQL';

export default () => next => action => {
  const callAPI = action[FETCH_GRAPHQL];

  if (!callAPI) {
    return next(action);
  }

  const { endpoint, types, variables } = callAPI;

  if (typeof endpoint !== 'string') {
    throw new Error('endpoint is required as string');
  }
  if (!Array.isArray(types) && types.length !== 3) {
    throw new Error('types is required as actions');
  }
  if (!types.every(type => typeof type === 'string')) {
    throw new Error('every type in types should be string');
  }

  const actionWith = data => {
    const finalAction = { ...action, ...data };

    delete finalAction[FETCH_GRAPHQL];
    return finalAction;
  };

  const [requestType, successType, failureType] = types;

  next(actionWith({ type: requestType }));

  return post(endpoint, variables)
    .then(responseGql => {
      const { error } = responseGql;

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
          responseGql,
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
