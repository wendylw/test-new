import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { getDecimalNumber, getPrice, getQueryString } from '../../../../common/utils';

export const getClaimCashbackPageHash = () => getQueryString('h');

export const getLoadOrderReceiptNumberData = state => state.claimCashback.loadOrderReceiptNumberRequest.data;

export const geLoadOrderReceiptNumberStatus = state => state.claimCashback.loadOrderReceiptNumberRequest.status;

export const geLoadOrderReceiptNumberError = state => state.claimCashback.loadOrderReceiptNumberRequest.error;

export const getOrderReceiptNumber = createSelector(getLoadOrderReceiptNumberData, loadOrderReceiptNumberData =>
  _get(loadOrderReceiptNumberData, 'receiptNumber', null)
);

export const getLoadOrderCashbackInfoData = state => state.claimCashback.loadOrderCashbackInfoRequest.data;

export const getLoadOrderCashbackInfoStatus = state => state.claimCashback.loadOrderCashbackInfoRequest.status;

export const getLoadOrderCashbackInfoError = state => state.claimCashback.loadOrderCashbackInfoRequest.error;

export const getOrderCashback = createSelector(getLoadOrderCashbackInfoData, loadOrderCashbackInfoData =>
  getDecimalNumber(_get(loadOrderCashbackInfoData, 'cashback', 0))
);

export const getOrderCashbackMerchantCountry = createSelector(getLoadOrderCashbackInfoData, loadOrderCashbackInfoData =>
  _get(loadOrderCashbackInfoData, 'country', '')
);

export const getOrderCashbackMerchantCurrency = createSelector(
  getLoadOrderCashbackInfoData,
  loadOrderCashbackInfoData => _get(loadOrderCashbackInfoData, 'currency', null)
);

export const getOrderCashbackMerchantLocale = createSelector(getLoadOrderCashbackInfoData, loadOrderCashbackInfoData =>
  _get(loadOrderCashbackInfoData, 'locale', null)
);

export const getOrderCashbackStoreCity = createSelector(getLoadOrderCashbackInfoData, loadOrderCashbackInfoData =>
  _get(loadOrderCashbackInfoData, 'store.city', null)
);

export const getClaimedCashbackForCustomerData = state => state.claimCashback.claimedCashbackForCustomerRequest.data;

export const getClaimedCashbackForCustomerStatus = state =>
  state.claimCashback.claimedCashbackForCustomerRequest.status;

export const getClaimedCashbackForCustomerError = state => state.claimCashback.claimedCashbackForCustomerRequest.error;

/**
 * Derived selectors
 */
export const getOrderCashbackPrice = createSelector(
  getOrderCashback,
  getOrderCashbackMerchantLocale,
  getOrderCashbackMerchantCurrency,
  getOrderCashbackMerchantCountry,
  (cashback, locale, currency, country) => getPrice(cashback, { locale, currency, country })
);
