import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

export const getLocationHistoryList = state => state.locations.listInfo.data;

export const getLocationHistoryListInitialized = state =>
  [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(state.locations.listInfo.status);
