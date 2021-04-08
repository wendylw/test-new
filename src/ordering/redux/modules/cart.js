import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import config from '../../../config';
import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';
import { API_INFO } from '../../../utils/api/api-utils';
import { get } from '../../../utils/api/api-fetch';
import { CART_TYPES } from '../types';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getAllProducts, getProductById } from '../../../redux/modules/entities/products';
import { getAllCategories } from '../../../redux/modules/entities/categories';
import { getBusinessUTCOffset, getCartItemList, fetchShoppingCart } from './app';
import { APP_TYPES } from '../types';

const initialState = {
  pendingTransactionsIds: [],
  selectedProduct: {
    id: '',
    cartId: '',
    isFetching: false,
    status: 'fulfilled',
  },
  cartInventory: {
    status: '',
    error: {},
  },
};

export const types = CART_TYPES;

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
const cartActionTypes = {
  checkInventory: 'cart/checkInventory',
  checkInventorySuccess: 'cart/checkInventorySuccess',
  checkInventoryFailed: 'cart/checkInventoryFailed',
};

const checkInventory = () => ({
  type: cartActionTypes.checkInventory,
  payload: {
    status: 'pending',
  },
});

const checkInventorySuccess = () => ({
  type: cartActionTypes.checkInventorySuccess,
  payload: {
    status: 'fulfilled',
  },
});

const checkInventoryFailed = error => ({
  type: cartActionTypes.checkInventoryFailed,
  payload: {
    error,
    status: 'reject',
  },
});

export const actions = {
  updateTransactionsStatus: ({ status, receiptNumbers }) => ({
    [API_REQUEST]: {
      types: [
        types.UPDATE_TRANSACTIONS_STATUS_REQUEST,
        types.UPDATE_TRANSACTIONS_STATUS_SUCCESS,
        types.UPDATE_TRANSACTIONS_STATUS_FAILURE,
      ],
      ...Url.API_URLS.PUT_TRANSACTIONS_STATUS,
      payload: {
        status,
        receiptNumbers,
      },
    },
  }),

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

  checkCartInventory: () => async (dispatch, getState) => {
    const state = getState();
    const businessUTCOffset = getBusinessUTCOffset(state);
    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);
    const { app } = state;
    const { items: cartItems } = app.shoppingCart;
    const cartItemIds = cartItems.map(item => item.id);
    const shippingType = Utils.getApiRequestShippingType();
    const { url, queryParams } = API_INFO.getCartInventoryState(fulfillDate || '', cartItemIds, shippingType);

    try {
      dispatch(checkInventory());

      await get(url, { queryParams });

      dispatch(checkInventorySuccess());

      return { status: 'fulfilled' };
    } catch (e) {
      dispatch(checkInventoryFailed(e));
      dispatch({
        type: APP_TYPES.UPDATE_API_ERROR,
        code: e.code || 40002,
      });

      return { status: 'reject' };
    }
  },
};

const pendingTransactionsIds = (state = initialState.pendingTransactionsIds, action) => {
  const { transactions } = action.response || {};

  switch (action.type) {
    case types.FETCH_PENDING_TRANSACTIONS_SUCCESS:
      return { ...state, pendingTransactionsIds: (transactions || []).map(t => t.orderId) };
    case types.UPDATE_TRANSACTIONS_STATUS_SUCCESS:
      return { ...state, pendingTransactionsIds: [] };
    default:
      return state;
  }
};

const selectedProduct = (state = initialState.selectedProduct, action) => {
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

const cartInventory = (state = initialState.cartInventory, action) => {
  const { type, payload } = action;

  if (type === cartActionTypes.checkInventory) {
    state = Object.assign({}, state, payload);
  } else if (type === cartActionTypes.checkInventorySuccess) {
    state = Object.assign({}, state, payload);
  } else if (type === cartActionTypes.checkInventoryFailed) {
    state = Object.assign({}, state, {
      status: payload.status,
      error: payload.error,
    });
  }

  return state;
};

export default combineReducers({
  pendingTransactionsIds,
  selectedProduct,
  cartInventory,
});

// selectors
export const getPendingTransactionIds = state => state.cart.pendingTransactionsIds;

export const getSelectedProductDetail = state => {
  const { selectedProduct } = state.cart;

  return getProductById(state, selectedProduct.id);
};

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
  (products, categories, carts) => {
    if (!products || !categories || !Array.isArray(carts)) {
      return [];
    }

    const newCategories = Object.values(categories)
      .map(category => {
        return {
          ...category,
          products: category.products.map(id => {
            const product = JSON.parse(JSON.stringify(products[id]));
            return {
              ...product,
            };
          }),
        };
      })
      .filter(c => c.products.length);

    return mergeWithShoppingCart(newCategories, carts);
  }
);

export const getAllProductsIds = createSelector(getAllProducts, allProducts => {
  try {
    const res = Object.keys(allProducts);
    return res;
  } catch (e) {
    return [];
  }
});

export const getCheckingInventoryPendingState = ({ cart }) => cart.cartInventory.status === 'pending';
