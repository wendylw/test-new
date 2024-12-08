import { combineReducers } from 'redux';
import _get from 'lodash/get';
import { createSelector } from 'reselect';
import config from '../../../config';
import Url from '../../../utils/url';

import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import Utils from '../../../utils/utils';

export const initialState = {
  error: null, // network error
  messageModal: {
    show: false,
    message: '',
    description: '',
  }, // message modal
  business: config.business,
  onlineStoreInfo: {
    id: '',
    isFetching: false,
  },
  requestInfo: {
    tableId: config.table,
    storeId: config.storeId,
  },
  removePickUpMerchantList: config.removePickupMerchantList,
};

export const types = {
  CLEAR_ERROR: 'STORES/APP/CLEAR_ERROR',

  // fetch onlineStoreInfo
  FETCH_ONLINESTOREINFO_REQUEST: 'STORES/APP/FETCH_ONLINESTOREINFO_REQUEST',
  FETCH_ONLINESTOREINFO_SUCCESS: 'STORES/APP/FETCH_ONLINESTOREINFO_SUCCESS',
  FETCH_ONLINESTOREINFO_FAILURE: 'STORES/APP/FETCH_ONLINESTOREINFO_FAILURE',

  // message modal
  SET_MESSAGE_INFO: 'STORES/APP/SET_MESSAGE_INFO',
  HIDE_MESSAGE_MODAL: 'STORES/APP/HIDE_MESSAGE_MODAL',
};

// action creators
export const actions = {
  clearError: () => ({
    type: types.CLEAR_ERROR,
  }),

  showMessageModal: ({ message, description }) => ({
    type: types.SET_MESSAGE_INFO,
    message,
    description,
  }),

  hideMessageModal: () => ({
    type: types.HIDE_MESSAGE_MODAL,
  }),

  fetchOnlineStoreInfo: () => ({
    [FETCH_GRAPHQL]: {
      types: [
        types.FETCH_ONLINESTOREINFO_REQUEST,
        types.FETCH_ONLINESTOREINFO_SUCCESS,
        types.FETCH_ONLINESTOREINFO_FAILURE,
      ],
      endpoint: Url.apiGql('OnlineStoreInfo'),
    },
  }),
};

const error = (state = initialState.error, action) => {
  const { type, code, message } = action;
  if (type === types.CLEAR_ERROR || code === 200) {
    return null;
  }

  if (code && code !== 401 && code < 40000) {
    return {
      ...state,
      code,
      message,
    };
  }

  return state;
};

const business = (state = initialState.business) => state;
const removePickUpMerchantList = (state = initialState.removePickUpMerchantList) => state;

const onlineStoreInfo = (state = initialState.onlineStoreInfo, action) => {
  const { type, responseGql } = action;

  if (!(responseGql && responseGql.data.onlineStoreInfo)) {
    return state;
  }

  switch (type) {
    case types.FETCH_ONLINESTOREINFO_REQUEST:
      return { ...state, isFetching: true };
    case types.FETCH_ONLINESTOREINFO_SUCCESS:
      return { ...state, isFetching: false, id: action.responseGql.data.onlineStoreInfo.id };
    case types.FETCH_ONLINESTOREINFO_FAILURE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
};

const messageModal = (state = initialState.messageModal, action) => {
  switch (action.type) {
    case types.SET_MESSAGE_INFO: {
      const { message, description } = action;
      return { ...state, show: true, message, description };
    }
    case types.HIDE_MESSAGE_MODAL: {
      return { ...state, show: false, message: '', description: '' };
    }
    default:
      return state;
  }
};

const requestInfo = (state = initialState.requestInfo) => state;

export default combineReducers({
  error,
  messageModal,
  business,
  removePickUpMerchantList,
  onlineStoreInfo,
  requestInfo,
});

// selectors
export const getBusiness = state => state.app.business;

export const getRemovedPickUpMerchantList = state => state.app.removePickUpMerchantList;
export const getError = state => state.app.error;
export const getOnlineStoreInfo = state => state.entities.onlineStores[state.app.onlineStoreInfo.id];
export const getRequestInfo = state => state.app.requestInfo;
export const getMessageModal = state => state.app.messageModal;

export const getBusinessInfo = state => {
  const name = getBusiness(state);

  return getBusinessByName(state, name) || {};
};

// default is UTC+8 offset
export const getBusinessUTCOffset = createSelector(getBusinessInfo, businessInfo =>
  _get(businessInfo, 'timezoneOffset', 480)
);

export const getBusinessDeliveryRadius = createSelector(getBusinessInfo, businessInfo =>
  _get(businessInfo, 'qrOrderingSettings.deliveryRadius', 0)
);

export const getDeliveryInfo = createSelector(getBusinessInfo, businessInfo => Utils.getDeliveryInfo(businessInfo));
