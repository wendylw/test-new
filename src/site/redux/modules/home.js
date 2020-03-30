import { getDevicePositionInfo } from '../../../utils/geoUtils';
import { appActionCreators, getCurrentPlaceInfo } from './app';

const initialState = {
  storeIds: [],
};

const types = {
  GET_STORE_LIST_REQUEST: 'SITE/HOME/GET_STORE_LIST_REQUEST',
  GET_STORE_LIST_SUCCESS: 'SITE/HOME/GET_STORE_LIST_SUCCESS',
  GET_STORE_LIST_FAILURE: 'SITE/HOME/GET_STORE_LIST_FAILURE',
};

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

    // fetch store list
    console.log('[redux/home] [setupHomePage] fetch store list');
  },
  getStoreList: pageInfo => (dispatch, getState) => {},
};

// @reducers

const reducer = (state = initialState, action) => {};

export const homeActionCreators = actions;
export default reducer;

// @selectors
