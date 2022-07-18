import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

export const getLocationHistoryList = state => state.locations.locationList;

export const getLocationOfDevice = state => state.locations.locationOfDevice;

export const getLocationHistoryListInitialized = state =>
  [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(state.locations.loadLocationListStatus);
