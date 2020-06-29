import Url from '../../../utils/url';
import { HOME_TYPES } from '../types';

import { API_REQUEST } from '../../../redux/middlewares/api';

import { getLoyaltyHistoriesByCustomerId } from '../../../redux/modules/entities/loyaltyHistories';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { getUser, getBusiness } from './app';

const initialState = {
  customerId: null,
  receiptList: [],
  fetchState: true,
  cashbackHistorySummary: null,
};

export const types = HOME_TYPES;

export const actions = {
  setCustomerId: customerId => ({
    type: types.SET_CUSTOMER_ID_SUCCESS,
    customerId,
  }),

  getReceiptList: (business,page,pageSize) => ({
    [API_REQUEST]: {
      types: [
        types.FETCH_RECEIPT_LIST_REQUEST,
        types.FETCH_RECEIPT_LIST_SUCCESS,
        types.FETCH_RECEIPT_LIST_FAILURE
      ],
      ...Url.API_URLS.GET_RECEIPTS_LIST,
      params: {
        business,
        page,
        pageSize
      }
    }
  }),

  getCashbackHistory: customerId => ({
    [API_REQUEST]: {
      types: [
        types.GET_CASHBACK_HISTORIES_REQUEST,
        types.GET_CASHBACK_HISTORIES_SUCCESS,
        types.GET_CASHBACK_HISTORIES_FAILURE,
      ],
      ...Url.API_URLS.GET_CASHBACK_HISTORIES,
      params: {
        customerId,
      },
    }
  }),
};

// reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_CUSTOMER_ID_SUCCESS: {
      return { ...state, customerId: action.customerId };
    }
    case types.GET_CASHBACK_HISTORIES_SUCCESS: {
      const { response } = action;
      const { totalCredits } = response || {};

      return {
        ...state,
        cashbackHistorySummary: {
          ...state.cashbackHistorySummary,
          totalCredits
        }
      };
    }
    case types.FETCH_RECEIPT_LIST_SUCCESS: {
      const {response} = action;
      const { list } = response || {};
      return {
        ...state,
        receiptList: state.receiptList.concat(list),
        fetchState: list.length === 0 ? false: true
      }
    }
    default:
      return state;
  }
}

export default reducer;

export const getCustomerId = state => state.home.customerId;
export const getReceiptList = state => state.home.receiptList;
export const getFetchState = state => state.home.fetchState;
export const getCashbackHistorySummary = state => state.home.cashbackHistorySummary;

export const getBusinessInfo = state => {
  const business = getBusiness(state);
  return getBusinessByName(state, business);
}

export const getCashbackHistory = state => {
  const user = getUser(state);
  const { customerId } = user || {};

  return getLoyaltyHistoriesByCustomerId(state, customerId);
}
