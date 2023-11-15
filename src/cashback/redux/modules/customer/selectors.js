import _get from 'lodash/get';
import { createSelector } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

export const getCustomer = state => state.customer;

export const getCustomerId = createSelector(getCustomer, customerInfo => _get(customerInfo, 'data.customerId', null));

export const getCustomerCashback = createSelector(getCustomer, customerInfo =>
  _get(customerInfo, 'data.storeCreditsBalance', 0)
);

export const getLoadCustomerRequestStatus = createSelector(getCustomer, customerInfo => customerInfo.status);

export const getLoadCustomerRequestError = createSelector(getCustomer, customerInfo => customerInfo.error);

export const getIsCustomerRequestPending = createSelector(
  getLoadCustomerRequestStatus,
  loadCustomerRequestStatus => loadCustomerRequestStatus === API_REQUEST_STATUS.PENDING
);

export const getIsCustomerRequestCompleted = createSelector(
  getLoadCustomerRequestStatus,
  loadCustomerRequestStatus =>
    loadCustomerRequestStatus === API_REQUEST_STATUS.FULFILLED ||
    loadCustomerRequestStatus === API_REQUEST_STATUS.REJECTED
);
