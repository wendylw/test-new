import Url from '../../../utils/url';
import Constants from '../../../utils/constants';

import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getOrderByOrderId } from '../../../redux/modules/entities/orders';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { getBusiness } from './app';


const initialState = {
  orderId: null,
  cashbackInfo: null,
  isFetching: false,
  createdCashbackInfo: false,
};

export const types = {
  // fetch order
  FETCH_ORDER_REQUEST: 'ORDERING/THANK_YOU/FETCH_ORDER_REQUEST',
  FETCH_ORDER_SUCCESS: 'ORDERING/THANK_YOU/FETCH_ORDER_SUCCESS',
  FETCH_ORDER_FAILURE: 'ORDERING/THANK_YOU/FETCH_ORDER_FAILURE',

  // fetch CashbackInfo
  FETCH_CASHBACKINFO_REQUEST: 'ORDERING/THANK_YOU/FETCH_CASHBACKINFO_REQUEST',
  FETCH_CASHBACKINFO_SUCCESS: 'ORDERING/THANK_YOU/FETCH_CASHBACKINFO_SUCCESS',
  FETCH_CASHBACKINFO_FAILURE: 'ORDERING/THANK_YOU/FETCH_CASHBACKINFO_FAILURE',

  // create CashbackInfo
  CREATE_CASHBACKINFO_REQUEST: 'ORDERING/THANK_YOU/CREATE_CASHBACKINFO_REQUEST',
  CREATE_CASHBACKINFO_SUCCESS: 'ORDERING/THANK_YOU/CREATE_CASHBACKINFO_SUCCESS',
  CREATE_CASHBACKINFO_FAILURE: 'ORDERING/THANK_YOU/CREATE_CASHBACKINFO_FAILURE',
}

export const actions = {
  loadOrder: (orderId) => (dispatch) => {
    return dispatch(fetchOrder({ orderId }));
  },

  getCashbackInfo: (receiptNumber) => ({
    [API_REQUEST]: {
      types: [
        types.FETCH_CASHBACKINFO_REQUEST,
        types.FETCH_CASHBACKINFO_SUCCESS,
        types.FETCH_CASHBACKINFO_FAILURE,
      ],
      ...Url.API_URLS.GET_CASHBACK,
      params: {
        receiptNumber,
        source: Constants.CASHBACK_SOURCE.QR_ORDERING,
      },
    }
  }),

  createCashbackInfo: ({ receiptNumber, phone, source }) => ({
    [API_REQUEST]: {
      types: [
        types.CREATE_CASHBACKINFO_REQUEST,
        types.CREATE_CASHBACKINFO_SUCCESS,
        types.CREATE_CASHBACKINFO_FAILURE,
      ],
      ...Url.API_URLS.POST_CASHBACK,
      payload: {
        receiptNumber,
        phone,
        source,
      }
    }
  }),
};

const fetchOrder = variables => ({
  [FETCH_GRAPHQL]: {
    types: [
      types.FETCH_ORDER_REQUEST,
      types.FETCH_ORDER_SUCCESS,
      types.FETCH_ORDER_FAILURE,
    ],
    endpoint: Url.apiGql('Order'),
    variables,
  }
});

// reducer
const reducer = (state = initialState, action) => {
  const { responseGql, response } = action;
  const { data } = responseGql || {};

  switch (action.type) {
    case types.FETCH_ORDER_SUCCESS: {
      const { order } = data || {};

      return { ...state, orderId: order.orderId };
    }
    case types.FETCH_CASHBACKINFO_REQUEST:
    case types.CREATE_CASHBACKINFO_REQUEST:
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          isFetching: true,
        }
      };
    case types.FETCH_CASHBACKINFO_FAILURE:
    case types.CREATE_CASHBACKINFO_FAILURE:
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          isFetching: false,
        }
      };
    case types.FETCH_CASHBACKINFO_SUCCESS: {
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          ...response,
          isFetching: false,
        }
      };
    }
    case types.CREATE_CASHBACKINFO_SUCCESS: {
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          ...response,
          isFetching: false,
          createdCashbackInfo: true,
        }
      };
    }
    default:
      return state;
  }
}

export default reducer;

// selectors
export const getOrder = state => {
  return getOrderByOrderId(state, state.thankYou.orderId)
};

export const getBusinessInfo = state => {
  const business = getBusiness(state);
  return getBusinessByName(state, business);
}

export const getCashbackInfo = state => state.thankYou.cashbackInfo;