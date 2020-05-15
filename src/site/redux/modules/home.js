import { combineReducers } from 'redux';
import { get } from '../../../utils/request';
import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import { getCurrentPlaceInfo } from './app';
import { getAllStoreCollections } from './entities/storeCollections';
import { getStoreById, storesActionCreators } from './entities/stores';

const initialState = {
  typePicker: {
    show: false,
    isOpen: false,
    business: '',
    deliveryUrl: '',
    pickupUrl: '',
    isOutOfDeliveryRange: true,
    loading: false,
  },
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
  searchInfo: {
    keyword: '',
    scrollTop: 0,
  },
  loadedSearchingStoreList: false,
  storeIds: [],
  storeIdsSearchResult: [],
  searchingStoreList: [], // Notice: not used, since dropdown search result is removed from design
};

const types = {
  // set pagination info
  SET_PAGINATION_INFO: 'SITE/HOME/SET_PAGINATION_INFO',

  // set searchInfo
  SET_SEARCH_INFO: 'SITE/HOME/SET_SEARCH_INFO',

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
  GET_STORE_LIST_CANCEL: 'SITE/HOME/GET_STORE_LIST_CANCEL',

  // fetch searching store list
  GET_SEARCHING_STORE_LIST_REQUEST: 'SITE/HOME/GET_SEARCHING_STORE_LIST_REQUEST',
  GET_SEARCHING_STORE_LIST_SUCCESS: 'SITE/HOME/GET_SEARCHING_STORE_LIST_SUCCESS',
  GET_SEARCHING_STORE_LIST_FAILURE: 'SITE/HOME/GET_SEARCHING_STORE_LIST_FAILURE',

  // set searching store list status
  SET_SEARCHING_STORES_STATUS: 'SITE/HOME/SET_SEARCHING_STORES_STATUS',
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
  setSearchInfo: searchInfo => ({
    type: types.SET_SEARCH_INFO,
    searchInfo,
  }),

  setPaginationInfo: paginationInfo => ({
    type: types.SET_PAGINATION_INFO,
    paginationInfo,
  }),

  hideTypePicker: () => ({
    type: types.HIDE_TYPE_PICKER,
  }),

  jumpToStore: ({ business, storeId, source = 'beepit.com', shippingType = 'delivery' }) => (dispatch, getState) => {
    const context = { storeId, business, source, shippingType };
    return dispatch(fetchStoreUrlHash(storeId, context));
  },

  showTypePicker: ({ business, storeId, source = 'beepit.com', isOutOfDeliveryRange, isOpen, isPreOrder }) => (
    dispatch,
    getState
  ) => {
    const context = { storeId, business, source, isOutOfDeliveryRange, isOpen, isPreOrder };
    return dispatch(fetchStoreUrlHash(storeId, context));
  },

  setSearchingStoresStatus: status => (dispatch, getState) => {
    return dispatch({
      type: types.SET_SEARCHING_STORES_STATUS,
      loadedSearchingStoreList: status,
    });
  },

  getStoreListNextPage: () => (dispatch, getState) => {
    const { loading, hasMore } = getPaginationInfo(getState());
    if (loading || !hasMore) return;
    return dispatch(fetchStoreList());
  },

  reloadStoreList: () => (dispatch, getState) => {
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

  getSearchingStoreList: ({ coords }) => async (dispatch, getState) => {
    const { keyword } = getSearchInfo(getState());
    return dispatch(fetchSearchingStoreList({ coords, keyword, page: 0, pageSize: 25 }));
  },
};

const fetchStoreUrlHash = (storeId, context) => ({
  types: [types.FETCH_STORE_HASHCODE_REQUEST, types.FETCH_STORE_HASHCODE_SUCCESS, types.FETCH_STORE_HASHCODE_FAILURE],
  context,
  requestPromise: get(Url.API_URLS.GET_STORE_HASH_DATA(storeId).url),
});

const fetchStoreList = () => (dispatch, getState) => {
  const { coords } = getCurrentPlaceInfo(getState()) || {};
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
      `${Url.API_URLS.GET_SEARCHING_STORE_LIST.url}?lat=${coords.lat}&lng=${coords.lng}&page=${page}&pageSize=${pageSize}&shippingType=delivery`,
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

const storeIdsSearchResultReducer = (state = initialState.storeIdsSearchResult, action) => {
  if (action.type === types.GET_SEARCHING_STORE_LIST_SUCCESS) {
    const { response } = action;

    if (response) {
      return (response.stores || []).map(store => store.id);
    }
  }

  return state;
};

const paginationInfoReducer = (state = initialState.paginationInfo, action) => {
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
      const { stores } = action.response || {};
      const page = action.context.page + 1;
      nextState = { ...state, page, loading: false };
      if (!stores || !stores.length || state.pageSize > stores.length) {
        nextState.hasMore = false;
      }
      return nextState;
    case types.GET_STORE_LIST_FAILURE:
      return { ...state, hasMore: false, loading: false };
    case types.GET_STORE_LIST_CANCEL:
      console.log('request cancelled');
      return { ...state, loading: false };
    default:
      return state;
  }
};

const searchInfo = (state = initialState.searchInfo, action) => {
  if (action.type === types.SET_SEARCH_INFO) {
    return { ...state, ...action.searchInfo };
  }
  return state;
};

const storeLinkInfo = (state = initialState.storeLinkInfo, action) => {
  const { type, context } = action;
  if (type === types.FETCH_STORE_HASHCODE_REQUEST) {
    return { ...state, loading: true };
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
      business: context.business,
      shippingType: context.shippingType,
      storeId: context.storeId,
      loading: false,
    };
  } else if (type === types.FETCH_STORE_HASHCODE_FAILURE) {
    return { ...initialState.storeLinkInfo };
  }

  return state;
};

// const typePickerReducer = (state = initialState.typePicker, action) => {
//   const { type, context } = action;
//   if (type === types.FETCH_STORE_HASHCODE_REQUEST) {
//     return { ...state, loading: true, show: context.isOpen || context.isPreOrder };
//   } else if (type === types.FETCH_STORE_HASHCODE_SUCCESS) {
//     const { redirectTo } = action.response || {};
//     const storeUrlParams = {
//       business: context.business,
//       hash: redirectTo,
//       source: context.source,
//     };

//     return {
//       ...state,
//       deliveryUrl: Utils.getMerchantStoreUrl({ ...storeUrlParams, type: 'delivery' }),
//       pickupUrl: Utils.getMerchantStoreUrl({ ...storeUrlParams, type: 'pickup' }),
//       isOutOfDeliveryRange: context.isOutOfDeliveryRange,
//       isOpen: context.isOpen || context.isPreOrder,
//       business: context.business,
//       loading: false,
//     };
//   } else if (type === types.FETCH_STORE_HASHCODE_FAILURE || type === types.HIDE_TYPE_PICKER) {
//     return { ...initialState.typePicker };
//   }

//   return state;
// };

const loadedSearchingStoreList = (state = initialState.loadedSearchingStoreList, action) => {
  switch (action.type) {
    case types.SET_SEARCHING_STORES_STATUS:
    case types.GET_SEARCHING_STORE_LIST_REQUEST:
      return false;
    case types.GET_SEARCHING_STORE_LIST_SUCCESS:
    case types.GET_SEARCHING_STORE_LIST_FAILURE:
      return true;
    default:
      return state;
  }
};

const searchingStoreList = (state = initialState.searchingStoreList, action) => {
  if (types.GET_SEARCHING_STORE_LIST_SUCCESS) {
    const { stores: searchingStoreList } = action.response || {};
    return { ...state, ...searchingStoreList };
  }

  return state;
};

const reducer = combineReducers({
  // typePicker: typePickerReducer,
  storeIds: storeIdsReducer,
  paginationInfo: paginationInfoReducer,
  searchInfo,
  loadedSearchingStoreList,
  searchingStoreList,
  storeIdsSearchResult: storeIdsSearchResultReducer,
  storeLinkInfo,
});

export const homeActionCreators = actions;
export default reducer;

// @selectors
// export const getTypePicker = state => state.home.typePicker;
export const getSearchInfo = state => state.home.searchInfo;
export const getPaginationInfo = state => state.home.paginationInfo;
export const getSearchingStores = state => state.home.searchingStoreList;
export const loadedSearchingStores = state => state.home.loadedSearchingStoreList;
export const getAllCurrentStores = state => state.home.storeIds.map(storeId => getStoreById(state, storeId));
export const getSearchResult = state => state.home.storeIdsSearchResult.map(storeId => getStoreById(state, storeId));
export const getStoreLinkInfo = state => state.home.storeLinkInfo;
export const getStoreCollections = state => {
  // todo
  return Object.values(getAllStoreCollections(state));
};
