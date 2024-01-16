import _get from 'lodash/get';
import { createSelector } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { getPrice, getDecimalNumber } from '../../../../common/utils';
import {
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
} from '../../../../redux/modules/merchant/selectors';

export const getCustomer = state => state.customer;

export const getCustomerId = createSelector(getCustomer, customerInfo => _get(customerInfo, 'data.customerId', null));

export const getCustomerCashback = createSelector(getCustomer, customerInfo =>
  getDecimalNumber(_get(customerInfo, 'data.storeCreditInfo.storeCreditsBalance', 0))
);

export const getLoadCustomerRequestStatus = createSelector(getCustomer, customerInfo => customerInfo.status);

export const getLoadCustomerRequestError = createSelector(getCustomer, customerInfo => customerInfo.error);

export const getIsLoadCustomerRequestPending = createSelector(
  getLoadCustomerRequestStatus,
  loadCustomerRequestStatus => loadCustomerRequestStatus === API_REQUEST_STATUS.PENDING
);

export const getIsLoadCustomerRequestCompleted = createSelector(
  getLoadCustomerRequestStatus,
  loadCustomerRequestStatus =>
    loadCustomerRequestStatus === API_REQUEST_STATUS.FULFILLED ||
    loadCustomerRequestStatus === API_REQUEST_STATUS.REJECTED
);

export const getCustomerCashbackPrice = createSelector(
  getCustomerCashback,
  getMerchantLocale,
  getMerchantCurrency,
  getMerchantCountry,
  (cashback, locale, currency, country) => getPrice(cashback, { locale, currency, country })
);
