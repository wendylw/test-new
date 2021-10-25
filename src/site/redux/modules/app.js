import { createSelector } from 'reselect';
import { getPlaceById, placesActionCreators } from './entities/places';
import { get } from '../../../utils/request';
import Utils from '../../../utils/utils';
import * as TngUtils from '../../../utils/tng-utils';
import * as ApiRequest from '../../../utils/api-request';
import { API_REQUEST_STATUS } from '../../../utils/constants';

const initialState = {
  error: '',
  currentPlaceId: '',
  currentPlaceInfoSource: '',
  user: {
    isLogin: false,
    consumerId: '',
    pingStatus: null,
    loginStatus: null,
  },
};

const types = {
  CLEAR_ERROR: 'SITE/APP/CLEAR_ERROR',
  SET_CURRENT_PLACE_INFO: 'SITE/APP/SET_CURRENT_PLACE_INFO',
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
  ping: () => async (dispatch, getState) => {
    await dispatch(queryPing());
  },
  setCurrentPlaceInfo: (placeInfo, source) => (dispatch, getState) => {
    if (!source) {
      console.error('setCurrentPlaceInfo: Must pass source as parameter');
    }
    if (placeInfo) {
      dispatch(placesActionCreators.savePlace(placeInfo));
      dispatch({
        type: types.SET_CURRENT_PLACE_INFO,
        placeId: placeInfo.placeId,
        source: source || 'unknown',
      });
    }
  },

  loginByTngMiniProgram: () => async (dispatch, getState) => {
    if (!Utils.isTNGMiniProgram()) {
      throw new Error('Not in tng mini program');
    }

    try {
      dispatch({
        type: types.LOGIN_REQUEST,
      });

      const result = await TngUtils.getAccessToken({ business: '' });

      const { access_token, refresh_token } = result;
      const data = await ApiRequest.login({
        accessToken: access_token,
        refreshToken: refresh_token,
      });

      dispatch({
        type: types.LOGIN_SUCCESS,
        payload: data,
      });
    } catch (e) {
      // TODO: prompt user login failed
      console.error(e);

      dispatch({
        type: types.LOGIN_FAILURE,
        error: e,
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
    case types.SET_CURRENT_PLACE_INFO:
      return { ...state, currentPlaceId: action.placeId, currentPlaceInfoSource: action.source };
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
export const getCurrentPlaceId = state => state.app.currentPlaceId;
export const getCurrentPlaceInfo = state => getPlaceById(state, state.app.currentPlaceId);
export const getCurrentPlaceInfoSource = state => state.app.currentPlaceInfoSource;

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
