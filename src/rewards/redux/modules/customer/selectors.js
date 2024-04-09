import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { getDecimalNumber } from '../../../../common/utils';
import { getIsAfterDateTime, getIsMidnight, getReduceOneSecondForDate } from '../../../../utils/datetime-lib';

export const getCustomerData = state => state.customer.loadCustomerRequest.data;

export const getLoadCustomerRequestStatus = state => state.customer.loadCustomerRequest.status;

export const getLoadCustomerRequestError = state => state.customer.loadCustomerRequest.error;

export const getCustomerCashback = createSelector(getCustomerData, customerData =>
  getDecimalNumber(_get(customerData, 'storeCreditInfo.storeCreditsBalance', 0))
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

export const getCustomerTierTotalSpent = createSelector(getCustomerData, customerData =>
  _get(customerData, 'customerTier.totalSpent', null)
);

export const getCustomerTierPointsTotal = createSelector(getCustomerData, customerData =>
  _get(customerData, 'customerTier.pointsTotal', null)
);

export const getCustomerAvailablePointsBalance = createSelector(getCustomerData, customerData =>
  getDecimalNumber(_get(customerData, 'availablePointsBalance', 0))
);

export const getCustomerTierNextReviewTime = createSelector(getCustomerData, customerData =>
  _get(customerData, 'customerTier.nextReviewTime', null)
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

export const getHasUserJoinedMerchantMembership = createSelector(
  getCustomerData,
  customerData => !!_get(customerData, 'customerTier', null)
);

export const getDisplayCashbackExpiredDate = createSelector(getCashbackExpiredDate, cashbackExpiredDate => {
  if (!cashbackExpiredDate) {
    return null;
  }

  const dateObj = new Date(cashbackExpiredDate);
  const isDateMidnight = getIsMidnight(dateObj);

  return isDateMidnight ? getReduceOneSecondForDate(dateObj) : cashbackExpiredDate;
});
