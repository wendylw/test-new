import { combineReducers } from 'redux';
import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import { API_INFO } from '../../../utils/api/api-utils';
import { get } from '../../../utils/api/api-fetch';
import { CART_TYPES } from '../types';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { getBusinessUTCOffset } from './app';
import { APP_TYPES } from '../types';

const initialState = {
  pendingTransactionsIds: [],
  cartInventory: {
    status: '',
    error: {},
  },
};

export const types = CART_TYPES;

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

  checkCartInventory: () => async (dispatch, getState) => {
    const state = getState();
    const businessUTCOffset = getBusinessUTCOffset(state);
    const fulfillDate = Utils.getFulfillDate(businessUTCOffset);
    const { app } = state;
    const { items: cartItems } = app.shoppingCart;
    const cartItemIds = cartItems.map(item => item.id);
    const shippingType = Utils.getApiRequestShippingType();
    const { url, queryParams } = API_INFO.getCartInventoryState(cartItemIds, shippingType, fulfillDate || '');

    try {
      dispatch(checkInventory());

      await get(url, { queryParams });

      dispatch(checkInventorySuccess());

      return { status: 'fulfilled' };
    } catch (e) {
      dispatch(checkInventoryFailed(e));

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
  cartInventory,
});

// selectors
export const getPendingTransactionIds = state => state.cart.pendingTransactionsIds;

export const getCheckingInventoryPendingState = ({ cart }) => cart.cartInventory.status === 'pending';
