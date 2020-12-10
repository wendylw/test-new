import { get } from '../../../../utils/request';
import Url from '../../../../utils/url';
import { getCurrentPlaceInfo } from '../app';
import { getCountryCodeByPlaceInfo } from '../../../../utils/geoUtils';
import { combineReducers } from 'redux';
import constants from '../../../../utils/constants';

const { COLLECTIONS_TYPE } = constants;

const initialState = {
  pageInfo: {
    SearchOthers: {
      page: 0,
      pageSize: 10,
      hasMore: true,
    },
  },
  currentCollection: {},
  collections: {
    Icon: [],
    SearchOthers: [],
    SearchPopular: [],
  },
};

// @types
const types = {
  GET_COLLECTIONS_REQUEST: 'SITE/ENTITIES/GET_COLLECTIONS_REQUEST',
  GET_COLLECTIONS_SUCCESS: 'SITE/ENTITIES/GET_COLLECTIONS_SUCCESS',
  GET_COLLECTIONS_FAILURE: 'SITE/ENTITIES/GET_COLLECTIONS_FAILURE',

  GET_CURRENT_COLLECTION_REQUEST: 'SITE/ENTITIES/GET_CURRENT_COLLECTION_REQUEST',
  GET_CURRENT_COLLECTION_SUCCESS: 'SITE/ENTITIES/GET_CURRENT_COLLECTION_SUCCESS',
  GET_CURRENT_COLLECTION_FAILURE: 'SITE/ENTITIES/GET_CURRENT_COLLECTION_FAILURE',
};

function getRequestUrl(url, params) {
  const paramsStr = params
    ? '?' +
      Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&')
    : '';
  return `${url}` + paramsStr;
}

// @actions
const actions = {
  getCurrentCollection: urlPath => (dispatch, getState) => {
    const currentPlaceInfo = getCurrentPlaceInfo(getState()) || {};
    const countryCode = getCountryCodeByPlaceInfo(currentPlaceInfo);
    return dispatch({
      types: [
        types.GET_CURRENT_COLLECTION_REQUEST,
        types.GET_CURRENT_COLLECTION_SUCCESS,
        types.GET_CURRENT_COLLECTION_FAILURE,
      ],
      requestPromise: get(`${Url.API_URLS.GET_COLLECTION.url}?countryCode=${countryCode}&urlPath=${urlPath}`),
    });
  },
  getCollections: type => (dispatch, getState) => {
    const currentPlaceInfo = getCurrentPlaceInfo(getState()) || {};
    const countryCode = getCountryCodeByPlaceInfo(currentPlaceInfo);
    const { page, pageSize } = getStorePageInfo(getState());
    const { coords } = currentPlaceInfo;

    const params =
      type === 'SearchOthers'
        ? {
            lat: coords.lat,
            lng: coords.lng,
            countryCode: countryCode,
            page: page,
            pagesize: pageSize,
            displayType: type,
          }
        : {
            lat: coords.lat,
            lng: coords.lng,
            countryCode: countryCode,
            displayType: type,
          };
    const requestUrl = getRequestUrl(Url.API_URLS.GET_COLLECTIONS.url, params);
    return dispatch({
      types: [types.GET_COLLECTIONS_REQUEST, types.GET_COLLECTIONS_SUCCESS, types.GET_COLLECTIONS_FAILURE],
      context: { type, page, pageSize },
      requestPromise: get(requestUrl),
    });
  },
};

// @reducers
const collections = (state = initialState.collections, action) => {
  switch (action.type) {
    case types.GET_COLLECTIONS_SUCCESS:
      const { collections } = action.response;
      const { type } = action.context;

      if (type === 'SearchOthers') {
        return { ...state, SearchOthers: state.SearchOthers.concat(collections[type]) };
      } else {
        return { ...state, [type]: collections[type] };
      }

    default:
      return state;
  }
};

const pageInfo = (state = initialState.pageInfo.SearchOthers, action) => {
  if (action.context && action.context.type === 'SearchOthers') {
    switch (action.type) {
      case types.GET_COLLECTIONS_REQUEST:
        const newState = { ...state, page: state.page + 1 };
        if (action.context.page === 0) {
          Object.assign(newState, { hasMore: true });
        }
        return { ...newState };
      case types.GET_COLLECTIONS_SUCCESS:
        const { collections } = action.response;

        if (!collections['SearchOthers'] || !collections['SearchOthers'].length) {
          return { ...state, hasMore: false };
        }

        if (state.pageSize > collections['SearchOthers'].length) {
          return { ...state, hasMore: false };
        }

        return state;
      default:
        return state;
    }
  }
  return state;
};

const currentCollection = (state = initialState.currentCollection, action) => {
  switch (action.type) {
    case types.GET_CURRENT_COLLECTION_SUCCESS:
      const { response } = action;
      return response;
    default:
      return state;
  }
};

export const collectionCardActionCreators = actions;
export default combineReducers({
  collections,
  pageInfo,
  currentCollection,
});

// @selector
export const getAllStoreCollections = state => state.entities.storeCollections.collections;
export const getStorePageInfo = state => state.entities.storeCollections.pageInfo;
export const getCurrentCollection = state => state.entities.storeCollections.currentCollection;
export const getOtherCollections = state => getAllStoreCollections(state)[COLLECTIONS_TYPE.OTHERS];
export const getPopupCollections = state => getAllStoreCollections(state)[COLLECTIONS_TYPE.POPULAR];
export const getIconCollections = state => getAllStoreCollections(state)[COLLECTIONS_TYPE.ICON];
export const getBannerCollections = state => getAllStoreCollections(state)[COLLECTIONS_TYPE.BANNER];
export const getCarouselCollections = state => getAllStoreCollections(state)[COLLECTIONS_TYPE.CAROUSEL];
