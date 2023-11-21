/* eslint-disable no-use-before-define */
import qs from 'qs';
import i18next from 'i18next';
import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import _get from 'lodash/get';
import _uniq from 'lodash/uniq';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _lowerCase from 'lodash/lowerCase';
import _cloneDeep from 'lodash/cloneDeep';
import { replace } from 'connected-react-router';
import { createCurrencyFormatter } from '@storehub/frontend-utils';
import Constants, { API_REQUEST_STATUS, REGISTRATION_SOURCE } from '../../../utils/constants';
import { URL_TYPES } from '../../../common/utils/constants';
import Utils from '../../../utils/utils';
import * as VoucherUtils from '../../../voucher/utils';
import config from '../../../config';
import Url from '../../../utils/url';
import * as ApiRequest from '../../../utils/api-request';
import CleverTap from '../../../utils/clevertap';

import { APP_TYPES } from '../types';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { get } from '../../../utils/request';
import { post } from '../../../utils/api/api-fetch';
import { getBusinessByName, getAllBusinesses } from '../../../redux/modules/entities/businesses';
import { getCoreStoreList, getStoreById } from '../../../redux/modules/entities/stores';
import { getAllProducts } from '../../../redux/modules/entities/products';
import { getAllCategories, getCategoryList } from '../../../redux/modules/entities/categories';
import { getAddressInfo, setAddressInfo } from '../../../redux/modules/address/thunks';
import {
  getAddressCoords,
  getSavedAddressId,
  getIsAddressRequestStatusFulfilled,
} from '../../../redux/modules/address/selectors';
import { getCartItems as getNewCartItems } from './cart/selectors';
import { getProfileInfo, postLoginGuest, getUrlAccessValidation } from './api-request';

import * as StoreUtils from '../../../utils/store-utils';
import * as TngUtils from '../../../utils/tng-utils';
import * as NativeMethods from '../../../utils/native-methods';
import logger from '../../../utils/monitoring/logger';
import { isFromBeepSite, isFromBeepSiteOrderHistory, isFromFoodCourt, isProductSoldOut } from '../../../common/utils';
import { toast } from '../../../common/utils/feedback';
import { COUNTRIES as AVAILABLE_COUNTRIES } from '../../../common/utils/phone-number-constants';

const { AUTH_INFO, DELIVERY_METHOD, CLIENTS, OTP_REQUEST_PLATFORM, OTP_REQUEST_TYPES } = Constants;
const localePhoneNumber = Utils.getLocalStorageVariable('user.p');

export const types = APP_TYPES;

export { getCategoryList, getAllProducts };

const CartItemModel = {
  id: null,
  productId: null,
  title: '',
  variationTexts: [],
  isTakeaway: false,
  displayPrice: 0,
  originalDisplayPrice: 0,
  image: null,
  stockStatus: '',
  quantity: 0,
};

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
  dynamicQrCode: {
    data: {
      urlType: config.urlType,
      isUrlExpired: config.isUrlExpired,
    },
    status: null,
    error: null,
  },
};

const fetchCoreBusiness = variables => ({
  [FETCH_GRAPHQL]: {
    types: [types.FETCH_COREBUSINESS_REQUEST, types.FETCH_COREBUSINESS_SUCCESS, types.FETCH_COREBUSINESS_FAILURE],
    endpoint: Url.apiGql('CoreBusiness'),
    variables,
  },
});

// generator a virtual shopping cart for Customer place a Voucher Order
const generatorShoppingCartForVoucherOrdering = () => {
  const orderingInfo = VoucherUtils.getVoucherOrderingInfoFromSessionStorage();
  const shoppingCart = VoucherUtils.generatorVirtualShoppingCart(orderingInfo.selectedVoucher);

  return {
    type: types.FETCH_SHOPPINGCART_SUCCESS,
    response: shoppingCart,
  };
};

export const fetchShoppingCart = (isDeliveryType, deliveryCoords, fulfillDate) => ({
  [API_REQUEST]: {
    types: [types.FETCH_SHOPPINGCART_REQUEST, types.FETCH_SHOPPINGCART_SUCCESS, types.FETCH_SHOPPINGCART_FAILURE],
    ...Url.API_URLS.GET_CART_TYPE(isDeliveryType, deliveryCoords, fulfillDate),
  },
});

// variables := { productId, variations }
const removeShoppingCartItem = variables => {
  const endpoint = Url.apiGql('RemoveShoppingCartItem');
  return {
    [FETCH_GRAPHQL]: {
      types: [
        types.REMOVE_SHOPPINGCARTITEM_REQUEST,
        types.REMOVE_SHOPPINGCARTITEM_SUCCESS,
        types.REMOVE_SHOPPINGCARTITEM_FAILURE,
      ],
      endpoint,
      variables,
    },
  };
};

const addOrUpdateShoppingCartItem = variables => {
  const endpoint = Url.apiGql('AddOrUpdateShoppingCartItem');
  return {
    [FETCH_GRAPHQL]: {
      types: [
        types.ADDORUPDATE_SHOPPINGCARTITEM_REQUEST,
        types.ADDORUPDATE_SHOPPINGCARTITEM_SUCCESS,
        types.ADDORUPDATE_SHOPPINGCARTITEM_FAILURE,
      ],
      endpoint,
      variables,
    },
  };
};

export const emptyShoppingCart = () => {
  const endpoint = Url.apiGql('EmptyShoppingCart');
  return {
    [FETCH_GRAPHQL]: {
      types: [types.CLEARALL_REQUEST, types.CLEARALL_SUCCESS, types.CLEARALL_FAILURE],
      endpoint,
    },
  };
};

const fetchOnlineCategory = variables => {
  const endpoint = Url.apiGql('OnlineCategory');
  // will be handle in src/redux/modules/entities/products.js and src/redux/modules/entities/categories.js
  return {
    [FETCH_GRAPHQL]: {
      types: [
        types.FETCH_ONLINECATEGORY_REQUEST,
        types.FETCH_ONLINECATEGORY_SUCCESS,
        types.FETCH_ONLINECATEGORY_FAILURE,
      ],
      endpoint,
      variables,
    },
  };
};

const fetchProductDetail = variables => {
  const endpoint = Url.apiGql('ProductDetail');
  //  will be handle in src/redux/modules/entities/products.js
  return {
    [FETCH_GRAPHQL]: {
      types: [types.FETCH_PRODUCTDETAIL_REQUEST, types.FETCH_PRODUCTDETAIL_SUCCESS, types.FETCH_PRODUCTDETAIL_FAILURE],
      endpoint,
      variables: {
        ...variables,
      },
    },
  };
};

// action creators
export const actions = {
  loginApp: ({ accessToken, refreshToken, source = null, shippingType = null }) => async (dispatch, getState) => {
    try {
      const businessUTCOffset = getBusinessUTCOffset(getState());

      dispatch({
        type: types.CREATE_LOGIN_REQUEST,
        payload: { source, shippingType },
      });

      const result = await ApiRequest.login({
        accessToken,
        refreshToken,
        fulfillDate: Utils.getFulfillDate(businessUTCOffset),
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

  loadCoreBusiness: id => (dispatch, getState) => {
    const state = getState();
    const { business } = config;
    const storeId = getStoreId(state);
    const shippingType = getShippingType(state);

    return dispatch(fetchCoreBusiness({ business, storeId: id || storeId, shippingType }));
  },

  // load shopping cart
  loadShoppingCart: () => async (dispatch, getState) => {
    const state = getState();
    const isDelivery = Utils.isDeliveryType();
    const isDigital = Utils.isDigitalType();
    const businessUTCOffset = getBusinessUTCOffset(state);

    if (isDigital) {
      await dispatch(generatorShoppingCartForVoucherOrdering());
      return;
    }

    const isAddressRequestStatusFulfilled = getIsAddressRequestStatusFulfilled(state);

    let deliveryCoords = null;

    if (isAddressRequestStatusFulfilled) {
      deliveryCoords = getAddressCoords(state);
    } else {
      // The only cost is to send redundant requests to get the address, but it will promise to get the address finally
      await dispatch(getAddressInfo());
      deliveryCoords = getAddressCoords(getState());
    }

    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);

    await dispatch(fetchShoppingCart(isDelivery, deliveryCoords, fulfillDate));
  },

  removeShoppingCartItem: variables => dispatch => dispatch(removeShoppingCartItem(variables)),

  addOrUpdateShoppingCartItem: variables => (dispatch, getState) => {
    const state = getState();
    const businessUTCOffset = getBusinessUTCOffset(state);
    const latestShippingType = getShippingType(state);
    const latestFulfillDate = Utils.getFulfillDate(businessUTCOffset);
    return dispatch(addOrUpdateShoppingCartItem({ ...variables, latestShippingType, latestFulfillDate }));
  },

  // TODO: This type is actually not used, because apiError does not respect action type,
  // which is a bad practice, we will fix it in the future, for now we just keep a useless
  // action type.
  showApiErrorModal: code => ({
    type: 'ordering/app/showApiErrorModal',
    code,
  }),

  clearAll: () => dispatch => dispatch(emptyShoppingCart()),

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

  updateDeliveryDetails: data => async (dispatch, getState) => {
    const state = getState();
    const deliveryDetails = getDeliveryDetails(state);

    const payload = {
      ...deliveryDetails,
      ...data,
    };

    const isAddressInfoEmpty = !payload.addressId;
    const hasAddressInfoChanged = [
      'addressId',
      'addressName',
      'deliveryToAddress',
      'deliveryToCity',
      'postCode',
      'countryCode',
      'deliveryToLocation',
    ].some(key => !_isEqual(deliveryDetails[key], payload[key]));
    const deliveryToLocation = _get(payload, 'deliveryToLocation', null);
    let coords = null;

    if (deliveryToLocation) {
      coords = {
        lat: _get(deliveryToLocation, 'latitude', 0),
        lng: _get(deliveryToLocation, 'longitude', 0),
      };
    }

    if (!isAddressInfoEmpty && hasAddressInfoChanged) {
      dispatch(
        setAddressInfo({
          savedAddressId: _get(payload, 'addressId', null),
          shortName: _get(payload, 'addressName', ''),
          fullName: _get(payload, 'deliveryToAddress', ''),
          coords,
          city: _get(payload, 'deliveryToCity', ''),
          postCode: _get(payload, 'postCode', ''),
          countryCode: _get(payload, 'countryCode', ''),
        })
      );
    }

    dispatch({
      type: types.DELIVERY_DETAILS_UPDATED,
      payload,
    });
  },

  loadDeliveryAddressDetails: () => async (dispatch, getState) => {
    const state = getState();
    const consumerId = getUserConsumerId(state);
    const storeId = getStoreId(state);
    const savedAddressId = getSavedAddressId(state);

    return dispatch({
      [API_REQUEST]: {
        types: [
          types.FETCH_DELIVERYADDRESSDETAIL_REQUEST,
          types.FETCH_DELIVERYADDRESSDETAIL_SUCCESS,
          types.FETCH_DELIVERYADDRESSDETAIL_FAILURE,
        ],
        ...Url.API_URLS.GET_DELIVERY_ADDRESS_DETAILS(consumerId, storeId, savedAddressId),
      },
    });
  },

  loadDeliveryAddressDetailsIfNeeded: () => async (dispatch, getState) => {
    const state = getState();
    const savedAddressId = getSavedAddressId(state);
    const storeId = getStoreId(state);

    if (!(_isEmpty(savedAddressId) || _isEmpty(storeId))) {
      await dispatch(actions.loadDeliveryAddressDetails());
    }
  },

  loadCoreStores: address => (dispatch, getState) => {
    const state = getState();
    const business = getBusiness(state);
    const shippingType = getShippingType(state);

    // will be handle in src/redux/modules/entities/stores.js
    return dispatch({
      [FETCH_GRAPHQL]: {
        types: [types.FETCH_CORESTORES_REQUEST, types.FETCH_CORESTORES_SUCCESS, types.FETCH_CORESTORES_FAILURE],
        endpoint: Url.apiGql('CoreStores'),
        variables: { business, shippingType, ...address },
      },
    });
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

  // load product list group by category, and shopping cart
  loadProductList: () => async (dispatch, getState) => {
    const businessUTCOffset = getBusinessUTCOffset(getState());
    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);
    const shippingType = Utils.getApiRequestShippingType();

    await dispatch(fetchOnlineCategory({ fulfillDate, shippingType }));
  },

  reloadProductList: () => async dispatch => {
    // Reset product list and category list data
    dispatch({
      type: types.RESET_ONLINECATEGORY_STATUS,
    });

    await dispatch(actions.loadProductList());
  },

  loadProductDetail: productId => (dispatch, getState) => {
    const businessUTCOffset = getBusinessUTCOffset(getState());
    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);
    const shippingType = Utils.getApiRequestShippingType();

    return dispatch(fetchProductDetail({ productId, fulfillDate, shippingType }));
  },

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

      const businessUTCOffset = getBusinessUTCOffset(getState());

      const tokens = await TngUtils.getAccessToken({ business });

      const { access_token: accessToken, refresh_token: refreshToken } = tokens;

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

  updateStoreId: newStoreId => (dispatch, getState) => {
    const state = getState();
    const storeId = getStoreId(state);

    // replace new store id in url query
    if (storeId !== newStoreId) {
      const store = getStoreById(state, newStoreId);
      const hashCode = _get(store, 'hash', null);
      const h = decodeURIComponent(hashCode);
      const queryObj = getURLQueryObject(state);
      const location = getLocation(state);
      queryObj.h = h;
      dispatch(
        replace({
          pathname: location.pathname,
          hash: location.hash,
          state: location.state,
          search: qs.stringify(queryObj, { addQueryPrefix: true }),
        })
      );
    }

    dispatch({
      type: types.UPDATE_STORE_ID,
      payload: newStoreId,
    });
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

  checkIsUrlValidation: () => async dispatch => {
    dispatch({
      type: types.CHECK_URL_VALIDATION_REQUEST,
    });
    try {
      const { isExpired: isUrlExpired } = await getUrlAccessValidation();

      dispatch({
        type: types.CHECK_URL_VALIDATION_SUCCESS,
        payload: {
          isUrlExpired,
        },
      });
    } catch (error) {
      dispatch({
        type: types.CHECK_URL_VALIDATION_FAILURE,
        error,
      });
    }
  },
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

const onlineStoreInfo = (state = initialState.onlineStoreInfo, action) => {
  const { type, responseGql } = action;

  if (!(responseGql && responseGql.data.onlineStoreInfo)) {
    return state;
  }

  switch (type) {
    case types.FETCH_ONLINESTOREINFO_REQUEST:
      return { ...state, status: API_REQUEST_STATUS.PENDING };
    case types.FETCH_ONLINESTOREINFO_SUCCESS:
      return { ...state, status: API_REQUEST_STATUS.FULFILLED, id: action.responseGql.data.onlineStoreInfo.id };
    case types.FETCH_ONLINESTOREINFO_FAILURE:
      return { ...state, status: API_REQUEST_STATUS.REJECTED };
    default:
      return state;
  }
};

const onlineCategory = (state = initialState.onlineCategory, action) => {
  switch (action.type) {
    case types.RESET_ONLINECATEGORY_STATUS:
      return { ...state, status: null };
    case types.FETCH_ONLINECATEGORY_REQUEST:
      return { ...state, status: API_REQUEST_STATUS.PENDING };
    case types.FETCH_ONLINECATEGORY_SUCCESS:
      return { ...state, status: API_REQUEST_STATUS.FULFILLED };
    case types.FETCH_ONLINECATEGORY_FAILURE:
      return { ...state, status: API_REQUEST_STATUS.REJECTED, errorCategory: action.category };
    default:
      return state;
  }
};

const coreBusiness = (state = initialState.coreBusiness, action) => {
  const { type, category } = action;

  switch (type) {
    case types.RESET_COREBUSINESS_STATUS:
      return { ...state, status: null };
    case types.FETCH_COREBUSINESS_REQUEST:
      return { ...state, status: API_REQUEST_STATUS.PENDING };
    case types.FETCH_COREBUSINESS_SUCCESS:
      return { ...state, status: API_REQUEST_STATUS.FULFILLED };
    case types.FETCH_COREBUSINESS_FAILURE:
      return { ...state, status: API_REQUEST_STATUS.REJECTED, errorCategory: category };
    default:
      return state;
  }
};

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

const shoppingCart = (state = initialState.shoppingCart, action) => {
  if (action.type === types.CLEARALL_SUCCESS || action.type === types.CLEARALL_BY_PRODUCTS_SUCCESS) {
    return { ...state, ...CartModel, isFetching: false, status: API_REQUEST_STATUS.FULFILLED };
  }

  if (action.type === types.FETCH_SHOPPINGCART_REQUEST) {
    return { ...state, isFetching: true, status: API_REQUEST_STATUS.PENDING };
  }

  if (action.type === types.FETCH_SHOPPINGCART_SUCCESS) {
    const { items = [], unavailableItems = [], displayPromotions, voucher: voucherObject, ...cartBilling } =
      action.response || {};
    let promotion = null;
    if (voucherObject) {
      promotion = {
        promoCode: voucherObject.voucherCode,
        status: voucherObject.status,
        discount: voucherObject.value,
        validFrom: new Date(voucherObject.validFrom),
        promoType: Constants.PROMO_TYPE.VOUCHER,
      };
    } else if (displayPromotions && displayPromotions.length) {
      const displayPromotion = displayPromotions[0];
      promotion = {
        promoCode: displayPromotion.promotionCode,
        discount: displayPromotion.displayDiscount,
        promoType: Constants.PROMO_TYPE.PROMOTION,
        status: displayPromotion.status,
      };
    }

    return {
      ...state,
      isFetching: false,
      status: API_REQUEST_STATUS.FULFILLED,
      items: items.map(item => ({ ...CartItemModel, ...item })),
      unavailableItems: unavailableItems.map(unavailableItem => ({ ...CartItemModel, ...unavailableItem })),
      billing: {
        ...cartBilling,
        promotion,
      },
    };
  }

  if (action.type === types.FETCH_SHOPPINGCART_FAILURE) {
    return { ...state, isFetching: false, status: API_REQUEST_STATUS.REJECTED, errorCategory: action.category };
  }

  if (action.type === types.UPDATE_SHOPPINGCART_APPLYCASHBACK) {
    return { ...state, billing: { ...state.billing, applyCashback: action.payload } };
  }

  return state;
};

const addOrUpdateShoppingCartItemRequest = (state = initialState.addOrUpdateShoppingCartItemRequest, action) => {
  switch (action.type) {
    case types.ADDORUPDATE_SHOPPINGCARTITEM_REQUEST:
      return { ...state, status: API_REQUEST_STATUS.PENDING };
    case types.ADDORUPDATE_SHOPPINGCARTITEM_SUCCESS:
      return { ...state, status: API_REQUEST_STATUS.FULFILLED };
    case types.ADDORUPDATE_SHOPPINGCARTITEM_FAILURE:
      return { ...state, status: API_REQUEST_STATUS.REJECTED, errorCategory: action.category };
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

const storeHashCodeReducer = (state = initialState.storeHashCode, action) => {
  switch (action.type) {
    case types.FETCH_STORE_HASHCODE_REQUEST: {
      return {
        ...state,
        status: API_REQUEST_STATUS.PENDING,
      };
    }
    case types.FETCH_STORE_HASHCODE_SUCCESS: {
      const hashCode = _get(action.response, 'redirectTo', null);

      return {
        ...state,
        data: hashCode,
        status: API_REQUEST_STATUS.FULFILLED,
      };
    }

    case types.FETCH_STORE_HASHCODE_FAILURE: {
      return {
        ...state,
        data: null,
        status: API_REQUEST_STATUS.REJECTED,
      };
    }
    default:
      return state;
  }
};

const dynamicQrCode = (state = initialState.dynamicQrCode, action) => {
  switch (action.type) {
    case types.CHECK_URL_VALIDATION_REQUEST: {
      return {
        ...state,
        status: API_REQUEST_STATUS.PENDING,
      };
    }
    case types.CHECK_URL_VALIDATION_SUCCESS: {
      const isUrlExpired = _get(action.payload, 'isUrlExpired', null);

      return {
        ...state,
        data: {
          ...state.data,
          isUrlExpired,
        },
        status: API_REQUEST_STATUS.FULFILLED,
      };
    }
    case types.CHECK_URL_VALIDATION_FAILURE: {
      return {
        ...state,
        status: API_REQUEST_STATUS.REJECTED,
      };
    }
    default:
      return state;
  }
};

export default combineReducers({
  user,
  error,
  business,
  onlineStoreInfo,
  requestInfo,
  apiError,
  shoppingCart,
  addOrUpdateShoppingCartItemRequest,
  deliveryDetails,
  storeHashCode: storeHashCodeReducer,
  coreBusiness,
  onlineCategory,
  coreStores,
  productDetail,
  dynamicQrCode,
});

// selectors
export const getUser = state => state.app.user;
export const getOtpRequest = state => state.app.user.otpRequest;
export const getUserIsExpired = state => state.app.user.isExpired;
export const getBusiness = state => state.app.business;
export const getError = state => state.app.error;
export const getDynamicQrCode = state => state.app.dynamicQrCode;

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

export const getIsLoginRequestFailed = createSelector(getUser, userInfo => _get(userInfo, 'isError', false));

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

export const getBusinessInfo = state => {
  const businessName = getBusiness(state);

  return getBusinessByName(state, businessName) || {};
};

export const getMerchantCountry = createSelector(getBusinessInfo, businessInfo => _get(businessInfo, 'country', null));

export const getStoresList = state => getCoreStoreList(state);

export const getStoreHashCode = state => state.app.storeHashCode.data;

export const getDeliveryInfo = createSelector(getBusinessInfo, businessInfo => Utils.getDeliveryInfo(businessInfo));

export const getBusinessUTCOffset = createSelector(getBusinessInfo, businessInfo =>
  _get(businessInfo, 'timezoneOffset', 480)
);

export const getCoreBusinessAPIStatus = state => state.app.coreBusiness.status;

export const getCoreBusinessAPIErrorCategory = state => state.app.coreBusiness.errorCategory;

export const getIsCoreBusinessAPIPending = createSelector(
  getCoreBusinessAPIStatus,
  status => status === API_REQUEST_STATUS.PENDING
);
export const getIsCoreBusinessAPIFulfilled = createSelector(
  getCoreBusinessAPIStatus,
  status => status === API_REQUEST_STATUS.FULFILLED
);

export const getIsCoreBusinessRequestRejected = createSelector(
  getCoreBusinessAPIStatus,
  status => status === API_REQUEST_STATUS.REJECTED
);

export const getIsCoreBusinessAPICompleted = createSelector(getCoreBusinessAPIStatus, status =>
  [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(status)
);

export const getProductDetailStatus = state => state.app.productDetail.status;

export const getProductDetailErrorCategory = state => state.app.productDetail.errorCategory;

export const getIsProductDetailRequestRejected = createSelector(
  getProductDetailStatus,
  productDetailStatus => productDetailStatus === API_REQUEST_STATUS.REJECTED
);

// TODO: Utils.getOrderTypeFromUrl() will replace be selector
export const getEnablePayLater = createSelector(
  getBusinessInfo,
  businessInfo =>
    _get(businessInfo, 'qrOrderingSettings.enablePayLater', false) &&
    Utils.getOrderTypeFromUrl() === Constants.DELIVERY_METHOD.DINE_IN
);

export const getBusinessDeliveryTypes = createSelector(getStoresList, stores => {
  const deliveryTypes = stores.reduce((allTypes, store) => allTypes.concat(store.fulfillmentOptions), []);

  return _uniq(deliveryTypes);
});

export const getStoreId = createSelector(getRequestInfo, info => _get(info, 'storeId', null));
export const getShippingType = createSelector(getRequestInfo, info => _get(info, 'shippingType', null));
export const getTableId = createSelector(getRequestInfo, info => _get(info, 'tableId', null));

export const getStore = state => {
  const storeId = getStoreId(state);

  return getStoreById(state, storeId);
};

export const getHasSelectedStore = createSelector(getStoreId, storeId => !!storeId);

export const getBusinessCurrency = createSelector(getOnlineStoreInfo, info => _get(info, 'currency', 'MYR'));

export const getIsEnablePreOrder = createSelector(getBusinessInfo, businessInfo =>
  _get(businessInfo, 'qrOrderingSettings.enablePreOrder', false)
);

export const getStoreFulfillmentOptions = createSelector(getStore, store => _get(store, 'fulfillmentOptions', []));

export const getIsEnablePerTimeSlotLimitForPreOrder = createSelector(getStore, store =>
  _get(store, 'qrOrderingSettings.enablePerTimeSlotLimitForPreOrder', false)
);

export const getStoreSupportShippingTypes = createSelector(getStoreFulfillmentOptions, storeFulfillmentOptions =>
  storeFulfillmentOptions.map(_lowerCase)
);

export const getIsEnablePauseMode = createSelector(getStore, store =>
  _get(store, 'qrOrderingSettings.pauseModeEnabled', false)
);

export const getCartItems = state => state.app.shoppingCart.items;

export const getCartBilling = state => state.app.shoppingCart.billing;

export const getCartUnavailableItems = state => state.app.shoppingCart.unavailableItems;

export const getCartStatus = state => state.app.shoppingCart.status;

export const getCartErrorCategory = state => state.app.shoppingCart.errorCategory;

export const getIsGetCartFailed = createSelector(
  getCartStatus,
  cartStatus => cartStatus === API_REQUEST_STATUS.REJECTED
);

export const getShippingFee = createSelector(getCartBilling, billing => billing.shippingFee);

export const getDeliveryDetails = state => state.app.deliveryDetails;

export const getDeliveryAddressId = createSelector(getDeliveryDetails, deliveryDetailInfo =>
  _get(deliveryDetailInfo, 'addressId', null)
);

export const getHasFetchDeliveryDetailsRequestCompleted = createSelector(getDeliveryDetails, deliveryDetailInfo =>
  [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(deliveryDetailInfo.fetchRequestStatus)
);

export const getCartTotal = createSelector(getCartBilling, cartBilling => _get(cartBilling, 'total', null));
export const getCartSubtotal = createSelector(getCartBilling, cartBilling => _get(cartBilling, 'subtotal', null));
export const getCartCashback = createSelector(getCartBilling, cartBilling => _get(cartBilling, 'cashback', null));
export const getCartTotalCashback = createSelector(getCartBilling, cartBilling =>
  _get(cartBilling, 'totalCashback', null)
);
export const getCartCount = createSelector(getCartBilling, cartBilling => _get(cartBilling, 'count', 0));

export const getCartApplyCashback = createSelector(getCartBilling, cartBilling =>
  _get(cartBilling, 'applyCashback', false)
);

export const getServiceChargeRate = createSelector(getCartBilling, cartBilling =>
  _get(cartBilling, 'serviceChargeInfo.serviceChargeRate', 0)
);

export const getShoppingCart = createSelector(
  [getCartBilling, getCartItems, getCartUnavailableItems, getAllProducts, getAllCategories],
  (cartBilling, items, unavailableItems, allProducts, categories) => {
    const categoriesKeys = Object.keys(categories) || [];
    const allProductIds = Object.keys(allProducts) || [];
    const categoryInfo = selectedProductObject => {
      let categoryName = '';
      let categoryRank = '';

      categoriesKeys.forEach((key, index) => {
        if ((categories[key].products || []).find(productId => productId === selectedProductObject.productId)) {
          categoryName = categories[key].name;
          categoryRank = index + 1;
        }
      });

      return {
        categoryName,
        categoryRank,
      };
    };

    cartBilling.count = [...items, ...unavailableItems].reduce((sumCount, item) => sumCount + item.quantity, 0);

    return {
      cartBilling,
      items: items.map(item => ({
        ...item,
        ...categoryInfo(item),
        rank: allProductIds.findIndex(id => id === item.productId) + 1,
        isFeaturedProduct:
          allProducts[item.productId] && allProducts[item.productId].isFeaturedProduct
            ? allProducts[item.productId].isFeaturedProduct
            : false,
      })),
      unavailableItems: unavailableItems.map(unavailableItem => ({
        ...unavailableItem,
        ...categoryInfo(unavailableItem),
        rank: allProductIds.findIndex(id => id === unavailableItem.productId) + 1,
        isFeaturedProduct:
          allProducts[unavailableItem.productId] && allProducts[unavailableItem.productId].isFeaturedProduct
            ? allProducts[unavailableItem.productId].isFeaturedProduct
            : false,
      })),
    };
  }
);

// This selector is for Clever Tap only, don't change it unless you are working on Clever Tap feature.
export const getStoreInfoForCleverTap = state => {
  const businessName = getBusiness(state);
  const allBusinessInfo = getAllBusinesses(state);
  const { billing: cartSummary } = state.app.shoppingCart;

  return StoreUtils.getStoreInfoForCleverTap({ business: businessName, allBusinessInfo, cartSummary });
};

// This selector is for Clever Tap only, don't change it unless you are working on Clever Tap feature.
export const getPaymentInfoForCleverTap = state => {
  const enablePayLater = getEnablePayLater(state);
  const isDineType = getIsDineType(state);

  const res = {};

  if (isDineType) {
    res['dine-in payment flow'] = enablePayLater ? 'pay later' : 'pay first';
  }

  return res;
};

export const getIsCartStatusRejected = createSelector(getCartStatus, status => status === API_REQUEST_STATUS.REJECTED);

export const getUserEmail = createSelector(getUser, userInfo => _get(userInfo, 'profile.email', ''));

export const getUserName = createSelector(getUser, userInfo => _get(userInfo, 'profile.name', ''));

export const getUserPhone = createSelector(getUser, userInfo => _get(userInfo, 'profile.phone', ''));

export const getUserConsumerId = createSelector(getUser, userInfo => _get(userInfo, 'consumerId', ''));

export const getStoreName = createSelector(getStore, store => _get(store, 'name', ''));

export const getStoreCoords = createSelector(getStore, store => {
  if (!store) {
    return null;
  }

  return {
    lat: _get(store, 'location.latitude'),
    lng: _get(store, 'location.longitude'),
  };
});

export const getEnableCashback = createSelector(getBusinessInfo, businessInfo =>
  _get(businessInfo, 'enableCashback', null)
);

export const getEnableTakeaway = createSelector(getBusinessInfo, businessInfo =>
  _get(businessInfo, 'enableTakeaway', false)
);

export const getTakeawayCharge = createSelector(getBusinessInfo, businessInfo =>
  _get(businessInfo, 'takeawayCharge', 0)
);

export const getQROrderingSettings = createSelector(getBusinessInfo, businessInfo =>
  _get(businessInfo, 'qrOrderingSettings', null)
);

export const getIsGuestLoginDisabled = createSelector(getQROrderingSettings, qrOrderingSettings =>
  _get(qrOrderingSettings, 'disableGuestLogin', false)
);

export const getSearchingTags = createSelector(getQROrderingSettings, qrOrderingSettings =>
  _get(qrOrderingSettings, 'searchingTags', [])
);

export const getFoodTagsForCleverTap = createSelector(getSearchingTags, searchingTags => searchingTags.join(', '));

export const getFreeShippingMinAmount = createSelector(getQROrderingSettings, qrOrderingSettings =>
  _get(qrOrderingSettings, 'defaultShippingZone.defaultShippingZoneMethod.freeShippingMinAmount', null)
);

export const getDefaultLoyaltyRatio = createSelector(getBusinessInfo, businessInfo =>
  _get(businessInfo, 'defaultLoyaltyRatio', null)
);

export const getCashbackRate = createSelector(
  getDefaultLoyaltyRatio,
  getEnableCashback,
  (defaultLoyaltyRatio, enableCashback) => {
    if (!enableCashback) {
      return null;
    }

    if (defaultLoyaltyRatio === 0) {
      return 0;
    }

    return Math.floor((1 / defaultLoyaltyRatio) * 100) / 100;
  }
);

export const getMinimumConsumption = createSelector(getQROrderingSettings, qrOrderingSettings => {
  const minimumConsumption = _get(qrOrderingSettings, 'minimumConsumption', null);
  return Number(minimumConsumption || 0);
});

export const getEnableConditionalFreeShipping = createSelector(getQROrderingSettings, qrOrderingSettings =>
  _get(qrOrderingSettings, 'defaultShippingZone.defaultShippingZoneMethod.enableConditionalFreeShipping', null)
);

const mergeWithShoppingCart = (onlineCategories, carts) => {
  if (!Array.isArray(onlineCategories)) {
    return null;
  }

  const shoppingCartNewSet = {};

  if (carts) {
    (carts || []).forEach(item => {
      const newItem = shoppingCartNewSet[item.parentProductId || item.productId] || {
        quantity: 0,
        ids: [],
        products: [],
      };

      newItem.quantity += item.quantity;
      newItem.ids.push(item.id);
      newItem.products.push(item);

      shoppingCartNewSet[item.parentProductId || item.productId] = newItem;
    });
  }

  return onlineCategories.map(category => {
    const { products } = category;

    category.cartQuantity = 0;

    products.forEach(product => {
      product.variations = product.variations || [];
      product.soldOut = isProductSoldOut(product || {});
      product.hasSingleChoice = !!product.variations.find(v => v.variationType === 'SingleChoice');
      product.cartQuantity = 0;

      const result = shoppingCartNewSet[product.id];

      if (result) {
        category.cartQuantity += result.quantity;
        product.cartQuantity += result.quantity;
        product.cartItemIds = result.ids;
        product.cartItems = result.products;
        product.canDecreaseQuantity = result.quantity > 0 && result.ids.length === 1;
      }
    });

    return category;
  });
};

export const getCategoryProductList = createSelector(
  [getAllProducts, getAllCategories, getCartItems, getNewCartItems, getEnablePayLater],
  (allProducts, categories, cartItems, newCartItems, enablePayLater) => {
    const carts = enablePayLater ? newCartItems : cartItems;

    if (!allProducts || !categories || !Array.isArray(carts)) {
      return [];
    }

    const newCategories = Object.values(categories)
      .map((category, categoryId) => ({
        ...category,
        products: category.products.map((id, index) => {
          const product = JSON.parse(JSON.stringify(allProducts[id]));

          return {
            categoryName: category.name,
            categoryRank: categoryId + 1,
            rank: index + 1,
            ...product,
          };
        }),
      }))
      .filter(c => c.products.length);

    return mergeWithShoppingCart(newCategories, carts);
  }
);

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

export const getAllowAnonymousQROrdering = createSelector(getBusinessInfo, businessInfo =>
  _get(businessInfo, 'allowAnonymousQROrdering', false)
);

export const getIsGuestCheckout = createSelector(
  getIsQROrder,
  getIsGuestMode,
  (isQROrder, isGuestMode) => isQROrder && isGuestMode
);

export const getIsQROrderingLoginFree = createSelector(
  getAllowAnonymousQROrdering,
  getIsQROrder,
  getIsGuestMode,
  (allowAnonymousQROrdering, isQROrder, isGuestMode) => isQROrder && (allowAnonymousQROrdering || isGuestMode)
);

export const getIsLoginFree = createSelector(
  getIsDigitalType,
  getIsQROrderingLoginFree,
  (isDigitalType, isQROrderingLoginFree) => isDigitalType || isQROrderingLoginFree
);

export const getHasLoginGuardPassed = createSelector(
  getUserIsLogin,
  getIsLoginFree,
  (isUserLogin, isLoginFree) => isUserLogin || isLoginFree
);

export const getIsFreeOrder = createSelector(getCartBilling, cartBilling => {
  const billingTotal = _get(cartBilling, 'total', 0);
  return billingTotal === 0;
});

export const getIsValidCreateOrder = createSelector(
  getIsFreeOrder,
  getIsTNGMiniProgram,
  (isFreeOrder, isTNGMiniProgram) => isTNGMiniProgram || isFreeOrder
);

export const getTotalItemPrice = createSelector(getShoppingCart, shoppingCartInfo => {
  const { items } = shoppingCartInfo || {};
  let totalPrice = 0;

  (items || []).forEach(item => {
    totalPrice += item.displayPrice * item.quantity;
  });

  return totalPrice;
});

export const getValidBillingTotal = createSelector(getMinimumConsumption, minimumConsumption => {
  const minimumBillingTotal = 1;
  return Math.max(minimumConsumption, minimumBillingTotal);
});

export const getIsBillingTotalInvalid = createSelector(
  getTotalItemPrice,
  getCartBilling,
  getIsDeliveryType,
  getMinimumConsumption,
  (totalItemPrice, cartBilling, isDeliveryType, minimumConsumption) => {
    const { total: billingTotal } = cartBilling || {};
    const hasMinConsumptionNotReached = isDeliveryType && totalItemPrice < minimumConsumption;
    const isTotalBillingTooSmall = billingTotal > 0 && billingTotal < 1;
    return hasMinConsumptionNotReached || isTotalBillingTooSmall;
  }
);

/**
 * get Format Currency function
 * Usage example: formatCurrency(100), output: "RM 100.00"
 */
export const getFormatCurrencyFunction = createSelector(getBusinessCurrency, currencyCode => {
  const currencyFormatter = createCurrencyFormatter({
    currencyCode,
  });

  return currencyFormatter.format.bind(currencyFormatter);
});

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

/**
 * is related store data api ready
 * @returns
 */
export const getIsStoreInfoReady = createSelector(
  getOnlineStoreInfoStatus,
  getCoreBusinessAPIStatus,
  (onlineStoreInfoStatus, coreBusinessAPIStatus) =>
    onlineStoreInfoStatus === API_REQUEST_STATUS.FULFILLED && coreBusinessAPIStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsCoreStoresLoaded = createSelector(
  getCoreStoresStatus,
  coreStoresStatus => coreStoresStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsCoreStoresRequestRejected = createSelector(
  getCoreStoresStatus,
  coreStoresStatus => coreStoresStatus === API_REQUEST_STATUS.REJECTED
);

export const getDeliveryRadius = createSelector(getBusinessInfo, businessInfo =>
  _get(businessInfo, 'qrOrderingSettings.deliveryRadius', null)
);

export const getRouter = state => state.router;

export const getLocation = state => state.router.location;

export const getRouterPathName = createSelector(getLocation, location => location.pathname);

export const getLocationSearch = createSelector(getLocation, location => location.search);

export const getURLQueryObject = createSelector(getLocationSearch, locationSearch =>
  qs.parse(locationSearch, { ignoreQueryPrefix: true })
);

export const getStoreRating = createSelector(getBusinessInfo, businessInfo =>
  _get(businessInfo, 'stores[0].reviewInfo.rating', null)
);

export const getAddOrUpdateShoppingCartItemStatus = state => state.app.addOrUpdateShoppingCartItemRequest.status;

export const getAddOrUpdateShoppingCartItemErrorCategory = state =>
  state.app.addOrUpdateShoppingCartItemRequest.errorCategory;

export const getIsAddOrUpdateShoppingCartItemRejected = createSelector(
  getAddOrUpdateShoppingCartItemStatus,
  addOrUpdateShoppingCartItemStatus => addOrUpdateShoppingCartItemStatus === API_REQUEST_STATUS.REJECTED
);

export const getShouldShowCashbackSwitchButton = createSelector(getCartCashback, cashback => cashback > 0);

export const getDynamicQrCodeUrlType = createSelector(getDynamicQrCode, dynamicQrCodeInfo =>
  _get(dynamicQrCodeInfo, 'data.urlType', null)
);

export const getIsDynamicQrCodeUrlExpired = createSelector(getDynamicQrCode, dynamicQrCodeInfo =>
  _get(dynamicQrCodeInfo, 'data.isUrlExpired', false)
);

export const getIsDynamicUrl = createSelector(getDynamicQrCodeUrlType, urlType => urlType === URL_TYPES.DYNAMIC);

export const getIsDynamicUrlExpired = createSelector(
  getIsDynamicQrCodeUrlExpired,
  getIsDynamicUrl,
  (isDynamicQrCodeUrlExpired, isDynamicUrl) => isDynamicQrCodeUrlExpired && isDynamicUrl
);
