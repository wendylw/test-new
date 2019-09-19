import { combineReducers } from 'redux';
import config from '../../../config';
import Url from '../../../utils/url';

import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';

const initialState = {
  user: {
    isWebview: Boolean(window.ReactNativeWebView && window.ReactNativeWebView.postMessage),
    isLogin: false,
    isExpired: false,
  },
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
  }
};

export const types = {
  CLEAR_ERROR: 'ORDERING/APP/CLEAR_ERROR',

  // fetch onlineStoreInfo
  FETCH_ONLINESTOREINFO_REQUEST: 'ORDERING/APP/FETCH_ONLINESTOREINFO_REQUEST',
  FETCH_ONLINESTOREINFO_SUCCESS: 'ORDERING/APP/FETCH_ONLINESTOREINFO_SUCCESS',
  FETCH_ONLINESTOREINFO_FAILURE: 'ORDERING/APP/FETCH_ONLINESTOREINFO_FAILURE',

  // message modal
  SHOW_MESSAGE_MODAL: 'ORDERING/APP/SHOW_MESSAGE_MODAL',
  HIDE_MESSAGE_MODAL: 'ORDERING/APP/HIDE_MESSAGE_MODAL',

  // fetch login status
  FETCH_LOGIN_STATUS_REQUEST: 'ORDERING/APP/FETCH_LOGIN_STATUS_REQUEST',
  FETCH_LOGIN_STATUS_SUCCESS: 'ORDERING/APP/FETCH_LOGIN_STATUS_SUCCESS',
  FETCH_LOGIN_STATUS_FAILURE: 'ORDERING/APP/FETCH_LOGIN_STATUS_FAILURE',

  // login
  CREATE_LOGIN_REQUEST: 'ORDERING/APP/CREATE_LOGIN_REQUEST',
  CREATE_LOGIN_SUCCESS: 'ORDERING/APP/CREATE_LOGIN_SUCCESS',
  CREATE_LOGIN_FAILURE: 'ORDERING/APP/CREATE_LOGIN_FAILURE',
};

//action creators
export const actions = {
  loginApp: ({ accessToken, refreshToken }) => ({
    [API_REQUEST]: {
      types: [
        types.CREATE_LOGIN_REQUEST,
        types.CREATE_LOGIN_SUCCESS,
        types.CREATE_LOGIN_FAILURE,
      ],
      ...Url.API_URLS.POST_LOGIN,
      payload: {
        accessToken,
        refreshToken,
      },
    }
  }),
  getLoginStatus: () => ({
    [API_REQUEST]: {
      types: [
        types.FETCH_LOGIN_STATUS_REQUEST,
        types.FETCH_LOGIN_STATUS_SUCCESS,
        types.FETCH_LOGIN_STATUS_FAILURE,
      ],
      ...Url.API_URLS.GET_LOGIN_STATUS
    }
  }),
  clearError: () => ({
    type: types.CLEAR_ERROR
  }),
  showMessageModal: ({ message, description }) => ({
    type: types.SHOW_MESSAGE_MODAL,
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
    }
  }),
};

const user = (state = initialState.user, action) => {
  const {
    type,
    response,
    code,
  } = action;
  const { login } = response || {};

  switch (type) {
    case types.FETCH_LOGIN_STATUS_REQUEST:
      return { ...state, isFetching: true };
    case types.CREATE_LOGIN_SUCCESS:
      return {
        ...state,
        isLogin: true,
        isFetching: false,
      };
    case types.FETCH_LOGIN_STATUS_SUCCESS:
      return {
        ...state,
        isLogin: login,
        isFetching: false,
      };
    case types.CREATE_LOGIN_FAILURE:
      if (code && code === 401) {
        return { ...state, isExpired: true, isFetching: false };
      }

      return { ...state, isFetching: false };
    case types.FETCH_LOGIN_STATUS_FAILURE:
      return { ...state, isFetching: false };
    default:
      return state;
  }
}

const error = (state = initialState.error, action) => {
  const {
    type,
    code,
    message,
  } = action;

  if (type === types.CLEAR_ERROR || code === 200) {
    return null;
  } else if (code && code !== 401) {
    return { ...state, code, message };
  }

  return state;
}

const business = (state = initialState.business, action) => state;

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
}

const messageModal = (state = initialState.messageModal, action) => {
  switch (action.type) {
    case types.SHOW_MESSAGE_MODAL: {
      const { message, description } = action;
      return { ...state, show: true, message, description };
    }
    case types.HIDE_MESSAGE_MODAL: {
      return { ...state, show: false, message: '', description: '' };
    }
    default:
      return state;
  }
}

const requestInfo = (state = initialState.requestInfo, action) => state;

export default combineReducers({
  user,
  error,
  messageModal,
  business,
  onlineStoreInfo,
  requestInfo,
});

// selectors
export const getUser = state => state.app.user;
export const getBusiness = state => state.app.business;
export const getError = state => state.app.error;
export const getOnlineStoreInfo = state => {
  return state.entities.onlineStores[state.app.onlineStoreInfo.id];
};
export const getRequestInfo = state => state.app.requestInfo;
export const getMessageModal = state => state.app.messageModal;
