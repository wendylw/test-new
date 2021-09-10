import { combineReducers } from 'redux';
import _get from 'lodash/get';
import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';
import CleverTap from '../../../utils/clevertap';
import config from '../../../config';
import Url from '../../../utils/url';
import * as TngUtils from '../../../utils/tng-utils';

import { APP_TYPES } from '../types';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { post, get } from '../../../utils/request';
import { createSelector } from 'reselect';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');
const localePhoneNumber = Utils.getLocalStorageVariable('user.p');
const { AUTH_INFO } = Constants;

export const initialState = {
  user: {
    isWebview: Utils.isWebview(),
    isLogin: false,
    isExpired: false,
    hasOtp: false,
    consumerId: config.consumerId,
    customerId: '',
    storeCreditsBalance: 0,
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
  // TODO: use login request in `src/utils/api-request.js` and thunk
  loginApp: ({ accessToken, refreshToken }) => (dispatch, getState) => {
    const businessUTCOffset = getBusinessUTCOffset(getState());

    return dispatch({
      types: [types.CREATE_LOGIN_REQUEST, types.CREATE_LOGIN_SUCCESS, types.CREATE_LOGIN_FAILURE],
      requestPromise: post(Url.API_URLS.POST_LOGIN.url, {
        accessToken,
        refreshToken,
        fulfillDate: Utils.getFulfillDate(businessUTCOffset),
        shippingType: Utils.getApiRequestShippingType(),
        registrationTouchpoint: Utils.getRegistrationTouchPoint(),
        registrationSource: Utils.getRegistrationSource(),
      }).then(resp => {
        if (resp && resp.consumerId) {
          const phone = Utils.getLocalStorageVariable('user.p');
          if (phone) {
          }
        }
        const userInfo = {
          Name: resp.user?.firstName,
          Phone: resp.user?.phone,
          Email: resp.user?.email,
          Identity: resp.consumerId,
        };
        if (resp.user?.birthday) {
          userInfo.DOB = new Date(resp.user?.birthday);
        }
        CleverTap.onUserLogin(userInfo);
        return resp;
      }),
    });
  },

  resetOtpStatus: () => ({
    type: types.RESET_OTP_STATUS,
  }),

  getOtp: ({ phone }) => ({
    [API_REQUEST]: {
      types: [types.GET_OTP_REQUEST, types.GET_OTP_SUCCESS, types.GET_OTP_FAILURE],
      ...Url.API_URLS.POST_OTP(config.authApiUrl),
      payload: {
        grant_type: AUTH_INFO.GRANT_TYPE,
        client: AUTH_INFO.CLIENT,
        business_name: config.business,
        username: phone,
      },
    },
  }),

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
        type: types.LOGIN_BY_TNG_MINI_PROGRAM_REQUEST,
      });

      const isLogin = getUserIsLogin(getState());
      const business = getBusiness(getState());
      if (isLogin) {
        return true;
      }

      const result = await TngUtils.getAccessToken({ business: business });

      const { access_token, refresh_token } = result;

      await dispatch(
        actions.loginApp({
          accessToken: access_token,
          refreshToken: refresh_token,
        })
      );

      dispatch({
        type: types.LOGIN_BY_TNG_MINI_PROGRAM_SUCCESS,
      });
    } catch (e) {
      // TODO: prompt user login failed
      console.error(e);

      dispatch({
        type: types.LOGIN_BY_TNG_MINI_PROGRAM_FAILURE,
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
  const { type, response, responseGql, code, prompt, error } = action;
  const { login, consumerId, noWhatsAppAccount } = response || {};

  switch (type) {
    case types.FETCH_LOGIN_STATUS_REQUEST:
    case types.GET_OTP_REQUEST:
    case types.CREATE_OTP_REQUEST:
      return { ...state, isFetching: true, isResending: true };
    case types.FETCH_LOGIN_STATUS_FAILURE:
    case types.GET_OTP_FAILURE:
    case types.CREATE_OTP_FAILURE:
      return { ...state, isFetching: false, isResending: false };
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
    case types.CREATE_LOGIN_SUCCESS:
      if (state.accessToken) {
        delete state.accessToken;
      }

      if (state.refreshToken) {
        delete state.refreshToken;
      }

      return {
        ...state,
        consumerId,
        isLogin: true,
        isFetching: false,
      };
    case types.FETCH_LOGIN_STATUS_SUCCESS:
      return {
        ...state,
        isLogin: login,
        consumerId,
        isFetching: false,
      };
    case types.CREATE_LOGIN_FAILURE:
      if (code && code === 401 && code < 40000) {
        return { ...state, isExpired: true, isFetching: false };
      }

      if (error && error.code === 401) {
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
    case types.LOGIN_BY_TNG_MINI_PROGRAM_REQUEST: {
      return { ...state, isFetching: true };
    }
    case types.LOGIN_BY_TNG_MINI_PROGRAM_SUCCESS: {
      return { ...state, isFetching: false };
    }
    case types.LOGIN_BY_TNG_MINI_PROGRAM_FAILURE: {
      return { ...state, isFetching: false };
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
