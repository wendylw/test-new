import Url from '../../../../utils/url';
import { API_REQUEST } from '../../../../redux/middlewares/api';
import { getLoyaltyHistoriesByCustomerId } from '../../../../redux/modules/entities/loyaltyHistories';
import { getBusinessByName } from '../../../../redux/modules/entities/businesses';
import { getUser, getBusiness } from '../../../redux/modules/app';
import { HOME_TYPES } from '../../../redux/types';

export const initialState = {
  receiptList: [],
  fetchState: true,
  cashbackHistorySummary: null,
};

export const types = HOME_TYPES;

export const actions = {
  getReceiptList: (business, page, pageSize) => ({
    [API_REQUEST]: {
      types: [types.FETCH_RECEIPT_LIST_REQUEST, types.FETCH_RECEIPT_LIST_SUCCESS, types.FETCH_RECEIPT_LIST_FAILURE],
      ...Url.API_URLS.GET_RECEIPTS_LIST,
      params: {
        business,
        page,
        pageSize,
      },
    },
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
    },
  }),
};

// reducer
const reducer = (state = initialState, action) => {
  const { response } = action;
  const { totalCredits, list = [] } = response || {};

  switch (action.type) {
    case types.GET_CASHBACK_HISTORIES_SUCCESS: {
      return {
        ...state,
        cashbackHistorySummary: {
          ...state.cashbackHistorySummary,
          totalCredits,
        },
      };
    }
    case types.FETCH_RECEIPT_LIST_SUCCESS: {
      return {
        ...state,
        receiptList: state.receiptList.concat(list),
        fetchState: list.length !== 0,
      };
    }
    default:
      return state;
  }
};

export default reducer;

export const getReceiptList = state => state.home.receiptList;
export const getFetchState = state => state.home.fetchState;
export const getCashbackHistorySummary = state => state.home.cashbackHistorySummary;

export const getBusinessInfo = state => {
  const business = getBusiness(state);
  return getBusinessByName(state, business);
};

export const getCashbackHistory = state => {
  const user = getUser(state);
  const { customerId } = user || {};

  return getLoyaltyHistoriesByCustomerId(state, customerId);
};
