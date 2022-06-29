import { createSelector } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';

export const getStoreInfo = state => state.menu.address.storeInfo;

export const getDrawerInfo = state => state.menu.address.drawerInfo;

export const getHasStoreInfoInitialized = createSelector(
  getStoreInfo,
  storeInfo => storeInfo.status === API_REQUEST_STATUS.PENDING
);

export const getDrawerError = createSelector(getDrawerInfo, drawerInfo => drawerInfo.error);
