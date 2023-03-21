import { actions } from './app';
import { createBrowserHistory } from 'history';
import rootReducer from './index';
import { APP_TYPES as types } from '../types';
import {
  store,
  configureMiddlewareStore,
  successMockFetch,
  failMockFetch,
  commonSuccessData,
  mockErrorMsg,
  mockErrorCode,
  expectedActionsCheck,
} from '../../../utils/testHelper';
import { RequestError } from '../../../utils/request';
const history = createBrowserHistory();
const orderingStore = rootReducer(history);

describe('src/ordering/redux/modules/app.js:actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  afterEach(() => {
    store.clearActions();
  });

  describe('Async Action Creators', () => {
    describe('loginApp', () => {
      const reqParams = { accessToken: 'mockAccessToken', refreshToken: 'mockRefreshToken' };
      it(':Success', () => {
        successMockFetch();
        const caseStore = configureMiddlewareStore(orderingStore);
        const expectedActions = [
          {
            type: types.CREATE_LOGIN_REQUEST,
          },
          {
            type: types.CREATE_LOGIN_SUCCESS,
            payload: JSON.stringify(commonSuccessData),
          },
        ];

        return caseStore.dispatch(actions.loginApp(reqParams)).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
      it(':Fail', () => {
        failMockFetch();
        const caseStore = configureMiddlewareStore(orderingStore);
        const expectedActions = [
          {
            type: types.CREATE_LOGIN_REQUEST,
          },
          {
            type: types.CREATE_LOGIN_FAILURE,
            error: new RequestError(mockErrorMsg, mockErrorCode),
          },
        ];
        return caseStore.dispatch(actions.loginApp(reqParams)).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
    });

    describe('fetchOnlineStoreInfo', () => {
      it(':Success', () => {
        successMockFetch();
        const caseStore = configureMiddlewareStore(orderingStore);
        const expectedActions = [
          { type: types.FETCH_ONLINESTOREINFO_REQUEST },
          { type: types.FETCH_ONLINESTOREINFO_SUCCESS, responseGql: commonSuccessData },
        ];

        return caseStore.dispatch(actions.fetchOnlineStoreInfo()).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
      it(':Fail', () => {
        failMockFetch();
        const caseStore = configureMiddlewareStore(orderingStore);
        const expectedActions = [
          { type: types.FETCH_ONLINESTOREINFO_REQUEST },
          { type: types.FETCH_ONLINESTOREINFO_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return caseStore.dispatch(actions.fetchOnlineStoreInfo()).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
    });
    describe('getOpt', () => {
      const reqParams = { phone: '18766668888' };
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.GET_OTP_REQUEST, payload: { otpType: undefined } },
          {
            type: types.GET_OTP_SUCCESS,
          },
        ];

        return expectedActionsCheck(actions.getOtp(reqParams), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          {
            type: types.GET_OTP_REQUEST,
            payload: {
              otpType: undefined,
            },
          },
          { type: types.GET_OTP_FAILURE, error: new Error(mockErrorMsg) },
        ];
        return expectedActionsCheck(actions.getOtp(reqParams), expectedActions);
      });
    });
    describe('sendOtp', () => {
      const reqParams = { otp: 'otp' };
      it(':Success', () => {
        successMockFetch();
        const caseStore = configureMiddlewareStore(orderingStore);
        const expectedActions = [
          { type: types.CREATE_OTP_REQUEST },
          {
            type: types.CREATE_OTP_SUCCESS,
            response: commonSuccessData,
            params: {
              grant_type: 'otp',
              client: 'beep',
              business_name: null,
              username: null,
              password: reqParams.otp,
            },
          },
        ];
        return caseStore.dispatch(actions.sendOtp(reqParams)).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
      it(':Fail', () => {
        failMockFetch();
        const caseStore = configureMiddlewareStore(orderingStore);
        const expectedActions = [
          { type: types.CREATE_OTP_REQUEST },
          { type: types.CREATE_OTP_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return caseStore.dispatch(actions.sendOtp(reqParams)).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
    });
    describe('getLoginStatus', () => {
      it(':Success', () => {
        successMockFetch();
        const caseStore = configureMiddlewareStore(orderingStore);
        const expectedActions = [
          { type: types.FETCH_LOGIN_STATUS_REQUEST },
          { type: types.FETCH_LOGIN_STATUS_SUCCESS, response: commonSuccessData },
        ];
        return caseStore.dispatch(actions.getLoginStatus()).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
      it(':Fail', () => {
        failMockFetch();
        const caseStore = configureMiddlewareStore(orderingStore);
        const expectedActions = [
          {
            type: types.FETCH_LOGIN_STATUS_REQUEST,
          },
          {
            type: types.FETCH_LOGIN_STATUS_FAILURE,
            error: new RequestError(mockErrorMsg, mockErrorCode),
          },
        ];
        return caseStore.dispatch(actions.getLoginStatus()).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
    });
    describe('loadCoreBusiness', () => {
      it(':Success', () => {
        successMockFetch();
        const caseStore = configureMiddlewareStore(orderingStore);
        const expectedActions = [
          { type: types.FETCH_COREBUSINESS_REQUEST },
          { type: types.FETCH_COREBUSINESS_SUCCESS, responseGql: commonSuccessData },
        ];
        return caseStore.dispatch(actions.loadCoreBusiness()).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
      it(':Fail', () => {
        failMockFetch();
        const caseStore = configureMiddlewareStore(orderingStore);
        const expectedActions = [
          { type: types.FETCH_COREBUSINESS_REQUEST },
          { type: types.FETCH_COREBUSINESS_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return caseStore.dispatch(actions.loadCoreBusiness()).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
    });
  });
});
