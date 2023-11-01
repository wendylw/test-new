// eslint-disable-next-line import/no-extraneous-dependencies
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router';
import history from '../ordering/orderingHistory';
import api from '../redux/middlewares/api';
import apiGql from '../redux/middlewares/apiGql';
import RequestError from './api/request-error';
import requestPromise from '../redux/middlewares/requestPromise';

const middlewares = [thunk, apiGql, api, requestPromise];
const orderingMiddleWares = [routerMiddleware(history), thunk, apiGql, api, requestPromise];
const configureMiddlewareStore = configureMockStore(middlewares);
const configureOrderingMiddlewareStore = configureMockStore(orderingMiddleWares);
const store = configureMiddlewareStore({});

const mockErrorMsg = 'fake error message';
const mockErrorCode = 401;
const commonSuccessData = {
  status: 'ok',
};
const commonFailResponse = new RequestError(mockErrorMsg, { code: mockErrorCode });

const successMockFetch = () => {
  fetch.mockResponseOnce(JSON.stringify(commonSuccessData));
};

const failMockFetch = () => {
  fetch.mockRejectOnce(req => Promise.reject(commonFailResponse));
};

function expectedActionsCheck(dispatchedAction, expectedActions) {
  return store.dispatch(dispatchedAction).then(() => {
    expect(store.getActions()).toEqual(expectedActions);
  });
}
const getReducerNewState = (combinedReducers, action, nameField) => combinedReducers(undefined, action)[nameField];

export {
  store,
  expectedActionsCheck,
  getReducerNewState,
  mockErrorMsg,
  mockErrorCode,
  successMockFetch,
  failMockFetch,
  commonSuccessData,
  commonFailResponse,
  configureMiddlewareStore,
  configureOrderingMiddlewareStore,
};
