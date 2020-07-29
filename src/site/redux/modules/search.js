import { combineReducers } from 'redux';
import { get } from '../../../utils/request';
import Url from '../../../utils/url';
import { getStoreById, storesActionCreators } from './entities/stores';
import { getCurrentPlaceInfo } from './app';
import { getCountryCodeByPlaceInfo } from '../../../utils/geoUtils';

const defaultPageInfo = {
  page: 0,
  pageSize: 10,
  hasMore: true,
  loading: false,
  scrollTop: 0,
};

const initialState = {
  storeIds: [],
  paginationInfo: { ...defaultPageInfo },
  searchInfo: {
    keyword: '',
    scrollTop: 0,
  },
  storeIdsSearchResult: [],
  loadedSearchingStoreList: false,
  shippingType: 'delivery', // delivery || pickup, same to the above 2 states
};

// @types
const types = {
  GET_STORE_LIST: '/SITE/SEARCH/GET_STORE_LIST',
  SET_SHIPPING_TYPE: 'SITE/SEARCH/SET_SHIPPING_TYPE',
  SET_SEARCH_INFO: 'SITE/SEARCH/SET_SEARCH_INFO',
  SET_PAGINATION_INFO: 'SITE/SEARCH/SET_PAGINATION_INFO',

  // fetch store list
  GET_STORE_LIST_REQUEST: 'SITE/SEARCH/GET_STORE_LIST_REQUEST',
  GET_STORE_LIST_SUCCESS: 'SITE/SEARCH/GET_STORE_LIST_SUCCESS',
  GET_STORE_LIST_FAILURE: 'SITE/SEARCH/GET_STORE_LIST_FAILURE',

  SET_SEARCHING_STORES_STATUS: 'SITE/SEARCH/SET_SEARCHING_STORES_STATUS',
};

// @actions
const actions = {
  getStoreList: () => (dispatch, getState) => {
    const shippingType = getShippingType(getState());
    const { loading, page, pageSize, hasMore } = getPageInfo(getState());
    if (loading || !hasMore) return;
    return dispatch(fetchStoreList(page, pageSize, shippingType));
  },
  setShippingType: shippingType => ({
    type: types.SET_SHIPPING_TYPE,
    shippingType,
  }),
  setSearchInfo: searchInfo => ({
    type: types.SET_SEARCH_INFO,
    searchInfo,
  }),
  setPaginationInfo: () => ({
    type: types.SET_PAGINATION_INFO,
    paginationInfo: {
      ...defaultPageInfo,
    },
  }),
  setSearchingStoresStatus: status => (dispatch, getState) => {
    return dispatch({
      type: types.SET_SEARCHING_STORES_STATUS,
      loadedSearchingStoreList: status,
    });
  },
};

const fetchStoreList = (page, pageSize, shippingType) => (dispatch, getState) => {
  const currentPlaceInfo = getCurrentPlaceInfo(getState()) || {};
  const countryCode = getCountryCodeByPlaceInfo(currentPlaceInfo);
  const { coords } = currentPlaceInfo;
  const { keyword } = getSearchInfo(getState());
  return dispatch({
    types: [types.GET_STORE_LIST_REQUEST, types.GET_STORE_LIST_SUCCESS, types.GET_STORE_LIST_FAILURE],
    context: { page, pageSize, shippingType },
    requestPromise: get(
      `${Url.API_URLS.GET_SEARCHING_STORE_LIST.url}?keyword=${keyword}&lat=${coords.lat}&lng=${coords.lng}&page=${page}&pageSize=${pageSize}&shippingType=${shippingType}&countryCode=${countryCode}`
    ).then(async response => {
      if (response && Array.isArray(response.stores)) {
        window.heap?.track('site.search.store-list.load-page', { Page: page, Keyword: keyword });
        await dispatch(storesActionCreators.saveStores(response.stores));
        return response;
      }
      return response;
    }),
  });
};

// @reducers
const shippingType = (state = initialState.shippingType, action) => {
  if (action.type === types.SET_SHIPPING_TYPE) {
    return action.shippingType;
  }
  return state;
};

const storeIds = (state = initialState.storeIds, action) => {
  if (action.type === types.GET_STORE_LIST_REQUEST) {
    if (action.context.page === 0) return [];
  } else if (action.type === types.GET_STORE_LIST_SUCCESS) {
    const { response } = action;
    if (!response.stores || !response.stores.length) return state;
    if (action.context.page === 0) return (response.stores || []).map(store => store.id);
    return [...state.concat((response.stores || []).map(store => store.id))];
  }

  return state;
};

const paginationInfo = (state = initialState.paginationInfo, action) => {
  switch (action.type) {
    case types.SET_PAGINATION_INFO:
      return { ...state, ...action.paginationInfo };
    case types.GET_STORE_LIST_REQUEST:
      const newState = { ...state, page: state.page + 1 };
      if (action.context.page === 0) {
        Object.assign(newState, { hasMore: true, loading: false });
      }
      return { ...newState, loading: true };
    case types.GET_STORE_LIST_SUCCESS:
      const { stores } = action.response || {};

      if (!stores || !stores.length) {
        return { ...state, hasMore: false, loading: false };
      }

      if (state.pageSize > stores.length) {
        return { ...state, hasMore: false, loading: false };
      }

      return { ...state, loading: false };
    case types.GET_STORE_LIST_FAILURE:
      return { ...state, hasMore: false, loading: false };
    default:
      return state;
  }
};

const storeIdsSearchResultReducer = (state = initialState.storeIdsSearchResult, action) => {
  if (action.type === types.GET_STORE_LIST_SUCCESS) {
    const { response } = action;

    if (response) {
      return (response.stores || []).map(store => store.id);
    }
  }

  return state;
};

const searchInfo = (state = initialState.searchInfo, action) => {
  if (action.type === types.SET_SEARCH_INFO) {
    return { ...state, ...action.searchInfo };
  }
  return state;
};

const loadedSearchingStoreList = (state = initialState.loadedSearchingStoreList, action) => {
  switch (action.type) {
    case types.SET_SEARCHING_STORES_STATUS:
      return false;
    case types.GET_STORE_LIST_REQUEST:
      if (action.context.page === 0) {
        // keyword change send request return false, others return true
        return false;
      } else {
        return true;
      }
    case types.GET_STORE_LIST_SUCCESS:
    case types.GET_STORE_LIST_FAILURE:
      return true;
    default:
      return state;
  }
};

export default combineReducers({
  storeIds,
  paginationInfo,
  shippingType,
  searchInfo,
  loadedSearchingStoreList,
  storeIdsSearchResult: storeIdsSearchResultReducer,
});
export const searchActions = actions;

// @selectors
export const getSearchInfo = state => state.search.searchInfo;
export const getPageInfo = state => state.search.paginationInfo;
export const getShippingType = state => state.search.shippingType;
export const loadedSearchingStores = state => state.search.loadedSearchingStoreList;
export const getStoreList = state => state.search.storeIds.map(storeId => getStoreById(state, storeId));
