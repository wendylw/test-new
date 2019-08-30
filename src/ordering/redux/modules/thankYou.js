import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';

import api from '../../../utils/api';

import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getOrderByOrderId } from '../../../redux/modules/entities/orders';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { getBusiness, getRequestInfo } from './app';


const initialState = {
  orderId: null,
  cashbackInfo: null,
};

export const types = {
  // fetch order
  FETCH_ORDER_REQUEST: 'REDUX_DEMO/THANK_YOU/FETCH_ORDER_REQUEST',
  FETCH_ORDER_SUCCESS: 'REDUX_DEMO/THANK_YOU/FETCH_ORDER_SUCCESS',
  FETCH_ORDER_FAILURE: 'REDUX_DEMO/THANK_YOU/FETCH_ORDER_FAILURE',

  // fetch coreBusiness
  FETCH_COREBUSINESS_REQUEST: 'REDUX_DEMO/THANK_YOU/FETCH_COREBUSINESS_REQUEST',
  FETCH_COREBUSINESS_SUCCESS: 'REDUX_DEMO/THANK_YOU/FETCH_COREBUSINESS_SUCCESS',
  FETCH_COREBUSINESS_FAILURE: 'REDUX_DEMO/THANK_YOU/FETCH_COREBUSINESS_FAILURE',

  // fetch CashbackInfo
  FETCH_CASHBACKINFO_REQUEST: 'REDUX_DEMO/THANK_YOU/FETCH_CASHBACKINFO_REQUEST',
  FETCH_CASHBACKINFO_SUCCESS: 'REDUX_DEMO/THANK_YOU/FETCH_CASHBACKINFO_SUCCESS',
  FETCH_CASHBACKINFO_FAILURE: 'REDUX_DEMO/THANK_YOU/FETCH_CASHBACKINFO_FAILURE',

  // create CashbackInfo
  CREATE_CASHBACKINFO_REQUEST: 'REDUX_DEMO/THANK_YOU/CREATE_CASHBACKINFO_REQUEST',
  CREATE_CASHBACKINFO_SUCCESS: 'REDUX_DEMO/THANK_YOU/CREATE_CASHBACKINFO_SUCCESS',
  CREATE_CASHBACKINFO_FAILURE: 'REDUX_DEMO/THANK_YOU/CREATE_CASHBACKINFO_FAILURE',
}

export const actions = {
  loadOrder: (orderId) => (dispatch, getState) => {
    return dispatch(fetchOrder({ orderId }));
  },

  loadCoreBusiness: () => (dispatch, getState) => {
    const { storeId } = getRequestInfo(getState());
    const business = getBusiness(getState());
    return dispatch(fetchCoreBusiness({ business, storeId }));
  },

  getCashbackInfo: (receiptNumber) => async (dispatch) => {
    try {
      const { ok, data } = await api({
        ...Url.API_URLS.GET_CASHBACK,
        params: {
          receiptNumber,
          source: Constants.CASHBACK_SOURCE.RECEIPT,
        }
      });

      if (ok) {
        dispatch({
          type: types.FETCH_CASHBACKINFO_SUCCESS,
          cashbackInfo: data,
        });
      }
    } catch (e) {
      // TODO: handle error
      console.error(e);
    }
  },

  createCashbackInfo: (payload) => async (dispatch) => {
    const { phone } = payload;

    Utils.setPhoneNumber(phone);

    try {
      const response = await api({
        ...Url.API_URLS.POST_CASHBACK,
        data: payload,
      });
      const { ok, data } = response;

      if (ok) {
        dispatch({
          type: types.CREATE_CASHBACKINFO_SUCCESS,
          cashbackInfo: data,
        });
      }
    } catch (e) {
      // TODO: handle error
      console.error(e);
    }
  },
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
})

const fetchCoreBusiness = variables => ({
  [FETCH_GRAPHQL]: {
    types: [
      types.FETCH_COREBUSINESS_REQUEST,
      types.FETCH_COREBUSINESS_SUCCESS,
      types.FETCH_COREBUSINESS_FAILURE,
    ],
    endpoint: Url.apiGql('CoreBusiness'),
    variables,
  }
})

// reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_ORDER_SUCCESS: {
      const { data } = action.responseGql;

      return { ...state, orderId: data.order.orderId };
    }
    case types.FETCH_CASHBACKINFO_SUCCESS: {
      return { ...state, cashbackInfo: action.cashbackInfo };
    }
    case types.CREATE_CASHBACKINFO_SUCCESS: {
      return { ...state, cashbackInfo: Object.assign({}, state.cashbackInfo, action.cashbackInfo) }
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