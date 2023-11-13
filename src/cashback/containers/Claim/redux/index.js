import Url from '../../../../utils/url';
import Utils from '../../../../utils/utils';
import Constants from '../../../../utils/constants';
import { CLAIM_TYPES } from '../../../redux/types';
import { getBusiness } from '../../../redux/modules/app';
import { API_REQUEST } from '../../../../redux/middlewares/api';
import { getBusinessByName } from '../../../../redux/modules/entities/businesses';

export const initialState = {
  cashbackInfo: null,
  receiptNumber: null,
};

export const types = CLAIM_TYPES;

export const actions = {
  getCashbackInfo: receiptNumber => ({
    [API_REQUEST]: {
      types: [types.FETCH_CASHBACKINFO_REQUEST, types.FETCH_CASHBACKINFO_SUCCESS, types.FETCH_CASHBACKINFO_FAILURE],
      ...Url.API_URLS.GET_CASHBACK,
      params: {
        receiptNumber,
        source: Constants.CASHBACK_SOURCE.RECEIPT,
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
        registrationTouchpoint: Utils.getRegistrationTouchPoint(),
        registrationSource: Utils.getRegistrationSource(),
      },
    },
  }),

  getCashbackReceiptNumber: hash => ({
    [API_REQUEST]: {
      types: [types.FETCH_RECEIPTNUMBER_REQUEST, types.FETCH_RECEIPTNUMBER_SUCCESS, types.FETCH_RECEIPTNUMBER_FAILURE],
      ...Url.API_URLS.GET_CASHBACK_HASH_DATA(hash),
    },
  }),
};

// reducer
const reducer = (state = initialState, action) => {
  const { response } = action;

  switch (action.type) {
    case types.FETCH_CASHBACKINFO_REQUEST:
    case types.CREATE_CASHBACKINFO_REQUEST:
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          isFetching: true,
        },
      };
    case types.FETCH_RECEIPTNUMBER_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_CASHBACKINFO_FAILURE:
    case types.CREATE_CASHBACKINFO_FAILURE:
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          isFetching: false,
        },
      };
    case types.FETCH_RECEIPTNUMBER_FAILURE:
      return { ...state, isFetching: false };
    case types.FETCH_CASHBACKINFO_SUCCESS: {
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          ...response,
          isFetching: false,
          loadedCashbackInfo: true,
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
          loadedCashbackInfo: false,
          createdCashbackInfo: true,
        },
      };
    }
    case types.FETCH_RECEIPTNUMBER_SUCCESS: {
      const { receiptNumber } = response || {};

      return {
        ...state,
        isFetching: false,
        receiptNumber,
      };
    }
    default:
      return state;
  }
};

export const getBusinessInfo = state => {
  const business = getBusiness(state);
  return getBusinessByName(state, business);
};

export const isFetchingCashbackInfo = state => state.claim.isFetching;
export const getCashbackInfo = state => state.claim.cashbackInfo;
export const getReceiptNumber = state => state.claim.receiptNumber;

export default reducer;
