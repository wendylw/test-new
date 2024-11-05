import _get from 'lodash/get';
import i18next from 'i18next';
import { createSelector } from 'reselect';
import { getQueryString } from '../../../../../../common/utils';
import { REWARDS_APPLIED_ALL_STORES, REWARDS_APPLIED_SOURCES } from '../../../utils/constants';
import { getFormatDiscountValue } from '../../../utils/rewards';
import {
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
} from '../../../../../../redux/modules/merchant/selectors';

export const getPointsRewardUniqueRewardSettingId = () => getQueryString('rewardSettingId');

export const getLoadPointsRewardDetailData = state =>
  state.business.pointsRewardDetail.loadPointsRewardDetailRequest.data;

export const getLoadPointsRewardDetailStatus = state =>
  state.business.pointsRewardDetail.loadPointsRewardDetailRequest.status;

export const getLoadPointsRewardDetailError = state =>
  state.business.pointsRewardDetail.loadPointsRewardDetailRequest.error;

export const getPointsRewardPromotionName = createSelector(getLoadPointsRewardDetailData, loadPointsRewardDetailData =>
  _get(loadPointsRewardDetailData, 'promotion.name', null)
);

export const getPointsRewardDiscountInfo = createSelector(getLoadPointsRewardDetailData, loadPointsRewardDetailData =>
  _get(loadPointsRewardDetailData, 'promotion.discountInfo', {})
);

export const getPointsRewardDiscountValue = createSelector(getPointsRewardDiscountInfo, pointsRewardDiscountInfo =>
  _get(pointsRewardDiscountInfo, 'discountValue', 0)
);

export const getPointsRewardDiscountType = createSelector(getPointsRewardDiscountInfo, pointsRewardDiscountInfo =>
  _get(pointsRewardDiscountInfo, 'discountType', 0)
);

export const getPointsRewardProductLimits = createSelector(getLoadPointsRewardDetailData, loadPointsRewardDetailData =>
  _get(loadPointsRewardDetailData, 'promotion.productsLimits', {})
);

export const getPointsRewardStoresLimits = createSelector(getLoadPointsRewardDetailData, loadPointsRewardDetailData =>
  _get(loadPointsRewardDetailData, 'promotion.storesLimits', {})
);

export const getPointsRewardLimitsAppliedStores = createSelector(
  getPointsRewardStoresLimits,
  pointsRewardStoresLimits => _get(pointsRewardStoresLimits, 'appliedStores', [])
);

export const getPointsRewardGeneralLimits = createSelector(getLoadPointsRewardDetailData, loadPointsRewardDetailData =>
  _get(loadPointsRewardDetailData, 'promotion.generalLimits', {})
);

export const getPointsRewardLimitsAppliedSources = createSelector(
  getPointsRewardGeneralLimits,
  pointsRewardGeneralLimits => _get(pointsRewardGeneralLimits, 'appliedSources', [])
);

/**
 * Derived selectors
 */
export const getPointsRewardFormatDiscountValue = createSelector(
  getPointsRewardDiscountValue,
  getPointsRewardDiscountType,
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
  (pointsRewardDiscountValue, pointsRewardDiscountType, merchantCountry, merchantCurrency, merchantLocale) =>
    getFormatDiscountValue(pointsRewardDiscountType, pointsRewardDiscountValue, {
      country: merchantCountry,
      currency: merchantCurrency,
      locale: merchantLocale,
    })
);

export const getPointsRewardFormatAppliedProductsText = createSelector(
  getPointsRewardProductLimits,
  pointsRewardProductLimits => {
    if (!pointsRewardProductLimits) {
      return null;
    }

    if (pointsRewardProductLimits.length === 0) {
      return i18next.t('Rewards:PointsRewardAllProductsText');
    }

    return i18next.t('Rewards:PointsRewardSelectedProductsText');
  }
);

export const getPointsRewardFormatAppliedStoresText = createSelector(
  getPointsRewardLimitsAppliedStores,
  pointsRewardLimitsAppliedStores => {
    if (!pointsRewardLimitsAppliedStores) {
      return null;
    }

    const isAllStoresApplied = pointsRewardLimitsAppliedStores.includes(REWARDS_APPLIED_ALL_STORES);

    if (isAllStoresApplied) {
      return i18next.t('Rewards:PointsRewardAllStoresText');
    }

    return i18next.t('Rewards:PointsRewardSelectedStoresText');
  }
);

export const getPointsRewardRedeemOnlineList = createSelector(
  getPointsRewardLimitsAppliedSources,
  pointsRewardLimitsAppliedSources =>
    pointsRewardLimitsAppliedSources.filter(source => source !== REWARDS_APPLIED_SOURCES.POS)
);

export const getIsPointsRewardRedeemOnlineShow = createSelector(
  getPointsRewardRedeemOnlineList,
  pointsRewardRedeemOnlineList => pointsRewardRedeemOnlineList.length > 0
);

export const getIsPointsRewardRedeemInStoreShow = createSelector(
  getPointsRewardLimitsAppliedSources,
  pointsRewardLimitsAppliedSources => pointsRewardLimitsAppliedSources.includes(REWARDS_APPLIED_SOURCES.POS)
);
