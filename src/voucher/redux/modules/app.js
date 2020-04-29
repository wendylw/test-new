import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import _get from 'lodash/get';
import TYPES from '../types';
import Url from '../../../utils/url';
import config from '../../../config';

import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';

const DEFAULT_SELECT_VOUCHER = 50;

const initialState = {
  selectedVoucher: {
    value: DEFAULT_SELECT_VOUCHER,
    cost: 0,
  },
  contactInfo: {
    email: '',
  },
  onlineStoreInfo: null,
  businessInfo: null,
  order: null,
};

export const actions = {
  loadOnlineStoreInfo: () => ({
    [FETCH_GRAPHQL]: {
      types: [
        TYPES.FETCH_ONLINESTOREINFO_REQUEST,
        TYPES.FETCH_ONLINESTOREINFO_SUCCESS,
        TYPES.FETCH_ONLINESTOREINFO_FAILURE,
      ],
      endpoint: Url.apiGql('OnlineStoreInfo'),
    },
  }),
  loadBusinessInfo: () => dispatch => {
    const { business } = config;

    return dispatch({
      [FETCH_GRAPHQL]: {
        types: [TYPES.FETCH_COREBUSINESS_REQUEST, TYPES.FETCH_COREBUSINESS_SUCCESS, TYPES.FETCH_COREBUSINESS_FAILURE],
        endpoint: Url.apiGql('CoreBusiness'),
        variables: { business },
      },
    });
  },
  selectVoucher: voucher => ({
    type: TYPES.SELECT_VOUCHER,
    voucher,
  }),
  updateContactEmail: email => dispatch => {
    return dispatch({
      type: TYPES.UPDATE_CONTACT_EMAIL,
      email: email.trim(),
    });
  },
  loadOrder: orderId => ({
    [FETCH_GRAPHQL]: {
      types: [TYPES.FETCH_ORDER_REQUEST, TYPES.FETCH_ORDER_SUCCESS, TYPES.FETCH_ORDER_FAILURE],
      endpoint: Url.apiGql('Order'),
      variables: { orderId },
    },
  }),
};

const onlineStoreInfoReducer = (state = initialState.onlineStoreInfo, action) => {
  const { type, responseGql } = action;

  if (!(responseGql && responseGql.data.onlineStoreInfo)) {
    return state;
  }

  switch (type) {
    case TYPES.FETCH_ONLINESTOREINFO_SUCCESS:
      return {
        ...state,
        ...responseGql.data.onlineStoreInfo,
      };
    default:
      return state;
  }
};

const businessInfoReducer = (state = initialState.businessInfo, action) => {
  const { type } = action;
  switch (type) {
    case TYPES.FETCH_COREBUSINESS_SUCCESS:
      const businessInfo = _get(action, 'responseGql.data.business', {});
      return {
        ...state,
        ...businessInfo,
      };
    default:
      return state;
  }
};

const selectedVoucherReducer = (state = initialState.selectedVoucher, action) => {
  const { type } = action;
  switch (type) {
    case TYPES.SELECT_VOUCHER:
      return {
        ...state,
        value: action.voucher,
        cost: action.voucher,
      };
    default:
      return state;
  }
};

const contactInfoReducer = (state = initialState.contactInfo, action) => {
  switch (action.type) {
    case TYPES.UPDATE_CONTACT_EMAIL:
      return {
        ...state,
        email: action.email,
      };
    default:
      break;
  }
  return state;
};

const orderReducer = (state = initialState.order, action) => {
  switch (action.type) {
    case TYPES.FETCH_ORDER_SUCCESS:
      const { order } = action.responseGql.data;
      return {
        ...state,
        ...order,
      };
    default:
      break;
  }
  return state;
};

export default combineReducers({
  onlineStoreInfo: onlineStoreInfoReducer,
  businessInfo: businessInfoReducer,
  selectedVoucher: selectedVoucherReducer,
  contactInfo: contactInfoReducer,
  order: orderReducer,
});

export function getOnlineStoreInfo(state) {
  return state.app.onlineStoreInfo;
}

export function getOnlineStoreInfoFavicon(state) {
  return _get(state.app, 'onlineStoreInfo.favicon', '');
}

export function getOnlineStoreInfoLogo(state) {
  return _get(state.app, 'onlineStoreInfo.logo', '');
}

export function getBusinessDisplayName(state) {
  return _get(state.app, 'businessInfo.name', '');
}

export function getBusinessName(state) {
  return _get(state.app, 'businessInfo.name', '');
}

export function getCurrencySymbol(state) {
  return _get(state.app, 'onlineStoreInfo.currencySymbol', '');
}

export const getSelectedVoucher = state => {
  return _get(state.app, 'selectedVoucher.value', DEFAULT_SELECT_VOUCHER);
};

export const getBeepSiteUrl = createSelector([getBusinessName], business => {
  return config.beepOnlineStoreUrl(business);
});

export const getContactEmail = state => {
  return _get(state.app, 'contactInfo.email', '');
};

export const getVoucherList = state => {
  return [5, 10, 20, 50];
};

export const getOrderReceiptNumber = state => {
  return _get(state.app, 'order.orderId', '');
};

export const getOrderVoucherCode = state => {
  return _get(state.app, 'order.createdVoucherCodes.0', '');
};

export const getOrderContactEmail = state => {
  return 'huaicheng.liu@storehub.com';
  return _get(state.app, 'order.createdVoucherCodes.0', '');
};
