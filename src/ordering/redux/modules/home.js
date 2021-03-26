import { createSelector } from 'reselect';
import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import * as StoreUtils from '../../../utils/store-utils';
import { combineReducers } from 'redux';
import { getAllCategories } from '../../../redux/modules/entities/categories';
import { getAllProducts, getProductById } from '../../../redux/modules/entities/products';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { API_REQUEST } from '../../../redux/middlewares/api';
import config from '../../../config';
import { getBusiness, getBusinessUTCOffset, getCartItemList, fetchShoppingCart } from './app';
import { getAllBusinesses } from '../../../redux/modules/entities/businesses';
import { getCoreStoreList } from '../../../redux/modules/entities/stores';
import { APP_TYPES } from '../types';

export const initialState = {
  domProperties: {
    // 33.8% equal (item padding + item image + item cart controller button height) / window width
    productItemMinHeight:
      ((document.body.clientWidth || window.innerWidth) && (document.body.clientWidth || window.innerWidth) < 170
        ? document.body.clientWidth || window.innerWidth
        : 414) * 0.26,
  },
  onlineCategory: {
    isFetching: false,
    categoryIds: [],
  },
  popUpModal: {
    userConfirmed: false,
  },
  timeSlot: {
    timeSlotList: [],
  },
  coreStore: {
    isFetching: false,
    storeHashCode: '',
  },
  selectedProduct: {
    id: '',
    cartId: '',
    isFetching: false,
    status: 'fulfilled',
  },
};

const types = {
  // fetch shoppingCart
  FETCH_SHOPPINGCART_REQUEST: 'ORDERING/HOME/FETCH_SHOPPINGCART_REQUEST',
  FETCH_SHOPPINGCART_SUCCESS: 'ORDERING/HOME/FETCH_SHOPPINGCART_SUCCESS',
  FETCH_SHOPPINGCART_FAILURE: 'ORDERING/HOME/FETCH_SHOPPINGCART_FAILURE',

  // fetch onlineCategory
  FETCH_ONLINECATEGORY_REQUEST: 'ORDERING/HOME/FETCH_ONLINECATEGORY_REQUEST',
  FETCH_ONLINECATEGORY_SUCCESS: 'ORDERING/HOME/FETCH_ONLINECATEGORY_SUCCESS',
  FETCH_ONLINECATEGORY_FAILURE: 'ORDERING/HOME/FETCH_ONLINECATEGORY_FAILURE',

  // mutable addOrUpdateShoppingCartItem
  ADDORUPDATE_SHOPPINGCARTITEM_REQUEST: 'ORDERING/HOME/ADDORUPDATE_SHOPPINGCARTITEM_REQUEST',
  ADDORUPDATE_SHOPPINGCARTITEM_SUCCESS: 'ORDERING/HOME/ADDORUPDATE_SHOPPINGCARTITEM_SUCCESS',
  ADDORUPDATE_SHOPPINGCARTITEM_FAILURE: 'ORDERING/HOME/ADDORUPDATE_SHOPPINGCARTITEM_FAILURE',

  // - or + on home page product item
  DECREASE_PRODUCT_IN_CART: 'ORDERING/HOME/DECREASE_PRODUCT_IN_CART',
  INCREASE_PRODUCT_IN_CART: 'ORDERING/HOME/INCREASE_PRODUCT_IN_CART',

  SET_MENU_LAYOUT_TYPE: 'ORDERING/HOME/SET_MENU_TYPE',

  SET_PRE_ORDER_MODAL_CONFIRM: 'ORDERING/HOME/SET_PRE_ORDER_MODAL_CONFIRM',

  // time slot
  FETCH_TIMESLOT_REQUEST: 'ORDERING/HOME/FETCH_TIMESLOT_REQUEST',
  FETCH_TIMESLOT_SUCCESS: 'ORDERING/HOME/FETCH_TIMESLOT_SUCCESS',
  FETCH_TIMESLOT_FAILURE: 'ORDERING/HOME/FETCH_TIMESLOT_FAILURE',

  // core stores
  FETCH_CORESTORES_REQUEST: 'STORES/HOME/FETCH_CORESTORES_REQUEST',
  FETCH_CORESTORES_SUCCESS: 'STORES/HOME/FETCH_CORESTORES_SUCCESS',
  FETCH_CORESTORES_FAILURE: 'STORES/HOME/FETCH_CORESTORES_FAILURE',

  // store hash code
  FETCH_STORE_HASHCODE_REQUEST: 'STORES/HOME/FETCH_STORE_HASHCODE_REQUEST',
  FETCH_STORE_HASHCODE_SUCCESS: 'STORES/HOME/FETCH_STORE_HASHCODE_SUCCESS',
  FETCH_STORE_HASHCODE_FAILURE: 'STORES/HOME/FETCH_STORE_HASHCODE_FAILURE',
};

const fetchOnlineCategory = variables => {
  const endpoint = Url.apiGql('OnlineCategory');
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

// actions
export const actions = {
  // load product list group by category, and shopping cart
  loadProductList: () => (dispatch, getState) => {
    const isDelivery = Utils.isDeliveryType();
    const businessUTCOffset = getBusinessUTCOffset(getState());

    let deliveryCoords;
    if (isDelivery) {
      deliveryCoords = Utils.getDeliveryCoords();
    }
    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);

    config.storeId && dispatch(fetchShoppingCart(isDelivery, deliveryCoords, fulfillDate));

    const shippingType = Utils.getApiRequestShippingType();

    dispatch(fetchOnlineCategory({ fulfillDate, shippingType }));
  },

  loadCoreStores: address => (dispatch, getState) => {
    const business = getBusiness(getState());
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

  userConfirmPreOrder: () => ({
    type: types.SET_PRE_ORDER_MODAL_CONFIRM,
  }),

  getTimeSlot: (shippingType, fulfillDate, storeid) => dispatch => {
    return dispatch({
      [API_REQUEST]: {
        types: [types.FETCH_TIMESLOT_REQUEST, types.FETCH_TIMESLOT_SUCCESS, types.FETCH_TIMESLOT_FAILURE],
        ...Url.API_URLS.GET_TIME_SLOT(shippingType, fulfillDate, storeid),
      },
    });
  },
};

// reducers
const domProperties = (state = initialState.domProperties, action) => {
  return state;
};

const onlineCategory = (state = initialState.onlineCategory, action) => {
  switch (action.type) {
    case types.FETCH_ONLINECATEGORY_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_ONLINECATEGORY_SUCCESS:
      const { onlineCategory } = action.responseGql.data;
      return {
        ...state,
        isFetching: false,
        categoryIds: onlineCategory.map(category => category.id),
      };
    case types.FETCH_ONLINECATEGORY_FAILURE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

const timeSlot = (state = initialState.timeSlot, action) => {
  switch (action.type) {
    case types.FETCH_TIMESLOT_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_TIMESLOT_SUCCESS:
      const timeSlotList = action.response;
      return {
        ...state,
        isFetching: false,
        timeSlotList,
      };
    case types.FETCH_TIMESLOT_FAILURE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

const coreStore = (state = initialState.coreStore, action) => {
  switch (action.type) {
    case types.FETCH_CORESTORES_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_CORESTORES_SUCCESS:
      return {
        ...state,
        isFetching: false,
      };
    case types.FETCH_CORESTORES_FAILURE:
      return { ...state, isFetching: false };
    case types.FETCH_STORE_HASHCODE_SUCCESS: {
      const { response } = action;
      const { redirectTo } = response || {};

      return { ...state, storeHashCode: redirectTo };
    }
    default:
      return state;
  }
};

const popUpModal = (state = initialState.popUpModal, action) => {
  if (action.type === types.SET_PRE_ORDER_MODAL_CONFIRM) {
    return { ...state, userConfirmed: true };
  }
  return state;
};

const selectedProduct = (state = initialState.selectedProduct, action) => {
  console.log(action.type);

  if (action.type === APP_TYPES.FETCH_PRODUCTDETAIL_REQUEST) {
    return { ...state, isFetching: true, status: 'pending' };
  } else if (action.type === APP_TYPES.FETCH_PRODUCTDETAIL_SUCCESS) {
    const { product } = action.responseGql.data;

    return {
      ...state,
      isFetching: false,
      status: 'fulfilled',
      id: product.id,
    };
  } else if (action.type === APP_TYPES.FETCH_PRODUCTDETAIL_FAILURE) {
    return { ...state, isFetching: false, status: 'reject' };
  }

  return state;
};

export default combineReducers({
  domProperties,
  onlineCategory,
  popUpModal,
  timeSlot,
  coreStore,
  selectedProduct,
});

// selectors
export const getDeliveryInfo = state => {
  const business = getBusiness(state);
  const allBusinessInfo = getAllBusinesses(state);
  // ignore for now since home page needs address from it.
  // if (!allBusinessInfo || Object.keys(allBusinessInfo).length === 0) return null;
  return Utils.getDeliveryInfo({ business, allBusinessInfo });
};

export const getStoresList = state => getCoreStoreList(state);

export const getStoreHashCode = state => state.home.coreStore.storeHashCode;

export const getCategoryIds = state => state.home.onlineCategory.categoryIds;

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
      .map(category => {
        return {
          ...category,
          products: category.products.map((id, index) => {
            const product = JSON.parse(JSON.stringify(allProducts[id]));

            return {
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

export const getProductItemMinHeight = state => state.home.domProperties.productItemMinHeight;

export const getPopUpModal = state => state.home.popUpModal;

export const getTimeSlotList = state => state.home.timeSlot.timeSlotList;

// This selector is for Clever Tap only, don't change it unless you are working on Clever Tap feature.
export const getStoreInfoForCleverTap = state => {
  const business = getBusiness(state);
  const allBusinessInfo = getAllBusinesses(state);

  return StoreUtils.getStoreInfoForCleverTap({ business, allBusinessInfo });
};

export const getSelectedProductDetail = state => {
  const { selectedProduct } = state.home;

  return getProductById(state, selectedProduct.id);
};

export const getAllProductsIds = createSelector(getAllProducts, allProducts => {
  try {
    const res = Object.keys(allProducts);
    return res;
  } catch (e) {
    return [];
  }
});
