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
const cashbackStore = rootReducer(undefined, {});

describe('src/cashback/redux/modules/app.js:actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  afterEach(() => {
    store.clearActions();
  });

  describe('action creators', () => {
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

    it('setMessageInfo', () => {
      const reqParams = { key: 'Claimed_FirstTime', message: 'hello' };
      const expectedAction = {
        type: types.SET_MESSAGE_INFO,
        key: reqParams.key,
        message: reqParams.message,
      };
      return expect(actions.setMessageInfo(reqParams)).toEqual(expectedAction);
    });

    it('showMessageInfo', () => {
      const expectedAction = { type: types.SHOW_MESSAGE_MODAL };
      return expect(actions.showMessageInfo()).toEqual(expectedAction);
    });

    // not sure
    it('setCashbackMessage', () => {
      const reqParams = { status: 'Claimed_FirstTime' };
      const expectedAction = {
        type: types.SET_CASHBACK_MESSAGE_SUCCESS,
        status: reqParams.status,
      };
      return expect(actions.setCashbackMessage()).toEqual(expectedAction);
    });

    it('hideMessageInfo', () => {
      const expectedAction = { type: types.HIDE_MESSAGE_MODAL };
      return expect(actions.hideMessageInfo()).toEqual(expectedAction);
    });

    it('setLoginPrompt', () => {
      const reqParams = { prompt: 'mockPrompt' };
      const expectedAction = {
        type: types.SET_LOGIN_PROMPT,
        prompt: reqParams.prompt,
      };
      return expect(actions.setLoginPrompt(reqParams)).toEqual(expectedAction);
    });
  });

  describe('Async Action Creators', () => {
    describe('loginApp', () => {
      const reqParams = { accessToken: 'mockAccessToken', refreshToken: 'mockRefreshToken' };
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

    describe('fetchBusiness', () => {
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_BUSINESS_REQUEST },
          { type: types.FETCH_BUSINESS_SUCCESS, responseGql: commonSuccessData, params: { storeId: null } },
        ];
        return expectedActionsCheck(actions.fetchBusiness(), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.FETCH_BUSINESS_REQUEST },
          { type: types.FETCH_BUSINESS_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.fetchBusiness(), expectedActions);
      });
    });

    describe('loadCustomerProfile', () => {
      it(':Success', () => {
        successMockFetch();
        const caseStore = configureMiddlewareStore(cashbackStore);
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
        const caseStore = configureMiddlewareStore(cashbackStore);
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
