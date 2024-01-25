import { createSelector } from 'reselect';
import {
  BECOME_MERCHANT_MEMBER_METHODS,
  PROMO_VOUCHER_DISCOUNT_TYPES,
  PROMO_VOUCHER_STATUS,
} from '../../../../../../common/utils/constants';
import { getPrice } from '../../../../../../common/utils';
import { formatTimeToDateString } from '../../../../../../utils/datetime-lib';
import { NEW_MEMBER_TYPES, RETURNING_MEMBER_TYPES } from '../utils/constants';
import { getSource } from '../../../redux/common/selectors';
import {
  getMerchantCurrency,
  getMerchantLocale,
  getMerchantCountry,
  getIsMerchantEnabledCashback,
  getIsMerchantEnabledDelivery,
  getIsMerchantEnabledOROrdering,
} from '../../../../../redux/modules/merchant/selectors';
import {
  getCustomerCashback,
  getIsLoadCustomerRequestCompleted,
} from '../../../../../redux/modules/customer/selectors';

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
  getMerchantCountry,
  (cashback, locale, currency, country) => getPrice(cashback, { locale, currency, country })
);

export const getIsFromEarnedCashbackQRScan = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.EARNED_CASHBACK_QR_SCAN
);

export const getIsFromJoinMembershipUrlClick = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.JOIN_MEMBERSHIP_URL_CLICK
);

export const getIsFromSeamlessLoyaltyQrScan = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.SEAMLESS_LOYALTY_QR_SCAN
);

export const getIsOrderAndRedeemButtonDisplay = createSelector(
  getIsMerchantEnabledOROrdering,
  getIsMerchantEnabledDelivery,
  (isOROrderingEnabled, isDeliveryEnabled) => isOROrderingEnabled && isDeliveryEnabled
);

export const getUniquePromoList = createSelector(
  getMerchantCurrency,
  getMerchantLocale,
  getMerchantCountry,
  getLoadUniquePromoListData,
  (merchantCurrency, merchantLocale, merchantCountry, uniquePromoList) =>
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
            : getPrice(discountValue, { locale: merchantLocale, currency: merchantCurrency, country: merchantCountry }),
        name,
        status,
        limitations: [
          minSpendAmount && {
            key: `unique-promo-${id}-limitation-0`,
            i18nKey: 'MinConsumption',
            params: {
              amount: getPrice(minSpendAmount, {
                locale: merchantLocale,
                currency: merchantCurrency,
                country: merchantCountry,
              }),
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

export const getNewMemberPromptCategory = createSelector(
  getIsLoadCustomerRequestCompleted,
  getCustomerCashback,
  getIsMerchantEnabledCashback,
  getIsFromJoinMembershipUrlClick,
  getIsFromSeamlessLoyaltyQrScan,
  (
    isLoadCustomerRequestCompleted,
    customerCashback,
    isMerchantEnabledCashback,
    isFromJoinMembershipUrlClick,
    isFromSeamlessLoyaltyQrScan
  ) => {
    if (isFromJoinMembershipUrlClick) {
      return NEW_MEMBER_TYPES.DEFAULT;
    }

    if (isFromSeamlessLoyaltyQrScan && isLoadCustomerRequestCompleted) {
      return isMerchantEnabledCashback && customerCashback > 0
        ? NEW_MEMBER_TYPES.REDEEM_CASHBACK
        : NEW_MEMBER_TYPES.DEFAULT;
    }

    return null;
  }
);

export const getReturningMemberPromptCategory = createSelector(
  getIsLoadCustomerRequestCompleted,
  getCustomerCashback,
  getIsMerchantEnabledCashback,
  getIsFromJoinMembershipUrlClick,
  getIsFromSeamlessLoyaltyQrScan,
  (
    isLoadCustomerRequestCompleted,
    customerCashback,
    isMerchantEnabledCashback,
    isFromJoinMembershipUrlClick,
    isFromSeamlessLoyaltyQrScan
  ) => {
    if (isFromJoinMembershipUrlClick) {
      return RETURNING_MEMBER_TYPES.DEFAULT;
    }

    if (isFromSeamlessLoyaltyQrScan && isLoadCustomerRequestCompleted) {
      return isMerchantEnabledCashback && customerCashback > 0
        ? RETURNING_MEMBER_TYPES.REDEEM_CASHBACK
        : RETURNING_MEMBER_TYPES.THANKS_COMING_BACK;
    }

    return null;
  }
);
