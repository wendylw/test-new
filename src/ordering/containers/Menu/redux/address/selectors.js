import { createSelector } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';
import { getUserIsLogin } from '../../../../redux/modules/app';
import { getAddressList, getAddressListInitialized } from '../../../../redux/modules/addressList/selectors';

export { getAddressListInitialized };

export const getAddressListInfo = createSelector(getAddressList, addressList =>
  addressList.map(({ _id, availableStatus, ...othersOptions }) => ({
    id: _id,
    outOfRange: !availableStatus,
    ...othersOptions,
  }))
);

export const getStoreInfo = state => state.menu.address.storeInfo;

export const getErrorToast = state => state.menu.address.errorToast.data;

export const getStoreInfoData = createSelector(getStoreInfo, storeInfo => storeInfo.data);

export const getHasStoreInfoInitialized = createSelector(
  getStoreInfo,
  storeInfo => storeInfo.status !== API_REQUEST_STATUS.PENDING
);

/**
 *  get enabled loading address list status
 * */
export const getEnableToLoadAddressList = createSelector(
  getUserIsLogin,
  getAddressListInitialized,
  (enableToLoadAddressList, addressListInitialized) => enableToLoadAddressList && !addressListInitialized
);
