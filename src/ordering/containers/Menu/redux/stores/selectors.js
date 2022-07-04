import { createSelector } from '@reduxjs/toolkit';
import { getShippingType } from '../../../../redux/modules/app';
import Constants from '../../../../../utils/constants';

const { API_REQUEST_STATUS, DELIVERY_METHOD } = Constants;

export const getStoreListInfo = state => state.menu.stores.storeListInfo;

export const getHasStoreListInitialized = createSelector(
  getStoreListInfo,
  storeListInfo => storeListInfo.status === API_REQUEST_STATUS.PENDING
);

export const getStoreList = createSelector(getStoreListInfo, storeList => storeList.data);

export const getTotalOutletDisplayTitle = createSelector(getStoreList, getShippingType, (storeList, shippingType) => {
  const numOfStores = storeList.length;
  return shippingType === DELIVERY_METHOD.DELIVERY ? `${numOfStores} outlets near you` : `Total ${numOfStores} outlets`;
});
