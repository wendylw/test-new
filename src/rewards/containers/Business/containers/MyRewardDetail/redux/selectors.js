import _get from 'lodash/get';
import i18next from 'i18next';
import { createSelector } from 'reselect';
import { PROMO_VOUCHER_STATUS } from '../../../../../../common/utils/constants';
import { UNIQUE_PROMO_APPLIED_ALL_STORES, UNIQUE_PROMO_APPLIED_SOURCES } from '../utils/constants';
import { getPrice, getQueryString } from '../../../../../../common/utils';
import { formatTimeToDateString } from '../../../../../../utils/datetime-lib';
import { getFormatDiscountValue, getRemainingRewardExpiredDays, getExpiringDaysI18n } from '../../../utils/rewards';
import {
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
} from '../../../../../../redux/modules/merchant/selectors';

export const getMyRewardId = () => getQueryString('id');

export const getMyRewardUniquePromotionId = () => getQueryString('uniquePromotionId');

export const getLoadMyRewardDetailData = state => state.business.myRewardDetail.loadMyRewardDetailRequest.data;

export const getLoadMyRewardDetailStatus = state => state.business.myRewardDetail.loadMyRewardDetailRequest.status;

export const getLoadMyRewardDetailError = state => state.business.myRewardDetail.loadMyRewardDetailRequest.error;

export const getMyRewardValidTo = createSelector(getLoadMyRewardDetailData, loadMyRewardDetailData =>
  _get(loadMyRewardDetailData, 'validTo', null)
);

export const getMyRewardMinSpendAmount = createSelector(getLoadMyRewardDetailData, loadMyRewardDetailData =>
  _get(loadMyRewardDetailData, 'minSpendAmount', 0)
);

export const getMyRewardStatus = createSelector(getLoadMyRewardDetailData, loadMyRewardDetailData =>
  _get(loadMyRewardDetailData, 'status', null)
);

export const getMyRewardPromotionName = createSelector(getLoadMyRewardDetailData, loadMyRewardDetailData =>
  _get(loadMyRewardDetailData, 'promotion.name', null)
);

export const getMyRewardDiscountInfo = createSelector(getLoadMyRewardDetailData, loadMyRewardDetailData =>
  _get(loadMyRewardDetailData, 'promotion.discountInfo', {})
);

export const getMyRewardDiscountValue = createSelector(getMyRewardDiscountInfo, myRewardDiscountInfo =>
  _get(myRewardDiscountInfo, 'discountValue', 0)
);

export const getMyRewardDiscountType = createSelector(getMyRewardDiscountInfo, myRewardDiscountInfo =>
  _get(myRewardDiscountInfo, 'discountType', 0)
);

export const getMyRewardProductLimits = createSelector(getLoadMyRewardDetailData, loadMyRewardDetailData =>
  _get(loadMyRewardDetailData, 'promotion.productsLimits', {})
);

export const getMyRewardStoresLimits = createSelector(getLoadMyRewardDetailData, loadMyRewardDetailData =>
  _get(loadMyRewardDetailData, 'promotion.storesLimits', {})
);

export const getMyRewardLimitsAppliedStores = createSelector(getMyRewardStoresLimits, myRewardStoresLimits =>
  _get(myRewardStoresLimits, 'appliedStores', [])
);

export const getMyRewardGeneralLimits = createSelector(getLoadMyRewardDetailData, loadMyRewardDetailData =>
  _get(loadMyRewardDetailData, 'promotion.generalLimits', {})
);

export const getMyRewardLimitsAppliedSources = createSelector(getMyRewardGeneralLimits, myRewardGeneralLimits =>
  _get(myRewardGeneralLimits, 'appliedSources', [])
);

/**
 * Derived selectors
 */
export const getMyRewardFormatDiscountValue = createSelector(
  getMyRewardDiscountValue,
  getMyRewardDiscountType,
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
  (myRewardDiscountValue, myRewardDiscountType, merchantCountry, merchantCurrency, merchantLocale) =>
    getFormatDiscountValue(myRewardDiscountType, myRewardDiscountValue, {
      country: merchantCountry,
      currency: merchantCurrency,
      locale: merchantLocale,
    })
);

export const getMyRewardLimitations = createSelector(
  getMyRewardValidTo,
  getMyRewardMinSpendAmount,
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
  (myRewardValidTo, myRewardMinSpendAmount, merchantCountry, merchantCurrency, merchantLocale) => {
    const limitations = [];

    if (myRewardMinSpendAmount) {
      limitations.push({
        key: 'myRewardDetail-minConsumption',
        i18nKey: 'MinConsumption',
        params: {
          amount: getPrice(myRewardMinSpendAmount, {
            country: merchantCountry,
            currency: merchantCurrency,
            locale: merchantLocale,
          }),
        },
      });
    }

    if (myRewardValidTo) {
      limitations.push({
        key: 'myRewardDetail-expiringDate',
        i18nKey: 'ValidUntil',
        params: { date: formatTimeToDateString(merchantCountry, myRewardValidTo) },
      });
    }

    return limitations;
  }
);

export const getIsMyRewardUnAvailable = createSelector(getMyRewardStatus, myRewardStatus =>
  [PROMO_VOUCHER_STATUS.EXPIRED, PROMO_VOUCHER_STATUS.REDEEMED].includes(myRewardStatus)
);

export const getMyRewardExpiringDaysI18n = createSelector(getMyRewardValidTo, myRewardValidTo => {
  const remainingRewardExpiredDays = getRemainingRewardExpiredDays(myRewardValidTo);

  return getExpiringDaysI18n(remainingRewardExpiredDays);
});

export const getMyRewardFormatAppliedProductsText = createSelector(getMyRewardProductLimits, myRewardProductLimits => {
  if (!myRewardProductLimits) {
    return null;
  }

  if (myRewardProductLimits.length === 0) {
    return i18next.t('Rewards:MyRewardAllProductsText');
  }

  return i18next.t('Rewards:MyRewardSelectedProductsText');
});

export const getMyRewardFormatAppliedStoresText = createSelector(
  getMyRewardLimitsAppliedStores,
  myRewardLimitsAppliedStores => {
    if (!myRewardLimitsAppliedStores) {
      return null;
    }

    const isAllStoresApplied = myRewardLimitsAppliedStores.includes(UNIQUE_PROMO_APPLIED_ALL_STORES);

    if (isAllStoresApplied) {
      return i18next.t('Rewards:MyRewardAllStoresText');
    }

    return i18next.t('Rewards:MyRewardSelectedStoresText');
  }
);

export const getMyRewardRedeemOnlineList = createSelector(
  getMyRewardLimitsAppliedSources,
  myRewardLimitsAppliedSources =>
    myRewardLimitsAppliedSources.filter(source => source !== UNIQUE_PROMO_APPLIED_SOURCES.POS)
);

export const getIsMyRewardRedeemOnlineShow = createSelector(
  getMyRewardRedeemOnlineList,
  myRewardRedeemOnlineList => myRewardRedeemOnlineList.length > 0
);

export const getIsMyRewardRedeemInStoreShow = createSelector(
  getMyRewardLimitsAppliedSources,
  myRewardLimitsAppliedSources => myRewardLimitsAppliedSources.includes(UNIQUE_PROMO_APPLIED_SOURCES.POS)
);
