import Url from '../../../utils/url';
import { HOME_TYPES } from '../types';

import { API_REQUEST } from '../../../redux/middlewares/api';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { getBusiness } from './app';

export const initialState = {
  receiptList: [],
  fetchState: true,
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
};

// reducer
const reducer = (state = initialState, action) => {
  const { response } = action;
  const { list = [] } = response || {};

  switch (action.type) {
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

export const getBusinessInfo = state => {
  const business = getBusiness(state);
  return getBusinessByName(state, business);
};
