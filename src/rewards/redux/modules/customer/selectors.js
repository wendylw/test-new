import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { getIsAfterDateTime } from '../../../../utils/datetime-lib';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

export const getCustomerData = state => state.customer.loadCustomerRequest.data;

export const getLoadCustomerRequestStatus = state => state.customer.loadCustomerRequest.status;

export const getLoadCustomerRequestError = state => state.customer.loadCustomerRequest.error;

export const getCustomerCashback = createSelector(getCustomerData, customerData =>
  _get(customerData, 'storeCreditInfo.storeCreditsBalance', 0)
);

export const getCashbackExpiredDate = createSelector(getCustomerData, customerData =>
  _get(customerData, 'storeCreditInfo.cashbackExpirationDate', null)
);

export const getCustomerTier = createSelector(getCustomerData, customerData =>
  _get(customerData, 'customerTier', null)
);

export const getCustomerTierLevel = createSelector(getCustomerData, customerData =>
  _get(customerData, 'customerTier.level', null)
);

export const getCustomerTierLevelName = createSelector(getCustomerData, customerData =>
  _get(customerData, 'customerTier.name', null)
);

/**
 * Derived selectors
 */
export const getIsCashbackExpired = createSelector(
  getCashbackExpiredDate,
  cashbackExpiredDate => cashbackExpiredDate && getIsAfterDateTime(new Date(), new Date(cashbackExpiredDate))
);

export const getIsLoadCustomerRequestCompleted = createSelector(
  getLoadCustomerRequestStatus,
  loadCustomerRequestStatus =>
    [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(loadCustomerRequestStatus)
);

export const getHasUserJoinedMerchantMembership = createSelector(getCustomerTier, customerTier => !!customerTier);