import _get from 'lodash/get';
import { createSelector } from '@reduxjs/toolkit';
import {
  getOnlineStoreInfo,
  getIsCoreBusinessLoaded,
  getIsLoadCoreBusinessFailed,
  getIsCoreBusinessEnableCashback,
  getIsConsumerCustomerLoaded,
  getIsLoadConsumerCustomerFailed,
  getUserStoreCashback,
  getIsOnlineStoreInfoLoaded,
  getIsLoadOnlineStoreInfoFailed,
} from '../../../redux/modules/app';

/**
 *
 * @param {*} state
 * @returns string
 */
export const getStoreRedemptionRequestId = state => _get(state.storeRedemption, 'requestId', '');

/**
 * get store logo
 * @param {*} state
 * @returns store log
 */
export const getStoreLogo = createSelector(getOnlineStoreInfo, onlineStoreInfo => _get(onlineStoreInfo, 'logo', null));

/**
 * get store display title
 * @param {*} state
 * @returns store display title
 */
export const getStoreDisplayTitle = createSelector(getOnlineStoreInfo, onlineStoreInfo => {
  const storeBrandName = _get(onlineStoreInfo, 'beepBrandName', '');
  const onlineStoreName = _get(onlineStoreInfo, 'storeName', '');

  return storeBrandName || onlineStoreName;
});

export const getIsDisplayStoreRedemptionContent = createSelector(
  getIsCoreBusinessLoaded,
  getIsLoadCoreBusinessFailed,
  getIsCoreBusinessEnableCashback,
  getUserStoreCashback,
  (isCoreBusinessLoaded, isLoadCoreBusinessFailed, isCoreBusinessEnableCashback, userStoreCashback) =>
    (isCoreBusinessLoaded || isLoadCoreBusinessFailed) && isCoreBusinessEnableCashback && userStoreCashback > 0
);

export const getIsDisplayStoreRedemptionAlert = createSelector(
  getIsOnlineStoreInfoLoaded,
  getIsLoadOnlineStoreInfoFailed,
  getIsCoreBusinessLoaded,
  getIsLoadCoreBusinessFailed,
  getIsConsumerCustomerLoaded,
  getIsLoadConsumerCustomerFailed,
  (
    isOnlineStoreInfoLoaded,
    isLoadOnlineStoreInfoFailed,
    isCoreBusinessLoaded,
    isLoadCoreBusinessFailed,
    isConsumerCustomerLoaded,
    isLoadConsumerCustomerFailed
  ) =>
    (isOnlineStoreInfoLoaded || isLoadOnlineStoreInfoFailed) &&
    (isCoreBusinessLoaded || isLoadCoreBusinessFailed) &&
    (isConsumerCustomerLoaded || isLoadConsumerCustomerFailed)
);
