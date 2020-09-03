import Url from '../../../utils/url';
import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';
import _get from 'lodash/get';
import { createSelector } from 'reselect';

import { THANK_YOU_TYPES } from '../types';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getOrderByOrderId } from '../../../redux/modules/entities/orders';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { getBusiness } from './app';

const { PROMO_TYPE } = Constants;

export const initialState = {
  orderId: null,
  cashbackInfo: null /* included: customerId, consumerId, status */,
  storeHashCode: null,
  orderStatus: null,
};

export const types = THANK_YOU_TYPES;

export const actions = {
  loadOrder: orderId => dispatch => {
    return dispatch(fetchOrder({ orderId }));
  },

  loadOrderStatus: orderId => dispatch => {
    return dispatch(fetchOrderStatus({ orderId }));
  },

  getCashbackInfo: receiptNumber => ({
    [API_REQUEST]: {
      types: [types.FETCH_CASHBACKINFO_REQUEST, types.FETCH_CASHBACKINFO_SUCCESS, types.FETCH_CASHBACKINFO_FAILURE],
      ...Url.API_URLS.GET_CASHBACK,
      params: {
        receiptNumber,
        source: Constants.CASHBACK_SOURCE.QR_ORDERING,
      },
    },
  }),

  createCashbackInfo: ({ receiptNumber, phone, source }) => ({
    [API_REQUEST]: {
      types: [types.CREATE_CASHBACKINFO_REQUEST, types.CREATE_CASHBACKINFO_SUCCESS, types.CREATE_CASHBACKINFO_FAILURE],
      ...Url.API_URLS.POST_CASHBACK,
      payload: {
        receiptNumber,
        phone,
        source,
      },
    },
  }),

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
};

const fetchOrder = variables => ({
  [FETCH_GRAPHQL]: {
    types: [types.FETCH_ORDER_REQUEST, types.FETCH_ORDER_SUCCESS, types.FETCH_ORDER_FAILURE],
    endpoint: Url.apiGql('Order'),
    variables,
  },
});

const fetchOrderStatus = variables => ({
  [API_REQUEST]: {
    types: [types.FETCH_ORDER_STATUS_REQUEST, types.FETCH_ORDER_STATUS_SUCCESS, types.FETCH_ORDER_STATUS_FAILURE],
    ...Url.API_URLS.GET_ORDER_STATUS(variables),
  },
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
        },
      };
    case types.FETCH_CASHBACKINFO_FAILURE:
    case types.CREATE_CASHBACKINFO_FAILURE:
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          isFetching: false,
        },
      };
    case types.FETCH_CASHBACKINFO_SUCCESS: {
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          ...response,
          isFetching: false,
          createdCashbackInfo: false,
        },
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
        },
      };
    }
    case types.FETCH_STORE_HASHCODE_SUCCESS: {
      const { response } = action;
      const { redirectTo } = response || {};

      return { ...state, storeHashCode: redirectTo };
    }
    case 'TEST_FETCH_ORDER_STATUS':
      return {
        ...state,
        orderStatus: Math.random(),
      };
    default:
      return state;
  }
};

export default reducer;

// selectors
export const getOrder = state => {
  return getOrderByOrderId(state, state.thankYou.orderId);
};

export const getPromotion = state => {
  const order = getOrder(state);
  if (order && order.appliedVoucher) {
    return {
      promoCode: order.appliedVoucher.voucherCode,
      discount: order.appliedVoucher.value,
      promoType: PROMO_TYPE.VOUCHER,
    };
  } else if (order && order.displayPromotions && order.displayPromotions.length) {
    const appliedPromo = order.displayPromotions[0];
    return {
      promoCode: appliedPromo.promotionCode,
      discount: appliedPromo.displayDiscount,
      promoType: PROMO_TYPE.PROMOTION,
    };
  } else {
    return null;
  }
};

export const getBusinessInfo = state => {
  const business = getBusiness(state);
  return getBusinessByName(state, business);
};

export const getStoreHashCode = state => state.thankYou.storeHashCode;
export const getCashbackInfo = state => state.thankYou.cashbackInfo;

export const getLoadOrderStatus = state => state.thankYou.orderStatus;

export const getOrderStatus = createSelector([getOrder], order => {
  return _get(order, 'status', '');
});

export const getIsUseStorehubLogistics = createSelector([getOrder], order => {
  return _get(order, 'deliveryInformation.0.useStorehubLogistics', false);
});

export const getReceiptNumber = state => {
  return Utils.getQueryString('receiptNumber');
};
