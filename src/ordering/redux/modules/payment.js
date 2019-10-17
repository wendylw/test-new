import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';

import { getCartItemIds } from './home';
import { getBusiness, getRequestInfo } from './app';

import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';

const initialState = {
  currentPayment: Constants.PAYMENT_METHODS.ONLINE_BANKING_PAY,
  orderId: '',
  braintreeToken: '',
  bankingList: [],
};

export const types = {
  // createOrder
  CREATEORDER_REQUEST: 'ORDERING/PAYMENT/CREATEORDER_REQUEST',
  CREATEORDER_SUCCESS: 'ORDERING/PAYMENT/CREATEORDER_SUCCESS',
  CREATEORDER_FAILURE: 'ORDERING/PAYMENT/CREATEORDER_FAILURE',

  // getOrder
  FETCH_ORDER_REQUEST: 'ORDERING/PAYMENT/FETCH_ORDER_REQUEST',
  FETCH_ORDER_SUCCESS: 'ORDERING/PAYMENT/FETCH_ORDER_SUCCESS',
  FETCH_ORDER_FAILURE: 'ORDERING/PAYMENT/FETCH_ORDER_FAILURE',

  // setCurrentPayment
  SET_CURRENT_PAYMENT: 'ORDERING/PAYMENTT/SET_CURRENT_PAYMENT',

  // getBraintreeToken
  FETCH_BRAINTREE_TOKEN_REQUEST: 'ORDERING/PAYMENT/FETCH_BRAINTREE_TOKEN_REQUEST',
  FETCH_BRAINTREE_TOKEN_SUCCESS: 'ORDERING/PAYMENT/FETCH_BRAINTREE_TOKEN_SUCCESS',
  FETCH_BRAINTREE_TOKEN_FAILURE: 'ORDERING/PAYMENT/FETCH_BRAINTREE_TOKEN_FAILURE',

  // getBankList
  FETCH_BANKLIST_REQUEST: 'ORDERING/PAYMENT/FETCH_BANKLIST_REQUEST',
  FETCH_BANKLIST_SUCCESS: 'ORDERING/PAYMENT/FETCH_BANKLIST_SUCCESS',
  FETCH_BANKLIST_FAILURE: 'ORDERING/PAYMENT/FETCH_BANKLIST_FAILURE',
};

// action creators
export const actions = {
  createOrder: () => (dispatch, getState) => {
    const business = getBusiness(getState());
    const shoppingCartIds = getCartItemIds(getState());
    const additionalComments = Utils.getSessionVariable('additionalComments');
    const { storeId, tableId } = getRequestInfo(getState());
    const variables = {
      business,
      storeId,
      shoppingCartIds,
      additionalComments: encodeURIComponent(additionalComments),
      tableId,
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

  fetchBraintreeToken: (paymentName) => ({
    [API_REQUEST]: {
      types: [
        types.FETCH_BRAINTREE_TOKEN_REQUEST,
        types.FETCH_BRAINTREE_TOKEN_SUCCESS,
        types.FETCH_BRAINTREE_TOKEN_FAILURE,
      ],
      ...Url.API_URLS.GET_BRAINTREE_TOKEN,
      params: {
        paymentName,
      },
    }
  }),

  fetchBankList: () => ({
    [API_REQUEST]: {
      types: [
        types.FETCH_BANKLIST_REQUEST,
        types.FETCH_BANKLIST_SUCCESS,
        types.FETCH_BANKLIST_FAILURE,
      ],
      ...Url.API_URLS.GET_BANKING_LIST,
    }
  }),
};

const createOrder = variables => {
  const endpoint = Url.apiGql('CreateOrder');

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
  const endpoint = Url.apiGql('Order');

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
  const { response, responseGql } = action;
  const { data } = responseGql || {};

  switch (action.type) {
    case types.SET_CURRENT_PAYMENT:
      return { ...state, currentPayment: action.paymentName };
    case types.CREATEORDER_SUCCESS: {
      const { createOrder } = data || {};
      const [order] = createOrder.orders;

      if (order) {
        return { ...state, orderId: order.orderId };
      }
      return state;
    }
    case types.FETCH_ORDER_SUCCESS: {
      const { order } = data || {};

      if (order) {
        return { ...state, orderId: order.orderId };
      }
      return state;
    }
    case types.FETCH_BRAINTREE_TOKEN_SUCCESS: {
      const { token } = response || {};

      return { ...state, braintreeToken: token };
    }
    case types.FETCH_BANKLIST_SUCCESS: {
      const { bankingList } = response || {};

      return { ...state, bankingList };
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
