import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import _get from 'lodash/get';
import TYPES from '../types';
import Url from '../../../utils/url';
import config from '../../../config';
import { getVoucherOrderingInfoFromSessionStorage } from '../../utils';

import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';

const VOUCHER_VALIDITY_PERIOD_DAYS = 60;
const VOUCHER_LIST_COUNTRY_MAP = {
  MY: [5, 10, 20, 50],
  TH: [50, 100, 200, 300],
  PH: [50, 100, 200, 300],
  SG: [5, 10, 20, 50],
};

const initialState = {
  selectedVoucher: null,
  contactInfo: {
    email: '',
  },
  onlineStoreInfo: null,
  businessInfo: null,
  order: null,
};

export const actions = {
  initialVoucherOrderingInfo: () => (dispatch, getState) => {
    const orderingInfo = getVoucherOrderingInfoFromSessionStorage();
    const state = getState();

    if (Object.prototype.hasOwnProperty.call(orderingInfo, 'selectedVoucher')) {
      dispatch({
        type: TYPES.SELECT_VOUCHER,
        voucher: orderingInfo.selectedVoucher,
      });
    } else {
      // default select max voucher amount
      const maxVoucher = getMaxVoucherFromVoucherList(state);
      dispatch({
        type: TYPES.SELECT_VOUCHER,
        voucher: maxVoucher,
      });
    }

    if (Object.prototype.hasOwnProperty.call(orderingInfo, 'contactEmail')) {
      dispatch({
        type: TYPES.UPDATE_CONTACT_EMAIL,
        email: orderingInfo.contactEmail,
      });
    }
  },
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
      email: email,
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
      return action.voucher;
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

export function getOnlineStoreCountry(state) {
  return _get(state.app, 'onlineStoreInfo.country', '');
}

export function getOnlineStoreInfoFavicon(state) {
  return _get(state.app, 'onlineStoreInfo.favicon', '');
}

export function getOnlineStoreInfoLogo(state) {
  return _get(state.app, 'onlineStoreInfo.logo', '');
}

export function getBusinessDisplayName(state) {
  return _get(state.app, 'businessInfo.displayBusinessName', '');
}

export function getBusinessName(state) {
  return _get(state.app, 'businessInfo.name', '');
}

export function getOnlineStoreName(state) {
  return _get(state.app, 'onlineStoreInfo.storeName', '');
}

export function getCurrencySymbol(state) {
  return _get(state.app, 'onlineStoreInfo.currencySymbol', '');
}

export const getSelectedVoucher = state => {
  return _get(state.app, 'selectedVoucher', null);
};

export const getBeepSiteUrl = createSelector([getBusinessName], business => {
  return config.beepOnlineStoreUrl(business);
});

export const getContactEmail = state => {
  return _get(state.app, 'contactInfo.email', '');
};

export const getVoucherList = createSelector([getOnlineStoreCountry], country => {
  return _get(VOUCHER_LIST_COUNTRY_MAP, country, []);
});

export const getMaxVoucherFromVoucherList = createSelector([getVoucherList], voucherList => {
  if (voucherList.length > 0) {
    return Math.max(...voucherList);
  } else {
    return null;
  }
});

export const getVoucherValidityPeriodDays = state => {
  return VOUCHER_VALIDITY_PERIOD_DAYS;
};

export const getOrderReceiptNumber = state => {
  return _get(state.app, 'order.orderId', '');
};

export const getOrderVoucherCode = state => {
  return _get(state.app, 'order.createdVoucherCodes.0', '');
};

export const getOrderContactEmail = state => {
  return _get(state.app, 'order.contactDetail.email', '');
};
