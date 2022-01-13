import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../utils/constants';
import { getIsLoginRequestInPending, getIsPingRequestDone } from '../../redux/modules/app';

export const getStatus = state => state.orderHistory.status;

export const getOrderHistoryList = state => Object.values(state.orderHistory.data);

export const getOrderDataLength = createSelector(getOrderHistoryList, data => data.length);

export const getPage = state => state.orderHistory.page;

export const getPageSize = state => state.orderHistory.pageSize;

export const getHasMore = state => state.orderHistory.hasMore;

export const getIsRequestOrderDataDone = createSelector(
  getStatus,
  status => status === API_REQUEST_STATUS.FULFILLED || status === API_REQUEST_STATUS.REJECTED
);

export const getIsRequestOrderDataInPending = createSelector(
  getStatus,
  status => status === API_REQUEST_STATUS.PENDING
);

export const getPageLoaderVisibility = createSelector(
  getIsLoginRequestInPending,
  getIsPingRequestDone,
  getIsRequestOrderDataInPending,
  getOrderDataLength,
  (isLoginRequestInPending, isPingRequestDone, isRequestOrderDataInPending, orderDataLength) => {
    if (isLoginRequestInPending || !isPingRequestDone) {
      return true;
    }

    if (isRequestOrderDataInPending && orderDataLength === 0) {
      return true;
    }

    return false;
  }
);
