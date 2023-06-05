import _get from 'lodash/get';
import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import i18next from 'i18next';
import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import Constants from '../../../utils/constants';
import { COUNTRIES as AVAILABLE_COUNTRIES } from '../../../common/utils/phone-number-constants';
import Utils from '../../../utils/utils';
import CleverTap from '../../../utils/clevertap';
import config from '../../../config';
import Url from '../../../utils/url';
import * as TngUtils from '../../../utils/tng-utils';
import * as ApiRequest from '../../../utils/api-request';
import * as NativeMethods from '../../../utils/native-methods';
import logger from '../../../utils/monitoring/logger';

import { APP_TYPES } from '../types';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { post } from '../../../utils/api/api-fetch';
import { getConsumerLoginStatus, getProfileInfo, getConsumerCustomerInfo } from './api-request';
import { REGISTRATION_SOURCE } from '../../../common/utils/constants';
import { isWebview, isTNGMiniProgram, setCookieVariable } from '../../../common/utils';
import { toast } from '../../../common/utils/feedback';
import { ERROR_TYPES } from '../../../utils/api/constants';

const localePhoneNumber = Utils.getLocalStorageVariable('user.p');
const {
  AUTH_INFO,
  OTP_REQUEST_PLATFORM,
  API_REQUEST_STATUS,
  OTP_REQUEST_TYPES,
  OTP_BFF_ERROR_CODES,
  OTP_API_ERROR_CODES,
  SMS_API_ERROR_CODES,
  OTP_COMMON_ERROR_TYPES,
  OTP_SERVER_ERROR_I18N_KEYS,
  OTP_ERROR_POPUP_I18N_KEYS,
} = Constants;

export const initialState = {
  user: {
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
    showRequestLoginModal: false,
    createOtpRequestStatus: null,
    updateOtpRequestStatus: null,
    loginRequestStatus: null,
    loadConsumerCustomerStatus: null,
    loadConsumerIsLoginStatus: null,
    loadBeepIsAppLoginStatus: null,
  },
  customerInfo: {},
  error: null, // network error
  messageInfo: {
    show: false,
    key: null,
    message: null,
  }, // message modal
  business: config.business,
  onlineStoreInfo: {
    id: '',
    logo: null,
    isFetching: false,
    loadOnlineStoreInfoStatus: null,
  },
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

const fetchCoreBusiness = variables => ({
  [FETCH_GRAPHQL]: {
    types: [types.FETCH_CORE_BUSINESS_REQUEST, types.FETCH_CORE_BUSINESS_SUCCESS, types.FETCH_CORE_BUSINESS_FAILURE],
    endpoint: Url.apiGql('CoreBusiness'),
    variables,
  },
});

//action creators
export const actions = {
  showRequestLoginModal: () => ({
    type: types.SHOW_REQUEST_LOGIN_MODAL,
  }),
  hideRequestLoginModal: () => ({
    type: types.HIDE_REQUEST_LOGIN_MODAL,
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
      logger.error('Cash_loadConsumerLoginStatusFailed', { message: error?.message });

      dispatch({
        type: types.FETCH_LOGIN_STATUS_FAILURE,
        error,
      });
    }
  },

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

  loadConsumerCustomerInfo: ({ consumerId }) => async dispatch => {
    try {
      dispatch({ type: types.LOAD_CONSUMER_CUSTOMER_INFO_PENDING });

      if (consumerId) {
        setCookieVariable('consumerId', consumerId);
      }

      const result = await getConsumerCustomerInfo(consumerId);

      dispatch({
        type: types.LOAD_CONSUMER_CUSTOMER_INFO_FULFILLED,
        response: result,
      });
    } catch (error) {
      dispatch({ type: types.LOAD_CONSUMER_CUSTOMER_INFO_REJECTED });
    }
  },

  loginByBeepApp: () => async (dispatch, getState) => {
    try {
      const tokens = await NativeMethods.getTokenAsync();
      const { access_token: accessToken, refresh_token: refreshToken } = tokens;

      if (_isEmpty(accessToken) || _isEmpty(refreshToken)) return;

      const source = REGISTRATION_SOURCE.BEEP_APP;

      await dispatch(actions.loginApp({ accessToken, refreshToken, source }));

      const isTokenExpired = getIsUserExpired(getState());

      if (isTokenExpired) {
        const tokens = await NativeMethods.tokenExpiredAsync();
        const { access_token: accessToken, refresh_token: refreshToken } = tokens;

        await dispatch(actions.loginApp({ accessToken, refreshToken, source }));
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

  syncLoginFromNative: () => async (dispatch, getState) => {
    try {
      const isLogin = getIsUserLogin(getState());
      if (isLogin) {
        return;
      }

      const isAppLogin = NativeMethods.getLoginStatus();

      if (!isAppLogin) {
        dispatch(actions.showRequestLoginModal());
        return;
      }

      dispatch(actions.loadByBeepApp());
    } catch (e) {
      logger.error('Cashback_syncLoginFromNativeFailed', { message: e?.message, code: e?.code });
    }
  },

  loginByTngMiniProgram: () => async (dispatch, getState) => {
    if (!isTNGMiniProgram()) {
      throw new Error('Not in tng mini program');
    }

    try {
      const business = getBusiness(getState());

      const tokens = await TngUtils.getAccessToken({ business: business });

      const { access_token, refresh_token } = tokens;

      await dispatch(actions.loginApp({ accessToken: access_token, refreshToken: refresh_token }));
    } catch (error) {
      logger.error('Cashback_LoginByTngMiniProgramFailed', { message: error?.message });

      return false;
    }

    return getIsUserLogin(getState());
  },

  syncLoginFromTngMiniProgram: () => async (dispatch, getState) => {
    try {
      const isLogin = getIsUserLogin(getState());

      if (!isLogin) {
        dispatch(actions.showRequestLoginModal());
        return;
      }

      dispatch(actions.loginByTngMiniProgram());
    } catch (e) {
      logger.error('Cashback_syncLoginFromTngMiniProgramFailed', { message: e?.message, code: e?.code });
    }
  },

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

  loadCoreBusiness: () => async dispatch => {
    const { business } = config;

    await dispatch(fetchCoreBusiness({ business }));
  },

  loadOnlineStoreInfo: () => ({
    [FETCH_GRAPHQL]: {
      types: [
        types.FETCH_ONLINE_STORE_INFO_REQUEST,
        types.FETCH_ONLINE_STORE_INFO_SUCCESS,
        types.FETCH_ONLINE_STORE_INFO_FAILURE,
      ],
      endpoint: Url.apiGql('OnlineStoreInfo'),
    },
  }),

  loadCashbackBusiness: () => ({
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
  const { type, response, responseGql, prompt, error, payload } = action || {};
  const { login, consumerId, supportWhatsApp, storeCreditInfo, customerId } = response || {};
  const { storeCreditsBalance } = storeCreditInfo || {};
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
      return { ...state, isError: false, createOtpRequestStatus: API_REQUEST_STATUS.PENDING };
    case types.CREATE_OTP_FAILURE:
      return { ...state, isError: true, createOtpRequestStatus: API_REQUEST_STATUS.REJECTED };
    case types.CREATE_OTP_SUCCESS:
      const { access_token, refresh_token } = response;

      return {
        ...state,
        createOtpRequestStatus: API_REQUEST_STATUS.FULFILLED,
        accessToken: access_token,
        refreshToken: refresh_token,
      };
    case types.RESET_CREATE_OTP_REQUEST:
      return { ...state, isError: false, createOtpRequestStatus: null };
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
        loadConsumerIsLoginStatus: API_REQUEST_STATUS.PENDING,
      };
    case types.FETCH_LOGIN_STATUS_FAILURE:
      return {
        ...state,
        loadConsumerIsLoginStatus: API_REQUEST_STATUS.REJECTED,
      };
    case types.FETCH_LOGIN_STATUS_SUCCESS:
      return {
        ...state,
        isLogin: login,
        consumerId,
        loadConsumerIsLoginStatus: API_REQUEST_STATUS.FULFILLED,
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
        loginRequestStatus: API_REQUEST_STATUS.PENDING,
      };
    }
    case types.CREATE_LOGIN_FAILURE:
      if (['TokenExpiredError', 'JsonWebTokenError'].includes(error?.error)) {
        return { ...state, isExpired: true, loginRequestStatus: API_REQUEST_STATUS.REJECTED };
      }

      return { ...state, loginRequestStatus: API_REQUEST_STATUS.REJECTED };
    case types.CREATE_LOGIN_SUCCESS: {
      return {
        ...state,
        consumerId: _get(payload, 'consumerId', null),
        isLogin: true,
        loginRequestStatus: API_REQUEST_STATUS.FULFILLED,
      };
    }
    // load consumer customer info
    case types.LOAD_CONSUMER_CUSTOMER_INFO_PENDING:
      return {
        ...state,
        loadConsumerCustomerStatus: API_REQUEST_STATUS.PENDING,
      };
    case types.LOAD_CONSUMER_CUSTOMER_INFO_FULFILLED:
      return {
        ...state,
        storeCreditsBalance,
        customerId,
        loadConsumerCustomerStatus: API_REQUEST_STATUS.FULFILLED,
      };
    case types.LOAD_CONSUMER_CUSTOMER_INFO_REJECTED:
      return {
        ...state,
        loadConsumerCustomerStatus: API_REQUEST_STATUS.REJECTED,
      };
    // fetch online store info success
    // fetch core business success
    case types.FETCH_ONLINE_STORE_INFO_SUCCESS:
    case types.FETCH_CORE_BUSINESS_SUCCESS:
      const { data } = responseGql;
      const { business, onlineStoreInfo } = data || {};

      if (!state.phone && business && business.country) {
        return { ...state, country: business.country };
      } else if (!state.phone && onlineStoreInfo && onlineStoreInfo.country) {
        return { ...state, country: onlineStoreInfo.country };
      } else {
        return state;
      }
    case types.UPDATE_USER:
      return Object.assign({}, state, action.user);
    case types.SET_LOGIN_PROMPT:
      return { ...state, prompt };
    case types.SHOW_REQUEST_LOGIN_MODAL:
      return { ...state, showRequestLoginModal: true };
    case types.HIDE_REQUEST_LOGIN_MODAL:
      return { ...state, showRequestLoginModal: false };
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
    case types.FETCH_CASHBACK_BUSINESS_SUCCESS:
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
    case types.FETCH_ONLINE_STORE_INFO_REQUEST:
      return { ...state, isFetching: true, loadOnlineStoreInfoStatus: API_REQUEST_STATUS.PENDING };
    case types.FETCH_ONLINE_STORE_INFO_SUCCESS:
      return {
        ...state,
        isFetching: false,
        id: onlineStoreInfo.id || '',
        loadOnlineStoreInfoStatus: API_REQUEST_STATUS.FULFILLED,
      };
    case types.FETCH_ONLINE_STORE_INFO_FAILURE:
      return { ...state, isFetching: false, loadOnlineStoreInfoStatus: API_REQUEST_STATUS.REJECTED };
    default:
      return state;
  }
};

const coreBusiness = (state = initialState.coreBusiness, action) => {
  const { type, responseGql } = action || {};
  const enableCashback = _get(responseGql, 'data.business.enableCashback', false);

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
  coreBusiness,
  requestInfo,
});

// selectors
export const getUser = state => state.app.user;
export const getOtpRequest = state => state.app.user.otpRequest;
export const getUserProfile = state => state.app.user.profile;
export const getBusiness = state => state.app.business;
export const getBusinessInfo = state => getBusinessByName(state, state.app.business);
export const getError = state => state.app.error;
export const getOnlineStoreInfo = state => state.entities.onlineStores[state.app.onlineStoreInfo.id];
export const getCoreBusiness = state => state.app.coreBusiness;
export const getRequestInfo = state => state.app.requestInfo;
export const getMessageInfo = state => state.app.messageInfo;

export const getOnlineStoreInfoFavicon = createSelector(getOnlineStoreInfo, onlineStoreInfo =>
  _get(onlineStoreInfo, 'favicon', null)
);

export const getLoadOnlineStoreInfoStatus = state => _get(state.app.onlineStoreInfo, 'loadOnlineStoreInfoStatus', null);

export const getIsOnlineStoreInfoLoaded = createSelector(
  getLoadOnlineStoreInfoStatus,
  loadOnlineStoreInfoStatus => loadOnlineStoreInfoStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsLoadOnlineStoreInfoFailed = createSelector(
  getLoadOnlineStoreInfoStatus,
  loadOnlineStoreInfoStatus => loadOnlineStoreInfoStatus === API_REQUEST_STATUS.REJECTED
);

export const getBusinessUTCOffset = createSelector(getBusinessInfo, businessInfo =>
  _get(businessInfo, 'timezoneOffset', 480)
);

export const getLoadCoreBusinessStatus = createSelector(getCoreBusiness, coreBusiness =>
  _get(coreBusiness, 'loadCoreBusinessStatus', null)
);

export const getIsCoreBusinessLoaded = createSelector(
  getLoadCoreBusinessStatus,
  loadCoreBusinessStatus => loadCoreBusinessStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsLoadCoreBusinessFailed = createSelector(
  getLoadCoreBusinessStatus,
  loadCoreBusinessStatus => loadCoreBusinessStatus === API_REQUEST_STATUS.REJECTED
);

export const getIsCoreBusinessEnableCashback = createSelector(getCoreBusiness, coreBusiness =>
  _get(coreBusiness, 'enableCashback', false)
);

export const getLoginBannerPrompt = createSelector(getUser, user => _get(user, 'prompt', null));

export const getIsUserLogin = createSelector(getUser, user => _get(user, 'isLogin', false));

export const getIsUserExpired = createSelector(getUser, user => _get(user, 'isExpired', false));

export const getIsLoginRequestModalShown = createSelector(getUser, user => _get(user, 'showRequestLoginModal', false));

export const getUserConsumerId = createSelector(getUser, user => _get(user, 'consumerId', null));

export const getLoadConsumerCustomerStatus = createSelector(getUser, user =>
  _get(user, 'loadConsumerCustomerStatus', 0)
);

export const getIsConsumerCustomerLoaded = createSelector(
  getLoadConsumerCustomerStatus,
  loadConsumerCustomerStatus => loadConsumerCustomerStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsLoadConsumerCustomerFailed = createSelector(
  getLoadConsumerCustomerStatus,
  loadConsumerCustomerStatus => loadConsumerCustomerStatus === API_REQUEST_STATUS.REJECTED
);

export const getUserStoreCashback = createSelector(getUser, user => _get(user, 'storeCreditsBalance', 0));

export const getIsLoginRequestFailed = createSelector(getUser, user => _get(user, 'isError', false));

export const getCreateOtpRequestStatus = createSelector(getUser, user => _get(user, 'createOtpRequestStatus', null));

export const getIsCreateOtpRequestStatusPending = createSelector(
  getCreateOtpRequestStatus,
  createOtpRequestStatus => createOtpRequestStatus === API_REQUEST_STATUS.PENDING
);

export const getIsOtpRequestStatusCreated = createSelector(
  getCreateOtpRequestStatus,
  createOtpRequestStatus => createOtpRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsCreateOtpRequestStatusFailed = createSelector(
  getCreateOtpRequestStatus,
  createOtpRequestStatus => createOtpRequestStatus === API_REQUEST_STATUS.REJECTED
);

export const getLoadConsumerIsLoginStatus = createSelector(getUser, user =>
  _get(user, 'loadConsumerIsLoginStatus', null)
);

export const getIsConsumerIsLoginStatusLoaded = createSelector(
  getLoadConsumerIsLoginStatus,
  loadConsumerIsLoginStatus => loadConsumerIsLoginStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsLoadConsumerIsLoginStatusFailed = createSelector(
  getLoadConsumerIsLoginStatus,
  loadConsumerIsLoginStatus => loadConsumerIsLoginStatus === API_REQUEST_STATUS.REJECTED
);

export const getLoginRequestStatus = createSelector(getUser, user => _get(user, 'loginRequestStatus', null));

export const getIsLoginRequestStatusFulfilled = createSelector(
  getLoginRequestStatus,
  loginRequestStatus => loginRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsLoginRequestStatusRejected = createSelector(
  getLoginRequestStatus,
  loginRequestStatus => loginRequestStatus === API_REQUEST_STATUS.REJECTED
);

export const getLoadAppLoginStatus = createSelector(getUser, user => _get(user, 'loadBeepIsAppLoginStatus', null));

export const getIsAppLoginStatusLoaded = createSelector(
  getLoadAppLoginStatus,
  loadAppLoginStatus => loadAppLoginStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsAppLoginStatusFailed = createSelector(
  getLoadAppLoginStatus,
  loadAppLoginStatus => loadAppLoginStatus === API_REQUEST_STATUS.REJECTED
);

export const getIsDisplayLoginBanner = createSelector(
  getIsUserLogin,
  getIsConsumerIsLoginStatusLoaded,
  getIsLoadConsumerIsLoginStatusFailed,
  getIsLoginRequestStatusFulfilled,
  getIsLoginRequestStatusRejected,
  (
    isUserLogin,
    isConsumerIsLoginStatusLoaded,
    isLoadConsumerIsLoginStatusFailed,
    isLoginRequestStatusFulfilled,
    isLoginRequestStatusRejected
  ) =>
    !isWebview() &&
    !isTNGMiniProgram() &&
    !isUserLogin &&
    (isConsumerIsLoginStatusLoaded ||
      isLoadConsumerIsLoginStatusFailed ||
      isLoginRequestStatusFulfilled ||
      isLoginRequestStatusRejected)
);

export const getOtpRequestStatus = createSelector(getOtpRequest, otp => otp.status);

export const getOtpRequestError = createSelector(getOtpRequest, otp => otp.error);

export const getOtpType = createSelector(getOtpRequest, otp => _get(otp, 'data.type', null));

export const getOtpErrorCode = createSelector(getOtpRequestError, error => _get(error, 'code', null));

export const getOtpErrorName = createSelector(getOtpRequestError, error => _get(error, 'name', null));

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
  getIsCreateOtpRequestStatusPending,
  (isOtpRequestStatusPending, isCreateOtpRequestStatusPending) =>
    isOtpRequestStatusPending || isCreateOtpRequestStatusPending
);
