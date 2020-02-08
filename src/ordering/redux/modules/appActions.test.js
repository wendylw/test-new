// import configureMockStore from 'redux-mock-store';
// import thunk from 'redux-thunk';
// import api from '../../../redux/middlewares/api';
// import apiGql from '../../../redux/middlewares/apiGql';
import { actions } from './app';
import { APP_TYPES as types } from '../types';
//import { commonSuccessData, commonFailResponse } from '../__fixtures__/common.fixture';
import {
  store,
  successMockFetch,
  failMockFetch,
  expectedActionsCheck,
  commonSuccessData,
  mockErrorMsg,
  mockErrorCode,
} from '../../../utils/testHelper';
// const middlewares = [thunk, apiGql, api];
// const mockStore = configureMockStore(middlewares);
// const store = mockStore({});

describe('src/ordering/redux/modules/app.js:actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  afterEach(() => {
    store.clearActions();
  });
  describe('action creators', () => {
    it('showLogin', () => {
      const expectedAction = {
        type: types.SHOW_LOGIN_PAGE,
      };
      return expect(actions.showLogin()).toEqual(expectedAction);
    });
    it('hideLogin', () => {
      const expectedAction = {
        type: types.HIDE_LOGIN_PAGE,
      };
      return expect(actions.hideLogin()).toEqual(expectedAction);
    });
  });

  describe('Async Action Creators', () => {
    describe('loginApp', () => {
      const reqParams = { accessToken: 'mockAccessToken', refreshToken: 'mockRefreToken' };
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          {
            type: types.CREATE_LOGIN_REQUEST,
          },
          {
            type: types.CREATE_LOGIN_SUCCESS,
            response: commonSuccessData,
            params: reqParams,
          },
        ];
        return expectedActionsCheck(actions.loginApp(reqParams), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          {
            type: types.CREATE_LOGIN_REQUEST,
          },
          {
            type: types.CREATE_LOGIN_FAILURE,
            code: mockErrorCode,
            message: mockErrorMsg,
          },
        ];
        return expectedActionsCheck(actions.loginApp(reqParams), expectedActions);
      });
    });
    describe('phoneNumberLogin', () => {
      const reqParams = { phone: '18766668888' };
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.CREATE_LOGIN_REQUEST },
          { type: types.CREATE_LOGIN_SUCCESS, response: commonSuccessData, params: reqParams },
        ];
        return expectedActionsCheck(actions.phoneNumberLogin(reqParams), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.CREATE_LOGIN_REQUEST },
          { type: types.CREATE_LOGIN_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.phoneNumberLogin(reqParams), expectedActions);
      });
    });
    describe('fetchOnlineStoreInfo', () => {
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_ONLINESTOREINFO_REQUEST },
          { type: types.FETCH_ONLINESTOREINFO_SUCCESS, responseGql: commonSuccessData },
        ];
        return expectedActionsCheck(actions.fetchOnlineStoreInfo(), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.FETCH_ONLINESTOREINFO_REQUEST },
          { type: types.FETCH_ONLINESTOREINFO_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.fetchOnlineStoreInfo(), expectedActions);
      });
    });
  });
});
