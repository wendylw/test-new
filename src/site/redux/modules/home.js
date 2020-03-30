import { getDevicePositionInfo } from '../../../utils/geoUtils';
import { appActionCreators, getCurrentPlaceInfo } from './app';
import Url from '../../../utils/url';

import { API_REQUEST } from '../../../redux/middlewares/api';

const initialState = {
  pageInfo: {
    page: 0,
    pageSize: 5,
  },
  storeIds: [],
};

const types = {
  GET_STORE_LIST_REQUEST: 'SITE/HOME/GET_STORE_LIST_REQUEST',
  GET_STORE_LIST_SUCCESS: 'SITE/HOME/GET_STORE_LIST_SUCCESS',
  GET_STORE_LIST_FAILURE: 'SITE/HOME/GET_STORE_LIST_FAILURE',
};

const ajaxRequestBusiness = ({ lat, lng, page, pageSize }) => ({
  [API_REQUEST]: {
    types: [types.GET_STORE_LIST_REQUEST, types.GET_STORE_LIST_SUCCESS, types.GET_STORE_LIST_FAILURE],
    ...Url.API_URLS.GET_STORE_LIST,
    params: { lat, lng, page, pageSize },
  },
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

  getStoreList: ({ coords, page, pageSize }) => (dispatch, getState) => {
    dispatch(ajaxRequestBusiness({ ...coords, page, pageSize }));
  },
};

// @reducers

const reducer = (state = initialState, action) => {};

export const homeActionCreators = actions;
export default reducer;

// @selectors
export const getPageInfo = state => getPlaceById(state, state.home.pageInfo);
