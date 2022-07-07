import { createSelector } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';

export const getStoreInfo = state => state.menu.address.storeInfo;

export const getErrorToast = state => state.menu.address.errorToast.data;

export const getStoreInfoData = createSelector(getStoreInfo, storeInfo => storeInfo.data);

export const getHasStoreInfoInitialized = createSelector(
  getStoreInfo,
  storeInfo => storeInfo.status === API_REQUEST_STATUS.PENDING
);
