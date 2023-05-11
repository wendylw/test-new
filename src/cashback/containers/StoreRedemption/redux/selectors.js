import _get from 'lodash/get';
import { createSelector } from '@reduxjs/toolkit';
import { getOnlineStoreInfo, getUserStoreCashback } from '../../../redux/modules/app';

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
  getUserStoreCashback,
  userStoreCashback => userStoreCashback
);
