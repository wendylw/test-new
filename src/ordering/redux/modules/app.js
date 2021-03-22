import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import _get from 'lodash/get';
import _uniq from 'lodash/uniq';
import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';
import * as VoucherUtils from '../../../voucher/utils';
import config from '../../../config';
import Url from '../../../utils/url';
import CleverTap from '../../../utils/clevertap';

import { APP_TYPES } from '../types';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { post, get } from '../../../utils/request';
import i18next from 'i18next';
import url from '../../../utils/url';
import { toISODateString } from '../../../utils/datetime-lib';
import { getCartItemById } from '../../../redux/modules/entities/carts';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { getCoreStoreList, getStoreById } from '../../../redux/modules/entities/stores';
import { getCartSummary, getAllCartItems } from '../../../redux/modules/entities/carts';

const { AUTH_INFO } = Constants;
const localePhoneNumber = Utils.getLocalStorageVariable('user.p');
const metadataMobile = require('libphonenumber-js/metadata.mobile.json');

export const types = APP_TYPES;

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
    isError: false,
    otpType: 'otp',
    country: Utils.getCountry(localePhoneNumber, navigator.language, Object.keys(metadataMobile.countries || {}), 'MY'),
    phone: localePhoneNumber,
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
  currentProduct: {
    id: '',
    cartId: '',
    isFetching: false,
  },
  shoppingCart: {
    isFetching: false,
    itemIds: [],
    unavailableItemIds: [],
  },
};

const fetchCoreBusiness = variables => ({
  [FETCH_GRAPHQL]: {
    types: [types.FETCH_COREBUSINESS_REQUEST, types.FETCH_COREBUSINESS_SUCCESS, types.FETCH_COREBUSINESS_FAILURE],
    endpoint: Url.apiGql('CoreBusiness'),
    variables,
  },
});

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

// generator a virtual shopping cart for Customer place a Voucher Order
const generatorShoppingCartForVoucherOrdering = () => {
  const orderingInfo = VoucherUtils.getVoucherOrderingInfoFromSessionStorage();
  const shoppingCart = VoucherUtils.generatorVirtualShoppingCart(orderingInfo.selectedVoucher);

  return {
    type: types.FETCH_SHOPPINGCART_SUCCESS,
    response: shoppingCart,
  };
};

const fetchShoppingCart = (isDeliveryType, deliveryCoords, fulfillDate) => {
  return {
    [API_REQUEST]: {
      types: [types.FETCH_SHOPPINGCART_REQUEST, types.FETCH_SHOPPINGCART_SUCCESS, types.FETCH_SHOPPINGCART_FAILURE],
      //...Url.API_URLS.GET_CART,
      ...Url.API_URLS.GET_CART_TYPE(isDeliveryType, deliveryCoords, fulfillDate),
    },
  };
};

const fetchProductDetail = variables => {
  const endpoint = Url.apiGql('ProductDetail');
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

//action creators
export const actions = {
  showLogin: () => ({
    type: types.SHOW_LOGIN_PAGE,
  }),

  hideLogin: () => ({
    type: types.HIDE_LOGIN_PAGE,
  }),

  loginApp: ({ accessToken, refreshToken }) => (dispatch, getState) => {
    const businessUTCOffset = getBusinessUTCOffset(getState());

    dispatch({
      types: [types.CREATE_LOGIN_REQUEST, types.CREATE_LOGIN_SUCCESS, types.CREATE_LOGIN_FAILURE],
      requestPromise: post(Url.API_URLS.POST_LOGIN.url, {
        accessToken,
        refreshToken,
        fulfillDate: Utils.getFulfillDate(businessUTCOffset),
        shippingType: Utils.getApiRequestShippingType(),
      }).then(resp => {
        if (resp && resp.consumerId) {
          window.heap?.identify(resp.consumerId);
          window.heap?.addEventProperties({ LoggedIn: 'yes' });
          const phone = Utils.getLocalStorageVariable('user.p');
          if (phone) {
            window.heap?.addUserProperties({ PhoneNumber: phone });
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
        }
        return resp;
      }),
    });
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

  getLoginStatus: () => ({
    types: [types.FETCH_LOGIN_STATUS_REQUEST, types.FETCH_LOGIN_STATUS_SUCCESS, types.FETCH_LOGIN_STATUS_FAILURE],
    requestPromise: get(Url.API_URLS.GET_LOGIN_STATUS.url).then(resp => {
      if (resp) {
        if (resp.consumerId) {
          window.heap?.identify(resp.consumerId);
          window.heap?.addEventProperties({ LoggedIn: 'yes' });
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
            });
          }
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

  loadCustomerProfile: () => (dispatch, getState) => {
    const { app } = getState();

    if (app.user.consumerId) {
      document.cookie = `consumerId=${app.user.consumerId}`;
    }

    return dispatch(fetchCustomerProfile(app.user.consumerId || config.consumerId));
  },

  // load shopping cart
  loadShoppingCart: location => async (dispatch, getState) => {
    const isDelivery = Utils.isDeliveryType();
    const isDigital = Utils.isDigitalType();
    const businessUTCOffset = getBusinessUTCOffset(getState());

    if (isDigital) {
      await dispatch(generatorShoppingCartForVoucherOrdering());
      return;
    }

    let deliveryCoords;
    if (isDelivery) {
      deliveryCoords = Utils.getDeliveryCoords();
    }
    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);

    await dispatch(fetchShoppingCart(isDelivery, location || deliveryCoords, fulfillDate));
  },

  removeShoppingCartItem: variables => dispatch => {
    return dispatch(removeShoppingCartItem(variables));
  },

  addOrUpdateShoppingCartItem: variables => dispatch => {
    return dispatch(addOrUpdateShoppingCartItem(variables));
  },

  // decrease clicked on product item
  decreaseProductInCart: (shoppingCart, prod) => (dispatch, getState) => {
    const cartItem = (shoppingCart.items || []).find(
      item => item.productId === prod.id || item.parentProductId === prod.id
    );

    if (prod.cartQuantity === 1) {
      return dispatch(
        removeShoppingCartItem({
          productId: cartItem.productId,
          variations: cartItem.variations,
        })
      );
    }
    return dispatch(
      addOrUpdateShoppingCartItem({
        action: 'edit',
        business: getBusiness(getState()),
        productId: cartItem.productId,
        quantity: prod.cartQuantity - 1,
        variations: cartItem.variations || [],
      })
    );
  },

  // increase clicked on product item
  increaseProductInCart: prod => (dispatch, getState) => {
    const cartItem = (prod.cartItems || []).find(
      item => item.productId === prod.id || item.parentProductId === prod.id
    );

    if (prod.variations && prod.variations.length && getState().app.currentProduct.id === prod.id) {
      return;
    }

    if (prod.variations && prod.variations.length) {
      const businessUTCOffset = getBusinessUTCOffset(getState());
      const fulfillDate = Utils.getFulfillDate(businessUTCOffset);

      return dispatch(fetchProductDetail({ productId: prod.id, fulfillDate }));
    }

    return dispatch(
      addOrUpdateShoppingCartItem({
        action: 'edit',
        business: getBusiness(getState()),
        productId: prod.id,
        quantity: prod.cartQuantity + 1,
        variations: prod.hasSingleChoice && prod.cartItems.length === 1 ? cartItem.variations : [],
      })
    );
  },
};

const user = (state = initialState.user, action) => {
  const { type, response, prompt, error, fields, responseGql } = action;
  const { consumerId, login, user } = response || {};

  switch (type) {
    case types.SHOW_LOGIN_PAGE:
      return { ...state, showLoginPage: true };
    case types.HIDE_LOGIN_PAGE:
      return { ...state, showLoginPage: false };
    case types.FETCH_LOGIN_STATUS_REQUEST:
    case types.CREATE_OTP_REQUEST:
    case types.CREATE_LOGIN_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_LOGIN_STATUS_FAILURE:
    case types.GET_OTP_FAILURE:
    case types.CREATE_OTP_FAILURE:
      return { ...state, isFetching: false, isError: true };
    case types.GET_OTP_REQUEST:
      return {
        ...state,
        isFetching: true,
        otpType: 'reSendotp',
      };
    case types.RESET_OTP_STATUS:
      return { ...state, isFetching: false, hasOtp: false };
    case types.UPDATE_OTP_STATUS:
      return { ...state, isFetching: false, isError: false };
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
      if (error && (error.code === 401 || error.code === '40000')) {
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
  const { type, code, response, responseGql } = action;
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

const shoppingCart = (state = initialState.shoppingCart, action) => {
  if (action.responseGql) {
    const { emptyShoppingCart } = action.responseGql.data || {};
    if (emptyShoppingCart && emptyShoppingCart.success) {
      return { ...state, isFetching: false, itemIds: [], unavailableItemIds: [] };
    }
  }

  switch (action.type) {
    case types.FETCH_SHOPPINGCART_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_SHOPPINGCART_SUCCESS: {
      const { items, unavailableItems } = action.response || {};

      return {
        ...state,
        isFetching: false,
        itemIds: items.map(item => item.id),
        unavailableItemIds: unavailableItems.map(item => item.id),
      };
    }
    case types.FETCH_SHOPPINGCART_FAILURE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

const currentProduct = (state = initialState.currentProduct, action) => {
  if (action.type === types.FETCH_PRODUCTDETAIL_REQUEST) {
    return { ...state, isFetching: true };
  } else if (action.type === types.FETCH_PRODUCTDETAIL_SUCCESS) {
    const { product } = action.responseGql.data;

    return {
      ...state,
      isFetching: false,
      id: product.id,
    };
  } else if (action.type === types.FETCH_PRODUCTDETAIL_FAILURE) {
    return { ...state, isFetching: false };
  }
  return state;
};

export default combineReducers({
  user,
  error,
  messageModal,
  business,
  onlineStoreInfo,
  requestInfo,
  apiError,
  shoppingCart,
  currentProduct,
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
export const getMessageModal = state => state.app.messageModal;
export const getMerchantCountry = state => {
  if (state.entities.businesses[state.app.business]) {
    return state.entities.businesses[state.app.business].country;
  }

  return null;
};
export const getApiError = state => state.app.apiError;

export const getBusinessInfo = state => {
  const business = getBusiness(state);

  return getBusinessByName(state, business) || {};
};

export const getBusinessUTCOffset = createSelector(getBusinessInfo, businessInfo => {
  return _get(businessInfo, 'timezoneOffset', 480);
});

export const getBusinessDeliveryTypes = createSelector(getCoreStoreList, stores => {
  const deliveryTypes = stores.reduce((types, store) => {
    return types.concat(store.fulfillmentOptions);
  }, []);

  return _uniq(deliveryTypes);
});

export const getStoreId = createSelector(getRequestInfo, requestInfo => _get(requestInfo, 'storeId', null));

export const getStore = state => {
  const storeId = getStoreId(state);

  return getStoreById(state, storeId);
};

export const getBusinessCurrency = createSelector(getOnlineStoreInfo, onlineStoreInfo => {
  return _get(onlineStoreInfo, 'currency', 'MYR');
});

export const getCurrentProduct = state => state.app.currentProduct;

export const getCartItemIds = state => state.app.shoppingCart.itemIds;

export const getCartUnavailableItemIds = state => state.app.shoppingCart.unavailableItemIds;

export const getShoppingCart = createSelector(
  [getCartSummary, getCartItemIds, getCartUnavailableItemIds, getAllCartItems],
  (summary, itemIds, unavailableItemIds, carts) => {
    return {
      summary,
      items: itemIds.map(id => carts[id]),
      unavailableItems: unavailableItemIds.map(id => carts[id]),
    };
  }
);

// get cartItems of currentProduct
export const getShoppingCartItemsByProducts = createSelector(
  [getCartItemIds, getAllCartItems, getCurrentProduct],
  (itemIds, carts, product) => {
    const calcItems = itemIds
      .map(id => carts[id])
      .filter(x => x.productId === product.id || x.parentProductId === product.id);
    const items = calcItems.map(x => {
      return {
        productId: x.productId,
        variations: x.variations,
      };
    });
    const count = calcItems.reduce((res, item) => {
      res = res + item.quantity;
      return res;
    }, 0);

    return {
      items,
      count,
    };
  }
);

export const getCartItemList = state => {
  return state.app.shoppingCart.itemIds.map(id => getCartItemById(state, id));
};
