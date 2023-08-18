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
  getIsUserLogin,
} from '../../../redux/modules/app';

/**
 * get store redemption request id
 * @param {*} state
 * @returns string
 */
export const getStoreRedemptionRequestId = state => _get(state.storeRedemption, 'requestId', null);

/**
 * get store redemption is new customer
 * @param {*} state
 * @returns boolean | null
 */
export const getIsStoreRedemptionNewCustomer = state =>
  _get(state.storeRedemption, 'sharedInfoData.isNewCustomer', false);

/**
 * get consumer share info available status
 * @param {*} state
 * @returns boolean
 */
export const getIsAvailableToShareConsumerInfo = createSelector(
  getStoreRedemptionRequestId,
  getIsUserLogin,
  (storeRedemptionRequestId, isUserLogin) => storeRedemptionRequestId && isUserLogin
);

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

export const getIsLoadStoreRedemptionDataCompleted = createSelector(
  getIsCoreBusinessLoaded,
  getIsLoadCoreBusinessFailed,
  getIsConsumerCustomerLoaded,
  getIsLoadConsumerCustomerFailed,
  getIsOnlineStoreInfoLoaded,
  getIsLoadOnlineStoreInfoFailed,
  (
    isCoreBusinessLoaded,
    isLoadCoreBusinessFailed,
    isConsumerCustomerLoaded,
    isLoadConsumerCustomerFailed,
    isOnlineStoreInfoLoaded,
    isLoadOnlineStoreInfoFailed
  ) =>
    (isCoreBusinessLoaded || isLoadCoreBusinessFailed) &&
    (isConsumerCustomerLoaded || isLoadConsumerCustomerFailed) &&
    (isOnlineStoreInfoLoaded || isLoadOnlineStoreInfoFailed)
);

export const getIsDisplayStoreRedemptionContent = createSelector(
  getIsLoadStoreRedemptionDataCompleted,
  getIsCoreBusinessEnableCashback,
  getUserStoreCashback,
  (isLoadStoreRedemptionDataCompleted, isCoreBusinessEnableCashback, userStoreCashback) =>
    isLoadStoreRedemptionDataCompleted && isCoreBusinessEnableCashback && userStoreCashback > 0
);

export const getIsDisplayStoreRedemptionAlert = createSelector(
  getIsLoadStoreRedemptionDataCompleted,
  isLoadStoreRedemptionDataCompleted => isLoadStoreRedemptionDataCompleted
);
