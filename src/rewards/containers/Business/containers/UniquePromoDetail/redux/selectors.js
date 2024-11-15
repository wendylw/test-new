import _get from 'lodash/get';
import i18next from 'i18next';
import { createSelector } from 'reselect';
import { PROMO_VOUCHER_STATUS } from '../../../../../../common/utils/constants';
import { REWARDS_APPLIED_ALL_STORES, REWARDS_APPLIED_SOURCES } from '../../../utils/constants';
import { getPrice, getQueryString } from '../../../../../../common/utils';
import { formatTimeToDateString } from '../../../../../../utils/datetime-lib';
import { getFormatDiscountValue, getRemainingRewardExpiredDays, getExpiringDaysI18n } from '../../../utils/rewards';
import {
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
} from '../../../../../../redux/modules/merchant/selectors';

export const getUniquePromoId = () => getQueryString('id');

export const getUniquePromoUniquePromotionCodeId = () => getQueryString('uniquePromotionCodeId');

export const getLoadUniquePromoDetailData = state => state.business.uniquePromoDetail.loadUniquePromoDetailRequest.data;

export const getLoadUniquePromoDetailStatus = state =>
  state.business.uniquePromoDetail.loadUniquePromoDetailRequest.status;

export const getLoadUniquePromoDetailError = state =>
  state.business.uniquePromoDetail.loadUniquePromoDetailRequest.error;

export const getUniquePromoValidTo = createSelector(getLoadUniquePromoDetailData, loadUniquePromoDetailData =>
  _get(loadUniquePromoDetailData, 'validTo', null)
);

export const getUniquePromoMinSpendAmount = createSelector(getLoadUniquePromoDetailData, loadUniquePromoDetailData =>
  _get(loadUniquePromoDetailData, 'minSpendAmount', 0)
);

export const getUniquePromoStatus = createSelector(getLoadUniquePromoDetailData, loadUniquePromoDetailData =>
  _get(loadUniquePromoDetailData, 'status', null)
);

export const getUniquePromoPromotionName = createSelector(getLoadUniquePromoDetailData, loadUniquePromoDetailData =>
  _get(loadUniquePromoDetailData, 'promotion.name', null)
);

export const getUniquePromoDiscountInfo = createSelector(getLoadUniquePromoDetailData, loadUniquePromoDetailData =>
  _get(loadUniquePromoDetailData, 'promotion.discountInfo', {})
);

export const getUniquePromoDiscountValue = createSelector(getUniquePromoDiscountInfo, uniquePromoDiscountInfo =>
  _get(uniquePromoDiscountInfo, 'discountValue', 0)
);

export const getUniquePromoDiscountType = createSelector(getUniquePromoDiscountInfo, uniquePromoDiscountInfo =>
  _get(uniquePromoDiscountInfo, 'discountType', 0)
);

export const getUniquePromoProductLimits = createSelector(getLoadUniquePromoDetailData, loadUniquePromoDetailData =>
  _get(loadUniquePromoDetailData, 'promotion.productsLimits', {})
);

export const getUniquePromoStoresLimits = createSelector(getLoadUniquePromoDetailData, loadUniquePromoDetailData =>
  _get(loadUniquePromoDetailData, 'promotion.storesLimits', {})
);

export const getUniquePromoLimitsAppliedStores = createSelector(getUniquePromoStoresLimits, uniquePromoStoresLimits =>
  _get(uniquePromoStoresLimits, 'appliedStores', [])
);

export const getUniquePromoGeneralLimits = createSelector(getLoadUniquePromoDetailData, loadUniquePromoDetailData =>
  _get(loadUniquePromoDetailData, 'promotion.generalLimits', {})
);

export const getUniquePromoLimitsAppliedSources = createSelector(
  getUniquePromoGeneralLimits,
  uniquePromoGeneralLimits => _get(uniquePromoGeneralLimits, 'appliedSources', [])
);

/**
 * Derived selectors
 */
export const getUniquePromoFormatDiscountValue = createSelector(
  getUniquePromoDiscountValue,
  getUniquePromoDiscountType,
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
  (uniquePromoDiscountValue, uniquePromoDiscountType, merchantCountry, merchantCurrency, merchantLocale) =>
    getFormatDiscountValue(uniquePromoDiscountType, uniquePromoDiscountValue, {
      country: merchantCountry,
      currency: merchantCurrency,
      locale: merchantLocale,
    })
);

export const getUniquePromoLimitations = createSelector(
  getUniquePromoValidTo,
  getUniquePromoMinSpendAmount,
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
  (uniquePromoValidTo, uniquePromoMinSpendAmount, merchantCountry, merchantCurrency, merchantLocale) => {
    const limitations = [];

    if (uniquePromoMinSpendAmount) {
      limitations.push({
        key: 'uniquePromoDetail-minConsumption',
        i18nKey: 'MinConsumption',
        params: {
          amount: getPrice(uniquePromoMinSpendAmount, {
            country: merchantCountry,
            currency: merchantCurrency,
            locale: merchantLocale,
          }),
        },
      });
    }

    if (uniquePromoValidTo) {
      limitations.push({
        key: 'uniquePromoDetail-expiringDate',
        i18nKey: 'ValidUntil',
        params: { date: formatTimeToDateString(merchantCountry, uniquePromoValidTo) },
      });
    }

    return limitations;
  }
);

export const getIsUniquePromoUnAvailable = createSelector(getUniquePromoStatus, uniquePromoStatus =>
  [PROMO_VOUCHER_STATUS.EXPIRED, PROMO_VOUCHER_STATUS.REDEEMED].includes(uniquePromoStatus)
);

export const getUniquePromoExpiringDaysI18n = createSelector(getUniquePromoValidTo, uniquePromoValidTo => {
  const remainingRewardExpiredDays = getRemainingRewardExpiredDays(uniquePromoValidTo);

  return getExpiringDaysI18n(remainingRewardExpiredDays);
});

export const getUniquePromoFormatAppliedProductsText = createSelector(
  getUniquePromoProductLimits,
  uniquePromoProductLimits => {
    if (!uniquePromoProductLimits) {
      return null;
    }

    if (uniquePromoProductLimits.length === 0) {
      return i18next.t('Rewards:UniquePromoAllProductsText');
    }

    return i18next.t('Rewards:UniquePromoSelectedProductsText');
  }
);

export const getUniquePromoFormatAppliedStoresText = createSelector(
  getUniquePromoLimitsAppliedStores,
  uniquePromoLimitsAppliedStores => {
    if (!uniquePromoLimitsAppliedStores) {
      return null;
    }

    const isAllStoresApplied = uniquePromoLimitsAppliedStores.includes(REWARDS_APPLIED_ALL_STORES);

    if (isAllStoresApplied) {
      return i18next.t('Rewards:UniquePromoAllStoresText');
    }

    return i18next.t('Rewards:UniquePromoSelectedStoresText');
  }
);

export const getUniquePromoRedeemOnlineList = createSelector(
  getUniquePromoLimitsAppliedSources,
  uniquePromoLimitsAppliedSources =>
    uniquePromoLimitsAppliedSources.filter(source => source !== REWARDS_APPLIED_SOURCES.POS)
);

export const getIsUniquePromoRedeemOnlineShow = createSelector(
  getUniquePromoRedeemOnlineList,
  uniquePromoRedeemOnlineList => uniquePromoRedeemOnlineList.length > 0
);

export const getIsUniquePromoRedeemInStoreShow = createSelector(
  getUniquePromoLimitsAppliedSources,
  uniquePromoLimitsAppliedSources => uniquePromoLimitsAppliedSources.includes(REWARDS_APPLIED_SOURCES.POS)
);
