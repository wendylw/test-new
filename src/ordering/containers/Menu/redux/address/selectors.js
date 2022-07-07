import { createSelector } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';
import { getAddressList } from '../../../../redux/modules/addressList/selectors';

export { getAddressList };

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
