import { combineReducers } from 'redux';
import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';
import config from '../../../config';
import Url from '../../../utils/url';

import { APP_TYPES } from '../types';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { post, get } from '../../../utils/request';

const { AUTH_INFO } = Constants;

export const initialState = {
  user: {
    // isWebview: Utils.isWebview(),
    isLogin: false,
    isExpired: false,
    hasOtp: false,
    consumerId: config.consumerId,
    customerId: '',
    storeCreditsBalance: 0,
    prompt: 'Do you have a Beep account? Login with your mobile phone number.',
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
  loginApp: ({ accessToken, refreshToken }) => ({
    types: [types.CREATE_LOGIN_REQUEST, types.CREATE_LOGIN_SUCCESS, types.CREATE_LOGIN_FAILURE],
    requestPromise: post(Url.API_URLS.POST_LOGIN.url, {
      accessToken,
      refreshToken,
      fulfillDate: Utils.getFulfillDate().expectDeliveryDateFrom,
    }).then(resp => {
      if (resp && resp.consumerId) {
        window.heap?.identify(resp.consumerId);
        window.heap?.addEventProperties({ LoggedIn: 'yes' });
        const phone = Utils.getLocalStorageVariable('user.p');
        if (phone) {
          window.heap?.addUserProperties({ PhoneNumber: phone });
        }
      }
      return resp;
    }),
  }),

  phoneNumberLogin: ({ phone }) => ({
    types: [types.CREATE_LOGIN_REQUEST, types.CREATE_LOGIN_SUCCESS, types.CREATE_LOGIN_FAILURE],
    requestPromise: post(Url.API_URLS.PHONE_NUMBER_LOGIN.url, {
      phone,
      fulfillDate: Utils.getFulfillDate().expectDeliveryDateFrom,
    }).then(resp => {
      if (resp && resp.consumerId) {
        window.heap?.identify(resp.consumerId);
        window.heap?.addEventProperties({ LoggedIn: 'yes' });
        const phone = Utils.getLocalStorageVariable('user.p');
        if (phone) {
          window.heap?.addUserProperties({ PhoneNumber: phone });
        }
      }
      return resp;
    }),
  }),

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
    requestPromise: get(Url.API_URLS.GET_LOGIN_STATUS).then(resp => {
      if (resp) {
        if (resp.consumerId) {
          window.heap?.identify(resp.consumerId);
        } else {
          window.heap?.resetIdentity();
          window.heap?.addEventProperties({ LoggedIn: 'no' });
        }
      }
      return resp;
    }),
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
  const { type, response, code, prompt } = action;
  const { login, consumerId } = response || {};

  switch (type) {
    case types.FETCH_LOGIN_STATUS_REQUEST:
    case types.GET_OTP_REQUEST:
    case types.CREATE_OTP_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_LOGIN_STATUS_FAILURE:
    case types.GET_OTP_FAILURE:
    case types.CREATE_OTP_FAILURE:
      return { ...state, isFetching: false };
    case types.RESET_OTP_STATUS:
      return { ...state, isFetching: false, hasOtp: false };
    case types.GET_OTP_SUCCESS:
      return { ...state, isFetching: false, hasOtp: true };
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

      return { ...state, isFetching: false };
    case types.SET_LOGIN_PROMPT:
      return { ...state, prompt };
    case types.FETCH_CUSTOMER_PROFILE_SUCCESS:
      const { storeCreditsBalance, customerId } = response || {};

      return { ...state, storeCreditsBalance, customerId };
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
