import Url from '../../../../../../utils/url';
import Constants from '../../../../../../utils/constants';
import { API_REQUEST } from '../../../../../../redux/middlewares/api';
import { createSelector } from 'reselect';
import {
  getOrderStatus,
  getIsOnDemandOrder,
  getIsUseStorehubLogistics,
  getOrderShippingType,
} from '../../../redux/common';

const { ORDER_STATUS, DELIVERY_METHOD } = Constants;

const types = {
  // fetch cashbackInfo
  fetchCashbackInfoRequest: 'ordering/orderStatus/thankYou/fetchCashbackInfoRequest',
  fetchCashbackInfoSuccess: 'ordering/orderStatus/thankYou/fetchCashbackInfoSuccess',
  fetchCashbackInfoFailure: 'ordering/orderStatus/thankYou/fetchCashbackInfoFailure',
  // create cashbackInfo
  createCashbackInfoRequest: 'ordering/orderStatus/thankYou/createCashbackInfoRequest',
  createCashbackInfoSuccess: 'ordering/orderStatus/thankYou/createCashbackInfoSuccess',
  createCashbackInfoFailure: 'ordering/orderStatus/thankYou/createCashbackInfoFailure',
  // fetch store hash
  fetchStoreHashRequest: 'ordering/orderStatus/thankYou/fetchStoreHashRequest',
  fetchStoreHashSuccess: 'ordering/orderStatus/thankYou/fetchStoreHashSuccess',
  fetchStoreHashFailure: 'ordering/orderStatus/thankYou/fetchStoreHashFailure',
  // fetch store has with table id
  fetchStoreHashWithTableIdRequest: 'ordering/orderStatus/thankYou/fetchStoreHashWithTableIdRequest',
  fetchStoreHashWithTableIdSuccess: 'ordering/orderStatus/thankYou/fetchStoreHashWithTableIdSuccess',
  fetchStoreHashWithTableIdFailure: 'ordering/orderStatus/thankYou/fetchStoreHashWithTableIdFailure',

  // order cancellation reason aside
  showOrderCancellationReasonAside: 'ordering/orderStatus/thankYou/showOrderCancellationReasonAside',
  hideOrderCancellationReasonAside: 'ordering/orderStatus/thankYou/hideOrderCancellationReasonAside',
};

const initialState = {
  cashbackInfo: null /* included: isFetching, customerId, consumerId, status */,
  storeHashCode: null,
  orderCancellationReasonAsideVisible: false,
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.fetchCashbackInfoRequest:
    case types.createCashbackInfoRequest:
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          isFetching: true,
        },
      };
    case types.fetchCashbackInfoFailure:
    case types.createCashbackInfoFailure:
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          isFetching: false,
        },
      };
    case types.fetchCashbackInfoSuccess: {
      const { response } = action;

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
    case types.createCashbackInfoSuccess: {
      const { response } = action;
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
    case types.fetchStoreHashSuccess: {
      const { response } = action;
      const { redirectTo } = response || {};

      return { ...state, storeHashCode: redirectTo };
    }
    case types.fetchStoreHashWithTableIdSuccess: {
      const { response } = actions;
      const { hex } = response || {};

      return { ...state, storeHashCode: hex };
    }
    case types.showOrderCancellationReasonAside:
      return {
        ...state,
        orderCancellationReasonAsideVisible: true,
      };
    case types.hideOrderCancellationReasonAside:
      return {
        ...state,
        orderCancellationReasonAsideVisible: false,
      };
    default:
      return state;
  }
};

export default reducer;

export const actions = {
  getCashbackInfo: receiptNumber => ({
    [API_REQUEST]: {
      types: [types.fetchCashbackInfoRequest, types.fetchCashbackInfoSuccess, types.fetchCashbackInfoFailure],
      ...Url.API_URLS.GET_CASHBACK,
      params: {
        receiptNumber,
        source: Constants.CASHBACK_SOURCE.QR_ORDERING,
      },
    },
  }),

  createCashbackInfo: ({ receiptNumber, phone, source }) => ({
    [API_REQUEST]: {
      types: [types.createCashbackInfoRequest, types.createCashbackInfoSuccess, types.createCashbackInfoFailure],
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
      types: [types.fetchStoreHashRequest, types.fetchStoreHashSuccess, types.fetchStoreHashFailure],
      ...Url.API_URLS.GET_STORE_HASH_DATA(storeId),
    },
  }),

  getStoreHashDataWithTableId: ({ storeId, tableId }) => ({
    [API_REQUEST]: {
      types: [
        types.fetchStoreHashWithTableIdRequest,
        types.fetchStoreHashWithTableIdSuccess,
        types.fetchStoreHashWithTableIdFailure,
      ],
      payload: {
        tableId,
      },
      ...Url.API_URLS.POST_STORE_HASH_DATA(storeId),
    },
  }),
  showOrderCancellationReasonAside: () => ({
    type: types.showOrderCancellationReasonAside,
  }),
  hideOrderCancellationReasonAside: () => ({
    type: types.hideOrderCancellationReasonAside,
  }),
};

// selectors
export const getStoreHashCode = state => state.orderStatus.thankYou.storeHashCode;

export const getCashbackInfo = state => state.orderStatus.thankYou.cashbackInfo;

export const getOrderCancellationReasonAsideVisible = state =>
  state.orderStatus.thankYou.orderCancellationReasonAsideVisible;

export const getIsOrderCancellable = createSelector(
  getOrderStatus,
  getOrderShippingType,
  getIsOnDemandOrder,
  getIsUseStorehubLogistics,
  (orderStatus, shippingType, isOnDemandOrder, isUseStorehubLogistics) =>
    isOnDemandOrder &&
    shippingType === DELIVERY_METHOD.DELIVERY &&
    isUseStorehubLogistics &&
    [ORDER_STATUS.PAID, ORDER_STATUS.ACCEPTED].includes(orderStatus)
);

export const getOrderCancellationButtonVisible = createSelector(
  getOrderStatus,
  getOrderShippingType,
  getIsOnDemandOrder,
  getIsUseStorehubLogistics,
  (orderStatus, shippingType, isOnDemandOrder, isUseStorehubLogistics) =>
    isOnDemandOrder &&
    shippingType === DELIVERY_METHOD.DELIVERY &&
    isUseStorehubLogistics &&
    [
      ORDER_STATUS.PAID,
      ORDER_STATUS.ACCEPTED,
      ORDER_STATUS.LOGISTICS_CONFIRMED,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PICKED_UP,
    ].includes(orderStatus)
);
