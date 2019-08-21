import url from '../../../utils/url';
import Constants from '../../../Constants';

import api from '../../../utils/api';

import { getCartItemIds } from './home';
import { getBusiness, getRequestInfo } from './app';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';

const initialState = {
  currentPayment: Constants.PAYMENT_METHODS.ONLINE_BANKING_PAY,
  orderId: '',
  braintreeToken: '',
  bankingList: [],
};

export const types = {
  // createOrder
  CREATEORDER_REQUEST: 'REDUX_DEMO/PAYMENT/CREATEORDER_REQUEST',
  CREATEORDER_SUCCESS: 'REDUX_DEMO/PAYMENT/CREATEORDER_SUCCESS',
  CREATEORDER_FAILURE: 'REDUX_DEMO/PAYMENT/CREATEORDER_FAILURE',

  // getOrder
  FETCH_ORDER_REQUEST: 'REDUX_DEMO/PAYMENT/FETCH_ORDER_REQUEST',
  FETCH_ORDER_SUCCESS: 'REDUX_DEMO/PAYMENT/FETCH_ORDER_SUCCESS',
  FETCH_ORDER_FAILURE: 'REDUX_DEMO/PAYMENT/FETCH_ORDER_FAILURE',

  // setCurrentPayment
  SET_CURRENT_PAYMENT: 'REDUX_DEMOPAYMENTT/SET_CURRENT_PAYMENT',

  // getBraintreeToken
  FETCH_BRAINTREE_TOKEN_REQUEST: 'FETCH_BRAINTREE_TOKEN_REQUEST',
  FETCH_BRAINTREE_TOKEN_SUCCESS: 'FETCH_BRAINTREE_TOKEN_SUCCESS',
  FETCH_BRAINTREE_TOKEN_FAILURE: 'FETCH_BRAINTREE_TOKEN_FAILURE',

  // getBankList
  FETCH_BANKLIST_REQUEST: 'FETCH_BANKLIST_REQUEST',
  FETCH_BANKLIST_SUCCESS: 'FETCH_BANKLIST_SUCCESS',
  FETCH_BANKLIST_FAILURE: 'FETCH_BANKLIST_FAILURE',
};

// action creators
export const actions = {
  createOrder: () => (dispatch, getState) => {
    const business = getBusiness(getState());
    const shoppingCartIds = getCartItemIds(getState());
    const { storeId, tableId } = getRequestInfo(getState());
    const variables = {
      business,
      storeId,
      tableId,
      shoppingCartIds
    };

    return dispatch(createOrder(variables));
  },

  fetchOrder: (orderId) => (dispatch) => {
    return dispatch(fetchOrder({ orderId }));
  },

  setCurrentPayment: paymentName => ({
    type: types.SET_CURRENT_PAYMENT,
    paymentName
  }),

  fetchBraintreeToken: (paymentName) => async (dispatch) => {
    try {
      const data = await api({
        url: `/payment/initToken?paymentName=${paymentName}`,
        method: 'get',
      });
      const { token } = data || {};

      if (token) {
        dispatch({
          type: types.FETCH_BRAINTREE_TOKEN_SUCCESS,
          token,
        });
      }
    } catch (e) {
      // TODO: handle error
      console.error(e);
    }
  },

  fetchBankList: () => async (dispatch) => {
    try {
      const data = await api({
        url: '/payment/onlineBanking',
        method: 'get',
      });
      const { bankingList } = data || {};

      if (token) {
        dispatch({
          type: types.FETCH_BANKLIST_SUCCESS,
          bankingList,
        });
      }
    } catch (e) {
      // TODO: handle error
      console.error(e);
    }
  }
};

const createOrder = variables => {
  const endpoint = url.apiGql('CreateOrder');

  return {
    [FETCH_GRAPHQL]: {
      types: [
        types.CREATEORDER_REQUEST,
        types.CREATEORDER_SUCCESS,
        types.CREATEORDER_FAILURE
      ],
      endpoint,
      variables
    }
  };
};

const fetchOrder = variables => {
  const endpoint = url.apiGql('Order');

  return {
    [FETCH_GRAPHQL]: {
      types: [
        types.FETCH_ORDER_REQUEST,
        types.FETCH_ORDER_SUCCESS,
        types.FETCH_ORDER_FAILURE
      ],
      endpoint,
      variables
    }
  };
};

// reducers
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_CURRENT_PAYMENT:
      return { ...state, currentPayment: action.paymentName };
    case types.CREATEORDER_SUCCESS: {
      const { createOrder } = action.responseGql.data || {};
      const [order] = createOrder.orders;

      if (order) {
        return { ...state, orderId: order.orderId };
      }
      return state;
    }
    case types.FETCH_ORDER_SUCCESS: {
      const { order } = action.responseGql.data || {};

      if (order) {
        return { ...state, orderId: order.orderId };
      }
      return state;
    }
    case types.FETCH_BRAINTREE_TOKEN_SUCCESS: {
      return { ...state, braintreeToken: action.token };
    }
    case types.FETCH_BANKLIST_SUCCESS: {
      return { ...state, braintreeToken: action.bankingList };
    }
    default:
      return state;
  }
};

export default reducer;

// selectors
export const getCurrentPayment = state => state.payment.currentPayment;

export const getCurrentOrderId = (state) => state.payment.orderId;

export const getBraintreeToken = state => state.payment.braintreeToken;

export const getBankList = state => state.payment.bankingList;
