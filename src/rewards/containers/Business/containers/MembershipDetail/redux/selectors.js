import { createSelector } from 'reselect';
import {
  BECOME_MERCHANT_MEMBER_METHODS,
  PROMO_VOUCHER_DISCOUNT_TYPES,
  PROMO_VOUCHER_STATUS,
} from '../../../../../../common/utils/constants';
import { getQueryString, getPrice } from '../../../../../../common/utils';
import { formatTime } from '../../../../../../utils/time-lib';
import {
  getMerchantCurrency,
  getMerchantLocale,
  getIsMerchantEnabledDelivery,
  getIsMerchantEnabledOROrdering,
} from '../../../../../redux/modules/merchant/selectors';
import { getCustomerCashback } from '../../../../../redux/modules/customer/selectors';

export const getSource = () => getQueryString('source');

export const getLoadUniquePromoListData = state =>
  state.business.membershipDetail.loadUniquePromoListRequest.data || [];

export const getLoadUniquePromoListStatus = state => state.business.membershipDetail.loadUniquePromoListRequest.status;

export const getLoadUniquePromoListError = state => state.business.membershipDetail.loadUniquePromoListRequest.error;

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

export const getUniquePromoList = createSelector(
  getMerchantCurrency,
  getMerchantLocale,
  getLoadUniquePromoListData,
  (merchantCurrency, merchantLocale, uniquePromoList) =>
    uniquePromoList.map(promo => {
      if (!promo) {
        return promo;
      }

      const { id, discountType, discountValue, name, validTo, status } = promo;

      return {
        id,
        value:
          discountType === PROMO_VOUCHER_DISCOUNT_TYPES.PERCENTAGE
            ? `${discountValue}%`
            : getPrice(discountValue, { locale: merchantLocale, currency: merchantCurrency }),
        name,
        status,
        limitations: [
          {
            key: `unique-promo-${id}-limitation-0`,
            i18nKey: 'MinConsumption',
            // TODO: add amount
            // params: {amount: getPrice(, { locale: merchantLocale, currency: merchantCurrency })},
          },
          {
            key: `unique-promo-${id}-limitation-1`,
            i18nKey: 'ValidUntil',
            params: { date: formatTime(validTo, 'MMMM D, YYYY') },
          },
        ],
        isUnavailable: [PROMO_VOUCHER_STATUS.EXPIRED, PROMO_VOUCHER_STATUS.REDEEMED].includes(status),
      };
    })
);
