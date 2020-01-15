import Url from '../../../utils/url';
import { CART_TYPES } from '../types';
import { getBusiness } from './app';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';

const initialState = {
  pendingTransactionsIds: [],
};

export const types = CART_TYPES;

// actions
export const actions = {
  clearAll: () => dispatch => {
    return dispatch(emptyShoppingCart());
  },
  clearAllByProducts: products => dispatch => {
    dispatch(clearShopcartItemByProducts(products));
  },

  /**  do not find any place refer to these code
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
    }
  }),*/
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

// reducers
const reducer = (state = initialState, action) => {
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

export default reducer;

export const getBusinessInfo = state => {
  const business = getBusiness(state);

  return getBusinessByName(state, business);
};

export const getPendingTransactionIds = state => state.cart.pendingTransactionsIds;

// selectors
