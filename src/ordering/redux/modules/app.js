import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import dayjs from 'dayjs';
import _get from 'lodash/get';
import _uniq from 'lodash/uniq';
import Constants, { API_REQUEST_STATUS } from '../../../utils/constants';
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
import i18next from 'i18next';
import url from '../../../utils/url';
import { getBusinessByName, getAllBusinesses } from '../../../redux/modules/entities/businesses';
import { getCoreStoreList, getStoreById } from '../../../redux/modules/entities/stores';
import { getAllProducts } from '../../../redux/modules/entities/products';
import { getAllCategories } from '../../../redux/modules/entities/categories';

import * as StoreUtils from '../../../utils/store-utils';
import * as TngUtils from '../../../utils/tng-utils';

const { AUTH_INFO } = Constants;
const localePhoneNumber = Utils.getLocalStorageVariable('user.p');
const metadataMobile = require('libphonenumber-js/metadata.mobile.json');

export const types = APP_TYPES;

const CartItemModel = {
  id: null,
  productId: null,
  title: '',
  variationTexts: [],
  displayPrice: 0,
  originalDisplayPrice: 0,
  image: null,
  stockStatus: '',
  quantity: 0,
  quantityOnHand: 0,
};

const CartModel = {
  status: 'pending',
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
  },
};

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
      status: '',
    },
    isError: false,
    otpType: 'otp',
    country: Utils.getCountry(localePhoneNumber, navigator.language, Object.keys(metadataMobile.countries || {}), 'MY'),
    phone: localePhoneNumber || '',
    noWhatsAppAccount: true,
    loginRequestStatus: null,
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
    isFetching: false,
  },
  requestInfo: {
    tableId: config.table,
    storeId: config.storeId,
    shippingType: Utils.getOrderTypeFromUrl(),
  },
  shoppingCart: CartModel,
  storeHashCode: {
    data: null,
    status: null,
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
  },
};

const updateDeliveryDetailsInSessionStorage = data => {
  return sessionStorage.setItem('deliveryDetails', JSON.stringify(data));
};

const getDeliveryDetailsFromSessionStorage = () => {
  try {
    return JSON.parse(Utils.getSessionVariable('deliveryDetails'));
  } catch (e) {
    console.error(e);
    return null;
  }
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

export const fetchShoppingCart = (isDeliveryType, deliveryCoords, fulfillDate) => {
  return {
    [API_REQUEST]: {
      types: [types.FETCH_SHOPPINGCART_REQUEST, types.FETCH_SHOPPINGCART_SUCCESS, types.FETCH_SHOPPINGCART_FAILURE],
      ...Url.API_URLS.GET_CART_TYPE(isDeliveryType, deliveryCoords, fulfillDate),
    },
  };
};

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

//action creators
export const actions = {
  showLogin: () => ({
    type: types.SHOW_LOGIN_PAGE,
  }),

  hideLogin: () => ({
    type: types.HIDE_LOGIN_PAGE,
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

  resetOtpStatus: () => ({
    type: types.RESET_OTP_STATUS,
  }),

  getOtp: ({ phone, type = 'otp' }) => ({
    [API_REQUEST]: {
      types: [types.GET_OTP_REQUEST, types.GET_OTP_SUCCESS, types.GET_OTP_FAILURE],
      ...Url.API_URLS.GET_OTP,
      payload: {
        type,
        phone,
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

  getLoginStatus: () => dispatch => {
    return dispatch({
      types: [types.FETCH_LOGIN_STATUS_REQUEST, types.FETCH_LOGIN_STATUS_SUCCESS, types.FETCH_LOGIN_STATUS_FAILURE],
      requestPromise: get(Url.API_URLS.GET_LOGIN_STATUS.url).then(resp => {
        if (resp) {
          if (resp.consumerId) {
            if (resp.login) {
              get(Url.API_URLS.GET_CONSUMER_PROFILE(resp.consumerId).url).then(profile => {
                const userInfo = {
                  Name: profile.firstName,
                  Phone: profile.phone,
                  Email: profile.email,
                  Identity: resp.consumerId,
                };

                if (profile.birthday) {
                  userInfo.DOB = new Date(profile.birthday);
                }

                CleverTap.onUserLogin(userInfo);

                dispatch({ type: types.FETCH_PROFILE_SUCCESS, response: profile });
              });
            }
          }
        }
        return resp;
      }),
    });
  },

  setLoginPrompt: prompt => ({
    type: types.SET_LOGIN_PROMPT,
    prompt,
  }),

  hideApiMessageModal: () => ({
    type: types.CLEAR_API_ERROR,
  }),

  updateProfileInfo: fields => ({
    type: types.UPDATE_PROFILE_INFO,
    fields,
  }),

  updateOtpStatus: () => ({
    type: types.UPDATE_OTP_STATUS,
  }),

  getProfileInfo: consumerId => ({
    [API_REQUEST]: {
      types: [types.FETCH_PROFILE_REQUEST, types.FETCH_PROFILE_SUCCESS, types.FETCH_PROFILE_FAILURE],
      ...url.API_URLS.GET_CONSUMER_PROFILE(consumerId),
    },
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

  loadCoreBusiness: id => dispatch => {
    const { storeId, business } = config;

    return dispatch(fetchCoreBusiness({ business, storeId: id || storeId }));
  },

  // load shopping cart
  loadShoppingCart: () => async (dispatch, getState) => {
    const isDelivery = Utils.isDeliveryType();
    const isDigital = Utils.isDigitalType();
    const businessUTCOffset = getBusinessUTCOffset(getState());

    if (isDigital) {
      await dispatch(generatorShoppingCartForVoucherOrdering());
      return;
    }

    const deliveryDetails = getDeliveryDetails(getState());

    const deliveryToLocation = _get(deliveryDetails, 'deliveryToLocation', null);

    const deliveryCoords = deliveryToLocation
      ? { lat: deliveryToLocation.latitude, lng: deliveryToLocation.longitude }
      : Utils.getDeliveryCoords();

    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);

    await dispatch(fetchShoppingCart(isDelivery, deliveryCoords, fulfillDate));
  },

  removeShoppingCartItem: variables => dispatch => {
    return dispatch(removeShoppingCartItem(variables));
  },

  addOrUpdateShoppingCartItem: variables => dispatch => {
    return dispatch(addOrUpdateShoppingCartItem(variables));
  },

  // TODO: This type is actually not used, because apiError does not respect action type,
  // which is a bad practice, we will fix it in the future, for now we just keep a useless
  // action type.
  showApiErrorModal: code => ({
    type: 'ordering/app/showApiErrorModal',
    code,
  }),

  clearAll: () => dispatch => {
    return dispatch(emptyShoppingCart());
  },

  initDeliveryDetails: () => async (dispatch, getState) => {
    const deliveryDetailsInSession = getDeliveryDetailsFromSessionStorage();
    const localStoragePhone = localStorage.getItem('user.p') || '';

    const payload = {
      ...deliveryDetailsInSession,
      phone: deliveryDetailsInSession?.phone || localStoragePhone,
    };

    updateDeliveryDetailsInSessionStorage(payload);

    dispatch({
      type: types.DELIVERY_DETAILS_INIT,
      payload,
    });
  },

  updateDeliveryDetails: data => async (dispatch, getState) => {
    const state = getState();
    const deliveryDetails = getDeliveryDetails(state);

    const payload = {
      ...deliveryDetails,
      ...data,
    };

    updateDeliveryDetailsInSessionStorage(payload);

    dispatch({
      type: types.DELIVERY_DETAILS_UPDATED,
      payload,
    });
  },
  loadCoreStores: address => (dispatch, getState) => {
    const business = getBusiness(getState());

    // will be handle in src/redux/modules/entities/stores.js
    return dispatch({
      [FETCH_GRAPHQL]: {
        types: [types.FETCH_CORESTORES_REQUEST, types.FETCH_CORESTORES_SUCCESS, types.FETCH_CORESTORES_FAILURE],
        endpoint: Url.apiGql('CoreStores'),
        variables: { business, ...address },
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

  // load product list group by category, and shopping cart
  loadProductList: () => (dispatch, getState) => {
    const businessUTCOffset = getBusinessUTCOffset(getState());

    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);

    config.storeId && dispatch(actions.loadShoppingCart());

    const shippingType = Utils.getApiRequestShippingType();

    dispatch(fetchOnlineCategory({ fulfillDate, shippingType }));
  },

  loadProductDetail: productId => (dispatch, getState) => {
    const businessUTCOffset = getBusinessUTCOffset(getState());
    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);

    return dispatch(fetchProductDetail({ productId, fulfillDate }));
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

      const tokens = await TngUtils.getAccessToken({ business: business });

      const { access_token, refresh_token } = tokens;

      const result = await ApiRequest.login({
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

const user = (state = initialState.user, action) => {
  const { type, response, prompt, error, fields, responseGql } = action;
  const { consumerId, login, noWhatsAppAccount } = response || {};

  switch (type) {
    case types.SHOW_LOGIN_PAGE:
      return { ...state, showLoginPage: true };
    case types.HIDE_LOGIN_PAGE:
      return { ...state, showLoginPage: false };
    case types.FETCH_LOGIN_STATUS_REQUEST:
    case types.CREATE_OTP_REQUEST:
      return { ...state, isFetching: true };
    case types.CREATE_LOGIN_REQUEST:
      return { ...state, isFetching: true, loginRequestStatus: API_REQUEST_STATUS.PENDING };
    case types.FETCH_LOGIN_STATUS_FAILURE:
    case types.GET_OTP_FAILURE:
    case types.CREATE_OTP_FAILURE:
      return { ...state, isFetching: false, isResending: false, isError: true };
    case types.GET_OTP_REQUEST:
      return {
        ...state,
        isFetching: true,
        isResending: true,
        otpType: 'reSendotp',
      };
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
    case types.CREATE_LOGIN_SUCCESS: {
      const { consumerId, user } = action.payload;
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
          birthday: user.birthday,
        },
        isLogin: true,
        hasOtp: false,
        isFetching: false,
        loginRequestStatus: API_REQUEST_STATUS.FULFILLED,
      };
    }
    case types.FETCH_LOGIN_STATUS_SUCCESS:
      return {
        ...state,
        isLogin: login,
        consumerId,
        isFetching: false,
        isExpired: false,
      };
    case types.CREATE_LOGIN_FAILURE:
      CleverTap.pushEvent('Login - login failed');
      if (error?.error === 'TokenExpiredError' || error?.error === 'JsonWebTokenError') {
        return { ...state, isExpired: true, isFetching: false, loginRequestStatus: API_REQUEST_STATUS.REJECTED };
      }

      return { ...state, isFetching: false, loginRequestStatus: API_REQUEST_STATUS.REJECTED };
    case types.SET_LOGIN_PROMPT:
      return { ...state, prompt };
    case types.UPDATE_PROFILE_INFO:
      return {
        ...state,
        profile: {
          ...state.profile,
          ...fields,
        },
      };

    case types.FETCH_PROFILE_REQUEST: {
      return {
        ...state,
        profile: {
          status: API_REQUEST_STATUS.PENDING,
        },
      };
    }

    case types.FETCH_PROFILE_SUCCESS: {
      const { firstName, email, birthday, phone } = response || {};
      return {
        ...state,
        profile: {
          name: firstName,
          email,
          birthday,
          phone,
          status: API_REQUEST_STATUS.FULFILLED,
        },
      };
    }

    case types.FETCH_PROFILE_FAILURE: {
      return {
        ...state,
        profile: {
          status: API_REQUEST_STATUS.REJECTED,
        },
      };
    }

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

const business = (state = initialState.business) => state;

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
  const { type, code, response, responseGql, payload } = action;
  const { error: payloadError } = payload || {};
  const result = response || (responseGql || {}).data || payloadError;
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

const requestInfo = (state = initialState.requestInfo) => state;

const shoppingCart = (state = initialState.shoppingCart, action) => {
  if (action.type === types.CLEARALL_SUCCESS || action.type === types.CLEARALL_BY_PRODUCTS_SUCCESS) {
    return { ...state, ...CartModel, isFetching: false, status: 'fulfilled' };
  } else if (action.type === types.FETCH_SHOPPINGCART_REQUEST) {
    return { ...state, isFetching: true, status: 'pending' };
  } else if (action.type === types.FETCH_SHOPPINGCART_SUCCESS) {
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
      status: 'fulfilled',
      items: items.map(item => ({ ...CartItemModel, ...item })),
      unavailableItems: unavailableItems.map(unavailableItem => ({ ...CartItemModel, ...unavailableItem })),
      billing: {
        ...cartBilling,
        promotion,
      },
    };
  } else if (action.type === types.FETCH_SHOPPINGCART_FAILURE) {
    return { ...state, isFetching: false, status: 'reject' };
  }

  return state;
};

const deliveryDetails = (state = initialState.deliveryDetails, action) => {
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

export default combineReducers({
  user,
  error,
  business,
  onlineStoreInfo,
  requestInfo,
  apiError,
  shoppingCart,
  deliveryDetails,
  storeHashCode: storeHashCodeReducer,
});

// selectors
export const getUser = state => state.app.user;
export const getOtpType = state => state.app.user.otpType;
export const getBusiness = state => state.app.business;
export const getError = state => state.app.error;
export const getOnlineStoreInfo = state => {
  return state.entities.onlineStores[state.app.onlineStoreInfo.id];
};
export const getRequestInfo = state => state.app.requestInfo;
export const getMerchantCountry = state => {
  if (state.entities.businesses[state.app.business]) {
    return state.entities.businesses[state.app.business].country;
  }

  return null;
};
export const getApiError = state => state.app.apiError;

export const getUserIsLogin = createSelector(getUser, user => _get(user, 'isLogin', false));

export const getUserLoginRequestStatus = state => state.app.user.loginRequestStatus;

export const getUserProfileStatus = state => state.app.user.profile.status;

export const getIsUserLoginRequestStatusInPending = createSelector(
  getUserLoginRequestStatus,
  status => status === API_REQUEST_STATUS.PENDING
);

export const getBusinessInfo = state => {
  const business = getBusiness(state);

  return getBusinessByName(state, business) || {};
};

export const getStoresList = state => getCoreStoreList(state);

export const getStoreHashCode = state => state.app.storeHashCode.data;

export const getDeliveryInfo = createSelector(getBusinessInfo, businessInfo => Utils.getDeliveryInfo(businessInfo));

export const getBusinessUTCOffset = createSelector(getBusinessInfo, businessInfo => {
  return _get(businessInfo, 'timezoneOffset', 480);
});

export const getBusinessDeliveryTypes = createSelector(getStoresList, stores => {
  const deliveryTypes = stores.reduce((types, store) => {
    return types.concat(store.fulfillmentOptions);
  }, []);

  return _uniq(deliveryTypes);
});

export const getStoreId = createSelector(getRequestInfo, requestInfo => _get(requestInfo, 'storeId', null));
export const getShippingType = createSelector(getRequestInfo, requestInfo => _get(requestInfo, 'shippingType', null));

export const getStore = state => {
  const storeId = getStoreId(state);

  return getStoreById(state, storeId);
};

export const getBusinessCurrency = createSelector(getOnlineStoreInfo, onlineStoreInfo => {
  return _get(onlineStoreInfo, 'currency', 'MYR');
});

export const getCartItems = state => state.app.shoppingCart.items;

export const getCartBilling = state => state.app.shoppingCart.billing;

export const getCartUnavailableItems = state => state.app.shoppingCart.unavailableItems;

export const getDeliveryDetails = state => state.app.deliveryDetails;

export const getShoppingCart = createSelector(
  [getCartBilling, getCartItems, getCartUnavailableItems, getAllProducts, getAllCategories],
  (cartBilling, items, unavailableItems, allProducts, categories) => {
    const categoriesKeys = Object.keys(categories) || [];
    const allProductIds = Object.keys(allProducts) || [];
    const categoryInfo = function(selectedProductObject) {
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

export const getCartItemList = state => {
  return state.app.shoppingCart.items;
};

// This selector is for Clever Tap only, don't change it unless you are working on Clever Tap feature.
export const getStoreInfoForCleverTap = state => {
  const business = getBusiness(state);
  const allBusinessInfo = getAllBusinesses(state);
  const { billing: cartSummary } = state.app.shoppingCart;

  return StoreUtils.getStoreInfoForCleverTap({ business, allBusinessInfo, cartSummary });
};

export const getUserEmail = createSelector(getUser, user => _get(user, 'profile.email', ''));

export const getUserName = createSelector(getUser, user => _get(user, 'profile.name', ''));

export const getUserPhone = createSelector(getUser, user => _get(user, 'profile.phone', ''));

export const getUserConsumerId = createSelector(getUser, user => _get(user, 'consumerId', ''));

const mergeWithShoppingCart = (onlineCategory, carts) => {
  if (!Array.isArray(onlineCategory)) {
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

  return onlineCategory.map(category => {
    const { products } = category;

    category.cartQuantity = 0;

    products.forEach(function(product) {
      product.variations = product.variations || [];
      product.soldOut = Utils.isProductSoldOut(product || {});
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
  [getAllProducts, getAllCategories, getCartItemList],
  (allProducts, categories, carts) => {
    if (!allProducts || !categories || !Array.isArray(carts)) {
      return [];
    }

    const newCategories = Object.values(categories)
      .map((category, categoryId) => {
        return {
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
        };
      })
      .filter(c => c.products.length);

    return mergeWithShoppingCart(newCategories, carts);
  }
);
