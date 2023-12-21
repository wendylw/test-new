import { createSelector } from 'reselect';
import {
  BECOME_MERCHANT_MEMBER_METHODS,
  PROMO_VOUCHER_DISCOUNT_TYPES,
  PROMO_VOUCHER_STATUS,
} from '../../../../../../common/utils/constants';
import { getQueryString, getPrice } from '../../../../../../common/utils';
import { formatTimeToDateString } from '../../../../../../utils/datetime-lib';
import {
  getMerchantCountryCurrency,
  getMerchantCountryLocale,
  getMerchantCountry,
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
  getMerchantCountryLocale,
  getMerchantCountryCurrency,
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

export const getUniquePromoList = createSelector(
  getMerchantCountryCurrency,
  getMerchantCountryLocale,
  getMerchantCountry,
  getLoadUniquePromoListData,
  (merchantCountryCurrency, merchantCountryLocale, merchantCountry, uniquePromoList) =>
    uniquePromoList.map(promo => {
      if (!promo) {
        return promo;
      }

      const { id, discountType, discountValue, name, validTo, status, minSpendAmount } = promo;

      return {
        id,
        value:
          discountType === PROMO_VOUCHER_DISCOUNT_TYPES.PERCENTAGE
            ? `${discountValue}%`
            : getPrice(discountValue, { locale: merchantCountryLocale, currency: merchantCountryCurrency }),
        name,
        status,
        limitations: [
          minSpendAmount && {
            key: `unique-promo-${id}-limitation-0`,
            i18nKey: 'MinConsumption',
            params: {
              amount: getPrice(minSpendAmount, { locale: merchantCountryLocale, currency: merchantCountryCurrency }),
            },
          },
          validTo && {
            key: `unique-promo-${id}-limitation-1`,
            i18nKey: 'ValidUntil',
            params: { date: formatTimeToDateString(merchantCountry, validTo) },
          },
        ].filter(limitation => Boolean(limitation)),
        isUnavailable: [PROMO_VOUCHER_STATUS.EXPIRED, PROMO_VOUCHER_STATUS.REDEEMED].includes(status),
      };
    })
);
