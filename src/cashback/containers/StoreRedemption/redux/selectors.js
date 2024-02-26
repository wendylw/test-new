import _get from 'lodash/get';
import { createSelector } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { getQueryString } from '../../../../common/utils';
import { getIsMerchantEnabledCashback } from '../../../../redux/modules/merchant/selectors';
import { getCustomerCashback } from '../../../redux/modules/customer/selectors';

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
  getQueryString('isNewCustomer') === 'true' || _get(state.storeRedemption, 'sharedInfoData.isNewCustomer', false);

/**
 *
 * @param {*} state
 * @returns string
 */
export const getConfirmSharingConsumerInfoStatus = state =>
  _get(state.storeRedemption, 'confirmSharingConsumerInfo.status', null);

export const getIsMerchantLogoShown = createSelector(
  getIsMerchantEnabledCashback,
  getCustomerCashback,
  (isMerchantEnabledCashback, customerCashback) => isMerchantEnabledCashback && customerCashback > 0
);

export const getIsRedemptionCashbackEnabled = createSelector(
  getIsStoreRedemptionNewCustomer,
  getIsMerchantLogoShown,
  (isStoreRedemptionNewCustomer, isMerchantLogoShown) => isStoreRedemptionNewCustomer && isMerchantLogoShown
);

export const getIsConfirmSharingConsumerInfoCompleted = createSelector(
  getConfirmSharingConsumerInfoStatus,
  confirmSharingConsumerInfoStatus =>
    confirmSharingConsumerInfoStatus === API_REQUEST_STATUS.FULFILLED ||
    confirmSharingConsumerInfoStatus === API_REQUEST_STATUS.REJECTED
);
