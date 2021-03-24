import { combineReducers } from 'redux';
import Url from '../../../utils/url';
import { CART_TYPES } from '../types';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { getProductById } from '../../../redux/modules/entities/products';
import { APP_TYPES } from '../types';

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

export default combineReducers({
  pendingTransactionsIds,
  selectedProduct,
});

export const getPendingTransactionIds = state => state.cart.pendingTransactionsIds;

export const getSelectedProductDetail = state => {
  const { selectedProduct } = state.cart;

  return getProductById(state, selectedProduct.id);
};

// selectors
