import Url from '../../../../../../utils/url';
import Constants from '../../../../../../utils/constants';
import { API_REQUEST } from '../../../../../../redux/middlewares/api';

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
};

const initialState = {
  cashbackInfo: null /* included: isFetching, customerId, consumerId, status */,
  storeHashCode: null,
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
};

// selectors
export const getStoreHashCode = state => state.orderStatus.thankYou.storeHashCode;

export const getCashbackInfo = state => state.orderStatus.thankYou.cashbackInfo;
