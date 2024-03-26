import { actions } from './app';
import { APP_TYPES as types } from '../types';
import {
  store,
  successMockFetch,
  failMockFetch,
  expectedActionsCheck,
  commonSuccessData,
  mockErrorMsg,
} from '../../../utils/testHelper';

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

    describe('fetchCashbackBusiness', () => {
      it(':Success', () => {
        successMockFetch();
        const expectedActions = [
          { type: types.FETCH_CASHBACK_BUSINESS_REQUEST },
          { type: types.FETCH_CASHBACK_BUSINESS_SUCCESS, response: commonSuccessData, params: { storeId: null } },
        ];
        return expectedActionsCheck(actions.fetchCashbackBusiness(), expectedActions);
      });
    });
  });
});
