import _get from 'lodash/get';
import { createSelector } from 'reselect';
import {
  CLAIM_CASHBACK_QUERY_NAMES,
  CLAIM_CASHBACK_TYPES,
  PROMO_VOUCHER_DISCOUNT_TYPES,
  PROMO_VOUCHER_STATUS,
} from '../../../../../common/utils/constants';
import { getPrice, getQueryString } from '../../../../../common/utils';
import { getDifferenceTodayInDays, formatTimeToDateString } from '../../../../../utils/datetime-lib';
import { getIsJoinMembershipNewMember } from '../../../../../redux/modules/membership/selectors';
import {
  getMerchantLocale,
  getMerchantCurrency,
  getMerchantCountry,
} from '../../../../../redux/modules/merchant/selectors';
import {
  getCustomerCashback,
  getCashbackExpiredDate,
  getIsCashbackExpired,
} from '../../../../redux/modules/customer/selectors';

export const getOrderReceiptClaimedCashbackStatus = () => getQueryString(CLAIM_CASHBACK_QUERY_NAMES.STATUS);

export const getOrderReceiptClaimedCashbackType = () => getQueryString(CLAIM_CASHBACK_QUERY_NAMES.CASHBACK_TYPE);

export const getOrderReceiptClaimedCashbackValue = () => getQueryString(CLAIM_CASHBACK_QUERY_NAMES.VALUE);

export const getIsClaimedOrderCashbackNewMember = () => getQueryString('isNewMember') === 'true';

export const getConfirmSharingConsumerInfoData = state => state.business.common.confirmSharingConsumerInfoRequest.data;

export const getConfirmSharingConsumerInfoStatus = state =>
  state.business.common.confirmSharingConsumerInfoRequest.status;

export const getConfirmSharingConsumerInfoError = state =>
  state.business.common.confirmSharingConsumerInfoRequest.error;

export const getIsConfirmSharingNewCustomer = createSelector(
  getConfirmSharingConsumerInfoData,
  confirmSharingConsumerInfoData => _get(confirmSharingConsumerInfoData, 'isNewCustomer', false)
);

export const getIsConfirmSharingNewMember = createSelector(
  getConfirmSharingConsumerInfoData,
  confirmSharingConsumerInfoData => _get(confirmSharingConsumerInfoData, 'joinMembershipResult.isNewMember', false)
);

export const getLoadUniquePromoListData = state => state.business.common.loadUniquePromoListRequest.data || [];

export const getLoadUniquePromoListStatus = state => state.business.common.loadUniquePromoListRequest.status;

export const getLoadUniquePromoListError = state => state.business.common.loadUniquePromoListRequest.error;

/**
 * Derived selectors
 */
export const getIsNewMember = createSelector(
  getIsJoinMembershipNewMember,
  getIsConfirmSharingNewMember,
  getIsClaimedOrderCashbackNewMember,
  (isJoinMembershipNewMember, isConfirmSharingNewMember, isClaimedOrderCashbackNewMember) =>
    isJoinMembershipNewMember || isConfirmSharingNewMember || isClaimedOrderCashbackNewMember
);

export const getCustomerCashbackPrice = createSelector(
  getCustomerCashback,
  getMerchantLocale,
  getMerchantCurrency,
  getMerchantCountry,
  (cashback, locale, currency, country) => getPrice(cashback, { locale, currency, country })
);

export const getRemainingCashbackExpiredDays = createSelector(
  getCashbackExpiredDate,
  getIsCashbackExpired,
  (cashbackExpiredDate, isCashbackExpired) => {
    if (!cashbackExpiredDate || isCashbackExpired) {
      return null;
    }

    const days = getDifferenceTodayInDays(new Date(cashbackExpiredDate));

    return days > -8 && days <= 0 ? Math.floor(Math.abs(days)) : null;
  }
);

export const getIsTodayExpired = createSelector(
  getRemainingCashbackExpiredDays,
  remainingCashbackExpiredDays => remainingCashbackExpiredDays === 0
);

export const getIsExpiringTagShown = createSelector(
  getRemainingCashbackExpiredDays,
  remainingCashbackExpiredDays => remainingCashbackExpiredDays !== null
);

export const getOrderReceiptClaimedCashback = createSelector(
  getOrderReceiptClaimedCashbackType,
  getOrderReceiptClaimedCashbackValue,
  (claimedCashbackType, claimedCashbackValue) => {
    if (claimedCashbackType === CLAIM_CASHBACK_TYPES.PERCENTAGE) {
      return `${claimedCashbackValue}%`;
    }

    if (claimedCashbackType === CLAIM_CASHBACK_TYPES.ABSOLUTE) {
      return decodeURIComponent(claimedCashbackValue);
    }

    return '';
  }
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
