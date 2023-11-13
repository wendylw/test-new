import _get from 'lodash/get';
import { createSelector } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';

export const getCustomer = state => state.customer;

export const getCustomerId = createSelector(getCustomer, customerInfo => _get(customerInfo, 'data.customerId', null));

export const getCustomerCashback = createSelector(getCustomer, customerInfo =>
  _get(customerInfo, 'data.storeCreditsBalance', 0)
);

export const getCustomerRequestStatus = createSelector(getCustomer, customerInfo => customerInfo.status);

export const getCustomerError = createSelector(getCustomer, customerInfo => customerInfo.error);

export const getIsCustomerRequestPending = createSelector(
  getCustomerRequestStatus,
  customerRequestStatus => customerRequestStatus === API_REQUEST_STATUS.PENDING
);

export const getIsCustomerRequestCompleted = createSelector(
  getCustomerRequestStatus,
  customerRequestStatus =>
    customerRequestStatus === API_REQUEST_STATUS.FULFILLED || customerRequestStatus === API_REQUEST_STATUS.REJECTED
);
