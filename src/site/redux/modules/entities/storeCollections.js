/* eslint-disable no-use-before-define */
import { combineReducers } from 'redux';
import _get from 'lodash/get';
import { get } from '../../../../utils/request';
import Url from '../../../../utils/url';
import constants, { API_REQUEST_STATUS } from '../../../../utils/constants';
import { getAddressCoords, getAddressCountryCode } from '../../../../redux/modules/address/selectors';

const { COLLECTIONS_TYPE } = constants;

const initialState = {
  pageInfo: {
    SearchOthers: {
      page: 0,
      pageSize: 10,
      hasMore: true,
    },
  },
  currentCollection: {
    data: null,
    status: null,
  },
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

/* eslint-disable */
function getRequestUrl(url, params) {
  const paramsStr = params
    ? '?' +
      Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&')
    : '';
  return `${url}` + paramsStr;
}
/* eslint-enable */

// @actions
const actions = {
  getCurrentCollection: urlPath => (dispatch, getState) => {
    const countryCode = getAddressCountryCode(getState());
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
    const countryCode = getAddressCountryCode(getState()) || 'MY';
    // eslint-disable-next-line no-use-before-define
    const { page, pageSize } = getStorePageInfo(getState());
    const coords = getAddressCoords(getState()) || { lat: 0, lng: 0 };

    const params =
      type === 'SearchOthers'
        ? {
            lat: coords.lat,
            lng: coords.lng,
            countryCode,
            page,
            pagesize: pageSize,
            displayType: type,
          }
        : {
            lat: coords.lat,
            lng: coords.lng,
            countryCode,
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
  const collectionList = _get(action, 'response.collections', {});
  const type = _get(action, 'context.type', '');

  switch (action.type) {
    case types.GET_COLLECTIONS_SUCCESS:
      if (type === 'SearchOthers') {
        return { ...state, SearchOthers: state.SearchOthers.concat(collectionList[type]) };
      }

      return { ...state, [type]: collectionList[type] };
    default:
      return state;
  }
};

const pageInfo = (state = initialState.pageInfo.SearchOthers, action) => {
  if (action.context && action.context.type === 'SearchOthers') {
    const collectionList = _get(action, 'response.collections', {});

    switch (action.type) {
      case types.GET_COLLECTIONS_REQUEST:
        if (action.context.page === 0) {
          return { ...state, page: state.page + 1, hasMore: true };
        }
        return { ...state, page: state.page + 1 };
      case types.GET_COLLECTIONS_SUCCESS:
        // eslint-disable-next-line dot-notation
        if (!collectionList['SearchOthers'] || !collectionList['SearchOthers'].length) {
          return { ...state, hasMore: false };
        }

        // eslint-disable-next-line dot-notation
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
  const { response } = action;

  switch (action.type) {
    case types.GET_CURRENT_COLLECTION_REQUEST:
      return {
        ...state,
        status: API_REQUEST_STATUS.PENDING,
      };
    case types.GET_CURRENT_COLLECTION_SUCCESS:
      return {
        ...state,
        data: response,
        status: API_REQUEST_STATUS.FULFILLED,
      };
    case types.GET_CURRENT_COLLECTION_FAILURE:
      return {
        ...state,
        state: API_REQUEST_STATUS.REJECTED,
      };
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
export const getCurrentCollection = state => state.entities.storeCollections.currentCollection.data;
export const getCurrentCollectionStatus = state => state.entities.storeCollections.currentCollection.status;
export const getOtherCollections = state => getAllStoreCollections(state)[COLLECTIONS_TYPE.OTHERS];
export const getPopupCollections = state => getAllStoreCollections(state)[COLLECTIONS_TYPE.POPULAR];
export const getIconCollections = state => getAllStoreCollections(state)[COLLECTIONS_TYPE.ICON];
export const getBannerCollections = state => getAllStoreCollections(state)[COLLECTIONS_TYPE.BANNER];
export const getCarouselCollections = state => getAllStoreCollections(state)[COLLECTIONS_TYPE.CAROUSEL];
