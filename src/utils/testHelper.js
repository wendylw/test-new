import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import api from '../redux/middlewares/api';
import apiGql from '../redux/middlewares/apiGql';
import { RequestError } from './request';

const middlewares = [thunk, apiGql, api];
const configureMiddlewareStore = configureMockStore(middlewares);
const store = configureMiddlewareStore({});

const mockErrorMsg = 'fake error message';
const mockErrorCode = 401;
const commonSuccessData = {
  status: 'ok',
};
const commonFailResponse = new RequestError(mockErrorMsg, mockErrorCode);

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
const getReducerNewState = (combinedReducers, action, nameField) => {
  return combinedReducers(undefined, action)[nameField];
};
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
};
