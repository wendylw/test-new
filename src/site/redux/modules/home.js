/* eslint-disable no-use-before-define */
import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import _get from 'lodash/get';
import { get } from '../../../utils/request';
import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import { getIsAlipayMiniProgram } from './app';
import { getStoreById, storesActionCreators } from './entities/stores';
import {
  getAddressCoords,
  getAddressCountryCode,
  getIsMalaysianAddress,
} from '../../../redux/modules/address/selectors';

const initialState = {
  storeLinkInfo: {
    business: '',
    deliveryUrl: '',
    pickupUrl: '',
    loading: false,
  },
  paginationInfo: {
    page: 0, // <InfiniteScroll /> handles the page number
    pageSize: 10,
    hasMore: true,
    loading: false,
    scrollTop: 0,
  },
  storeIds: [],
};

const types = {
  // set pagination info
  SET_PAGINATION_INFO: 'SITE/HOME/SET_PAGINATION_INFO',

  // query store url
  FETCH_STORE_HASHCODE_REQUEST: 'SITE/HOME/FETCH_STORE_HASHCODE_REQUEST',
  FETCH_STORE_HASHCODE_SUCCESS: 'SITE/HOME/FETCH_STORE_HASHCODE_SUCCESS',
  FETCH_STORE_HASHCODE_FAILURE: 'SITE/HOME/FETCH_STORE_HASHCODE_FAILURE',

  // fetch store list
  GET_STORE_LIST_REQUEST: 'SITE/HOME/GET_STORE_LIST_REQUEST',
  GET_STORE_LIST_SUCCESS: 'SITE/HOME/GET_STORE_LIST_SUCCESS',
  GET_STORE_LIST_FAILURE: 'SITE/HOME/GET_STORE_LIST_FAILURE',
  GET_STORE_LIST_CANCEL: 'SITE/HOME/GET_STORE_LIST_CANCEL',
};

let fetchStoreListAbortController;
const refreshFetchStoreListAbortController = () => {
  if (window.AbortController) {
    fetchStoreListAbortController = new AbortController();
    return fetchStoreListAbortController.signal;
  }
  return undefined;
};

// @actions
const actions = {
  setPaginationInfo: paginationInfo => ({
    type: types.SET_PAGINATION_INFO,
    paginationInfo,
  }),

  jumpToStore: ({ business, storeId, source = 'beepit.com', shippingType = 'delivery' }) => dispatch => {
    const context = { storeId, business, source, shippingType };
    return dispatch(fetchStoreUrlHash(storeId, context));
  },

  getStoreListNextPage: () => (dispatch, getState) => {
    const { loading, hasMore } = getPaginationInfo(getState());
    if (loading || !hasMore) return;
    dispatch(fetchStoreList());
  },

  reloadStoreList: () => dispatch => {
    dispatch(
      actions.setPaginationInfo({
        page: 0,
        hasMore: true,
        loading: false,
      })
    );
    if (fetchStoreListAbortController) {
      fetchStoreListAbortController.abort();
    }
    dispatch(actions.getStoreListNextPage());
  },
};

const fetchStoreUrlHash = (storeId, context) => ({
  types: [types.FETCH_STORE_HASHCODE_REQUEST, types.FETCH_STORE_HASHCODE_SUCCESS, types.FETCH_STORE_HASHCODE_FAILURE],
  context,
  requestPromise: get(Url.API_URLS.GET_STORE_HASH_DATA(storeId).url),
});

const fetchStoreList = () => (dispatch, getState) => {
  const countryCode = getAddressCountryCode(getState());
  const coords = getAddressCoords(getState()) || { lat: 0, lng: 0 };
  const { page, pageSize } = getPaginationInfo(getState());
  return dispatch({
    types: [
      types.GET_STORE_LIST_REQUEST,
      types.GET_STORE_LIST_SUCCESS,
      types.GET_STORE_LIST_FAILURE,
      types.GET_STORE_LIST_CANCEL,
    ],
    context: { page },
    requestPromise: get(
      `${Url.API_URLS.GET_SEARCHING_STORE_LIST.url}?lat=${coords.lat}&lng=${coords.lng}&page=${page}&pageSize=${pageSize}&shippingType=delivery&countryCode=${countryCode}`,
      { signal: refreshFetchStoreListAbortController() }
    ).then(async response => {
      if (response && Array.isArray(response.stores)) {
        await dispatch(storesActionCreators.saveStores(response.stores));
        return response;
      }
      return response;
    }),
  });
};

// @reducers
const storeIdsReducer = (state = initialState.storeIds, action) => {
  if (action.type === types.GET_STORE_LIST_REQUEST) {
    if (action.context.page === 0) return [];
  } else if (action.type === types.GET_STORE_LIST_SUCCESS) {
    const { response } = action;
    if (!response.stores || !response.stores.length) return state;
    const storeIds = response.stores.map(store => store.id);
    return [...state, ...storeIds];
  }

  return state;
};

const paginationInfoReducer = (state = initialState.paginationInfo, action) => {
  const { stores } = action.response || {};
  const cxtPage = _get(action, 'context.page', 0);
  let nextState;

  switch (action.type) {
    case types.SET_PAGINATION_INFO:
      return { ...state, ...action.paginationInfo };
    case types.GET_STORE_LIST_REQUEST:
      nextState = { ...state };
      if (action.context.page === 0) {
        Object.assign(nextState, { hasMore: true, loading: false });
      }
      return { ...nextState, loading: true };
    case types.GET_STORE_LIST_SUCCESS:
      nextState = { ...state, page: cxtPage + 1, loading: false };
      if (!stores || !stores.length || state.pageSize > stores.length) {
        nextState.hasMore = false;
      }
      return nextState;
    case types.GET_STORE_LIST_FAILURE:
      return { ...state, hasMore: false, loading: false };
    case types.GET_STORE_LIST_CANCEL:
      return { ...state, loading: false };
    default:
      return state;
  }
};

const storeLinkInfo = (state = initialState.storeLinkInfo, action) => {
  const { type, context } = action;
  if (type === types.FETCH_STORE_HASHCODE_REQUEST) {
    return { ...state, loading: true };
  }

  if (type === types.FETCH_STORE_HASHCODE_SUCCESS) {
    const { redirectTo } = action.response || {};
    const storeUrlParams = {
      business: context.business,
      hash: redirectTo,
      source: context.source,
    };

    return {
      ...state,
      deliveryUrl: Utils.getMerchantStoreUrl({ ...storeUrlParams, type: 'delivery' }),
      pickupUrl: Utils.getMerchantStoreUrl({ ...storeUrlParams, type: 'pickup' }),
      business: context.business,
      shippingType: context.shippingType,
      storeId: context.storeId,
      loading: false,
    };
  }

  if (type === types.FETCH_STORE_HASHCODE_FAILURE) {
    return { ...initialState.storeLinkInfo };
  }

  return state;
};

const reducer = combineReducers({
  storeIds: storeIdsReducer,
  paginationInfo: paginationInfoReducer,
  storeLinkInfo,
});

export const homeActionCreators = actions;
export default reducer;

// @selectors
export const getPaginationInfo = state => state.home.paginationInfo;
export const getAllCurrentStores = state => state.home.storeIds.map(storeId => getStoreById(state, storeId));
export const getStoreLinkInfo = state => state.home.storeLinkInfo;

export const getShouldShowCampaignBar = createSelector(
  getIsMalaysianAddress,
  getIsAlipayMiniProgram,
  (isMalaysianAddress, isAlipayMiniProgram) => isMalaysianAddress && !isAlipayMiniProgram
);
