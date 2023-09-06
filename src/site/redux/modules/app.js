/* eslint-disable no-use-before-define */
import { createSelector } from 'reselect';
import { get } from '../../../utils/request';
import * as TngUtils from '../../../utils/tng-utils';
import * as ApiRequest from '../../../utils/api-request';
import { API_REQUEST_STATUS } from '../../../utils/constants';
import { isGCashMiniProgram, isTNGMiniProgram } from '../../../common/utils';
import { isAlipayMiniProgram, getAccessToken } from '../../../common/utils/alipay-miniprogram-client';
import logger from '../../../utils/monitoring/logger';

const initialState = {
  error: '',
  user: {
    isLogin: false,
    consumerId: '',
    pingStatus: null,
    loginStatus: null,
  },
};

const types = {
  CLEAR_ERROR: 'SITE/APP/CLEAR_ERROR',
  PING_REQUEST: 'SITE/APP/PING_REQUEST',
  PING_SUCCESS: 'SITE/APP/PING_SUCCESS',
  PING_FAILURE: 'SITE/APP/PING_FAILURE',

  // login
  LOGIN_REQUEST: 'SITE/APP/LOGIN_REQUEST',
  LOGIN_SUCCESS: 'SITE/APP/LOGIN_SUCCESS',
  LOGIN_FAILURE: 'SITE/APP/LOGIN_FAILURE',
};

// @actions
const queryPing = () => ({
  types: [types.PING_REQUEST, types.PING_SUCCESS, types.PING_FAILURE],
  requestPromise: get('/api/ping'),
});

const actions = {
  clearError: () => ({
    type: types.CLEAR_ERROR,
  }),

  // Important: this is an example to get response from dispatched requestPromise
  ping: () => async dispatch => {
    await dispatch(queryPing());
  },

  // TODO: Migrate loginByTngMiniProgram to loginByAlipayMiniProgram
  loginByTngMiniProgram: () => async (dispatch, getState) => {
    if (!isTNGMiniProgram()) {
      throw new Error('Not in tng mini program');
    }

    try {
      dispatch({
        type: types.LOGIN_REQUEST,
      });

      const result = await TngUtils.getAccessToken({ business: '' });

      const { access_token: accessToken, refresh_token: refreshToken } = result;

      const data = await ApiRequest.login({
        accessToken,
        refreshToken,
      });

      dispatch({
        type: types.LOGIN_SUCCESS,
        payload: data,
      });
    } catch (error) {
      logger.error('Site_LoginByAlipayMiniProgram', { message: error?.message });

      dispatch({
        type: types.LOGIN_FAILURE,
        error,
      });

      return false;
    }

    return getUserIsLogin(getState());
  },

  loginByAlipayMiniProgram: () => async (dispatch, getState) => {
    if (!isAlipayMiniProgram()) {
      throw new Error('Not in alipay mini program');
    }

    try {
      dispatch({
        type: types.LOGIN_REQUEST,
      });

      const { access_token: accessToken, refresh_token: refreshToken } = await getAccessToken({ business: '' });
      const data = await ApiRequest.login({
        accessToken,
        refreshToken,
      });

      dispatch({
        type: types.LOGIN_SUCCESS,
        payload: data,
      });
    } catch (error) {
      logger.error('Site_LoginByAlipayMiniProgramFailed', { message: error?.message });

      dispatch({
        type: types.LOGIN_FAILURE,
        error,
      });

      return false;
    }

    return getUserIsLogin(getState());
  },
};

// @reducers

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.CLEAR_ERROR:
      return { ...state, error: null };
    case types.PING_REQUEST:
      return {
        ...state,
        user: {
          ...state.user,
          pingStatus: API_REQUEST_STATUS.PENDING,
        },
      };
    case types.PING_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          isLogin: action.response.login,
          consumerId: action.response.consumerId,
          pingStatus: API_REQUEST_STATUS.FULFILLED,
        },
      };
    case types.PING_FAILURE:
      return {
        ...state,
        user: {
          ...state.user,
          pingStatus: API_REQUEST_STATUS.REJECTED,
        },
      };
    case types.LOGIN_REQUEST: {
      return {
        ...state,
        user: {
          ...state.user,
          loginStatus: API_REQUEST_STATUS.PENDING,
        },
      };
    }
    case types.LOGIN_SUCCESS: {
      const consumerId = action.payload?.consumerId;
      return {
        ...state,
        user: {
          ...state.user,
          isLogin: !!consumerId,
          consumerId,
          loginStatus: API_REQUEST_STATUS.FULFILLED,
        },
      };
    }
    case types.LOGIN_FAILURE: {
      return {
        ...state,
        user: {
          ...state.user,
          loginStatus: API_REQUEST_STATUS.REJECTED,
        },
      };
    }
    default:
      if (action.error) {
        return { ...state, error: action.error };
      }
      return state;
  }
};

export const appActionCreators = actions;
export default reducer;

// @selectors
export const getError = state => state.app.error;

export const getUserIsLogin = state => state.app.user.isLogin;

export const getUserConsumerId = state => state.app.user.consumerId;

export const getPingStatus = state => state.app.user.pingStatus;

export const getLoginStatus = state => state.app.user.loginStatus;

export const getIsLoginRequestInPending = createSelector(
  getLoginStatus,
  loginStatus => loginStatus === API_REQUEST_STATUS.PENDING
);

export const getIsPingRequestInPending = createSelector(
  getPingStatus,
  pingStatus => pingStatus === API_REQUEST_STATUS.PENDING
);

export const getIsPingRequestDone = createSelector(
  getPingStatus,
  pingStatus => pingStatus === API_REQUEST_STATUS.FULFILLED || pingStatus === API_REQUEST_STATUS.REJECTED
);

export const getIsTNGMiniProgram = () => isTNGMiniProgram();

export const getIsGCashMiniProgram = () => isGCashMiniProgram();

export const getIsAlipayMiniProgram = () => isAlipayMiniProgram();
