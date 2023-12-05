/* eslint-disable no-use-before-define */
import qs from 'qs';
import i18next from 'i18next';
import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import _cloneDeep from 'lodash/cloneDeep';
import { replace } from 'connected-react-router';
import Constants, { API_REQUEST_STATUS, REGISTRATION_SOURCE } from '../../../../utils/constants';
import Utils from '../../../../utils/utils';
import config from '../../../../config';
import Url from '../../../../utils/url';
import * as ApiRequest from '../../../../utils/api-request';
import CleverTap from '../../../../utils/clevertap';

import { APP_TYPES } from './types';
import { API_REQUEST } from '../../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../../redux/middlewares/apiGql';
import { get } from '../../../../utils/request';
import { post } from '../../../../utils/api/api-fetch';
import { getAllProducts } from '../../../../redux/modules/entities/products';
import { getCategoryList } from '../../../../redux/modules/entities/categories';
import { getProfileInfo, postLoginGuest } from './api-request';

import * as TngUtils from '../../../../utils/tng-utils';
import * as NativeMethods from '../../../../utils/native-methods';
import logger from '../../../../utils/monitoring/logger';
import { isFromBeepSite, isFromBeepSiteOrderHistory, isFromFoodCourt } from '../../../../common/utils';
import { toast } from '../../../../common/utils/feedback';
import { COUNTRIES as AVAILABLE_COUNTRIES } from '../../../../common/utils/phone-number-constants';

const { AUTH_INFO, DELIVERY_METHOD, CLIENTS, OTP_REQUEST_PLATFORM, OTP_REQUEST_TYPES } = Constants;
const localePhoneNumber = Utils.getLocalStorageVariable('user.p');

export const types = APP_TYPES;

export { getCategoryList, getAllProducts };

const CartModel = {
  status: API_REQUEST_STATUS.PENDING,
  isFetching: false,
  items: [],
  unavailableItems: [],
  billing: {
    discount: 0,
    subtotal: 0,
    total: 0,
    tax: 0,
    totalCashback: 0,
    serviceCharge: 0,
    serviceChargeInfo: {},
    shippingFee: 0,
    promotion: {
      promoCode: null,
      discount: 0,
      promoType: '',
      status: '',
    },
    voucher: {
      promoCode: null,
      status: '',
      discount: 0,
      validFrom: null,
      promoType: '',
    },
    applyCashback: false,
  },
  errorCategory: null,
};

export const initialState = {
  user: {
    isWebview: Utils.isWebview(),
    disableGuestLogin: true,
    guestModeRequest: {
      isGuestMode: config.isGuest,
      status: null,
      error: null,
    },
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
    phone: localePhoneNumber || '',
    noWhatsAppAccount: true,
    loginRequestStatus: null,
    loginByBeepAppStatus: null,
    fetchLoginRequestStatus: null,
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
  },
  error: null, // network error
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
    status: null,
  },
  coreBusiness: {
    status: null,
    errorCategory: null,
  },
  requestInfo: {
    tableId: config.table,
    storeId: config.storeId,
    shippingType: Utils.getOrderTypeFromUrl(),
  },
  shoppingCart: CartModel,
  addOrUpdateShoppingCartItemRequest: {
    status: null,
    errorCategory: null,
  },
  storeHashCode: {
    data: null,
    status: null,
  },
  onlineCategory: {
    status: null,
    errorCategory: null,
  },
  coreStores: {
    status: null,
    errorCategory: null,
  },
  productDetail: {
    status: null,
    errorCategory: null,
  },
  deliveryDetails: {
    username: '',
    phone: '',
    addressId: '',
    addressName: '',
    deliveryToAddress: '',
    deliveryToLocation: null, // {latitude, longitude}
    addressDetails: '',
    deliveryComments: '',
    deliveryToCity: '',
    postCode: '',
    countryCode: '',
    fetchRequestStatus: null,
  },
};

// action creators
export const actions = {
  loginApp: ({ accessToken, refreshToken, source = null, shippingType = null }) => async dispatch => {
    try {
      dispatch({
        type: types.CREATE_LOGIN_REQUEST,
        payload: { source, shippingType },
      });

      const result = await ApiRequest.login({
        accessToken,
        refreshToken,
        shippingType: Utils.getApiRequestShippingType(shippingType),
      });

      dispatch({
        type: types.CREATE_LOGIN_SUCCESS,
        payload: { ...result, source },
      });
    } catch (error) {
      CleverTap.pushEvent('Login - login failed');

      dispatch({
        type: types.CREATE_LOGIN_FAILURE,
        error,
        payload: { source },
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

      logger.log('Ordering_App_StartToGetOTP');

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

  setConsumerAsGuest: () => async dispatch => {
    dispatch({
      type: types.SET_CONSUMER_AS_GUEST_REQUEST,
    });

    try {
      dispatch({
        type: types.SET_CONSUMER_AS_GUEST_SUCCESS,
      });

      await postLoginGuest();
    } catch (error) {
      dispatch({
        type: types.SET_CONSUMER_AS_GUEST_FAILURE,
        error,
      });
    }
  },

  syncLoginFromNative: () => async (dispatch, getState) => {
    try {
      const isLogin = getUserIsLogin(getState());
      if (isLogin) {
        return;
      }

      const isAppLogin = NativeMethods.getLoginStatus();

      if (!isAppLogin) {
        return;
      }

      const tokens = await NativeMethods.getTokenAsync();
      const { access_token: accessToken, refresh_token: refreshToken } = tokens;
      await dispatch(
        actions.loginApp({
          accessToken,
          refreshToken,
        })
      );

      const isExpired = getUserIsExpired(getState());

      if (isExpired) {
        const validTokens = await NativeMethods.tokenExpiredAsync();

        await dispatch(
          actions.loginApp({
            accessToken: validTokens.access_token,
            refreshToken: validTokens.refresh_token,
          })
        );
      }
    } catch (error) {
      logger.error('Ordering_App_SyncLoginFromNativeFailed', {
        message: error?.message,
        code: error?.code,
      });
    }
  },

  getLoginStatus: () => (dispatch, getState) =>
    dispatch({
      types: [types.FETCH_LOGIN_STATUS_REQUEST, types.FETCH_LOGIN_STATUS_SUCCESS, types.FETCH_LOGIN_STATUS_FAILURE],
      requestPromise: get(Url.API_URLS.GET_LOGIN_STATUS.url).then(async resp => {
        const { consumerId, login } = resp || {};

        if (!login) {
          return resp;
        }

        try {
          await dispatch(actions.loadProfileInfo(consumerId));

          const profile = getUserProfile(getState());
          const { firstName, phone, email, birthday } = profile || {};

          const userInfo = {
            Name: firstName,
            Phone: phone,
            Email: email,
            Identity: consumerId,
          };

          if (birthday) {
            userInfo.DOB = new Date(birthday);
          }

          CleverTap.onUserLogin(userInfo);

          return resp;
        } catch (error) {
          logger.error('Ordering_App_getLoginStatus', { message: error?.message });

          // profile API request won't block the login status request
          return resp;
        }
      }),
    }),

  hideApiMessageModal: () => ({
    type: types.CLEAR_API_ERROR,
  }),

  updateUser: (user = {}) => ({
    type: types.UPDATE_USER,
    user,
  }),

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

  resetCoreBusinessStatus: () => ({
    type: types.RESET_COREBUSINESS_STATUS,
  }),

  // TODO: This type is actually not used, because apiError does not respect action type,
  // which is a bad practice, we will fix it in the future, for now we just keep a useless
  // action type.
  showApiErrorModal: code => ({
    type: 'ordering/app/showApiErrorModal',
    code,
  }),

  initDeliveryDetails: () => async dispatch => {
    const localStoragePhone = localStorage.getItem('user.p') || '';

    const payload = {
      phone: localStoragePhone,
    };

    dispatch({
      type: types.DELIVERY_DETAILS_INIT,
      payload,
    });

    await dispatch(actions.loadDeliveryAddressDetailsIfNeeded());
  },

  getStoreHashData: storeId => ({
    [API_REQUEST]: {
      types: [
        types.FETCH_STORE_HASHCODE_REQUEST,
        types.FETCH_STORE_HASHCODE_SUCCESS,
        types.FETCH_STORE_HASHCODE_FAILURE,
      ],
      ...Url.API_URLS.GET_STORE_HASH_DATA(storeId),
    },
  }),

  resetOnlineCategoryStatus: () => ({
    type: types.RESET_ONLINECATEGORY_STATUS,
  }),

  loginByBeepApp: () => async (dispatch, getState) => {
    try {
      const tokens = await NativeMethods.getTokenAsync();
      const { access_token: accessToken, refresh_token: refreshToken } = tokens;

      if (_isEmpty(accessToken) || _isEmpty(refreshToken)) return;

      const source = REGISTRATION_SOURCE.BEEP_APP;

      await dispatch(actions.loginApp({ accessToken, refreshToken, source }));

      const isTokenExpired = getUserIsExpired(getState());

      if (isTokenExpired) {
        const validTokens = await NativeMethods.tokenExpiredAsync();

        await dispatch(
          actions.loginApp({ accessToken: validTokens.access_token, refreshToken: validTokens.refresh_token, source })
        );
      }
    } catch (e) {
      if (e?.code === 'B0001') {
        toast(i18next.t('ApiError:B0001Description'));
      } else {
        toast(i18next.t('Common:UnknownError'));
      }

      logger.error('Common_LoginByBeepAppFailed', { message: e?.message, code: e?.code });
    }
  },

  loginByTngMiniProgram: () => async (dispatch, getState) => {
    if (!Utils.isTNGMiniProgram()) {
      throw new Error('Not in tng mini program');
    }

    try {
      const business = getBusiness(getState());

      dispatch({
        type: types.CREATE_LOGIN_REQUEST,
      });

      const tokens = await TngUtils.getAccessToken({ business });

      const { access_token: accessToken, refresh_token: refreshToken } = tokens;

      const result = await ApiRequest.login({
        accessToken,
        refreshToken,
      });

      dispatch({
        type: types.CREATE_LOGIN_SUCCESS,
        payload: result,
      });
    } catch (error) {
      CleverTap.pushEvent('Login - login failed');

      dispatch({
        type: types.CREATE_LOGIN_FAILURE,
        error,
      });

      logger.error('Common_LoginByTngMiniProgramFailed', { message: error?.message });

      return false;
    }

    return getUserIsLogin(getState());
  },

  updateShippingType: newShippingType => async (dispatch, getState) => {
    const state = getState();
    const shippingType = getShippingType(state);

    // replace new shipping type in url query
    if (shippingType !== newShippingType) {
      const queryObj = getURLQueryObject(state);
      const location = getLocation(state);
      queryObj.type = newShippingType;
      dispatch(
        replace({
          pathname: location.pathname,
          hash: location.hash,
          state: location.state,
          search: qs.stringify(queryObj, { addQueryPrefix: true }),
        })
      );

      dispatch({
        type: types.UPDATE_SHIPPING_TYPE,
        payload: newShippingType,
      });

      await Promise.all([dispatch(actions.loadCoreBusiness()), dispatch(actions.loadCoreStores())]);
    }
  },

  updateCashbackApplyStatus: newStatus => ({
    type: types.UPDATE_SHOPPINGCART_APPLYCASHBACK,
    payload: newStatus,
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
      logger.error('Ordering_LoadProfileInfoFailed', { message: error?.message });

      dispatch({
        type: types.LOAD_CONSUMER_PROFILE_REJECTED,
        error,
      });
    }
  },

  updateProfile: ({ firstName, email, birthday }) => ({
    type: types.UPDATE_CONSUMER_PROFILE,
    payload: {
      firstName,
      email,
      birthday,
    },
  }),
};

const user = (state = initialState.user, action) => {
  const { type, response, prompt, error, responseGql, payload } = action;
  const { consumerId, login, supportWhatsApp, access_token: accessToken, refresh_token: refreshToken } = response || {};

  const userConsumerId = _get(payload, 'consumerId', '');
  const userInfo = _get(payload, 'user', {});
  const { data } = responseGql || {};
  const { business, onlineStoreInfo } = data || {};
  const source = _get(payload, 'source', null);
  const otpType = _get(payload, 'otpType', null);
  const isFromBeepApp = source === REGISTRATION_SOURCE.BEEP_APP;
  const loginByBeepAppStatus = isFromBeepApp ? API_REQUEST_STATUS.REJECTED : null;

  switch (type) {
    case types.RESET_CREATE_OTP_REQUEST:
      return { ...state, isFetching: false, isError: false };
    case types.SET_CONSUMER_AS_GUEST_REQUEST:
      return {
        ...state,
        guestModeRequest: { ...state.guestModeRequest, status: API_REQUEST_STATUS.PENDING, error: null },
      };
    case types.SET_CONSUMER_AS_GUEST_SUCCESS:
      return {
        ...state,
        guestModeRequest: {
          ...state.guestModeRequest,
          isGuestMode: true,
          status: API_REQUEST_STATUS.FULFILLED,
          error: null,
        },
      };
    case types.SET_CONSUMER_AS_GUEST_FAILURE:
      return {
        ...state,
        guestModeRequest: {
          ...state.guestModeRequest,
          isGuestMode: false,
          status: API_REQUEST_STATUS.REJECTED,
          error,
        },
      };
    case types.FETCH_LOGIN_STATUS_REQUEST:
      return { ...state, isFetching: true, fetchLoginRequestStatus: API_REQUEST_STATUS.PENDING };
    case types.CREATE_OTP_REQUEST:
      return { ...state, isFetching: true, isError: false };
    case types.CREATE_LOGIN_REQUEST:
      return {
        ...state,
        isFetching: true,
        loginRequestStatus: API_REQUEST_STATUS.PENDING,
        loginByBeepAppStatus: isFromBeepApp ? API_REQUEST_STATUS.PENDING : null,
      };
    case types.FETCH_LOGIN_STATUS_FAILURE:
      return { ...state, isFetching: false, fetchLoginRequestStatus: API_REQUEST_STATUS.REJECTED };
    case types.GET_OTP_FAILURE:
      return { ...state, otpRequest: { ...state.otpRequest, status: API_REQUEST_STATUS.REJECTED, error } };
    case types.CREATE_OTP_FAILURE:
      return { ...state, isFetching: false, isError: true };
    case types.RESET_GET_OTP_REQUEST:
      return { ...state, otpRequest: _cloneDeep(initialState.user.otpRequest) };
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
    case types.GET_OTP_SUCCESS:
      return { ...state, otpRequest: { ...state.otpRequest, status: API_REQUEST_STATUS.FULFILLED } };
    case types.CREATE_OTP_SUCCESS:
      return {
        ...state,
        isFetching: false,
        accessToken,
        refreshToken,
      };
    case types.CREATE_LOGIN_SUCCESS: {
      if (state.accessToken) {
        delete state.accessToken;
      }

      if (state.refreshToken) {
        delete state.refreshToken;
      }

      return {
        ...state,
        consumerId: userConsumerId,
        // WB-5109: If login status refactor, please to remove profile data,
        // BE has any update profile field should update this reducer for api/login
        profile: {
          ...state.profile,
          phone: userInfo.phone,
          name: userInfo.firstName,
          email: userInfo.email,
          birthday: userInfo.birthday,
          status: API_REQUEST_STATUS.FULFILLED,
        },
        isLogin: true,
        isExpired: false,
        isFetching: false,
        loginRequestStatus: API_REQUEST_STATUS.FULFILLED,
        loginByBeepAppStatus: isFromBeepApp ? API_REQUEST_STATUS.FULFILLED : null,
      };
    }
    case types.FETCH_LOGIN_STATUS_SUCCESS:
      return {
        ...state,
        isLogin: login,
        consumerId,
        isFetching: false,
        isExpired: false,
        fetchLoginRequestStatus: API_REQUEST_STATUS.FULFILLED,
      };
    case types.CREATE_LOGIN_FAILURE:
      if (error?.error === 'TokenExpiredError' || error?.error === 'JsonWebTokenError') {
        return {
          ...state,
          isExpired: true,
          isFetching: false,
          loginRequestStatus: API_REQUEST_STATUS.REJECTED,
          loginByBeepAppStatus,
          loginAppErrorCategory: error?.category,
        };
      }

      return {
        ...state,
        isFetching: false,
        loginRequestStatus: API_REQUEST_STATUS.REJECTED,
        loginByBeepAppStatus,
        loginAppErrorCategory: error?.category,
      };
    case types.SET_LOGIN_PROMPT:
      return { ...state, prompt };

    case types.UPDATE_USER:
      return {
        ...state,
        ...action.user,
      };
    case types.FETCH_ONLINESTOREINFO_SUCCESS:
    case types.FETCH_COREBUSINESS_SUCCESS:
      if (!state.phone && business && business.country) {
        return { ...state, country: business.country };
      }

      if (!state.phone && onlineStoreInfo && onlineStoreInfo.country) {
        return { ...state, country: onlineStoreInfo.country };
      }

      return state;

    case types.GET_WHATSAPPSUPPORT_REQUEST:
      return { ...state, noWhatsAppAccount: true };
    case types.GET_WHATSAPPSUPPORT_SUCCESS:
      return { ...state, noWhatsAppAccount: !supportWhatsApp };
    case types.GET_WHATSAPPSUPPORT_FAILURE:
      // Write down here just for the sake of completeness, we won't handle this failure case for now.
      return state;
    case types.LOAD_CONSUMER_PROFILE_PENDING:
      return { ...state, profile: { ...state.profile, status: API_REQUEST_STATUS.PENDING } };
    case types.LOAD_CONSUMER_PROFILE_FULFILLED:
      return {
        ...state,
        profile: {
          id: _get(payload, 'id', ''),
          firstName: _get(payload, 'firstName', ''),
          lastName: _get(payload, 'lastName', ''),
          name: _get(payload, 'firstName', ''),
          phone: _get(payload, 'phone', ''),
          birthdayModifiedTime: _get(payload, 'birthdayModifiedTime', ''),
          notificationSettings: _get(payload, 'notificationSettings', ''),
          email: _get(payload, 'email', ''),
          birthday: _get(payload, 'birthday', ''),
          gender: _get(payload, 'gender', ''),
          birthdayChangeAllowed: _get(payload, 'birthdayChangeAllowed', false),
          status: API_REQUEST_STATUS.FULFILLED,
        },
      };
    case types.LOAD_CONSUMER_PROFILE_REJECTED:
      return { ...state, profile: { ...state.profile, status: API_REQUEST_STATUS.REJECTED } };
    case types.UPDATE_CONSUMER_PROFILE:
      return {
        ...state,
        profile: { ...state.profile, ...payload },
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

  if (code && code !== 401 && Object.values(Constants.CREATE_ORDER_ERROR_CODES).includes(code)) {
    return {
      ...state,
      code,
      message,
    };
  }

  return state;
};

const business = (state = initialState.business) => state;

const coreStores = (state = initialState.coreStores, action) => {
  switch (action.type) {
    case types.FETCH_CORESTORES_REQUEST:
      return { ...state, status: API_REQUEST_STATUS.PENDING };
    case types.FETCH_CORESTORES_SUCCESS:
      return { ...state, status: API_REQUEST_STATUS.FULFILLED };
    case types.FETCH_CORESTORES_FAILURE:
      return { ...state, status: API_REQUEST_STATUS.REJECTED, errorCategory: action.category };
    default:
      return state;
  }
};

const productDetail = (state = initialState.productDetail, action) => {
  switch (action.type) {
    case types.FETCH_PRODUCTDETAIL_REQUEST:
      return { ...state, status: API_REQUEST_STATUS.PENDING };
    case types.FETCH_PRODUCTDETAIL_SUCCESS:
      return { ...state, status: API_REQUEST_STATUS.FULFILLED };
    case types.FETCH_PRODUCTDETAIL_FAILURE:
      return { ...state, status: API_REQUEST_STATUS.REJECTED, errorCategory: action.category };
    default:
      return state;
  }
};

const apiError = (state = initialState.apiError, action) => {
  const { type, code, response, responseGql, payload } = action;
  const { error: payloadError } = payload || {};
  const result = response || (responseGql || {}).data || payloadError;
  const errorCode = code || (result || {}).code;
  const { ERROR_CODE_MAP } = Constants;
  const errorInfo = ERROR_CODE_MAP[errorCode];

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

  if (errorInfo) {
    return {
      ...state,
      show: errorInfo.showModal,
      code: errorCode,
      message: i18next.t(errorInfo.title, { error_code: errorCode }),
      description: i18next.t(errorInfo.desc),
      buttonText: i18next.t(errorInfo.buttonText),
      redirectUrl: errorInfo.redirectUrl,
    };
  }

  // TODO add default error message
  return state;
};

const requestInfo = (state = initialState.requestInfo, action) => {
  switch (action.type) {
    case types.UPDATE_SHIPPING_TYPE:
      return { ...state, shippingType: action.payload };
    case types.UPDATE_STORE_ID:
      return { ...state, storeId: action.payload };
    default:
      return state;
  }
};

const deliveryDetails = (state = initialState.deliveryDetails, action) => {
  const { response } = action || {};
  const isAddressAvailable = _get(response, 'availableStatus', false);
  const deliveryDetailsInfo = isAddressAvailable
    ? {
        username: _get(response, 'contactName', ''),
        phone: _get(response, 'contactNumber', ''),
        addressId: _get(response, '_id', ''),
        addressName: _get(response, 'addressName', ''),
        addressDetails: _get(response, 'addressDetails', ''),
        deliveryComments: _get(response, 'comments', ''),
        deliveryToAddress: _get(response, 'deliveryTo', ''),
        deliveryToLocation: _get(response, 'location', null),
        deliveryToCity: _get(response, 'city', ''),
        postCode: _get(response, 'postCode', ''),
        countryCode: _get(response, 'countryCode', ''),
      }
    : {};

  switch (action.type) {
    case types.DELIVERY_DETAILS_INIT:
      return {
        ...state,
        ...action.payload,
      };
    case types.DELIVERY_DETAILS_UPDATED:
      return {
        ...state,
        ...action.payload,
      };
    case types.FETCH_DELIVERYADDRESSDETAIL_REQUEST:
      return {
        ...state,
        fetchRequestStatus: API_REQUEST_STATUS.PENDING,
      };
    case types.FETCH_DELIVERYADDRESSDETAIL_SUCCESS:
      return {
        ...state,
        ...deliveryDetailsInfo,
        fetchRequestStatus: API_REQUEST_STATUS.FULFILLED,
      };
    case types.FETCH_DELIVERYADDRESSDETAIL_FAILURE:
      return {
        ...state,
        fetchRequestStatus: API_REQUEST_STATUS.REJECTED,
      };
    default:
      return state;
  }
};

export default combineReducers({
  user,
  error,
  business,
  requestInfo,
  apiError,
  deliveryDetails,
  coreStores,
  productDetail,
});

// selectors

export const getUser = state => state.app.user; // left
export const getOtpRequest = state => state.app.user.otpRequest; // left
export const getUserIsExpired = state => state.app.user.isExpired; // left
export const getBusiness = state => state.app.business;
export const getError = state => state.app.error;

export const getIsGuestMode = createSelector(getUser, userInfo =>
  _get(userInfo, 'guestModeRequest.isGuestMode', false)
);

export const getIsGuestModeRequestStatus = createSelector(getUser, userInfo =>
  _get(userInfo, 'guestModeRequest.status', null)
);

export const getIsGuestModeRequestFulfilled = createSelector(
  getIsGuestModeRequestStatus,
  status => status === API_REQUEST_STATUS.FULFILLED
);

export const getIsGuestModeRequestRejected = createSelector(
  getIsGuestModeRequestStatus,
  status => status === API_REQUEST_STATUS.REJECTED
);

export const getUserIsLogin = createSelector(getUser, userInfo => _get(userInfo, 'isLogin', false));

export const getFetchLoginRequestStatus = createSelector(getUser, userInfo => userInfo.fetchLoginRequestStatus || null);

export const getIsFetchLoginStatusFulfilled = createSelector(
  getFetchLoginRequestStatus,
  fetchLoginRequestStatus => fetchLoginRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsFetchLoginStatusRejected = createSelector(
  getFetchLoginRequestStatus,
  fetchLoginRequestStatus => fetchLoginRequestStatus === API_REQUEST_STATUS.REJECTED
);

export const getIsFetchLoginStatusComplete = createSelector(
  getIsFetchLoginStatusFulfilled,
  getIsFetchLoginStatusRejected,
  (isFetchLoginStatusFulfilled, isFetchLoginStatusRejected) => isFetchLoginStatusFulfilled || isFetchLoginStatusRejected
);

export const getIsLoginRequestFailed = createSelector(getUser, userInfo => _get(userInfo, 'isError', false)); // left

export const getIsLoginRequestStatusPending = createSelector(getUser, userInfo => _get(userInfo, 'isFetching', false));

export const getOnlineStoreInfo = state => state.entities.onlineStores[state.app.onlineStoreInfo.id];

export const getOnlineStoreInfoStatus = state => state.app.onlineStoreInfo.status;

export const getCoreStoresStatus = state => state.app.coreStores.status;

export const getCoreStoresErrorCategory = state => state.app.coreStores.errorCategory;

export const getOnlineCategoryStatus = state => state.app.onlineCategory.status;

export const getOnlineCategoryErrorCategory = state => state.app.onlineCategory.errorCategory;

export const getIsOnlineCategoryRequestRejected = createSelector(
  getOnlineCategoryStatus,
  onlineCategoryStatus => onlineCategoryStatus === API_REQUEST_STATUS.REJECTED
);

export const getRequestInfo = state => state.app.requestInfo;

export const getApiError = state => state.app.apiError;

export const getUserLoginRequestStatus = state => state.app.user.loginRequestStatus;

export const getUserLoginByBeepAppStatus = state => state.app.user.loginByBeepAppStatus;

export const getloginAppErrorCategory = state => state.app.user.loginAppErrorCategory;

export const getUserProfile = state => state.app.user.profile;

export const getUserProfileStatus = state => state.app.user.profile.status;

export const getIsUserLoginRequestStatusInPending = createSelector(
  getUserLoginRequestStatus,
  status => status === API_REQUEST_STATUS.PENDING
);

export const getIsUserProfileStatusFulfilled = createSelector(
  getUserProfileStatus,
  status => status === API_REQUEST_STATUS.FULFILLED
);

export const getIsUserProfileStatusPending = createSelector(
  getUserProfileStatus,
  status => status === API_REQUEST_STATUS.PENDING
);

export const getUserEmail = createSelector(getUser, userInfo => _get(userInfo, 'profile.email', ''));

export const getUserName = createSelector(getUser, userInfo => _get(userInfo, 'profile.name', ''));

export const getUserPhone = createSelector(getUser, userInfo => _get(userInfo, 'profile.phone', ''));

export const getUserConsumerId = createSelector(getUser, userInfo => _get(userInfo, 'consumerId', ''));

export const getIsGuestLoginDisabled = createSelector(getUser, userInfo => userInfo.disableGuestLogin);

// TODO: add Utils methods to state rather than using Utils
export const getIsTNGMiniProgram = () => Utils.isTNGMiniProgram();
export const getIsDigitalType = () => Utils.isDigitalType();
export const getIsDeliveryOrder = () => Utils.isDeliveryOrder();
export const getIsQROrder = () => Utils.isQROrder();
export const getIsWebview = () => Utils.isWebview();
export const getIsInBrowser = () => Utils.getClient() === CLIENTS.WEB;
export const getIsInAppOrMiniProgram = createSelector(
  getIsWebview,
  getIsTNGMiniProgram,
  (isWebview, isTNGMiniProgram) => isWebview || isTNGMiniProgram
);
export const getIsFromBeepSite = () => isFromBeepSite();
export const getIsFromBeepSiteOrderHistory = () => isFromBeepSiteOrderHistory();
export const getIsFromFoodCourt = () => isFromFoodCourt();

export const getShippingType = createSelector(getRequestInfo, info => _get(info, 'shippingType', null));

/**
 * Is delivery shipping type
 * @returns
 */
export const getIsDeliveryType = createSelector(
  getShippingType,
  shippingType => shippingType === DELIVERY_METHOD.DELIVERY
);

/**
 * Is pickup shipping type
 */
export const getIsPickUpType = createSelector(getShippingType, shippingType => shippingType === DELIVERY_METHOD.PICKUP);

/**
 * Is dine shipping type
 */
export const getIsDineType = createSelector(getShippingType, shippingType => shippingType === DELIVERY_METHOD.DINE_IN);

/**
 * Is Takeaway type
 */
export const getIsTakeawayType = createSelector(
  getShippingType,
  shippingType => shippingType === DELIVERY_METHOD.TAKE_AWAY
);

export const getIsGuestCheckout = createSelector(
  getIsQROrder,
  getIsGuestMode,
  (isQROrder, isGuestMode) => isQROrder && isGuestMode
);

/**
 * is shipping type of QR ordering
 * @returns
 */
export const getIsQrOrderingShippingType = createSelector(
  getShippingType,
  shippingType => shippingType === DELIVERY_METHOD.DINE_IN || shippingType === DELIVERY_METHOD.TAKE_AWAY
);

/**
 * is shipping type of delivery or pickup
 * @returns
 */
export const getIsBeepDeliveryShippingType = createSelector(
  getShippingType,
  shippingType => shippingType === DELIVERY_METHOD.DELIVERY || shippingType === DELIVERY_METHOD.PICKUP
);

export const getRouter = state => state.router;

export const getLocation = state => state.router.location;

export const getLocationSearch = createSelector(getLocation, location => location.search);

export const getURLQueryObject = createSelector(getLocationSearch, locationSearch =>
  qs.parse(locationSearch, { ignoreQueryPrefix: true })
);
