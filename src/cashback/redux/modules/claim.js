import _get from 'lodash/get';
import { createSelector } from 'reselect';
import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import { CLAIM_TYPES } from '../types';
import Constants from '../../../utils/constants';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { getBusiness } from './app';
import { API_REQUEST_STATUS } from '../../../common/utils/constants';

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
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          isFetching: true,
        },
      };
    case types.CREATE_CASHBACKINFO_REQUEST:
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          cashbackClaimStatus: API_REQUEST_STATUS.PENDING,
          isFetching: true,
        },
      };
    case types.FETCH_RECEIPTNUMBER_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_CASHBACKINFO_FAILURE:
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          isFetching: false,
        },
      };
    case types.CREATE_CASHBACKINFO_FAILURE:
      return {
        ...state,
        cashbackInfo: {
          ...state.cashbackInfo,
          cashbackClaimStatus: API_REQUEST_STATUS.REJECTED,
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
          cashbackClaimStatus: API_REQUEST_STATUS.FULFILLED,
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

export default reducer;

export const getBusinessInfo = state => {
  const business = getBusiness(state);
  return getBusinessByName(state, business);
};

export const isFetchingCashbackInfo = state => state.claim.isFetching;
export const getCashbackInfo = state => state.claim.cashbackInfo;
export const getReceiptNumber = state => state.claim.receiptNumber;

export const getCashbackClaimRequestStatus = createSelector(getCashbackInfo, cashbackInfo =>
  _get(cashbackInfo, 'cashbackClaimStatus', null)
);

export const getIsCashbackClaimRequestFulfilled = createSelector(
  getCashbackClaimRequestStatus,
  cashbackClaimRequestStatus => cashbackClaimRequestStatus === API_REQUEST_STATUS.FULFILLED
);
