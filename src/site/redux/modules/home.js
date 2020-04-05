import { getStoreById, storesActionCreators } from './entities/stores';
import Url from '../../../utils/url';

import { get } from '../../../utils/request';
import { getCurrentPlaceInfo } from './app';
import Utils from '../../../utils/utils';

const initialState = {
  typePicker: {
    show: false,
    business: '',
    deliveryUrl: '',
    pickupUrl: '',
    isOutOfDeliveryRange: true,
    loading: false,
  },
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
  // query store url
  SHOW_TYPE_PICKER: 'SITE/HOME/SHOW_TYPE_PICKER',
  HIDE_TYPE_PICKER: 'SITE/HOME/HIDE_TYPE_PICKER',
  FETCH_STORE_HASHCODE_REQUEST: 'SITE/HOME/FETCH_STORE_HASHCODE_REQUEST',
  FETCH_STORE_HASHCODE_SUCCESS: 'SITE/HOME/FETCH_STORE_HASHCODE_SUCCESS',
  FETCH_STORE_HASHCODE_FAILURE: 'SITE/HOME/FETCH_STORE_HASHCODE_FAILURE',

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

// @actions
const actions = {
  hideTypePicker: () => ({
    type: types.HIDE_TYPE_PICKER,
  }),

  showTypePicker: ({ business, storeId, source = 'beepit.com', isOutOfDeliveryRange }) => (dispatch, getState) => {
    const context = { storeId, business, source, isOutOfDeliveryRange };
    return dispatch(fetchStoreUrlHash(storeId, context));
  },

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

const fetchStoreUrlHash = (storeId, context) => ({
  types: [types.FETCH_STORE_HASHCODE_REQUEST, types.FETCH_STORE_HASHCODE_SUCCESS, types.FETCH_STORE_HASHCODE_FAILURE],
  context,
  requestPromise: get(Url.API_URLS.GET_STORE_HASH_DATA(storeId).url),
});

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
      if (response && Array.isArray(response.stores)) {
        await dispatch(storesActionCreators.saveStores(response.stores));
        return response;
      }

      return response;
    }),
  });
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

const typePickerReducer = (state, action) => {
  const { type, context } = action;
  if (type === types.FETCH_STORE_HASHCODE_REQUEST) {
    return { ...state, loading: true, show: true };
  } else if (type === types.FETCH_STORE_HASHCODE_SUCCESS) {
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
      isOutOfDeliveryRange: context.isOutOfDeliveryRange,
      business: context.business,
      loading: false,
    };
  } else if (type === types.FETCH_STORE_HASHCODE_FAILURE || type === types.HIDE_TYPE_PICKER) {
    return { show: false, loading: false };
  }
  return state;
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
    case types.HIDE_TYPE_PICKER:
    case types.FETCH_STORE_HASHCODE_REQUEST:
    case types.FETCH_STORE_HASHCODE_SUCCESS:
    case types.FETCH_STORE_HASHCODE_FAILURE:
      return {
        ...state,
        typePicker: typePickerReducer(state.typePicker, action),
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
export const getTypePicker = state => state.home.typePicker;
