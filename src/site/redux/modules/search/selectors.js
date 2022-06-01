import { createSelector } from '@reduxjs/toolkit';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import { getStoreById } from '../entities/stores';
import { getFilterOptionSearchParams, getHasAnyCategorySelected } from '../filter/selectors';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { getPopupCollections, getOtherCollections } from '../entities/storeCollections';
import { getAddressCoords, getAddressCountryCode } from '../../../../redux/modules/address/selectors';

export const getStoreListInfoRequestStatus = state => state.search.storeListInfo.status;

export const getSearchInfo = state => state.search.searchInfo.data;

export const getPageInfo = state => state.search.pageInfo.data;

export const getShippingType = state => state.search.shippingType.data;

export const getStoreList = state => state.search.storeListInfo.data.storeIds.map(id => getStoreById(state, id));

export const getSearchKeyword = createSelector(getSearchInfo, searchInfo => searchInfo.keyword);

export const getSearchResults = createSelector(getSearchInfo, searchInfo => searchInfo.results);

export const getShouldLoadStoreList = createSelector(getPageInfo, getShippingType, (pageInfo, shippingType) => {
  const { loading, hasMore } = pageInfo;
  // We need to avoid sending the search API when the shipping type hasn't been set yet
  return !!shippingType && !loading && hasMore;
});

export const getSearchStoreParams = createSelector(
  getPageInfo,
  getShippingType,
  getSearchKeyword,
  getAddressCoords,
  getAddressCountryCode,
  getFilterOptionSearchParams,
  (pageInfo, shippingType, keyword, addressCoords, countryCode, filterParams) => {
    const { page, pageSize } = pageInfo;
    const lat = _get(addressCoords, 'lat', 0);
    const lng = _get(addressCoords, 'lng', 0);
    return `keyword=${keyword}&lat=${lat}&lng=${lng}&page=${page}&pageSize=${pageSize}&shippingType=${shippingType}&countryCode=${countryCode}&${filterParams}`;
  }
);

export const getIsSearchInfoKeywordEmpty = createSelector(getSearchInfo, searchInfo => _isEmpty(searchInfo.keyword));

export const getIsAnyCollectionAvailable = createSelector(
  getPopupCollections,
  getOtherCollections,
  (popularCollections, otherCollections) => !_isEmpty(popularCollections.concat(otherCollections))
);

export const getShouldShowCategories = createSelector(
  getIsSearchInfoKeywordEmpty,
  getIsAnyCollectionAvailable,
  (isKeywordEmpty, isAnyCollectionAvailable) => isKeywordEmpty && isAnyCollectionAvailable
);

export const getShouldShowFilterBar = createSelector(
  getIsSearchInfoKeywordEmpty,
  getIsAnyCollectionAvailable,
  (isKeywordEmpty, isAnyCollectionAvailable) => !(isKeywordEmpty && isAnyCollectionAvailable)
);

export const getShouldShowStartSearchPage = createSelector(
  getIsSearchInfoKeywordEmpty,
  getIsAnyCollectionAvailable,
  (isKeywordEmpty, isAnyCollectionAvailable) => isKeywordEmpty && !isAnyCollectionAvailable
);

export const getShouldShowNoSearchResultPage = createSelector(
  getStoreList,
  getIsSearchInfoKeywordEmpty,
  (stores, isKeywordEmpty) => _isEmpty(stores) && !isKeywordEmpty
);

export const getShouldShowStoreList = createSelector(
  getStoreList,
  getIsSearchInfoKeywordEmpty,
  (stores, isKeywordEmpty) => !(_isEmpty(stores) || isKeywordEmpty)
);

export const getHasLoadStoreListRequestCompleted = createSelector(getStoreListInfoRequestStatus, requestStatus =>
  [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(requestStatus)
);

export const getShouldShowStoreListLoader = createSelector(
  getIsSearchInfoKeywordEmpty,
  getHasLoadStoreListRequestCompleted,
  (isKeywordEmpty, hasLoadStoreListRequestCompleted) => !isKeywordEmpty && !hasLoadStoreListRequestCompleted
);

export const getShouldShowNoFilteredResultPage = createSelector(
  getStoreList,
  getHasAnyCategorySelected,
  getHasLoadStoreListRequestCompleted,
  (stores, hasAnyCategorySelected, hasRequestCompleted) =>
    _isEmpty(stores) && hasRequestCompleted && hasAnyCategorySelected
);
