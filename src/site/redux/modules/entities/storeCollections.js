import { get } from '../../../../utils/request';
import Url from '../../../../utils/url';
import { getCurrentPlaceInfo } from '../app';
import { getCountryCodeByPlaceInfo } from '../../../../utils/geoUtils';

const initialState = {};

// @types
const types = {
  GET_COLLECTIONS_REQUEST: 'SITE/ENTITIES/GET_COLLECTIONS_REQUEST',
  GET_COLLECTIONS_SUCCESS: 'SITE/ENTITIES/GET_COLLECTIONS_SUCCESS',
  GET_COLLECTIONS_FAILURE: 'SITE/ENTITIES/GET_COLLECTIONS_FAILURE',
};

// @actions
const actions = {
  getCollections: () => (dispatch, getState) => {
    const currentPlaceInfo = getCurrentPlaceInfo(getState()) || {};
    const countryCode = getCountryCodeByPlaceInfo(currentPlaceInfo);
    const { coords } = currentPlaceInfo;
    return dispatch({
      types: [types.GET_COLLECTIONS_REQUEST, types.GET_COLLECTIONS_SUCCESS, types.GET_COLLECTIONS_FAILURE],
      requestPromise: get(
        `${Url.API_URLS.GET_COLLECTIONS.url}?lat=${coords.lat}&lng=${coords.lng}&countryCode=${countryCode}&displayType=Icon`
      ),
    });
  },
};

// @reducers
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.GET_COLLECTIONS_SUCCESS:
      let collectionIds = {};
      const { collections } = action.response;
      collections['Icon'].forEach(collection => {
        const { urlPath } = collection;
        Object.assign(collectionIds, {
          [urlPath]: collection,
        });
      });
      return collectionIds;
    default:
      return state;
  }
};
export const collectionCardActionCreators = actions;
export default reducer;

// @selector
export const getAllStoreCollections = state => state.entities.storeCollections;
export const getCollectionByPath = (state, urlPath) => getAllStoreCollections(state)[urlPath] || null;
