/* eslint-disable no-use-before-define */
import _get from 'lodash/get';
import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import i18next from 'i18next';
import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import Constants, {
  API_REQUEST_STATUS,
  OTP_BFF_ERROR_CODES,
  OTP_API_ERROR_CODES,
  SMS_API_ERROR_CODES,
  OTP_COMMON_ERROR_TYPES,
  OTP_SERVER_ERROR_I18N_KEYS,
  OTP_ERROR_POPUP_I18N_KEYS,
} from '../../../utils/constants';
import { COUNTRIES as AVAILABLE_COUNTRIES } from '../../../common/utils/phone-number-constants';
import Utils from '../../../utils/utils';
import CleverTap from '../../../utils/clevertap';
import config from '../../../config';
import Url from '../../../utils/url';
import { isAlipayMiniProgram, getAccessToken } from '../../../common/utils/alipay-miniprogram-client';
import * as ApiRequest from '../../../utils/api-request';
import * as NativeMethods from '../../../utils/native-methods';
import logger from '../../../utils/monitoring/logger';

import { APP_TYPES } from '../types';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { post } from '../../../utils/api/api-fetch';
import { getConsumerLoginStatus, getProfileInfo, getCoreBusinessInfo } from './api-request';
import { REGISTRATION_SOURCE, PATH_NAME_MAPPING } from '../../../common/utils/constants';
import { isJSON } from '../../../common/utils';
import { toast } from '../../../common/utils/feedback';
import { ERROR_TYPES } from '../../../utils/api/constants';

const localePhoneNumber = Utils.getLocalStorageVariable('user.p');
const { AUTH_INFO, OTP_REQUEST_PLATFORM, OTP_REQUEST_TYPES } = Constants;

export const initialState = {
  user: {
    isLogin: false,
    isExpired: false,
    consumerId: config.consumerId,
    isError: false,
    otpRequest: {
      data: {
        type: OTP_REQUEST_TYPES.OTP,
      },
      status: null,
      error: null,
    },
    loginAlipayMiniProgramRequest: {
      status: null,
      error: null,
    },
    country: Utils.getCountry(localePhoneNumber, navigator.language, AVAILABLE_COUNTRIES, 'MY'),
    phone: localePhoneNumber,
    prompt: null,
    noWhatsAppAccount: true,
    profile: {
      id: '',
      phone: '',
      firstName: '',
      lastName: '',
      email: '',
      gender: '',
      birthday: '',
      birthdayModifiedTime: '',
      notificationSettings: '',
      birthdayChangeAllowed: false,
      status: null,
    },
    showLoginModal: false,
  },
  error: null, // network error
  business: config.business,
  coreBusiness: {
    enableCashback: true,
    loadCoreBusinessStatus: null,
  },
  requestInfo: {
    tableId: config.table,
    storeId: config.storeId,
  },
};

export const types = APP_TYPES;

// action creators
export const actions = {
  showLoginModal: () => ({
    type: types.SHOW_LOGIN_MODAL,
  }),
  hideLoginModal: () => ({
    type: types.HIDE_LOGIN_MODAL,
  }),
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
        error,
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

      dispatch({ type: types.GET_OTP_REQUEST, payload: { otpType } });

      await post(Url.API_URLS.GET_OTP.url, {
        ...payload,
        platform: OTP_REQUEST_PLATFORM,
      });

      dispatch({ type: types.GET_OTP_SUCCESS });
    } catch (error) {
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

  loadConsumerLoginStatus: () => async (dispatch, getState) => {
    try {
      dispatch({ type: types.FETCH_LOGIN_STATUS_REQUEST });
      const result = await getConsumerLoginStatus();
      const { consumerId, login } = result;

      if (login) {
        await dispatch(actions.loadProfileInfo(consumerId));

        const profile = getUserProfile(getState());
        const { firstName, phone, email, birthday } = profile || {};

        const userInfo = {
          Name: firstName,
          Phone: phone,
          Identity: consumerId,
        };

        if (email) {
          userInfo.Email = email;
        }

        if (birthday) {
          userInfo.DOB = new Date(birthday);
        }

        CleverTap.onUserLogin(userInfo);
      }

      dispatch({
        type: types.FETCH_LOGIN_STATUS_SUCCESS,
        response: result,
      });
    } catch (error) {
      logger.error('Cashback_loadConsumerLoginStatusFailed', { message: error?.message });

      dispatch({
        type: types.FETCH_LOGIN_STATUS_FAILURE,
        error,
      });
    }
  },

  resetConsumerLoginStatus: () => ({
    type: types.RESET_LOGIN_STATUS_REQUEST,
  }),

  loadProfileInfo: consumerId => async dispatch => {
    try {
      dispatch({ type: types.LOAD_CONSUMER_PROFILE_PENDING });

      const result = await getProfileInfo(consumerId);

      dispatch({
        type: types.LOAD_CONSUMER_PROFILE_FULFILLED,
        payload: result,
      });
    } catch (error) {
      logger.error('Cashback_LoadProfileInfoFailed', { message: error?.message });

      dispatch({
        type: types.LOAD_CONSUMER_PROFILE_REJECTED,
        error,
      });
    }
  },

  updateUser: (user = {}) => ({
    type: types.UPDATE_USER,
    user,
  }),

  resetConsumerCustomerInfo: () => ({
    type: types.RESET_CONSUMER_CUSTOMER_INFO,
  }),

  loginByBeepApp: () => async (dispatch, getState) => {
    try {
      const tokens = await NativeMethods.getTokenAsync();

      const { access_token: accessToken, refresh_token: refreshToken } = tokens;

      if (_isEmpty(accessToken) || _isEmpty(refreshToken)) return;

      const source = REGISTRATION_SOURCE.BEEP_APP;

      await dispatch(actions.loginApp({ accessToken, refreshToken, source }));

      const isTokenExpired = getIsUserExpired(getState());

      if (isTokenExpired) {
        const validTokens = await NativeMethods.tokenExpiredAsync();

        await dispatch(
          actions.loginApp({
            accessToken: validTokens.access_token,
            refreshToken: validTokens.refresh_token,
            source,
          })
        );
      }
    } catch (e) {
      if (e?.code === 'B0001') {
        toast(i18next.t('ApiError:B0001Description'));
      } else {
        toast(i18next.t('Common:UnknownError'));
      }

      logger.error('Cashback_LoginByBeepAppFailed', { message: e?.message, code: e?.code });
    }
  },

  syncLoginFromBeepApp: () => async (dispatch, getState) => {
    try {
      const isUserLogin = getIsUserLogin(getState());

      if (isUserLogin) {
        return;
      }

      await dispatch(actions.loginByBeepApp());
    } catch (e) {
      logger.error('Cashback_syncLoginFromBeepAppFailed', { message: e?.message, code: e?.code });
    }
  },

  loginByAlipayMiniProgram: () => async (dispatch, getState) => {
    try {
      dispatch({
        type: types.CREATE_LOGIN_ALIPAY_REQUEST,
      });

      if (!isAlipayMiniProgram()) {
        throw new Error('Not in alipay mini program');
      }

      const business = getBusiness(getState());
      const tokens = await getAccessToken({ business });
      const { access_token: accessToken, refresh_token: refreshToken } = tokens;

      await dispatch(actions.loginApp({ accessToken, refreshToken }));

      dispatch({
        type: types.CREATE_LOGIN_ALIPAY_SUCCESS,
      });
    } catch (error) {
      dispatch({
        type: types.CREATE_LOGIN_ALIPAY_FAILURE,
        error: isJSON(error?.message) ? JSON.parse(error.message) : error,
      });

      logger.error('Cashback_LoginByAlipayMiniProgram', { message: error?.message });

      return false;
    }

    return getIsUserLogin(getState());
  },

  clearError: () => ({
    type: types.CLEAR_ERROR,
  }),

  setLoginPrompt: prompt => ({
    type: types.SET_LOGIN_PROMPT,
    prompt,
  }),

  loadCoreBusiness: () => async dispatch => {
    try {
      await dispatch({
        type: types.FETCH_CORE_BUSINESS_REQUEST,
      });
      const { business } = config;
      const response = await getCoreBusinessInfo(business);
      const { enableCashback } = _get(response, 'data.business', {});

      await dispatch({
        type: types.FETCH_CORE_BUSINESS_SUCCESS,
        payload: { enableCashback },
      });
    } catch (e) {
      await dispatch({
        type: types.FETCH_CORE_BUSINESS_FAILURE,
      });

      logger.error('Cashback_LoadCoreBusinessFailed', { message: e?.message });
    }
  },

  fetchCashbackBusiness: () => ({
    [API_REQUEST]: {
      types: [
        types.FETCH_CASHBACK_BUSINESS_REQUEST,
        types.FETCH_CASHBACK_BUSINESS_SUCCESS,
        types.FETCH_CASHBACK_BUSINESS_FAILURE,
      ],
      ...Url.API_URLS.GET_CASHBACK_BUSINESS,
      params: {
        storeId: config.storeId,
      },
    },
  }),
};

const user = (state = initialState.user, action) => {
  const { type, response, prompt, error, payload } = action || {};
  const { login, consumerId, supportWhatsApp, access_token: accessToken, refresh_token: refreshToken } = response || {};
  const otpType = _get(payload, 'otpType', null);

  switch (type) {
    // get otp
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
    case types.GET_OTP_FAILURE:
      return { ...state, otpRequest: { ...state.otpRequest, status: API_REQUEST_STATUS.REJECTED, error } };
    case types.GET_OTP_SUCCESS:
      return { ...state, otpRequest: { ...state.otpRequest, status: API_REQUEST_STATUS.FULFILLED } };
    case types.RESET_GET_OTP_REQUEST:
      return { ...state, otpRequest: _cloneDeep(initialState.user.otpRequest) };
    // create otp
    case types.CREATE_OTP_REQUEST:
      return { ...state, isFetching: true, isError: false };
    case types.CREATE_OTP_FAILURE:
      return { ...state, isFetching: false, isError: true };
    case types.CREATE_OTP_SUCCESS:
      return {
        ...state,
        isFetching: false,
        accessToken,
        refreshToken,
      };
    case types.RESET_CREATE_OTP_REQUEST:
      return { ...state, isFetching: false, isError: false };
    // get whatsapp support
    case types.GET_WHATSAPPSUPPORT_REQUEST:
      return { ...state, noWhatsAppAccount: true };
    case types.GET_WHATSAPPSUPPORT_SUCCESS:
      return { ...state, noWhatsAppAccount: !supportWhatsApp };
    case types.GET_WHATSAPPSUPPORT_FAILURE:
      // Write down here just for the sake of completeness, we won't handle this failure case for now.
      return state;
    // fetch login status
    case types.FETCH_LOGIN_STATUS_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case types.FETCH_LOGIN_STATUS_FAILURE:
      return {
        ...state,
        isFetching: false,
      };
    case types.FETCH_LOGIN_STATUS_SUCCESS:
      return {
        ...state,
        isLogin: login,
        consumerId,
        isFetching: false,
      };
    case types.RESET_LOGIN_STATUS_REQUEST:
      return {
        ...state,
        isFetching: false,
        isLogin: false,
        consumerId: null,
      };
    // load consumer profile
    case types.LOAD_CONSUMER_PROFILE_PENDING:
      return { ...state, profile: { ...state.profile, status: API_REQUEST_STATUS.PENDING } };
    case types.LOAD_CONSUMER_PROFILE_FULFILLED:
      return {
        ...state,
        profile: {
          id: payload.id,
          firstName: payload.firstName,
          lastName: payload.lastName,
          name: payload.firstName,
          phone: payload.phone,
          birthdayModifiedTime: payload.birthdayModifiedTime,
          notificationSettings: payload.notificationSettings,
          email: payload.email,
          birthday: payload.birthday,
          gender: payload.gender,
          birthdayChangeAllowed: payload.birthdayChangeAllowed,
          status: API_REQUEST_STATUS.FULFILLED,
        },
      };
    case types.LOAD_CONSUMER_PROFILE_REJECTED:
      return { ...state, profile: { ...state.profile, status: API_REQUEST_STATUS.REJECTED } };
    // create login
    case types.CREATE_LOGIN_REQUEST: {
      return {
        ...state,
        isFetching: true,
      };
    }
    case types.CREATE_LOGIN_FAILURE:
      if (['TokenExpiredError', 'JsonWebTokenError'].includes(error?.error)) {
        return { ...state, isExpired: true, isFetching: false };
      }

      return { ...state, isFetching: false };
    case types.CREATE_LOGIN_SUCCESS: {
      return {
        ...state,
        consumerId: _get(payload, 'consumerId', null),
        isLogin: true,
        isFetching: false,
      };
    }
    case types.UPDATE_USER:
      return { ...state, ...action.user };
    case types.SET_LOGIN_PROMPT:
      return { ...state, prompt };
    case types.SHOW_LOGIN_MODAL:
      return { ...state, showLoginModal: true };
    case types.HIDE_LOGIN_MODAL:
      return { ...state, showLoginModal: false };
    case types.CREATE_LOGIN_ALIPAY_REQUEST:
      return {
        ...state,
        loginAlipayMiniProgramRequest: {
          status: API_REQUEST_STATUS.PENDING,
          error: null,
        },
      };
    case types.CREATE_LOGIN_ALIPAY_SUCCESS:
      return {
        ...state,
        loginAlipayMiniProgramRequest: {
          status: API_REQUEST_STATUS.FULFILLED,
          error: null,
        },
      };
    case types.CREATE_LOGIN_ALIPAY_FAILURE:
      return {
        ...state,
        loginAlipayMiniProgramRequest: {
          status: API_REQUEST_STATUS.REJECTED,
          error,
        },
      };
    default:
      return state;
  }
};

const error = (state = initialState.error, action) => {
  const { type, code, message } = action;

  if (type === types.CLEAR_ERROR || code === 200) {
    return null;
  }

  if (code && code !== 401) {
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
  const { name } = response || {};

  switch (type) {
    case types.FETCH_CASHBACK_BUSINESS_SUCCESS:
      return name;
    default:
      return state;
  }
};

const coreBusiness = (state = initialState.coreBusiness, action) => {
  const { payload, type } = action || {};
  const enableCashback = payload || {};

  switch (type) {
    case types.FETCH_CORE_BUSINESS_REQUEST:
      return { ...state, loadCoreBusinessStatus: API_REQUEST_STATUS.PENDING };
    case types.FETCH_CORE_BUSINESS_SUCCESS:
      return { ...state, enableCashback, loadCoreBusinessStatus: API_REQUEST_STATUS.FULFILLED };
    case types.FETCH_CORE_BUSINESS_FAILURE:
      return { ...state, loadCoreBusinessStatus: API_REQUEST_STATUS.REJECTED };
    default:
      return state;
  }
};

const requestInfo = (state = initialState.requestInfo) => state;

export default combineReducers({
  user,
  error,
  business,
  coreBusiness,
  requestInfo,
});

// selectors
export const getUser = state => state.app.user;
export const getOtpRequest = state => state.app.user.otpRequest;
export const getLoginAlipayMiniProgramRequest = state => state.app.user.loginAlipayMiniProgramRequest;
export const getUserProfile = state => state.app.user.profile;
export const getBusiness = state => state.app.business;
export const getBusinessInfo = state => getBusinessByName(state, state.app.business);
export const getError = state => state.app.error;
export const getCoreBusiness = state => state.app.coreBusiness;
export const getRequestInfo = state => state.app.requestInfo;

export const getBusinessUTCOffset = createSelector(getBusinessInfo, businessInfo =>
  _get(businessInfo, 'timezoneOffset', 480)
);

// TODO: Will remove from reducer, prompt should in component
export const getIsClaimCashbackPage = () => {
  const { pathname } = window.location;

  return pathname.includes(PATH_NAME_MAPPING.CASHBACK_CLAIM);
};

export const getLoginBannerPrompt = createSelector(getUser, userInfo => _get(userInfo, 'prompt', null));

export const getIsUserLogin = createSelector(getUser, userInfo => _get(userInfo, 'isLogin', false));

export const getUserCountry = createSelector(getUser, userInfo => _get(userInfo, 'country', ''));

export const getIsUserExpired = createSelector(getUser, userInfo => _get(userInfo, 'isExpired', false));

export const getIsLoginModalShown = createSelector(getUser, userInfo => _get(userInfo, 'showLoginModal', false));

export const getUserConsumerId = createSelector(getUser, userInfo => _get(userInfo, 'consumerId', null));

export const getIsLoginRequestFailed = createSelector(getUser, userInfo => _get(userInfo, 'isError', false));

export const getIsLoginRequestStatusPending = createSelector(getUser, userInfo => _get(userInfo, 'isFetching', false));

export const getOtpRequestStatus = createSelector(getOtpRequest, otp => otp.status);

export const getOtpRequestError = createSelector(getOtpRequest, otp => otp.error);

export const getOtpType = createSelector(getOtpRequest, otp => _get(otp, 'data.type', null));

export const getOtpErrorCode = createSelector(getOtpRequestError, otpErrorInfo => _get(otpErrorInfo, 'code', null));

export const getOtpErrorName = createSelector(getOtpRequestError, otpErrorInfo => _get(otpErrorInfo, 'name', null));

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
    OTP_BFF_ERROR_CODES.PHONE_INVALID,
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

export const getShouldShowNetworkErrorPopUp = createSelector(
  getOtpErrorName,
  errorName => errorName === ERROR_TYPES.NETWORK_ERROR
);

export const getShouldShowOtpApiErrorPopUp = createSelector(
  getOtpErrorCode,
  getIsOtpInitialRequest,
  (errorCode, isOtpInitialRequest) => {
    const isHighRiskError = errorCode === OTP_API_ERROR_CODES.HIGH_RISK.toString();

    if (isHighRiskError) return true;

    const isReachedDailyLimitError = errorCode === OTP_API_ERROR_CODES.MEET_DAY_LIMIT.toString();

    return !isOtpInitialRequest && isReachedDailyLimitError;
  }
);

export const getOtpErrorPopUpI18nKeys = createSelector(
  getOtpErrorCode,
  getShouldShowOtpApiErrorPopUp,
  getShouldShowNetworkErrorPopUp,
  (errorCode, shouldShowOtpApiErrorPopUp, shouldShowNetworkErrorPopUp) =>
    shouldShowOtpApiErrorPopUp
      ? OTP_ERROR_POPUP_I18N_KEYS[errorCode]
      : shouldShowNetworkErrorPopUp
      ? OTP_ERROR_POPUP_I18N_KEYS[OTP_COMMON_ERROR_TYPES.NETWORK_ERROR]
      : OTP_ERROR_POPUP_I18N_KEYS[OTP_COMMON_ERROR_TYPES.UNKNOWN_ERROR]
);

export const getShouldShowLoader = createSelector(
  getIsOtpRequestStatusPending,
  getIsLoginRequestStatusPending,
  (isOtpRequestStatusPending, isLoginRequestStatusPending) => isOtpRequestStatusPending || isLoginRequestStatusPending
);
