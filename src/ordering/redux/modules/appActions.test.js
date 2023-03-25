import { actions } from './app';
import rootReducer from './index';
import { APP_TYPES as types } from '../types';
import {
  store,
  configureOrderingMiddlewareStore,
  successMockFetch,
  failMockFetch,
  expectedActionsCheck,
  commonSuccessData,
  mockErrorMsg,
  mockErrorCode,
} from '../../../utils/testHelper';
import { RequestError } from '../../../utils/request';
import history from '../../../ordering/orderingHistory';
const orderingStoreReducer = rootReducer(history)(undefined, {});

describe('src/ordering/redux/modules/app.js:actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  afterEach(() => {
    store.clearActions();
  });

  describe('Async Action Creators', () => {
    describe('loginApp', () => {
      const reqParams = { accessToken: 'mockAccessToken', refreshToken: 'mockRefreToken' };
      it(':Success', () => {
        successMockFetch();
        const orderingStore = configureOrderingMiddlewareStore(orderingStoreReducer);
        const expectedActions = [
          {
            type: types.CREATE_LOGIN_REQUEST,
            payload: {
              shippingType: null,
              source: null,
            },
          },
          {
            type: types.CREATE_LOGIN_SUCCESS,
            payload: {
              ...JSON.stringify(commonSuccessData),
              source: null,
            },
          },
        ];

        return orderingStore.dispatch(actions.loginApp(reqParams)).then(() => {
          expect(orderingStore.getActions()).toEqual(expectedActions);
        });
      });
      it(':Fail', () => {
        failMockFetch();
        const orderingStore = configureOrderingMiddlewareStore(orderingStoreReducer);
        const expectedActions = [
          {
            type: types.CREATE_LOGIN_REQUEST,
            payload: {
              shippingType: null,
              source: null,
            },
          },
          {
            type: types.CREATE_LOGIN_FAILURE,
            error: new RequestError(mockErrorMsg, mockErrorCode),
            payload: {
              source: null,
            },
          },
        ];

        return orderingStore.dispatch(actions.loginApp(reqParams)).then(() => {
          expect(orderingStore.getActions()).toEqual(expectedActions);
        });
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
    describe('getOtp', () => {
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
      // it(':Fail', () => {
      //   failMockFetch();
      //   const expectedActions = [
      //     {
      //       type: types.GET_OTP_REQUEST,
      //       payload: {
      //         otpType: undefined,
      //       },
      //     },
      //     { type: types.GET_OTP_FAILURE, error: new Error(mockErrorMsg) },
      //   ];
      //   return expectedActionsCheck(actions.getOtp(reqParams), expectedActions);
      // });
    });
    describe('sendOtp', () => {
      const reqParams = { otp: 'otp' };
      it(':Success', () => {
        successMockFetch();
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
        return expectedActionsCheck(actions.sendOtp(reqParams), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.CREATE_OTP_REQUEST },
          { type: types.CREATE_OTP_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.sendOtp(reqParams), expectedActions);
      });
    });
    describe('getLoginStatus', () => {
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_LOGIN_STATUS_REQUEST },
          { type: types.FETCH_LOGIN_STATUS_SUCCESS, response: commonSuccessData },
        ];
        return expectedActionsCheck(actions.getLoginStatus(), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          {
            type: types.FETCH_LOGIN_STATUS_REQUEST,
          },
          {
            type: types.FETCH_LOGIN_STATUS_FAILURE,
            error: new RequestError(mockErrorMsg, mockErrorCode),
          },
        ];
        return expectedActionsCheck(actions.getLoginStatus(), expectedActions);
      });
    });
    describe('loadCoreBusiness', () => {
      it(':Success', () => {
        successMockFetch();
        const orderingStore = configureOrderingMiddlewareStore(orderingStoreReducer);
        const expectedActions = [
          { type: types.FETCH_COREBUSINESS_REQUEST },
          { type: types.FETCH_COREBUSINESS_SUCCESS, responseGql: commonSuccessData },
        ];
        return orderingStore.dispatch(actions.loadCoreBusiness()).then(() => {
          expect(orderingStore.getActions()).toEqual(expectedActions);
        });
      });
      it(':Fail', () => {
        failMockFetch();
        const orderingStore = configureOrderingMiddlewareStore(orderingStoreReducer);
        const expectedActions = [
          { type: types.FETCH_COREBUSINESS_REQUEST },
          { type: types.FETCH_COREBUSINESS_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];

        return orderingStore.dispatch(actions.loadCoreBusiness()).then(() => {
          expect(orderingStore.getActions()).toEqual(expectedActions);
        });
      });
    });
  });
});
