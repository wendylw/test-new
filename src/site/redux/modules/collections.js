import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import { getCollectionBySlug } from './entities/storeCollections';
import { get } from '../../../utils/request';
import Url from '../../../utils/url';
import { getAllStores, storesActionCreators } from './entities/stores';

const defaultPageInfo = {
  page: 0,
  pageSize: 10,
  hasMore: true,
  loading: false,
  scrollTop: 0,
};

const initialState = {
  delivery: {
    storeIds: [],
    pageInfo: { ...defaultPageInfo },
  },
  pickup: {
    storeIds: [],
    pageInfo: { ...defaultPageInfo },
  },
  redirectInfo: {
    business: '',
    deliveryUrl: '',
    pickupUrl: '',
    loading: false,
  },
  coords: null, // { lat: float, lng: float }
  shippingType: 'delivery', // delivery || pickup, same to the above 2 states
};

// @types
const types = {
  // setCoords
  SET_COORDS: 'SITE/COLLECTIONS/SET_COORDS',

  FETCH_STORE_LIST_REQUEST: 'SITE/COLLECTIONS/FETCH_STORE_LIST_REQUEST',
  FETCH_STORE_LIST_SUCCESS: 'SITE/COLLECTIONS/FETCH_STORE_LIST_SUCCESS',
  FETCH_STORE_LIST_FAILURE: 'SITE/COLLECTIONS/FETCH_STORE_LIST_FAILURE',

  SET_SHIPPING_TYPE: 'SITE/COLLECTIONS/SET_SHIPPING_TYPE',
  RESET_PAGE_INFO: 'SITE/COLLECTIONS/RESET_PAGE_INFO',
  SET_PAGE_INFO: 'SITE/COLLECTIONS/SET_PAGE_INFO',
};

// @actions
const actions = {
  setCoords: coords => ({
    type: types.SET_COORDS,
    coords,
  }),
  setShippingType: shippingType => ({
    type: types.SET_SHIPPING_TYPE,
    shippingType,
  }),
  resetPageInfo: shippingType => ({
    type: types.RESET_PAGE_INFO,
    shippingType: shippingType,
    pageInfo: { ...defaultPageInfo },
  }),
  setPageInfo: ({ shippingType, scrollTop }) => ({
    type: types.SET_PAGE_INFO,
    shippingType,
    scrollTop,
  }),
  getStoreList: tags => (dispatch, getState) => {
    const shippingType = getShippingType(getState());
    const { loading, page, pageSize, hasMore } = getPageInfo(getState());
    if (loading || !hasMore) return;
    return dispatch(fetchStoreList(page, pageSize, shippingType, tags));
  },
};

const fetchStoreList = (page, pageSize, shippingType, tags) => (dispatch, getState) => {
  const coords = getCoords(getState());
  const tagsParam =
    !tags || tags.length === 0
      ? []
      : tags.reduce((accumulator, currencyValue) => accumulator + '&tags=' + currencyValue);

  return dispatch({
    types: [types.FETCH_STORE_LIST_REQUEST, types.FETCH_STORE_LIST_SUCCESS, types.FETCH_STORE_LIST_FAILURE],
    context: { page, pageSize, shippingType },
    requestPromise: get(
      `${Url.API_URLS.GET_SEARCHING_STORE_LIST.url}?lat=${coords.lat}&lng=${coords.lng}&page=${page}&pageSize=${pageSize}&shippingType=${shippingType}&tags=${tagsParam}`
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
const storeListReducer = (state = initialState.delivery, action) => {
  if (action.type === types.FETCH_STORE_LIST_REQUEST) {
    return {
      ...state,
      storeIds: action.context.page === 0 ? [] : state.storeIds,
      pageInfo: {
        ...state.pageInfo,
        page: state.pageInfo.page + 1,
        hasMore: action.context.page === 0 ? true : state.pageInfo.hasMore,
        loading: true,
      },
    };
  } else if (action.type === types.FETCH_STORE_LIST_SUCCESS) {
    const { stores } = action.response || {};

    return {
      ...state,
      storeIds:
        !stores || !stores.length ? state.storeIds : [...state.storeIds.concat((stores || []).map(store => store.id))],
      pageInfo: {
        ...state.pageInfo,
        hasMore: !stores || !stores.length || state.pageInfo.pageSize > stores.length ? false : state.pageInfo.hasMore,
        loading: false,
      },
    };
  } else if (action.type === types.FETCH_STORE_LIST_FAILURE) {
    return {
      ...state,
      pageInfo: {
        hasMore: false,
        loading: false,
      },
    };
  }
  return state;
};

const delivery = (state = initialState.delivery, action) => {
  if (action.context && action.context.shippingType === 'delivery') {
    return storeListReducer(state, action);
  }
  if (action.shippingType === 'delivery' && action.type === types.RESET_PAGE_INFO) {
    return {
      ...state,
      pageInfo: { ...action.pageInfo },
    };
  }
  if (action.shippingType === 'delivery' && action.type === types.SET_PAGE_INFO) {
    return {
      ...state,
      pageInfo: {
        ...state.pageInfo,
        scrollTop: action.scrollTop,
      },
    };
  }
  return state;
};

const pickup = (state = initialState.pickup, action) => {
  if (action.context && action.context.shippingType === 'pickup') {
    return storeListReducer(state, action);
  }
  if (action.shippingType === 'pickup' && action.type === types.RESET_PAGE_INFO) {
    return {
      ...state,
      pageInfo: { ...action.pageInfo },
    };
  }
  if (action.shippingType === 'pickup' && action.type === types.SET_PAGE_INFO) {
    return {
      ...state,
      pageInfo: {
        ...state.pageInfo,
        scrollTop: action.scrollTop,
      },
    };
  }
  return state;
};

const coords = (state = initialState.coords, action) => {
  if (action.type === types.SET_COORDS) {
    return action.coords;
  }
  return state;
};

const shippingType = (state = initialState.shippingType, action) => {
  if (action.type === types.SET_SHIPPING_TYPE) {
    return action.shippingType;
  }
  return state;
};

export const collectionsActions = actions;
export default combineReducers({
  delivery,
  pickup,
  coords,
  shippingType,
});

// @selector
export const getCoords = state => state.collections.coords;
export const getShippingType = state => state.collections.shippingType;
export const getPageInfo = state => {
  const shippingType = getShippingType(state);
  return state.collections[shippingType].pageInfo;
};
const getStoreIds = state => {
  const shippingType = getShippingType(state);
  return state.collections[shippingType].storeIds;
};

export const getCurrentCollection = (state, ownProps) => getCollectionBySlug(state, ownProps.match.params.name);
export const getStoreList = createSelector([getStoreIds, getAllStores], (storeIds, stores) => {
  return storeIds.map(id => stores[id]);
});