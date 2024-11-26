import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import { createSelector } from 'reselect';
import {
  API_REQUEST_STATUS,
  CLAIM_CASHBACK_QUERY_NAMES,
  PROMO_VOUCHER_STATUS,
} from '../../../../../common/utils/constants';
import { getPrice, getQueryString } from '../../../../../common/utils';
import { getDifferenceTodayInDays, formatTimeToDateString } from '../../../../../utils/datetime-lib';
import {
  getFormatDiscountValue,
  getRemainingRewardExpiredDays,
  getExpiringDaysI18n,
} from '../../../../../common/utils/rewards';
import { getIsJoinMembershipNewMember } from '../../../../../redux/modules/membership/selectors';
import {
  getMerchantLocale,
  getMerchantCurrency,
  getMerchantCountry,
  getIsMerchantEnabledCashback,
  getIsMerchantMembershipPointsEnabled,
} from '../../../../../redux/modules/merchant/selectors';
import {
  getLoadOrderRewardsRequestStatus,
  getOrderRewardsPoints,
  getOrderRewardsCashback,
  getClaimOrderRewardsCashbackValue,
  getIsClaimOrderRewardsIsNewMember,
} from '../../../../../redux/modules/transaction/selectors';
import {
  getCustomerCashback,
  getCashbackExpiredDate,
  getIsCashbackExpired,
  getCustomerAvailablePointsBalance,
} from '../../../../redux/modules/customer/selectors';

export const getStoreId = () => getQueryString('storeId');

// BE prevent users from manually changing the URL to obtain point and cashback, using base64 encryption
export const getReceiptNumber = () => {
  const receiptNumber = getQueryString('receiptNumber');

  if (_isEmpty(receiptNumber)) {
    return null;
  }

  return window.atob(receiptNumber);
};

export const getChannel = () => getQueryString('channel');

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

export const getLoadPointsRewardListData = state => state.business.common.loadPointsRewardListRequest.data || [];

export const getLoadPointsRewardListStatus = state => state.business.common.loadPointsRewardListRequest.status;

export const getLoadPointsRewardListError = state => state.business.common.loadPointsRewardListRequest.error;

export const getLoadCustomizeRewardsSettingsRequestData = state =>
  state.business.common.loadCustomizeRewardsSettingsRequest.data;

export const getLoadCustomizeRewardsSettingsRequestStatus = state =>
  state.business.common.loadCustomizeRewardsSettingsRequest.status;

export const getLoadCustomizeRewardsSettingsRequestError = state =>
  state.business.common.loadCustomizeRewardsSettingsRequest.error;

export const getCustomizeRewardsSettingsCashbackRate = createSelector(
  getLoadCustomizeRewardsSettingsRequestData,
  loadCustomizeRewardsSettingsRequestData => _get(loadCustomizeRewardsSettingsRequestData, 'cashbackRate', 0)
);

export const getCustomizeRewardsSettingsLoyaltyRate = createSelector(
  getLoadCustomizeRewardsSettingsRequestData,
  loadCustomizeRewardsSettingsRequestData => _get(loadCustomizeRewardsSettingsRequestData, 'loyaltyRate', 0)
);

export const getCustomizeRewardsSettingsPointsRate = createSelector(
  getLoadCustomizeRewardsSettingsRequestData,
  loadCustomizeRewardsSettingsRequestData => _get(loadCustomizeRewardsSettingsRequestData, 'pointRate', 0)
);

/**
 * Derived selectors
 */
export const getIsNewMember = createSelector(
  getIsJoinMembershipNewMember,
  getIsConfirmSharingNewMember,
  getIsClaimedOrderCashbackNewMember,
  getIsClaimOrderRewardsIsNewMember,
  (
    isJoinMembershipNewMember,
    isConfirmSharingNewMember,
    isClaimedOrderCashbackNewMember,
    isClaimOrderRewardsIsNewMember
  ) =>
    isJoinMembershipNewMember ||
    isConfirmSharingNewMember ||
    isClaimedOrderCashbackNewMember ||
    isClaimOrderRewardsIsNewMember
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

      const { id, uniquePromotionCodeId, discountType, discountValue, name, validTo, status, minSpendAmount } = promo;
      const remainingExpiredDays = getRemainingRewardExpiredDays(validTo);

      return {
        id,
        uniquePromotionCodeId,
        key: `${id}-${uniquePromotionCodeId}-${discountType}`,
        value: getFormatDiscountValue(discountType, discountValue, {
          locale: merchantLocale,
          currency: merchantCurrency,
          country: merchantCountry,
        }),
        name,
        status,
        minSpend: minSpendAmount && {
          i18nKey: 'MinConsumption',
          params: {
            amount: getPrice(minSpendAmount, {
              locale: merchantLocale,
              currency: merchantCurrency,
              country: merchantCountry,
            }),
          },
        },
        expiringDate: validTo && {
          i18nKey: 'ValidUntil',
          params: { date: formatTimeToDateString(merchantCountry, validTo) },
        },
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
          expiringDays: getExpiringDaysI18n(remainingExpiredDays),
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

      const { id, uniquePromotionCodeId, discountType, discountValue, name, validTo, status, minSpendAmount } = promo;
      const diffDays = getDifferenceTodayInDays(new Date(validTo));
      const remainingExpiredDays = diffDays > -8 && diffDays <= 0 ? Math.floor(Math.abs(diffDays)) : null;

      return {
        id,
        key: `${id}-${uniquePromotionCodeId}-${discountType}`,
        value: getFormatDiscountValue(discountType, discountValue, {
          locale: merchantLocale,
          currency: merchantCurrency,
          country: merchantCountry,
        }),
        name,
        status,
        conditions: {
          minSpend: !!minSpendAmount && {
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
          expiringDays: getExpiringDaysI18n(remainingExpiredDays),
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

// Points Rewards
export const getPointsRewardList = createSelector(
  getLoadPointsRewardListData,
  getCustomerAvailablePointsBalance,
  (pointsRewardList, customerAvailablePointsBalance) =>
    pointsRewardList.map(reward => {
      const { id, type, name, redeemedStatus, costOfPoints, rewardSettingId } = reward;
      const isUnavailableStatus = [PROMO_VOUCHER_STATUS.EXPIRED, PROMO_VOUCHER_STATUS.REDEEMED].includes(
        redeemedStatus
      );
      const isInsufficientPoints = customerAvailablePointsBalance < costOfPoints;

      return {
        id,
        type,
        name,
        costOfPoints,
        rewardSettingId,
        isSoldOut: redeemedStatus === PROMO_VOUCHER_STATUS.REDEEMED,
        isExpired: redeemedStatus === PROMO_VOUCHER_STATUS.EXPIRED,
        isUnavailable: isUnavailableStatus || isInsufficientPoints,
      };
    })
);

export const getIsPointsRewardListShown = createSelector(
  getIsMerchantMembershipPointsEnabled,
  getPointsRewardList,
  (isMerchantMembershipPointsEnabled, pointsRewardList) =>
    isMerchantMembershipPointsEnabled && pointsRewardList.length > 0
);

export const getIsLoadOrderRewardsRequestFulfilled = createSelector(
  getLoadOrderRewardsRequestStatus,
  loadOrderRewardsRequestStatus => loadOrderRewardsRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsLoadOrderRewardsRequestCompleted = createSelector(
  getLoadOrderRewardsRequestStatus,
  loadOrderRewardsRequestStatus =>
    [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(loadOrderRewardsRequestStatus)
);

export const getIsRequestOrderRewardsEnabled = createSelector(
  getReceiptNumber,
  getIsMerchantEnabledCashback,
  getIsMerchantMembershipPointsEnabled,
  (receiptNumber, isMerchantEnabledCashback, isMerchantMembershipPointsEnabled) =>
    receiptNumber && (isMerchantEnabledCashback || isMerchantMembershipPointsEnabled)
);

export const getIsClaimedOrderRewardsEnabled = createSelector(
  getIsRequestOrderRewardsEnabled,
  getOrderRewardsPoints,
  getOrderRewardsCashback,
  (isRequestOrderRewardsEnabled, orderRewardsPoints, orderRewardsCashback) =>
    isRequestOrderRewardsEnabled && (orderRewardsPoints > 0 || orderRewardsCashback > 0)
);

export const getClaimOrderRewardsCashbackPrice = createSelector(
  getClaimOrderRewardsCashbackValue,
  getMerchantLocale,
  getMerchantCurrency,
  getMerchantCountry,
  (claimOrderRewardsCashbackValue, locale, currency, country) =>
    getPrice(claimOrderRewardsCashbackValue, { locale, currency, country })
);
