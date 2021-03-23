import { combineReducers } from 'redux';
import Url from '../../../utils/url';
import { CART_TYPES } from '../types';
import { getBusiness } from './app';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { getProductById } from '../../../redux/modules/entities/products';

const initialState = {
  pendingTransactionsIds: [],
  selectedProduct: {
    id: '',
    cartId: '',
    isFetching: false,
    status: 'fulfilled',
  },
};

export const types = CART_TYPES;

// actions
export const actions = {
  clearAll: () => dispatch => {
    return dispatch(emptyShoppingCart());
  },
  clearAllByProducts: products => dispatch => {
    return dispatch(clearShopcartItemByProducts(products));
  },

  loadPendingPaymentList: () => ({
    [API_REQUEST]: {
      types: [
        types.FETCH_PENDING_TRANSACTIONS_REQUEST,
        types.FETCH_PENDING_TRANSACTIONS_SUCCESS,
        types.FETCH_PENDING_TRANSACTIONS_FAILURE,
      ],
      ...Url.API_URLS.GET_PENDING_TRANSACTIONS,
    },
  }),

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
};

const clearShopcartItemByProducts = products => {
  return {
    [API_REQUEST]: {
      types: [
        types.CLEARALL_BY_PRODUCTS_REQUEST,
        types.CLEARALL_BY_PRODUCTS_SUCCESS,
        types.CLEARALL_BY_PRODUCTS_FAILURE,
      ],
      payload: products,
      ...Url.API_URLS.DELETE_CARTITEMS_BY_PRODUCTS,
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
  if (action.type === types.FETCH_PRODUCTDETAIL_REQUEST) {
    return { ...state, isFetching: true, status: 'pending' };
  } else if (action.type === types.FETCH_PRODUCTDETAIL_SUCCESS) {
    const { product } = action.responseGql.data;

    return {
      ...state,
      isFetching: false,
      status: 'fulfilled',
      id: product.id,
    };
  } else if (action.type === types.FETCH_PRODUCTDETAIL_FAILURE) {
    return { ...state, isFetching: false, status: 'rejected' };
  }

  return state;
};

export default combineReducers({
  pendingTransactionsIds,
  selectedProduct,
});

export const getBusinessInfo = state => {
  const business = getBusiness(state);

  return getBusinessByName(state, business) || {};
};

export const getPendingTransactionIds = state => state.cart.pendingTransactionsIds;

export const getSelectedProductDetail = state => {
  const { selectedProduct } = state.app;

  return getProductById(state, selectedProduct.id);
};

// selectors
