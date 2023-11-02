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
import RequestError from '../../../utils/api/request-error';

const cashbackStore = rootReducer(undefined, {});

describe('src/cashback/redux/modules/app.js:actions', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  afterEach(() => {
    store.clearActions();
  });

  describe('action creators', () => {
    it('resetGetOtpRequest', () => {
      const expectedAction = {
        type: types.RESET_GET_OTP_REQUEST,
      };
      return expect(actions.resetGetOtpRequest()).toEqual(expectedAction);
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
      return expect(actions.setLoginPrompt(reqParams.prompt)).toEqual(expectedAction);
    });
  });

  describe('Async Action Creators', () => {
    describe('getOtp', () => {
      const reqParams = { phone: '18766668888', otpType: 'otp' };
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.GET_OTP_REQUEST, payload: { otpType: reqParams.otp } },
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
            payload: { otpType: reqParams.otp },
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
            error: new RequestError(mockErrorMsg, { code: mockErrorCode }),
          },
        ];
        return expectedActionsCheck(actions.getLoginStatus(), expectedActions);
      });
    });

    describe('fetchOnlineStoreInfo', () => {
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_ONLINE_STORE_INFO_REQUEST },
          { type: types.FETCH_ONLINE_STORE_INFO_SUCCESS, responseGql: commonSuccessData },
        ];
        return expectedActionsCheck(actions.fetchOnlineStoreInfo(), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.FETCH_ONLINE_STORE_INFO_REQUEST },
          { type: types.FETCH_ONLINE_STORE_INFO_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.fetchOnlineStoreInfo(), expectedActions);
      });
    });

    describe('fetchCashbackBusiness', () => {
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_CASHBACK_BUSINESS_REQUEST },
          { type: types.FETCH_CASHBACK_BUSINESS_SUCCESS, response: commonSuccessData, params: { storeId: null } },
        ];
        return expectedActionsCheck(actions.fetchCashbackBusiness(), expectedActions);
      });
      it(':Fail', () => {
        failMockFetch();
        const expectedActions = [
          { type: types.FETCH_CASHBACK_BUSINESS_REQUEST },
          { type: types.FETCH_CASHBACK_BUSINESS_FAILURE, code: mockErrorCode, message: mockErrorMsg },
        ];
        return expectedActionsCheck(actions.fetchCashbackBusiness(), expectedActions);
      });
    });

    describe('loadConsumerCustomerInfo', () => {
      it(':Success', () => {
        successMockFetch();
        const caseStore = configureMiddlewareStore(cashbackStore);
        const expectedActions = [
          { type: types.LOAD_CONSUMER_CUSTOMER_INFO_PENDING },
          { type: types.LOAD_CONSUMER_CUSTOMER_INFO_FULFILLED, response: commonSuccessData, params: {} },
        ];
        return caseStore.dispatch(actions.loadConsumerCustomerInfo()).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
      it(':Fail', () => {
        failMockFetch();
        const caseStore = configureMiddlewareStore(cashbackStore);
        const expectedActions = [
          { type: types.LOAD_CONSUMER_CUSTOMER_INFO_PENDING },
          { type: types.LOAD_CONSUMER_CUSTOMER_INFO_REJECTED, code: mockErrorCode, message: mockErrorMsg },
        ];
        return caseStore.dispatch(actions.loadConsumerCustomerInfo()).then(() => {
          expect(caseStore.getActions()).toEqual(expectedActions);
        });
      });
    });
  });

  describe('getCashbackHistory', () => {
    const reqParams = { customerId: '111111' };
    it(':Success', () => {
      successMockFetch();
      const expectedActions = [
        { type: types.GET_CASHBACK_HISTORIES_REQUEST },
        { type: types.GET_CASHBACK_HISTORIES_SUCCESS, response: commonSuccessData, params: reqParams },
      ];
      return expectedActionsCheck(actions.getCashbackHistory(reqParams.customerId), expectedActions);
    });
    it(':Fail', () => {
      failMockFetch();
      const expectedActions = [
        { type: types.GET_CASHBACK_HISTORIES_REQUEST },
        { type: types.GET_CASHBACK_HISTORIES_FAILURE, code: mockErrorCode, message: mockErrorMsg },
      ];
      return expectedActionsCheck(actions.getCashbackHistory(reqParams.customerId), expectedActions);
    });
  });
});
