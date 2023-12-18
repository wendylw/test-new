import { createSelector } from 'reselect';
import { BECOME_MERCHANT_MEMBER_METHODS } from '../../../../../../common/utils/constants';
import { getQueryString, getPrice } from '../../../../../../common/utils';
import {
  getMerchantCurrency,
  getMerchantLocale,
  getIsMerchantEnabledDelivery,
  getIsMerchantEnabledOROrdering,
} from '../../../../../redux/modules/merchant/selectors';
import { getCustomerCashback } from '../../../../../redux/modules/customer/selectors';

export const getSource = () => getQueryString('source');

export const getLoadPromoListData = state => state.business.membershipDetail.loadUniquePromoListRequest.data;

export const getLoadPromoListStatus = state => state.business.membershipDetail.loadUniquePromoListRequest.status;

export const getLoadPromoListError = state => state.business.membershipDetail.loadUniquePromoListRequest.error;

/**
 * Derived selectors
 */
export const getCustomerCashbackPrice = createSelector(
  getCustomerCashback,
  getMerchantLocale,
  getMerchantCurrency,
  (cashback, locale, currency) => getPrice(cashback, { locale, currency })
);

export const getIsFromEarnedCashbackQRScan = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.EARNED_CASHBACK_QR_SCAN
);

export const getIsOrderAndRedeemButtonDisplay = createSelector(
  getIsMerchantEnabledOROrdering,
  getIsMerchantEnabledDelivery,
  (isOROrderingEnabled, isDeliveryEnabled) => isOROrderingEnabled || isDeliveryEnabled
);

// getIsReturningMember => TODO: pending confirming member is returning query && not from earned cashback QR scan
