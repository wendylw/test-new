import appReducers, { initialState, getUser, getBusiness, getError, getOnlineStoreInfo, getRequestInfo } from './app';
import rootReducer from './index';
import { APP_TYPES as types } from '../types';
import { getReducerNewState } from '../../../utils/testHelper';
import history from '../../../ordering/orderingHistory';

describe('src/ordering/redux/modules/app.js:reducers', () => {
  it('should return the initial state', () => {
    expect(appReducers(undefined, {})).toEqual({
      ...initialState,
      cart: {
        cashback: 0,
        comments: null,
        count: 0,
        discount: 0,
        error: {
          clearCart: null,
          loadCart: null,
          loadCartStatus: null,
          removeCartItemsById: null,
          updateCartItems: null,
        },
        id: null,
        items: [],
        promotions: [],
        receiptNumber: null,
        requestStatus: {
          clearCart: 'fulfilled',
          loadCart: 'fulfilled',
          loadCartStatus: 'fulfilled',
          removeCartItemsById: 'fulfilled',
          updateCartItems: 'fulfilled',
        },
        serviceCharge: 0,
        shippingFee: 0,
        shippingType: '',
        source: 'BeepStore',
        status: null,
        submission: {
          receiptNumber: null,
          requestStatus: {
            loadCartSubmissionStatus: 'fulfilled',
            submitCart: 'fulfilled',
          },
          status: null,
          submissionId: null,
        },
        subtotal: 0,
        tax: 0,
        total: 0,
        unavailableItems: [],
        version: 0,
        voucher: null,
      },
    });
  });
  describe('user', () => {
    const nameField = 'user';
    const accessToken = 'mockAccessToken';
    const refreshToken = 'mockRefreshToken';
    const userActionInfo = {
      response: {
        access_token: accessToken,
        refresh_token: refreshToken,
        consumerId: '123456',
        login: true,
        storeCreditsBalance: 'mockStoreCreditsBalance',
      },
      code: 200,
      prompt: 'mockPrompt',
    };
    it('SHOW_LOGIN_PAGE', () => {
      const action = { type: types.SHOW_LOGIN_PAGE };
      const expectedState = { ...initialState.user, prompt: undefined };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
    });

    it('HIDE_LOGIN_PAGE', () => {
      const expectedState = { ...initialState.user, prompt: undefined };
      expect(getReducerNewState(appReducers, { type: types.HIDE_LOGIN_PAGE }, nameField)).toEqual(expectedState);
    });

    it('isFetching should be true', () => {
      expect(getReducerNewState(appReducers, { type: types.FETCH_LOGIN_STATUS_REQUEST }, nameField)).toEqual({
        ...initialState.user,
        isFetching: true,
      });
      expect(getReducerNewState(appReducers, { type: types.GET_OTP_REQUEST }, nameField)).toEqual({
        ...initialState.user,
        otpRequest: {
          data: {
            type: null,
          },
          error: null,
          status: 'pending',
        },
      });
    });
    it('isFetching should be false', () => {
      expect(getReducerNewState(appReducers, { type: types.FETCH_LOGIN_STATUS_FAILURE }, nameField)).toEqual({
        ...initialState.user,
        isFetching: false,
      });
      expect(getReducerNewState(appReducers, { type: types.GET_OTP_FAILURE }, nameField)).toEqual({
        ...initialState.user,
        otpRequest: {
          data: {
            type: 'otp',
          },
          error: undefined,
          status: 'rejected',
        },
      });
      expect(getReducerNewState(appReducers, { type: types.CREATE_OTP_FAILURE }, nameField)).toEqual({
        ...initialState.user,
        isError: true,
        isFetching: false,
      });
    });
    it('RESET_OTP_STATUS', () => {});
    it('CREATE_OTP_SUCCESS', () => {
      const expectedState = { ...initialState.user, isFetching: false, accessToken, refreshToken };
      const action = {
        type: types.CREATE_OTP_SUCCESS,
        ...userActionInfo,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
    });
    it('CREATE_LOGIN_SUCCESS', () => {
      const action = {
        type: types.CREATE_LOGIN_SUCCESS,
        ...userActionInfo,
      };
      const expectedState = {
        ...initialState.user,
        consumerId: '',
        isFetching: false,
        isLogin: true,
        loginRequestStatus: 'fulfilled',
        profile: {
          birthday: undefined,
          email: undefined,
          name: undefined,
          phone: undefined,
          status: 'fulfilled',
        },
      };
      const newState = appReducers({ ...initialState.user, accessToken, refreshToken }, action)[nameField];
      expect(newState).toEqual(expectedState);
    });
    it('FETCH_LOGIN_STATUS_SUCCESS', () => {
      const action = {
        type: types.FETCH_LOGIN_STATUS_SUCCESS,
        ...userActionInfo,
      };
      const expectedState = {
        ...initialState.user,
        isLogin: true,
        consumerId: '123456',
        isFetching: false,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
    });

    describe('CREATE_LOGIN_FAILURE', () => {
      it(':code equal 401,isExpired should be true', () => {
        const action = {
          type: types.CREATE_LOGIN_FAILURE,
          ...userActionInfo,
          error: {
            code: 401,
          },
        };
        const expectedState = {
          ...initialState.user,
          isFetching: false,
          loginRequestStatus: 'rejected',
        };
        expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
      });
      it(':code not 401,no Expired field in state', () => {
        const action = {
          type: types.CREATE_LOGIN_FAILURE,
          ...userActionInfo,
        };
        const expectedState = {
          ...initialState.user,
          isFetching: false,
          loginRequestStatus: 'rejected',
        };
        expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
      });
    });
    it('SET_LOGIN_PROMPT', () => {
      const action = { type: types.SET_LOGIN_PROMPT, ...userActionInfo };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual({
        ...initialState.user,
        prompt: 'mockPrompt',
      });
    });
    it('default', () => {
      expect(getReducerNewState(appReducers, { type: 'default' }, nameField)).toEqual({ ...initialState.user });
    });
  });

  describe('error', () => {
    const nameField = 'error';
    const errorActionInfo = {
      code: 200,
      message: 'mockErrorMessage',
    };
    it('CLEAR_ERROR with code equal 200', () => {
      const action = {
        type: types.CLEAR_ERROR,
        ...errorActionInfo,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(null);
    });
    it('code not equal 401', () => {
      const action = {
        type: types.CREATE_OTP_FAILURE,
        ...errorActionInfo,
        code: 400,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(null);
    });
  });
  describe('business', () => {
    const nameField = 'business';
    it('should return initial business state', () => {
      expect(getReducerNewState(appReducers, { type: 'none' }, nameField)).toEqual(initialState.business);
    });
  });
  describe('onlineStoreInfo', () => {
    const nameField = 'onlineStoreInfo';
    const onlineStoreInfoActionInfo = {
      responseGql: {
        data: {
          onlineStoreInfo: {
            id: '123456',
          },
        },
      },
    };
    it('FETCH_ONLINESTOREINFO_REQUEST', () => {
      const action = {
        type: types.FETCH_ONLINESTOREINFO_REQUEST,
        ...onlineStoreInfoActionInfo,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual({
        ...initialState.onlineStoreInfo,
        status: 'pending',
      });
    });
    it('FETCH_ONLINESTOREINFO_SUCCESS', () => {
      const action = {
        type: types.FETCH_ONLINESTOREINFO_SUCCESS,
        ...onlineStoreInfoActionInfo,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual({
        ...initialState.onlineStoreInfo,
        id: '123456',
        status: 'fulfilled',
      });
    });
    it('FETCH_ONLINESTOREINFO_FAILURE', () => {
      const action = {
        type: types.FETCH_ONLINESTOREINFO_FAILURE,
        ...onlineStoreInfoActionInfo,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual({
        ...initialState.onlineStoreInfo,
        status: 'rejected',
      });
    });
    it('default', () => {
      expect(getReducerNewState(appReducers, { type: 'default' }, nameField)).toEqual({
        ...initialState.onlineStoreInfo,
      });
    });
  });
  describe('requestInfo', () => {
    const nameField = 'requestInfo';
    it('should return initial requestInfo state', () => {
      expect(getReducerNewState(appReducers, { type: 'none' }, nameField)).toEqual(initialState.requestInfo);
    });
  });
});

describe('src/ordering/redux/modules/app.js:selectors', () => {
  const state = rootReducer(history)(undefined, { type: null });
  it('getUser', () => {
    const expectedState = initialState.user;
    expect(getUser(state)).toEqual(expectedState);
  });
  it('getBusiness', () => {
    const expectedState = initialState.business;
    expect(getBusiness(state)).toEqual(expectedState);
  });
  it('getError', () => {
    const expectedState = initialState.error;
    expect(getError(state)).toEqual(expectedState);
  });
  it('getOnlineStoreInfo', () => {
    expect(getOnlineStoreInfo(state)).toEqual(undefined);
  });
  it('getRequestInfo', () => {
    const expectedState = initialState.requestInfo;
    expect(getRequestInfo(state)).toEqual(expectedState);
  });
});
