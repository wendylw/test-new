import { createSelector } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';

export const getStoreInfo = state => state.menu.address.storeInfo;

export const getErrorCode = state => state.menu.address.errorCode;

export const getStoreInfoData = createSelector(getStoreInfo, storeInfo => storeInfo.data);

export const getHasStoreInfoInitialized = createSelector(getStoreInfo, storeInfo =>
  [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(storeInfo.status)
);
