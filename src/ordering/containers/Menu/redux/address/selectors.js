import { createSelector } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../common/utils/constants';
import { getUserIsLogin, getDeliveryRadius } from '../../../../redux/modules/app';
import { getAddressList, getAddressListInitialized } from '../../../../redux/modules/addressList/selectors';
import {
  getLocationHistoryList,
  getLocationHistoryListInitialized,
} from '../../../../redux/modules/locations/selectors';

export { getAddressListInitialized, getLocationHistoryListInitialized };

export const getStoreInfo = state => state.menu.address.storeInfo;

export const getErrorCode = state => state.menu.address.errorCode;

export const getErrorOptions = createSelector(getDeliveryRadius, deliveryRadius =>
  deliveryRadius ? { distance: deliveryRadius } : {}
);

export const getStoreInfoData = createSelector(getStoreInfo, storeInfo => storeInfo.data);

export const getHasStoreInfoInitialized = createSelector(getStoreInfo, storeInfo =>
  [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(storeInfo.status)
);

/**
 *  get loading address list status
 * */
export const getIsLoadableAddressList = createSelector(
  getUserIsLogin,
  getAddressListInitialized,
  (userSignedIn, addressListInitialized) => userSignedIn && !addressListInitialized
);

/**
 *  get address list
 * */
export const getAddressListInfo = createSelector(getAddressList, addressList =>
  addressList.map(({ _id, availableStatus, ...othersOptions }) => ({
    id: _id,
    outOfRange: !availableStatus,
    ...othersOptions,
  }))
);

/**
 *  get location history list
 * */
export const getLocationHistoryListInfo = createSelector(getLocationHistoryList, location =>
  location.map(({ availableStatus, ...othersOptions }) => ({
    outOfRange: !availableStatus,
    ...othersOptions,
  }))
);

export const getIsAddressListVisible = createSelector(
  getUserIsLogin,
  getAddressList,
  (userSignedIn, addressList) => userSignedIn && addressList.length > 0
);

export const getIsLocationHistoryListVisible = createSelector(
  getUserIsLogin,
  getAddressList,
  getLocationHistoryList,
  (userSignedIn, addressList, locationHistoryList) =>
    (userSignedIn && addressList.length <= 0 && locationHistoryList.length > 0) ||
    (!userSignedIn && locationHistoryList.length > 0)
);
