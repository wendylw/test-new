import { createSelector } from 'reselect';
import i18next from 'i18next';
import { PROMO_VOUCHER_STATUS } from '../../../../../../common/utils/constants';
import {
  REWARDS_APPLIED_SOURCES,
  REWARDS_APPLIED_ALL_STORES,
  REWARD_APPLY_TO_LIMITS_CONDITIONS,
} from '../../../../../../common/utils/rewards/constants';
import { getQueryString, getPrice } from '../../../../../../common/utils';
import { formatTimeToDateString } from '../../../../../../utils/datetime-lib';
import {
  getFormatDiscountValue,
  getRemainingRewardExpiredDays,
  getExpiringDaysI18n,
} from '../../../../../../common/utils/rewards';
import {
  getRewardDetailDiscountValue,
  getRewardDetailDiscountType,
  getRewardDetailValidTo,
  getRewardDetailMinSpendAmount,
  getRewardDetailStatus,
  getRewardDetailProductLimits,
  getRewardDetailLimitsConditions,
  getRewardDetailLimitsAppliedStores,
  getRewardDetailLimitsAppliedSources,
} from '../../../../../../redux/modules/rewards/selectors';
import { getMerchantCountry, getBusinessCurrency, getBusinessLocale } from '../../../../../redux/modules/app';

export const getRewardId = () => getQueryString('id');

export const getRewardUniquePromotionCodeId = () => getQueryString('up_id');

export const getRewardType = () => getQueryString('up_type');

/**
 * Derived selectors
 */
export const getRewardFormatDiscountValue = createSelector(
  getRewardDetailDiscountValue,
  getRewardDetailDiscountType,
  getMerchantCountry,
  getBusinessCurrency,
  getBusinessLocale,
  (rewardDetailDiscountValue, rewardDetailDiscountType, merchantCountry, businessCurrency, businessLocale) =>
    getFormatDiscountValue(rewardDetailDiscountType, rewardDetailDiscountValue, {
      country: merchantCountry,
      currency: businessCurrency,
      locale: businessLocale,
    })
);

export const getRewardLimitations = createSelector(
  getRewardDetailValidTo,
  getRewardDetailMinSpendAmount,
  getMerchantCountry,
  getBusinessCurrency,
  getBusinessLocale,
  (rewardDetailValidTo, rewardDetailMinSpendAmount, merchantCountry, businessCurrency, businessLocale) => {
    const limitations = [];

    if (rewardDetailMinSpendAmount) {
      limitations.push({
        key: 'rewardDetail-minConsumption',
        i18nKey: 'MinConsumption',
        params: {
          amount: getPrice(rewardDetailMinSpendAmount, {
            country: merchantCountry,
            currency: businessCurrency,
            locale: businessLocale,
          }),
        },
      });
    }

    if (rewardDetailValidTo) {
      limitations.push({
        key: 'rewardDetail-expiringDate',
        i18nKey: 'PromoValidUntil',
        params: { date: formatTimeToDateString(merchantCountry, rewardDetailValidTo) },
      });
    }

    return limitations;
  }
);

export const getIsRewardDetailUnAvailable = createSelector(getRewardDetailStatus, rewardDetailStatus =>
  [PROMO_VOUCHER_STATUS.EXPIRED, PROMO_VOUCHER_STATUS.REDEEMED].includes(rewardDetailStatus)
);

export const getRewardDetailExpiringDaysI18n = createSelector(getRewardDetailValidTo, rewardDetailValidTo => {
  const remainingRewardExpiredDays = getRemainingRewardExpiredDays(rewardDetailValidTo);

  return getExpiringDaysI18n(remainingRewardExpiredDays);
});

export const getRewardDetailFormatAppliedProductsText = createSelector(
  getRewardDetailProductLimits,
  getRewardDetailLimitsConditions,
  (rewardDetailProductLimits, rewardDetailLimitsConditions) => {
    const applyLimitedProducts = rewardDetailLimitsConditions.filter(
      ({ entity, propertyName }) =>
        entity === REWARD_APPLY_TO_LIMITS_CONDITIONS.ENTITY.PRODUCT &&
        [
          REWARD_APPLY_TO_LIMITS_CONDITIONS.PROPERTY_NAME.CATEGORY,
          REWARD_APPLY_TO_LIMITS_CONDITIONS.PROPERTY_NAME.TAGS,
          REWARD_APPLY_TO_LIMITS_CONDITIONS.PROPERTY_NAME.ID,
        ].includes(propertyName)
    );

    if (!rewardDetailProductLimits) {
      return null;
    }

    if (rewardDetailProductLimits.length === 0 && applyLimitedProducts.length === 0) {
      return i18next.t('OrderingPromotion:RewardDetailAllProductsText');
    }

    return i18next.t('OrderingPromotion:RewardDetailSelectedProductsText');
  }
);

export const getRewardDetailFormatAppliedStoresText = createSelector(
  getRewardDetailLimitsAppliedStores,
  rewardDetailLimitsAppliedStores => {
    if (!rewardDetailLimitsAppliedStores) {
      return null;
    }

    const isAllStoresApplied = rewardDetailLimitsAppliedStores.includes(REWARDS_APPLIED_ALL_STORES);

    if (isAllStoresApplied) {
      return i18next.t('OrderingPromotion:RewardDetailAllStoresText');
    }

    return i18next.t('OrderingPromotion:RewardDetailSelectedStoresText');
  }
);

export const getRewardDetailRedeemOnlineList = createSelector(
  getRewardDetailLimitsAppliedSources,
  rewardDetailLimitsAppliedSources =>
    rewardDetailLimitsAppliedSources.filter(source => source !== REWARDS_APPLIED_SOURCES.POS)
);

export const getIsRewardDetailRedeemOnlineShow = createSelector(
  getRewardDetailRedeemOnlineList,
  rewardDetailRedeemOnlineList => rewardDetailRedeemOnlineList.length > 0
);

export const getIsRewardDetailRedeemInStoreShow = createSelector(
  getRewardDetailLimitsAppliedSources,
  rewardDetailLimitsAppliedSources => rewardDetailLimitsAppliedSources.includes(REWARDS_APPLIED_SOURCES.POS)
);

export const getRewardDetailContentList = createSelector(
  getRewardDetailFormatAppliedProductsText,
  getRewardDetailFormatAppliedStoresText,
  getRewardDetailRedeemOnlineList,
  getIsRewardDetailRedeemOnlineShow,
  getIsRewardDetailRedeemInStoreShow,
  (
    rewardDetailFormatAppliedProductsText,
    rewardDetailFormatAppliedStoresText,
    rewardDetailRedeemOnlineList,
    isRewardDetailRedeemOnlineShow,
    isRewardDetailRedeemInStoreShow
  ) => {
    const contentList = [];

    if (rewardDetailFormatAppliedProductsText) {
      contentList.push({
        title: i18next.t('OrderingPromotion:RewardDetailApplicableProductsTitle'),
        titleDescription: rewardDetailFormatAppliedProductsText,
      });
    }

    if (rewardDetailFormatAppliedStoresText) {
      contentList.push({
        title: i18next.t('OrderingPromotion:RewardDetailApplicableStoresTitle'),
        titleDescription: rewardDetailFormatAppliedStoresText,
      });
    }

    const articleContentList = [];

    if (isRewardDetailRedeemOnlineShow) {
      articleContentList.push({
        subtitle: i18next.t('OrderingPromotion:RewardDetailRedeemOnlineTitle'),
        description: i18next.t('OrderingPromotion:RewardDetailRedeemOnlineDescription'),
        rewardDetailRedeemOnlineList,
      });
    }

    if (isRewardDetailRedeemInStoreShow) {
      articleContentList.push({
        subtitle: i18next.t('OrderingPromotion:RewardDetailRedeemInStoreTitle'),
        description: i18next.t('OrderingPromotion:RewardDetailRedeemInStoreDescription'),
      });
    }

    contentList.push({
      title: i18next.t('OrderingPromotion:HowToUse'),
      articleContentList,
    });

    return contentList;
  }
);
