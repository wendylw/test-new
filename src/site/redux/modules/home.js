import { getDevicePositionInfo } from '../../../utils/geoUtils';
import { getAllStores, storesActionCreators } from './entities/stores';
import { appActionCreators } from './app';
import Url from '../../../utils/url';

import { get } from '../../../utils/request';

const initialState = {
  paginationInfo: {
    page: 0,
    pageSize: 5,
    hasMore: true,
  },
  storeIds: [],
};

const types = {
  GET_STORE_LIST_REQUEST: 'SITE/HOME/GET_STORE_LIST_REQUEST',
  GET_STORE_LIST_SUCCESS: 'SITE/HOME/GET_STORE_LIST_SUCCESS',
  GET_STORE_LIST_FAILURE: 'SITE/HOME/GET_STORE_LIST_FAILURE',
};

const fetchStoreList = ({ coords, page, pageSize }) => ({
  types: [types.GET_STORE_LIST_REQUEST, types.GET_STORE_LIST_SUCCESS, types.GET_STORE_LIST_FAILURE],
  requestPromise: get(
    `${Url.API_URLS.GET_STORE_LIST}?lat=${coords.lat}&lng=${coords.lng}&page=${page}&pageSize=${pageSize}`
  ),
});

// @actions
const actions = {
  setupCurrentLocation: placeInfo => async (dispatch, getState) => {
    // home page provides a placeInfo, which mostly comes from browser history
    if (placeInfo) {
      // save the location directly
      dispatch(appActionCreators.setCurrentPlaceInfo(placeInfo));
    } else {
      // not found? get one from browser
      let placeInfoOfDevice = await getDevicePositionInfo();
      console.log('[redux/home] [setupHomePage] placeInfoOfDevice =>', placeInfoOfDevice);

      if (!placeInfoOfDevice) {
        throw new Error('cannot_get_device_location');
      }

      dispatch(appActionCreators.setCurrentPlaceInfo(placeInfoOfDevice));
    }
  },

  getStoreList: ({ coords, page, pageSize }) => async (dispatch, getState) => {
    const result = await dispatch(fetchStoreList({ coords, page, pageSize }));
    console.log(result.response);
    return await dispatch(storesActionCreators.saveStores(result.response.stores));
  },
};

// @reducers
const reducer = (state = initialState, action) => {
  const { response } = action;

  switch (action.type) {
    case types.GET_STORE_LIST_SUCCESS:
      const { stores } = response;
      const { page, pageSize } = state.paginationInfo;

      if (!stores || !stores.length) {
        return { ...state, paginationInfo: { hasMore: false, page, pageSize } };
      }

      return {
        ...state,
        storeIds: state.storeIds.concat((stores || []).map(store => store.id)),
        paginationInfo: { page: page + 1, pageSize },
      };
    default:
      return state;
  }
};

export const homeActionCreators = actions;
export default reducer;

// @selectors
export const getPaginationInfo = state => state.home.paginationInfo;
export const getAllCurrentStores = state => getAllStores(state);
