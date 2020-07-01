import { actions } from './app';
import rootReducer from './index';
import { APP_TYPES as types } from '../types';
import {
  store,
  configureMiddlewareStore,
  successMockFetch,
  failMockFetch,
  expectedActionsCheck,
  commonSuccessData,
  mockErrorMsg,
  mockErrorCode,
} from '../../../utils/testHelper';
const orderingStore = rootReducer(undefined, {});

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
    it('resetOtpStatus', () => {
      const expectedAction = {
        type: types.RESET_OTP_STATUS,
      };
      return expect(actions.resetOtpStatus()).toEqual(expectedAction);
    });
    it('clearError', () => {
      const expectedAction = {
        type: types.CLEAR_ERROR,
      };
      return expect(actions.clearError()).toEqual(expectedAction);
    });
    it('showMessageModal', () => {
      const reqParams = { message: 'hello', description: 'hello', buttonText: 'hello' };
      const expectedAction = {
        type: types.SET_MESSAGE_INFO,
        message: reqParams.message,
        description: reqParams.description,
        buttonText: reqParams.buttonText,
      };
      return expect(actions.showMessageModal(reqParams)).toEqual(expectedAction);
    });
    it('hideMessageModal', () => {
      return expect(actions.hideMessageModal()).toEqual({ type: types.HIDE_MESSAGE_MODAL });
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
    describe('getOpt', () => {
      const reqParams = { phone: '18766668888' };
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.GET_OTP_REQUEST },
          {
            type: types.GET_OTP_SUCCESS,
            response: commonSuccessData,
            params: {
              grant_type: 'otp',
              client: 'beep',
              business_name: null,
              username: reqParams.phone,
            },
          },
        ];
        return expectedActionsCheck(actions.getOtp(reqParams), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedAtions = [
          { type: types.GET_OTP_REQUEST },
          { type: types.GET_OTP_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.getOtp(reqParams), expectedAtions);
      });
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
          { type: types.FETCH_LOGIN_STATUS_SUCCESS, response: commonSuccessData, params: {} },
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
            code: mockErrorCode,
            message: mockErrorMsg,
          },
        ];
        return expectedActionsCheck(actions.getLoginStatus(), expectedActions);
      });
    });
    describe('loadCoreBusiness', () => {
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_COREBUSINESS_REQUEST },
          { type: types.FETCH_COREBUSINESS_SUCCESS, responseGql: commonSuccessData },
        ];
        return expectedActionsCheck(actions.loadCoreBusiness(), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.FETCH_COREBUSINESS_REQUEST },
          { type: types.FETCH_COREBUSINESS_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.loadCoreBusiness(), expectedActions);
      });
    });
    describe('loadCustomerProfile', () => {
      it(':Success', () => {
        successMockFetch();
        const caseStore = configureMiddlewareStore(orderingStore);
        const expectedActions = [
          { type: types.FETCH_CUSTOMER_PROFILE_REQUEST },
          { type: types.FETCH_CUSTOMER_PROFILE_SUCCESS, response: commonSuccessData, params: {} },
        ];
        return caseStore.dispatch(actions.loadCustomerProfile()).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
      it(':Fail', () => {
        failMockFetch();
        const caseStore = configureMiddlewareStore(orderingStore);
        const expectedActions = [
          { type: types.FETCH_CUSTOMER_PROFILE_REQUEST },
          { type: types.FETCH_CUSTOMER_PROFILE_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return caseStore.dispatch(actions.loadCustomerProfile()).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
    });
  });
});
