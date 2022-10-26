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
import { get } from '../../../utils/request';
import { post } from '../../../utils/api/api-fetch';
import { createSelector } from 'reselect';
import logger from '../../../utils/monitoring/logger';

const metadataMobile = require('libphonenumber-js/metadata.mobile.json');
const localePhoneNumber = Utils.getLocalStorageVariable('user.p');
const {
  AUTH_INFO,
  OTP_REQUEST_PLATFORM,
  API_REQUEST_STATUS,
  OTP_REQUEST_TYPES,
  OTP_API_ERROR_CODES,
  SMS_API_ERROR_CODES,
  OTP_COMMON_ERROR_TYPES,
  OTP_SERVER_ERROR_I18N_KEYS,
  OTP_ERROR_POPUP_I18N_KEYS,
} = Constants;

export const initialState = {
  user: {
    isWebview: Utils.isWebview(),
    isLogin: false,
    isExpired: false,
    consumerId: config.consumerId,
    customerId: '',
    storeCreditsBalance: 0,
    isError: false,
    otpRequest: {
      data: {
        type: OTP_REQUEST_TYPES.OTP,
      },
      status: null,
      error: null,
    },
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

  getPhoneWhatsAppSupport: phone => async dispatch => {
    try {
      dispatch({ type: types.GET_WHATSAPPSUPPORT_REQUEST });

      const { supportWhatsApp } = await post(Url.API_URLS.GET_WHATSAPP_SUPPORT.url, {
        phone,
      });

      dispatch({ type: types.GET_WHATSAPPSUPPORT_SUCCESS, response: { supportWhatsApp } });
    } catch (error) {
      dispatch({
        type: types.GET_WHATSAPPSUPPORT_FAILURE,
        error,
      });
    }
  },

  resetGetOtpRequest: () => ({
    type: types.RESET_GET_OTP_REQUEST,
  }),

  getOtp: payload => async dispatch => {
    try {
      const { type: otpType } = payload;

      // BEEP-2685: New Relic needs to know the OTP first send time.
      window.newrelic?.addPageAction('cashback.login.get-otp-start');
      logger.log('Cashback_App_StartToGetOTP');

      dispatch({ type: types.GET_OTP_REQUEST, payload: { otpType } });

      await post(Url.API_URLS.GET_OTP.url, {
        ...payload,
        platform: OTP_REQUEST_PLATFORM,
      });

      window.newrelic?.addPageAction('cashback.login.get-otp-success');

      dispatch({ type: types.GET_OTP_SUCCESS });
    } catch (error) {
      window.newrelic?.addPageAction('cashback.login.get-otp-failed', {
        error: error?.message,
        code: error?.code,
      });

      dispatch({
        type: types.GET_OTP_FAILURE,
        error,
      });
    }
  },

  resetSendOtpRequest: () => ({
    type: types.RESET_CREATE_OTP_REQUEST,
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
  const { type, response, responseGql, prompt, error, payload } = action;
  const { login, consumerId, supportWhatsApp } = response || {};
  const otpType = _get(payload, 'otpType', null);

  switch (type) {
    case types.RESET_CREATE_OTP_REQUEST:
      return { ...state, isFetching: false, isError: false };
    case types.GET_OTP_REQUEST:
      return {
        ...state,
        otpRequest: {
          ...state.otpRequest,
          data: { ...state.otpRequest.data, type: otpType },
          status: API_REQUEST_STATUS.PENDING,
          error: null,
        },
      };
    case types.FETCH_LOGIN_STATUS_REQUEST:
      return { ...state, isFetching: true };
    case types.CREATE_OTP_REQUEST:
      return { ...state, isFetching: true, isError: false };
    case types.FETCH_LOGIN_STATUS_FAILURE:
      return { ...state, isFetching: false };
    case types.GET_OTP_FAILURE:
      return { ...state, otpRequest: { ...state.otpRequest, status: API_REQUEST_STATUS.REJECTED, error } };
    case types.CREATE_OTP_FAILURE:
      return { ...state, isFetching: false, isError: true };
    case types.RESET_GET_OTP_REQUEST:
      return { ...state, otpRequest: { ...initialState.user.otpRequest } };
    case types.UPDATE_OTP_STATUS:
      return { ...state, isFetching: false, isError: false };
    case types.GET_OTP_SUCCESS:
      return { ...state, otpRequest: { ...state.otpRequest, status: API_REQUEST_STATUS.FULFILLED } };
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
    case types.GET_WHATSAPPSUPPORT_REQUEST:
      return { ...state, noWhatsAppAccount: true };
    case types.GET_WHATSAPPSUPPORT_SUCCESS:
      return { ...state, noWhatsAppAccount: !supportWhatsApp };
    case types.GET_WHATSAPPSUPPORT_FAILURE:
      // Write down here just for the sake of completeness, we won't handle this failure case for now.
      return state;
    default:
      return state;
  }
};

const error = (state = initialState.error, action) => {
  const { type, code, message } = action;

  if (type === types.CLEAR_ERROR || code === 200) {
    return null;
  } else if (code && code !== 401) {
    if (type === types.CREATE_OTP_FAILURE) return null;

    return {
      ...state,
      code,
      message,
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
export const getOtpRequest = state => state.app.user.otpRequest;
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

export const getIsLoginRequestFailed = createSelector(getUser, user => _get(user, 'isError', false));

export const getIsLoginRequestStatusPending = createSelector(getUser, user => _get(user, 'isFetching', false));

export const getOtpRequestStatus = createSelector(getOtpRequest, otp => otp.status);

export const getOtpRequestError = createSelector(getOtpRequest, otp => otp.error);

export const getOtpType = createSelector(getOtpRequest, otp => _get(otp, 'data.type', null));

export const getOtpErrorCode = createSelector(getOtpRequestError, error => _get(error, 'code', null));

export const getIsOtpRequestStatusPending = createSelector(
  getOtpRequestStatus,
  status => status === API_REQUEST_STATUS.PENDING
);

export const getIsOtpRequestStatusRejected = createSelector(
  getOtpRequestStatus,
  status => status === API_REQUEST_STATUS.REJECTED
);

export const getIsOtpRequestStatusFulfilled = createSelector(
  getOtpRequestStatus,
  status => status === API_REQUEST_STATUS.FULFILLED
);

export const getIsOtpInitialRequest = createSelector(getOtpType, otpType => otpType === OTP_REQUEST_TYPES.OTP);

export const getIsOtpInitialRequestFailed = createSelector(
  getIsOtpInitialRequest,
  getIsOtpRequestStatusRejected,
  (isOtpInitialRequest, isOtpRequestStatusRejected) => isOtpInitialRequest && isOtpRequestStatusRejected
);

export const getIsDisplayableOtpError = createSelector(getOtpErrorCode, errorCode =>
  [
    OTP_API_ERROR_CODES.PHONE_INVALID,
    OTP_API_ERROR_CODES.MEET_DAY_LIMIT,
    OTP_API_ERROR_CODES.REQUEST_TOO_FAST,
    SMS_API_ERROR_CODES.PHONE_INVALID,
    SMS_API_ERROR_CODES.NO_AVAILABLE_PROVIDER,
  ].some(code => errorCode === code.toString())
);

export const getIsOtpErrorFieldVisible = createSelector(
  getIsOtpInitialRequestFailed,
  getIsDisplayableOtpError,
  (isOtpInitialRequestFailed, isDisplayableOtpError) => isOtpInitialRequestFailed && isDisplayableOtpError
);

export const getOtpErrorTextI18nKey = createSelector(
  getOtpErrorCode,
  errorCode => OTP_SERVER_ERROR_I18N_KEYS[errorCode]
);

export const getShouldShowErrorPopUp = createSelector(
  getIsOtpInitialRequest,
  getIsDisplayableOtpError,
  getIsOtpRequestStatusRejected,
  (isOtpInitialRequest, isDisplayableOtpError, isRequestRejected) => {
    if (!isRequestRejected) return false;

    if (isOtpInitialRequest) return !isDisplayableOtpError;

    return true;
  }
);

export const getShouldShowNetworkErrorPopUp = createSelector(getOtpRequestError, error => error instanceof TypeError);

export const getShouldShowReachedDailyLimitErrorPopUp = createSelector(
  getOtpErrorCode,
  errorCode => errorCode === OTP_API_ERROR_CODES.MEET_DAY_LIMIT.toString()
);

export const getOtpErrorPopUpI18nKeys = createSelector(
  getIsOtpInitialRequest,
  getShouldShowNetworkErrorPopUp,
  getShouldShowReachedDailyLimitErrorPopUp,
  (isOtpInitialRequest, shouldShowNetworkErrorPopUp, shouldShowReachedDailyLimitErrorPopUp) => {
    if (isOtpInitialRequest) {
      return shouldShowNetworkErrorPopUp
        ? OTP_ERROR_POPUP_I18N_KEYS[OTP_COMMON_ERROR_TYPES.NETWORK_ERROR]
        : OTP_ERROR_POPUP_I18N_KEYS[OTP_COMMON_ERROR_TYPES.UNKNOWN_ERROR];
    }

    return shouldShowReachedDailyLimitErrorPopUp
      ? OTP_ERROR_POPUP_I18N_KEYS[OTP_API_ERROR_CODES.MEET_DAY_LIMIT]
      : shouldShowNetworkErrorPopUp
      ? OTP_ERROR_POPUP_I18N_KEYS[OTP_COMMON_ERROR_TYPES.NETWORK_ERROR]
      : OTP_ERROR_POPUP_I18N_KEYS[OTP_COMMON_ERROR_TYPES.UNKNOWN_ERROR];
  }
);

export const getShouldShowLoader = createSelector(
  getIsOtpRequestStatusPending,
  getIsLoginRequestStatusPending,
  (isOtpRequestStatusPending, isLoginRequestStatusPending) => isOtpRequestStatusPending || isLoginRequestStatusPending
);
