import { combineReducers } from 'redux';
import _get from 'lodash/get';
import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';
import CleverTap from '../../../utils/clevertap';
import config from '../../../config';
import Url from '../../../utils/url';
import * as TngUtils from '../../../utils/tng-utils';
import * as ApiRequest from '../../../utils/api-request';

import { APP_TYPES } from '../types';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { get, post } from '../../../utils/request';
import { createSelector } from 'reselect';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');
const localePhoneNumber = Utils.getLocalStorageVariable('user.p');
const { AUTH_INFO, OTP_REQUEST_PLATFORM, OTP_REQUEST_TYPES } = Constants;

export const initialState = {
  user: {
    isWebview: Utils.isWebview(),
    isLogin: false,
    isExpired: false,
    hasOtp: false,
    consumerId: config.consumerId,
    customerId: '',
    storeCreditsBalance: 0,
    isError: false,
    otpType: OTP_REQUEST_TYPES.OTP,
    isOtpError: false,
    country: Utils.getCountry(localePhoneNumber, navigator.language, Object.keys(metadataMobile.countries || {}), 'MY'),
    phone: localePhoneNumber,
    prompt: 'Do you have a Beep account? Login with your mobile phone number.',
    noWhatsAppAccount: true,
  },
  error: null, // network error
  messageInfo: {
    show: false,
    key: null,
    message: null,
  }, // message modal
  business: config.business,
  onlineStoreInfo: {
    id: '',
    isFetching: false,
  },
  requestInfo: {
    tableId: config.table,
    storeId: config.storeId,
  },
};

export const types = APP_TYPES;

//action creators
export const actions = {
  loginApp: ({ accessToken, refreshToken }) => async (dispatch, getState) => {
    try {
      const businessUTCOffset = getBusinessUTCOffset(getState());

      dispatch({
        type: types.CREATE_LOGIN_REQUEST,
      });

      const result = await ApiRequest.login({
        accessToken,
        refreshToken,
        fulfillDate: Utils.getFulfillDate(businessUTCOffset),
      });

      dispatch({
        type: types.CREATE_LOGIN_SUCCESS,
        payload: result,
      });
    } catch (error) {
      dispatch({
        type: types.CREATE_LOGIN_FAILURE,
        error: error,
      });
    }
  },

  resetOtpStatus: () => ({
    type: types.RESET_OTP_STATUS,
  }),

  getOtp: payload => async dispatch => {
    try {
      dispatch({ type: types.GET_OTP_REQUEST });

      const { isSent, errorCode } = await post(Url.API_URLS.GET_OTP.url, {
        ...payload,
        platform: OTP_REQUEST_PLATFORM,
      });

      if (isSent) {
        dispatch({ type: types.GET_OTP_SUCCESS });
      } else {
        dispatch({ type: types.GET_OTP_FAILURE, error: errorCode });
      }
    } catch (error) {
      // For sake of completeness: this won't be called because of the the response code will always be 200
      dispatch({
        type: types.GET_OTP_FAILURE,
        error: error,
      });
    }
  },

  sendOtp: ({ otp }) => ({
    [API_REQUEST]: {
      types: [types.CREATE_OTP_REQUEST, types.CREATE_OTP_SUCCESS, types.CREATE_OTP_FAILURE],
      ...Url.API_URLS.POST_OTP(config.authApiUrl),
      payload: {
        grant_type: AUTH_INFO.GRANT_TYPE,
        client: AUTH_INFO.CLIENT,
        business_name: config.business,
        username: Utils.getLocalStorageVariable('user.p'),
        password: otp,
      },
    },
  }),

  getLoginStatus: () => ({
    types: [types.FETCH_LOGIN_STATUS_REQUEST, types.FETCH_LOGIN_STATUS_SUCCESS, types.FETCH_LOGIN_STATUS_FAILURE],
    requestPromise: get(Url.API_URLS.GET_LOGIN_STATUS.url).then(resp => {
      if (resp) {
        if (resp.consumerId) {
          if (resp.login) {
            get(Url.API_URLS.GET_CONSUMER_PROFILE(resp.consumerId).url).then(profile => {
              const userInfo = {
                Name: resp.user?.firstName,
                Phone: resp.user?.phone,
                Identity: resp.consumerId,
                ...(resp.user?.email ? { Email: resp.user?.email } : {}),
              };

              if (profile.birthday) {
                userInfo.DOB = new Date(profile.birthday);
              }

              CleverTap.onUserLogin(userInfo);
            });
          }
        }
      }
      return resp;
    }),
  }),

  updateUser: (user = {}) => ({
    type: types.UPDATE_USER,
    user,
  }),

  updateOtpStatus: () => ({
    type: types.UPDATE_OTP_STATUS,
  }),

  clearError: () => ({
    type: types.CLEAR_ERROR,
  }),

  setMessageInfo: ({ key, message }) => ({
    type: types.SET_MESSAGE_INFO,
    key,
    message,
  }),

  setCashbackMessage: () => dispatch => {
    const status = Utils.getLocalStorageVariable('cashback.status');

    if (status) {
      Utils.removeLocalStorageVariable('cashback.status');
      dispatch({
        type: types.SET_CASHBACK_MESSAGE_SUCCESS,
        status,
      });
    }
  },

  showMessageInfo: () => ({
    type: types.SHOW_MESSAGE_MODAL,
  }),

  hideMessageInfo: () => ({
    type: types.HIDE_MESSAGE_MODAL,
  }),

  setLoginPrompt: prompt => ({
    type: types.SET_LOGIN_PROMPT,
    prompt,
  }),

  loadCustomerProfile: () => (dispatch, getState) => {
    const { app } = getState();

    if (app.user.consumerId) {
      document.cookie = `consumerId=${app.user.consumerId}`;
    }

    return dispatch(fetchCustomerProfile(app.user.consumerId || config.consumerId));
  },

  fetchOnlineStoreInfo: () => ({
    [FETCH_GRAPHQL]: {
      types: [
        types.FETCH_ONLINESTOREINFO_REQUEST,
        types.FETCH_ONLINESTOREINFO_SUCCESS,
        types.FETCH_ONLINESTOREINFO_FAILURE,
      ],
      endpoint: Url.apiGql('OnlineStoreInfo'),
    },
  }),

  fetchBusiness: () => ({
    [API_REQUEST]: {
      types: [types.FETCH_BUSINESS_REQUEST, types.FETCH_BUSINESS_SUCCESS, types.FETCH_BUSINESS_FAILURE],
      ...Url.API_URLS.GET_CASHBACK_BUSINESS,
      params: {
        storeId: config.storeId,
      },
    },
  }),

  loginByTngMiniProgram: () => async (dispatch, getState) => {
    if (!Utils.isTNGMiniProgram()) {
      throw new Error('Not in tng mini program');
    }

    try {
      dispatch({
        type: types.CREATE_LOGIN_REQUEST,
      });

      const business = getBusiness(getState());

      const businessUTCOffset = getBusinessUTCOffset(getState());

      const tokens = await TngUtils.getAccessToken({ business: business });

      const { access_token, refresh_token } = tokens;

      const result = ApiRequest.login({
        accessToken: access_token,
        refreshToken: refresh_token,
        fulfillDate: Utils.getFulfillDate(businessUTCOffset),
      });

      dispatch({
        type: types.CREATE_LOGIN_SUCCESS,
        payload: result,
      });
    } catch (error) {
      dispatch({
        type: types.CREATE_LOGIN_FAILURE,
        error,
      });

      return false;
    }

    return getUserIsLogin(getState());
  },
};

const fetchCustomerProfile = consumerId => ({
  [API_REQUEST]: {
    types: [
      types.FETCH_CUSTOMER_PROFILE_REQUEST,
      types.FETCH_CUSTOMER_PROFILE_SUCCESS,
      types.FETCH_CUSTOMER_PROFILE_FAILURE,
    ],
    ...Url.API_URLS.GET_CUSTOMER_PROFILE(consumerId),
  },
});

const user = (state = initialState.user, action) => {
  const { type, response, responseGql, prompt, error } = action;
  const { login, consumerId, noWhatsAppAccount } = response || {};

  switch (type) {
    case types.FETCH_LOGIN_STATUS_REQUEST:
    case types.GET_OTP_REQUEST:
      return {
        ...state,
        isFetching: true,
        isResending: true,
        isOtpError: false,
        otpType: OTP_REQUEST_TYPES.RE_SEND_OTP,
      };
    case types.CREATE_OTP_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_LOGIN_STATUS_FAILURE:
    case types.GET_OTP_FAILURE:
      // We won't handle the error code separately for now, because we don't want users to see the error details in the phase 1.
      return { ...state, isFetching: false, isResending: false, isOtpError: true };
    case types.CREATE_OTP_FAILURE:
      return { ...state, isFetching: false, isResending: false, isError: true };
    case types.RESET_OTP_STATUS:
      return { ...state, isFetching: false, hasOtp: false };
    case types.UPDATE_OTP_STATUS:
      return { ...state, isFetching: false, isError: false };
    case types.GET_OTP_SUCCESS:
      return { ...state, isFetching: false, isResending: false, hasOtp: true, noWhatsAppAccount };
    case types.CREATE_OTP_SUCCESS:
      const { access_token, refresh_token } = response;

      return {
        ...state,
        isFetching: false,
        accessToken: access_token,
        refreshToken: refresh_token,
      };
    case types.CREATE_LOGIN_REQUEST: {
      return {
        ...state,
        isFetching: true,
      };
    }
    case types.CREATE_LOGIN_SUCCESS: {
      const { consumerId } = action.payload;

      return {
        ...state,
        consumerId,
        isLogin: true,
        isFetching: false,
      };
    }
    case types.FETCH_LOGIN_STATUS_SUCCESS:
      return {
        ...state,
        isLogin: login,
        consumerId,
        isFetching: false,
      };
    case types.CREATE_LOGIN_FAILURE:
      if (error?.error === 'TokenExpiredError' || error?.error === 'JsonWebTokenError') {
        return { ...state, isExpired: true, isFetching: false };
      }

      return { ...state, isFetching: false };
    case types.SET_LOGIN_PROMPT:
      return { ...state, prompt };
    case types.FETCH_CUSTOMER_PROFILE_SUCCESS:
      const { storeCreditsBalance, customerId } = response || {};

      return { ...state, storeCreditsBalance, customerId };
    case types.UPDATE_USER:
      return Object.assign({}, state, action.user);
    case types.FETCH_ONLINESTOREINFO_SUCCESS:
    case types.FETCH_COREBUSINESS_SUCCESS:
      const { data } = responseGql;
      const { business, onlineStoreInfo } = data || {};

      if (!state.phone && business && business.country) {
        return { ...state, country: business.country };
      } else if (!state.phone && onlineStoreInfo && onlineStoreInfo.country) {
        return { ...state, country: onlineStoreInfo.country };
      } else {
        return state;
      }
    default:
      return state;
  }
};

const error = (state = initialState.error, action) => {
  const { type, code, message } = action;

  if (type === types.CLEAR_ERROR || code === 200) {
    return null;
  } else if (code && code !== 401) {
    let errorMessage = message;

    if (type === types.CREATE_OTP_FAILURE) {
      errorMessage = Constants.LOGIN_PROMPT[code];
    }

    return {
      ...state,
      code,
      message: errorMessage,
    };
  }

  return state;
};

const business = (state = initialState.business, action) => {
  const { type, response } = action;

  switch (type) {
    case types.FETCH_BUSINESS_SUCCESS:
      const { name } = response || {};
      return name;
    default:
      return state;
  }
};

const onlineStoreInfo = (state = initialState.onlineStoreInfo, action) => {
  const { type, responseGql } = action;
  const { data } = responseGql || {};
  const { onlineStoreInfo } = data || {};

  if (!(responseGql && onlineStoreInfo)) {
    return state;
  }

  switch (type) {
    case types.FETCH_ONLINESTOREINFO_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_ONLINESTOREINFO_SUCCESS:
      return { ...state, isFetching: false, id: onlineStoreInfo.id || '' };
    case types.FETCH_ONLINESTOREINFO_FAILURE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

const messageInfo = (state = initialState.messageInfo, action) => {
  switch (action.type) {
    case types.SET_MESSAGE_INFO: {
      const { key, message } = action;
      return { ...state, key, message };
    }
    case types.SHOW_MESSAGE_MODAL: {
      return { ...state, show: true };
    }
    case types.HIDE_MESSAGE_MODAL: {
      return { ...state, show: false, key: null, message: null };
    }
    case types.SET_CASHBACK_MESSAGE_SUCCESS: {
      const { status } = action;

      return {
        ...state,
        key: status,
      };
    }
    default:
      return state;
  }
};

const requestInfo = (state = initialState.requestInfo, action) => state;

export default combineReducers({
  user,
  error,
  messageInfo,
  business,
  onlineStoreInfo,
  requestInfo,
});

// selectors
export const getUser = state => state.app.user;
export const getIsOtpError = state => state.app.user.isOtpError;
export const getBusiness = state => state.app.business;
export const getBusinessInfo = state => {
  return getBusinessByName(state, state.app.business);
};
export const getError = state => state.app.error;
export const getOnlineStoreInfo = state => {
  return state.entities.onlineStores[state.app.onlineStoreInfo.id];
};
export const getRequestInfo = state => state.app.requestInfo;
export const getMessageInfo = state => state.app.messageInfo;

export const getBusinessUTCOffset = createSelector(getBusinessInfo, businessInfo =>
  _get(businessInfo, 'timezoneOffset', 480)
);

export const getUserIsLogin = createSelector(getUser, user => _get(user, 'isLogin', false));
