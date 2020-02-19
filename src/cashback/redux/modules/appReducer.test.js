import appReducers, {
  initialState,
  getUser,
  getBusiness,
  getBusinessInfo,
  getError,
  getOnlineStoreInfo,
  getRequestInfo,
  getMessageInfo,
} from './app';
import rootReducer from './index';
import { APP_TYPES as types } from '../types';
import { getReducerNewState } from '../../../utils/testHelper';

describe('src/cashback/redux/modules/app.js:reducers', () => {
  it('should return the initial state', () => {
    expect(appReducers(undefined, {})).toEqual(initialState);
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
        customerId: '111111',
        login: true,
        storeCreditsBalance: 'mockStoreCreditsBalance',
      },
      code: 200,
      prompt: 'mockPrompt',
    };
    it('isFetching should be true', () => {
      const expectedState = { ...initialState.user, isFetching: true };
      expect(getReducerNewState(appReducers, { type: types.FETCH_LOGIN_STATUS_REQUEST }, nameField)).toEqual(
        expectedState
      );
      expect(getReducerNewState(appReducers, { type: types.GET_OTP_REQUEST }, nameField)).toEqual(expectedState);
      expect(getReducerNewState(appReducers, { type: types.CREATE_OTP_REQUEST }, nameField)).toEqual(expectedState);
    });

    it('isFetch should be false', () => {
      const expectedState = { ...initialState.user, isFetching: false };
      expect(getReducerNewState(appReducers, { type: types.FETCH_LOGIN_STATUS_FAILURE }, nameField)).toEqual(
        expectedState
      );
      expect(getReducerNewState(appReducers, { type: types.GET_OTP_FAILURE }, nameField)).toEqual(expectedState);
      expect(getReducerNewState(appReducers, { type: types.CREATE_OTP_FAILURE }, nameField)).toEqual(expectedState);
    });

    it('RESET_OTP_STATUS', () => {});
    it('GET_OTP_SUCCESS', () => {});
    it('CREATE_OTP_SUCCESS', () => {
      const expectedState = { ...initialState.user, isFetching: false, accessToken, refreshToken };
      const action = {
        type: types.CREATE_OTP_SUCCESS,
        ...userActionInfo,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
    });

    it('CREATE_LOGIN_SUCCESS', () => {
      const expectedState = {
        ...initialState.user,
        consumerId: '123456',
        isFetching: false,
        isLogin: true,
      };
      const action = {
        type: types.CREATE_LOGIN_SUCCESS,
        ...userActionInfo,
      };
      const newState = appReducers({ ...initialState.user, accessToken, refreshToken }, action)[nameField];
      expect(newState).toEqual(expectedState);
    });

    it('FETCH_LOGIN_STATUS_SUCCESS', () => {
      const expectedState = {
        ...initialState.user,
        isLogin: true,
        consumerId: '123456',
        isFetching: false,
      };
      const action = {
        type: types.FETCH_LOGIN_STATUS_SUCCESS,
        ...userActionInfo,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
    });

    describe('CREATE_LOGIN_FAILURE', () => {
      it(':code equal 401, isExpired should be true', () => {
        const action = {
          type: types.CREATE_LOGIN_FAILURE,
          ...userActionInfo,
          code: 401,
        };
        const expectedState = {
          ...initialState.user,
          isExpired: true,
          isFetching: false,
        };
        expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
      });
      it(':code not 401, no Expired field in state', () => {
        const action = {
          type: types.CREATE_LOGIN_FAILURE,
          ...userActionInfo,
        };
        const expectedState = {
          ...initialState.user,
          isFetching: false,
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

    it('FETCH_CUSTOMER_PROFILE_SUCCESS', () => {
      const action = { type: types.FETCH_CUSTOMER_PROFILE_SUCCESS, ...userActionInfo };
      const expectedState = {
        ...initialState.user,
        customerId: '111111',
        storeCreditsBalance: 'mockStoreCreditsBalance',
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
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
      const action = { type: types.CLEAR_ERROR, ...errorActionInfo };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(null);
    });

    it('code not equal 401', () => {
      const action = {
        type: types.CREATE_OTP_FAILURE,
        ...errorActionInfo,
        code: 400,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual({
        ...initialState.error,
        code: 400,
        message: 'Your One Time Passcode is invalid.',
      });
    });
  });

  describe('business', () => {
    const nameField = 'business';
    const businessActionInfo = {
      name: 'beep',
    };

    it('FETCH_BUSINESS_SUCCESS', () => {
      const action = { type: types.FETCH_BUSINESS_SUCCESS, ...businessActionInfo };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual({ name: 'beep' });
    });

    it('should return initial business state', () => {
      expect(getReducerNewState(appReducers, { type: 'default' }, nameField)).toEqual(initialState.business);
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

    it('no responseGql in action,should return initial onlineStoreInfo state', () => {
      const action = {
        type: types.FETCH_ONLINESTOREINFO_SUCCESS,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual({
        ...initialState.onlineStoreInfo,
      });
    });

    it('FETCH_ONLINESTOREINFO_REQUEST', () => {
      const action = {
        type: types.FETCH_ONLINESTOREINFO_REQUEST,
        ...onlineStoreInfoActionInfo,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual({
        ...initialState.onlineStoreInfo,
        isFetching: true,
      });
    });

    it('FETCH_ONLINESTOREINFO_SUCCESS', () => {
      const action = {
        type: types.FETCH_ONLINESTOREINFO_SUCCESS,
        ...onlineStoreInfoActionInfo,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual({
        ...initialState.onlineStoreInfo,
        isFetching: false,
        id: '123456',
      });
    });

    it('FETCH_ONLINESTOREINFO_FAILURE', () => {
      const action = {
        type: types.FETCH_ONLINESTOREINFO_FAILURE,
        ...onlineStoreInfoActionInfo,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual({
        ...initialState.onlineStoreInfo,
        isFetching: false,
      });
    });

    it('default', () => {
      expect(getReducerNewState(appReducers, { type: 'default' }, nameField)).toEqual({
        ...initialState.onlineStoreInfo,
      });
    });
  });

  describe('messageInfo', () => {
    const nameField = 'messageInfo';
    const messageActionInfo = {
      message: 'mockMessage',
      key: 'mockKey',
      status: 'mockStatus',
    };

    it('SET_MESSAGE_INFO', () => {
      const action = {
        type: types.SET_MESSAGE_INFO,
        ...messageActionInfo,
      };
      const expectedState = {
        ...initialState.messageInfo,
        message: 'mockMessage',
        key: 'mockKey',
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
    });

    it('SHOW_MESSAGE_MODAL', () => {
      const action = {
        type: types.SHOW_MESSAGE_MODAL,
        ...messageActionInfo,
      };
      const expectedState = {
        ...initialState.messageInfo,
        show: true,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
    });

    it('HIDE_MESSAGE_MODAL', () => {
      const action = {
        type: types.HIDE_MESSAGE_MODAL,
        ...messageActionInfo,
      };
      const expectedState = {
        ...initialState.messageInfo,
        show: false,
        message: '',
        key: '',
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
    });

    it('types.SET_CASHBACK_MESSAGE_SUCCESS', () => {
      const action = {
        type: types.SET_CASHBACK_MESSAGE_SUCCESS,
        ...messageActionInfo,
      };
      const expectedState = {
        ...initialState.messageInfo,
        key: 'mockStatus;',
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
    });

    it('default', () => {
      expect(getReducerNewState(appReducers, { type: 'default' }, nameField)).toEqual({
        ...initialState.messageInfo,
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

describe('src/cashback/redux/modules/app.js:selectors', () => {
  const state = rootReducer(undefined, { type: null });
  it('getUser', () => {
    const expectedState = initialState.user;
    expect(getUser(state)).toEqual(expectedState);
  });
  it('getBusiness', () => {
    const expectedState = initialState.business;
    expect(getBusiness(state)).toEqual(expectedState);
  });
  it('getBusinessInfo', () => {
    expect(getBusinessInfo(state)).toEqual(undefined);
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
  it('getMessageInfo', () => {
    const expectedState = initialState.messageInfo;
    expect(getMessageInfo(state)).toEqual(expectedState);
  });
});
