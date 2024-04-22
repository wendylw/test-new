import appReducers, { initialState, getUser, getBusiness, getBusinessInfo, getError, getRequestInfo } from './app';
import rootReducer from './index';
import { APP_TYPES as types } from '../types';
import { getReducerNewState } from '../../../utils/testHelper';

jest.mock('../../../common/utils/__mocks__/inobounce.js');

// TODO: Remove isFetching setting in the test file
describe('src/cashback/redux/modules/app.js:reducers', () => {
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
        payload: userActionInfo.response,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
    });

    it('FETCH_LOGIN_STATUS_SUCCESS', () => {
      const expectedState = {
        ...initialState.user,
        consumerId: '123456',
        isLogin: true,
        isFetching: false,
      };
      const action = {
        type: types.FETCH_LOGIN_STATUS_SUCCESS,
        ...userActionInfo,
      };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
    });

    describe('CREATE_LOGIN_FAILURE', () => {
      it(':error equal TokenExpiredError, isExpired should be true', () => {
        const action = {
          type: types.CREATE_LOGIN_FAILURE,
          error: {
            error: 'TokenExpiredError',
          },
        };
        const expectedState = {
          ...initialState.user,
          isExpired: true,
          isFetching: false,
        };
        expect(getReducerNewState(appReducers, action, nameField)).toEqual(expectedState);
      });
      it(':code not TokenExpiredError, no Expired field in state', () => {
        const action = {
          type: types.CREATE_LOGIN_FAILURE,
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
      expect(getReducerNewState(appReducers, action, nameField)).toEqual(null);
    });
  });

  describe('business', () => {
    const nameField = 'business';
    const businessActionInfo = {
      response: {
        name: 'beep',
      },
    };

    it('FETCH_CASHBACK_BUSINESS_SUCCESS', () => {
      const action = { type: types.FETCH_CASHBACK_BUSINESS_SUCCESS, ...businessActionInfo };
      expect(getReducerNewState(appReducers, action, nameField)).toEqual('beep');
    });

    it('should return initial business state', () => {
      expect(getReducerNewState(appReducers, { type: 'default' }, nameField)).toEqual(initialState.business);
    });
  });

  describe('onlineStoreInfo', () => {
    const nameField = 'onlineStoreInfo';

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
        message: null,
        key: null,
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

  it('getRequestInfo', () => {
    const expectedState = initialState.requestInfo;
    expect(getRequestInfo(state)).toEqual(expectedState);
  });
});
