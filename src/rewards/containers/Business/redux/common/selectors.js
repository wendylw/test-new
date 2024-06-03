import _get from 'lodash/get';
import { createSelector } from 'reselect';
import {
  API_REQUEST_STATUS,
  CLAIM_CASHBACK_QUERY_NAMES,
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

export const getLoadUniquePromoListBannersData = state =>
  state.business.common.loadUniquePromoListBannersRequest.data || [];

export const getLoadUniquePromoListBannersStatus = state =>
  state.business.common.loadUniquePromoListBannersRequest.status;

export const getLoadUniquePromoListBannersError = state =>
  state.business.common.loadUniquePromoListBannersRequest.error;

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

export const getCustomerCashbackPriceWithoutCurrency = createSelector(
  getCustomerCashback,
  getMerchantLocale,
  getMerchantCurrency,
  getMerchantCountry,
  (cashback, locale, currency, country) => getPrice(cashback, { locale, currency, country, withCurrency: false })
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
  getOrderReceiptClaimedCashbackValue,
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
  (claimedCashbackValue, merchantCountry, merchantCurrency, merchantLocale) =>
    getPrice(claimedCashbackValue, { locale: merchantLocale, currency: merchantCurrency, country: merchantCountry })
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
      const diffDays = getDifferenceTodayInDays(new Date(validTo));
      const remainingExpiredDays = diffDays > -8 && diffDays <= 0 ? Math.floor(Math.abs(diffDays)) : null;
      const isTodayExpired = remainingExpiredDays === 0;

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
        conditions: {
          minSpend: minSpendAmount && {
            value: minSpendAmount,
            i18nKey: 'MinSpend',
            params: {
              amount: getPrice(minSpendAmount, {
                locale: merchantLocale,
                currency: merchantCurrency,
                country: merchantCountry,
              }),
            },
          },
          expiringDays: typeof remainingExpiredDays === 'number' && {
            value: remainingExpiredDays,
            i18nKey: isTodayExpired ? 'ExpiringToday' : 'ExpiringInDays',
            params: !isTodayExpired && { remainingExpiredDays },
          },
        },
        isUnavailable: [PROMO_VOUCHER_STATUS.EXPIRED, PROMO_VOUCHER_STATUS.REDEEMED].includes(status),
      };
    })
);

export const getUniquePromoListLength = createSelector(getUniquePromoList, uniquePromoList => uniquePromoList.length);

export const getIsLoadUniquePromoListCompleted = createSelector(
  getLoadUniquePromoListStatus,
  loadUniquePromoListStatus =>
    [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(loadUniquePromoListStatus)
);

export const getIsUniquePromoListEmpty = createSelector(
  getUniquePromoList,
  getIsLoadUniquePromoListCompleted,
  (uniquePromoList, isLoadUniquePromoListCompleted) => uniquePromoList.length === 0 && isLoadUniquePromoListCompleted
);

export const getUniquePromoListBanners = createSelector(
  getMerchantCurrency,
  getMerchantLocale,
  getMerchantCountry,
  getLoadUniquePromoListBannersData,
  (merchantCurrency, merchantLocale, merchantCountry, uniquePromoListBanners) =>
    uniquePromoListBanners.map(promo => {
      if (!promo) {
        return promo;
      }

      const { id, discountType, discountValue, name, validTo, status, minSpendAmount } = promo;
      const diffDays = getDifferenceTodayInDays(new Date(validTo));
      const remainingExpiredDays = diffDays > -8 && diffDays <= 0 ? Math.floor(Math.abs(diffDays)) : null;
      const isTodayExpired = remainingExpiredDays === 0;

      return {
        id,
        value:
          discountType === PROMO_VOUCHER_DISCOUNT_TYPES.PERCENTAGE
            ? `${discountValue}%`
            : getPrice(discountValue, { locale: merchantLocale, currency: merchantCurrency, country: merchantCountry }),
        name,
        status,
        conditions: {
          minSpend: minSpendAmount && {
            value: minSpendAmount,
            i18nKey: 'MinSpend',
            params: {
              amount: getPrice(minSpendAmount, {
                locale: merchantLocale,
                currency: merchantCurrency,
                country: merchantCountry,
              }),
            },
          },
          expiringDays: typeof remainingExpiredDays === 'number' && {
            value: remainingExpiredDays,
            i18nKey: isTodayExpired ? 'ExpiringToday' : 'ExpiringInDays',
            params: !isTodayExpired && { remainingExpiredDays },
          },
        },
        isUnavailable: [PROMO_VOUCHER_STATUS.EXPIRED, PROMO_VOUCHER_STATUS.REDEEMED].includes(status),
      };
    })
);

export const getIsLoadUniquePromoListBannersCompleted = createSelector(
  getLoadUniquePromoListBannersStatus,
  loadUniquePromoListBannersStatus =>
    [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(loadUniquePromoListBannersStatus)
);

export const getIsUniquePromoListBannersEmpty = createSelector(
  getUniquePromoListBanners,
  getIsLoadUniquePromoListBannersCompleted,
  (uniquePromoListBanners, isLoadUniquePromoListBannersCompleted) =>
    uniquePromoListBanners.length === 0 && isLoadUniquePromoListBannersCompleted
);
