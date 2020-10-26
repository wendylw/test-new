import { combineReducers } from 'redux';
import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';
import config from '../../../config';
import Url from '../../../utils/url';

import { APP_TYPES } from '../types';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { post, get } from '../../../utils/request';
import i18next from 'i18next';
import url from '../../../utils/url';
import { toISODateString } from '../../../utils/datetime-lib';

const { AUTH_INFO } = Constants;

export const initialState = {
  user: {
    showLoginPage: false,
    isWebview: Utils.isWebview(),
    isLogin: false,
    isExpired: false,
    hasOtp: false,
    consumerId: config.consumerId,
    customerId: '',
    storeCreditsBalance: 0,
    profile: {
      phone: '',
      name: '',
      email: '',
      birthday: null,
    },
  },
  error: null, // network error
  messageModal: {
    show: false,
    message: '',
    description: '',
    buttonText: '',
  }, // message modal
  apiError: {
    show: false,
    message: '',
    description: '',
    buttonText: '',
    code: null,
    redirectUrl: '',
  },
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
  showLogin: () => ({
    type: types.SHOW_LOGIN_PAGE,
  }),

  hideLogin: () => ({
    type: types.HIDE_LOGIN_PAGE,
  }),

  loginApp: ({ accessToken, refreshToken }) => dispatch =>
    dispatch({
      types: [types.CREATE_LOGIN_REQUEST, types.CREATE_LOGIN_SUCCESS, types.CREATE_LOGIN_FAILURE],
      requestPromise: post(Url.API_URLS.POST_LOGIN.url, {
        accessToken,
        refreshToken,
        fulfillDate: Utils.getFulfillDate().expectDeliveryDateFrom,
        shippingType: Utils.getApiRequestShippingType(),
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

  phoneNumberLogin: ({ phone }) => dispatch =>
    dispatch({
      types: [types.CREATE_LOGIN_REQUEST, types.CREATE_LOGIN_SUCCESS, types.CREATE_LOGIN_FAILURE],
      requestPromise: post(Url.API_URLS.PHONE_NUMBER_LOGIN.url, {
        phone,
        fulfillDate: Utils.getFulfillDate().expectDeliveryDateFrom,
        shippingType: Utils.getApiRequestShippingType(),
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
    requestPromise: get(Url.API_URLS.GET_LOGIN_STATUS.url).then(resp => {
      if (resp) {
        if (resp.consumerId) {
          window.heap?.identify(resp.consumerId);
          window.heap?.addEventProperties({ LoggedIn: 'yes' });
        } else {
          window.heap?.resetIdentity();
          window.heap?.addEventProperties({ LoggedIn: 'no' });
        }
      }
      return resp;
    }),
  }),

  setLoginPrompt: prompt => ({
    type: types.SET_LOGIN_PROMPT,
    prompt,
  }),

  showError: ({ message, code = 500 }) => ({
    type: types.SHOW_ERROR,
    message,
    code,
  }),

  clearError: () => ({
    type: types.CLEAR_ERROR,
  }),

  showMessageModal: ({ message, description, buttonText = '' }) => ({
    type: types.SET_MESSAGE_INFO,
    message,
    description,
    buttonText,
  }),

  hideMessageModal: () => ({
    type: types.HIDE_MESSAGE_MODAL,
  }),
  hideApiMessageModal: () => ({
    type: types.CLEAR_API_ERROR,
  }),

  updateProfileInfo: fields => ({
    type: types.UPDATE_PROFILE_INFO,
    fields,
  }),

  getProfileInfo: consumerId => ({
    [API_REQUEST]: {
      types: [types.FETCH_PROFILE_REQUEST, types.FETCH_PROFILE_SUCCESS, types.FETCH_PROFILE_FAILURE],
      ...url.API_URLS.GET_CONSUMER_PROFILE(consumerId),
    },
  }),

  createOrUpdateProfile: () => (dispatch, getState) => {
    const state = getState();
    const consumerId = state.user.consumerId;
    const profile = state.user.profile;
    return {
      [API_REQUEST]: {
        types: [
          types.CREATE_OR_UPDATE_PROFILE_REQUEST,
          types.CREATE_OR_UPDATE_PROFILE_SUCCESS,
          types.CREATE_OR_UPDATE_PROFILE_FAILURE,
        ],
        ...url.API_URLS.CREATE_AND_UPDATE_PROFILE(consumerId),
        payload: {
          firstName: profile.name,
          email: profile.email,
          birthday: profile.birthday,
        },
      },
    };
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

  loadCoreBusiness: id => dispatch => {
    const { storeId, business } = config;

    return dispatch(fetchCoreBusiness({ business, storeId: id || storeId }));
  },

  loadCustomerProfile: () => (dispatch, getState) => {
    const { app } = getState();

    if (app.user.consumerId) {
      document.cookie = `consumerId=${app.user.consumerId}`;
    }

    return dispatch(fetchCustomerProfile(app.user.consumerId || config.consumerId));
  },
};

const fetchCoreBusiness = variables => ({
  [FETCH_GRAPHQL]: {
    types: [types.FETCH_COREBUSINESS_REQUEST, types.FETCH_COREBUSINESS_SUCCESS, types.FETCH_COREBUSINESS_FAILURE],
    endpoint: Url.apiGql('CoreBusiness'),
    variables,
  },
});

export const fetchCustomerProfile = consumerId => ({
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
  const { type, response, prompt, error, fields } = action;
  const { consumerId, login, user } = response || {};

  switch (type) {
    case types.SHOW_LOGIN_PAGE:
      return { ...state, showLoginPage: true };
    case types.HIDE_LOGIN_PAGE:
      return { ...state, showLoginPage: false };
    case types.FETCH_LOGIN_STATUS_REQUEST:
    case types.GET_OTP_REQUEST:
    case types.CREATE_OTP_REQUEST:
    case types.CREATE_LOGIN_REQUEST:
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
        profile: {
          phone: user.phone,
          name: user.firstName,
          email: user.email,
          birthday: toISODateString(user.birthday),
        },
        isLogin: true,
        hasOtp: false,
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
      if (error && error.code === 401) {
        return { ...state, isExpired: true, isFetching: false };
      }

      return { ...state, isFetching: false };
    case types.SET_LOGIN_PROMPT:
      return { ...state, prompt };
    case types.FETCH_CUSTOMER_PROFILE_SUCCESS:
      const { storeCreditsBalance, customerId } = response || {};

      return { ...state, storeCreditsBalance, customerId };
    case types.UPDATE_PROFILE_INFO:
      return {
        ...state,
        profile: {
          ...state.profile,
          ...fields,
        },
      };
    case types.FETCH_PROFILE_SUCCESS:
      const { firstName, email, birthday } = response || {};
      return {
        ...state,
        profile: {
          name: firstName,
          email,
          birthday,
        },
      };

    case types.CREATE_OR_UPDATE_PROFILE_SUCCESS:
      const { success } = response || {};
      return {
        ...state,
        success,
      };
    default:
      return state;
  }
};

const error = (state = initialState.error, action) => {
  const { type, code, message, response, responseGql } = action;
  const result = response || (responseGql || {}).data;
  const errorCode = code || (result || {}).code;

  if (type === types.CLEAR_ERROR || code === 200) {
    return null;
  } else if (code && code !== 401 && Object.values(Constants.CREATE_ORDER_ERROR_CODES).includes(code)) {
    let errorMessage = message;

    return {
      ...state,
      code,
      message: errorMessage,
    };
  } else if (code && code !== 401 && type === types.CREATE_OTP_FAILURE) {
    let errorMessage = Constants.LOGIN_PROMPT[code];

    return {
      ...state,
      code,
      message: errorMessage,
    };
  }

  return state;
};

const business = (state = initialState.business, action) => state;

const onlineStoreInfo = (state = initialState.onlineStoreInfo, action) => {
  const { type, responseGql } = action;

  if (!(responseGql && responseGql.data.onlineStoreInfo)) {
    return state;
  }

  switch (type) {
    case types.FETCH_ONLINESTOREINFO_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_ONLINESTOREINFO_SUCCESS:
      return { ...state, isFetching: false, id: action.responseGql.data.onlineStoreInfo.id };
    case types.FETCH_ONLINESTOREINFO_FAILURE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

const apiError = (state = initialState.apiError, action) => {
  const { type, code, message, response, responseGql } = action;
  const result = response || (responseGql || {}).data;
  const errorCode = code || (result || {}).code;
  const { ERROR_CODE_MAP } = Constants;
  const error = ERROR_CODE_MAP[errorCode];

  if (type === types.CLEAR_API_ERROR) {
    return {
      ...state,
      show: false,
      message: '',
      description: '',
      buttonText: '',
      code: null,
      redirectUrl: '',
    };
  }

  if (error) {
    return {
      ...state,
      show: error.showModal,
      code: errorCode,
      message: i18next.t(error.title, { error_code: errorCode }),
      description: i18next.t(error.desc),
      buttonText: i18next.t(error.buttonText),
      redirectUrl: error.redirectUrl,
    };
  } else {
    // TODO add default error message
    return state;
  }
};

const messageModal = (state = initialState.messageModal, action) => {
  switch (action.type) {
    case types.SET_MESSAGE_INFO: {
      const { message, description, buttonText } = action;
      return { ...state, show: true, message, description, buttonText };
    }
    case types.HIDE_MESSAGE_MODAL: {
      return { ...state, show: false, message: '', description: '', buttonText: '' };
    }
    default:
      return state;
  }
};

const requestInfo = (state = initialState.requestInfo, action) => state;

export default combineReducers({
  user,
  error,
  messageModal,
  business,
  onlineStoreInfo,
  requestInfo,
  apiError,
});

// selectors
export const getUser = state => state.app.user;
export const getBusiness = state => state.app.business;
export const getError = state => state.app.error;
export const getOnlineStoreInfo = state => {
  return state.entities.onlineStores[state.app.onlineStoreInfo.id];
};
export const getRequestInfo = state => state.app.requestInfo;
export const getMessageModal = state => state.app.messageModal;
export const getMerchantCountry = state => {
  if (state.entities.businesses[state.app.business]) {
    return state.entities.businesses[state.app.business].country;
  }

  return null;
};
export const getApiError = state => state.app.apiError;
