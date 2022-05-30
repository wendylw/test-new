import { createSelector } from '@reduxjs/toolkit';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import { getAllStores } from '../entities/stores';
import { getFilterOptionSearchParams, getHasAnyCategorySelected } from '../filter/selectors';
import { getCurrentCollectionStatus } from '../entities/storeCollections';
import { getAddressCoords, getAddressCountryCode } from '../../../../redux/modules/address/selectors';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

export const getStoreListInfoRequestStatus = state => state.collections.storeListInfo.status;

export const getStoreListInfo = state => state.collections.storeListInfo.data;

export const getStoreIds = createSelector(getStoreListInfo, storeListInfo => storeListInfo.storeIds);

export const getPageInfo = state => state.collections.pageInfo.data;

export const getShippingType = state => state.collections.shippingType.data;

export const getStoreList = createSelector([getStoreIds, getAllStores], (storeIds, stores) =>
  storeIds.map(id => stores[id])
);

export const getShouldLoadStoreList = createSelector(getPageInfo, getShippingType, (pageInfo, shippingType) => {
  const { loading, hasMore } = pageInfo;
  // We need to avoid sending the search API when the shipping type hasn't been set yet
  return !!shippingType && !loading && hasMore;
});

export const getSearchStoreParams = createSelector(
  getPageInfo,
  getShippingType,
  getAddressCoords,
  getAddressCountryCode,
  getFilterOptionSearchParams,
  (pageInfo, shippingType, addressCoords, countryCode, filterParams) => {
    const { page, pageSize } = pageInfo;
    const lat = _get(addressCoords, 'lat', 0);
    const lng = _get(addressCoords, 'lng', 0);
    return `lat=${lat}&lng=${lng}&page=${page}&pageSize=${pageSize}&shippingType=${shippingType}&countryCode=${countryCode}&${filterParams}`;
  }
);

// Only show page loader for initialization under 2 conditions:
// 1. Request status is null (means haven't request yet)
// 2. Data is null and the request status is still pending (means the first response haven't come back yet)
// 3. Data is not null and the request status is still pending (means users came from other pages)
export const getShouldShowPageLoader = createSelector(
  getCurrentCollectionStatus,
  requestStatus => !requestStatus || requestStatus === API_REQUEST_STATUS.PENDING
);

export const getHasLoadStoreListRequestCompleted = createSelector(getStoreListInfoRequestStatus, requestStatus =>
  [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(requestStatus)
);

// Show loading indicator every time FE sends a search store request
export const getShouldShowStoreListLoader = createSelector(
  getHasLoadStoreListRequestCompleted,
  hasRequestCompleted => !hasRequestCompleted
);

export const getShouldShowNoFilteredResultPage = createSelector(
  getStoreList,
  getHasAnyCategorySelected,
  getHasLoadStoreListRequestCompleted,
  (stores, hasAnyCategorySelected, hasRequestCompleted) =>
    _isEmpty(stores) && hasRequestCompleted && hasAnyCategorySelected
);
