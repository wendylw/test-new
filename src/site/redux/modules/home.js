import { getStoreById, storesActionCreators } from './entities/stores';
import Url from '../../../utils/url';

import { get } from '../../../utils/request';
import { getCurrentPlaceInfo } from './app';

const initialState = {
  paginationInfo: {
    page: 0, // <InfiniteScroll /> handles the page number
    pageSize: 5,
    hasMore: true,
  },
  loadedSearchingStoreList: false,
  storeIds: [],
  storeIdsSearchResult: [],
  searchingStoreList: [], // Notice: not used, since dropdown search result is removed from design
};

const types = {
  // fetch store list
  GET_STORE_LIST_REQUEST: 'SITE/HOME/GET_STORE_LIST_REQUEST',
  GET_STORE_LIST_SUCCESS: 'SITE/HOME/GET_STORE_LIST_SUCCESS',
  GET_STORE_LIST_FAILURE: 'SITE/HOME/GET_STORE_LIST_FAILURE',

  // fetch searching store list
  GET_SEARCHING_STORE_LIST_REQUEST: 'SITE/HOME/GET_SEARCHING_STORE_LIST_REQUEST',
  GET_SEARCHING_STORE_LIST_SUCCESS: 'SITE/HOME/GET_SEARCHING_STORE_LIST_SUCCESS',
  GET_SEARCHING_STORE_LIST_FAILURE: 'SITE/HOME/GET_SEARCHING_STORE_LIST_FAILURE',

  // set searching store list status
  SET_SEARCHING_STORES_STATUS: 'SITE/HOME/SET_SEARCHING_STORES_STATUS',
};

const fetchStoreList = page => (dispatch, getState) => {
  const { coords } = getCurrentPlaceInfo(getState()) || {};
  const { pageSize } = getPaginationInfo(getState());

  return dispatch({
    types: [types.GET_STORE_LIST_REQUEST, types.GET_STORE_LIST_SUCCESS, types.GET_STORE_LIST_FAILURE],
    requestPromise: get(
      `${Url.API_URLS.GET_STORE_LIST.url}?lat=${coords.lat}&lng=${coords.lng}&page=${page}&pageSize=${pageSize}`
    ).then(async response => {
      if (response && Array.isArray(response.stores)) {
        await dispatch(storesActionCreators.saveStores(response.stores));
        return response;
      }

      console.error(new Error(JSON.stringify(response)));
      return response;
    }),
  });
};

const fetchSearchingStoreList = ({ coords, keyword, page, pageSize }) => (dispatch, getState) => {
  return dispatch({
    types: [
      types.GET_SEARCHING_STORE_LIST_REQUEST,
      types.GET_SEARCHING_STORE_LIST_SUCCESS,
      types.GET_SEARCHING_STORE_LIST_FAILURE,
    ],
    requestPromise: get(
      `${Url.API_URLS.GET_SEARCHING_STORE_LIST.url}?keyword=${keyword}&lat=${coords.lat}&lng=${coords.lng}&page=${page}&pageSize=${pageSize}`
    ).then(async response => {
      console.log('--> response =', response);
      if (response && Array.isArray(response.stores)) {
        await dispatch(storesActionCreators.saveStores(response.stores));
        return response;
      }

      return response;
    }),
  });
};

// @actions
const actions = {
  setSearchingStoresStatus: status => (dispatch, getState) => {
    return dispatch({
      type: types.SET_SEARCHING_STORES_STATUS,
      loadedSearchingStoreList: status,
    });
  },
  getStoreList: page => (dispatch, getState) => {
    return dispatch(fetchStoreList(page));
  },

  getSearchingStoreList: ({ coords, keyword }) => async (dispatch, getState) => {
    return dispatch(fetchSearchingStoreList({ coords, keyword, page: 0, pageSize: 25 }));
  },
};

// @reducers
const storeIdsReducer = (state, action) => {
  if (action.type === types.GET_STORE_LIST_SUCCESS) {
    const { response } = action;
    if (!response.stores || !response.stores.length) return state;
    return [...state.concat((response.stores || []).map(store => store.id))];
  }

  return state;
};

const storeIdsSearchResultReducer = (state, action) => {
  const { response } = action;
  return (response.stores || []).map(store => store.id);
};

const paginationInfoReducer = (state, action) => {
  switch (action.type) {
    case types.GET_STORE_LIST_SUCCESS:
      const { stores } = action.response || {};

      if (!stores || !stores.length) {
        return { ...state, hasMore: false };
      }

      if (state.pageSize > stores.length) {
        return { ...state, hasMore: false };
      }

      return state;
    case types.GET_STORE_LIST_FAILURE:
      return { ...state, hasMore: false };
    default:
      return state;
  }
};

const reducer = (state = initialState, action) => {
  const { response } = action;

  switch (action.type) {
    case types.GET_STORE_LIST_SUCCESS:
    case types.GET_STORE_LIST_FAILURE:
      return {
        ...state,
        storeIds: storeIdsReducer(state.storeIds, action),
        paginationInfo: paginationInfoReducer(state.paginationInfo, action),
      };
    case types.GET_SEARCHING_STORE_LIST_REQUEST:
    case types.SET_SEARCHING_STORES_STATUS:
      return { ...state, loadedSearchingStoreList: false };
    case types.GET_SEARCHING_STORE_LIST_FAILURE:
      return { ...state, loadedSearchingStoreList: true };
    case types.GET_SEARCHING_STORE_LIST_SUCCESS:
      const { stores: searchingStoreList } = response;

      return {
        ...state,
        loadedSearchingStoreList: true,
        searchingStoreList,
        storeIdsSearchResult: storeIdsSearchResultReducer(state.storeIdsSearchResult, action),
      };
    default:
      return state;
  }
};

export const homeActionCreators = actions;
export default reducer;

// @selectors
export const getPaginationInfo = state => state.home.paginationInfo;
export const getSearchingStores = state => state.home.searchingStoreList;
export const loadedSearchingStores = state => state.home.loadedSearchingStoreList;
export const getAllCurrentStores = state => state.home.storeIds.map(storeId => getStoreById(state, storeId));
export const getSearchResult = state => state.home.storeIdsSearchResult.map(storeId => getStoreById(state, storeId));
