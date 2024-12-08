import _get from 'lodash/get';
import i18next from 'i18next';
import { createSelector } from 'reselect';
import { getPrice, getQueryString } from '../../../../../../common/utils';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import {
  REWARDS_APPLIED_SOURCES,
  REWARDS_APPLIED_ALL_STORES,
  REWARD_APPLY_TO_LIMITS_CONDITIONS,
} from '../../../../../../common/utils/rewards/constants';
import { getFormatDiscountValue } from '../../../../../../common/utils/rewards';
import { CLAIMED_POINTS_REWARD_ERROR_CODES } from '../utils/constants';
import {
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
} from '../../../../../../redux/modules/merchant/selectors';
import { getCustomerAvailablePointsBalance } from '../../../../../redux/modules/customer/selectors';

export const getPointsRewardRewardSettingId = () => getQueryString('rewardSettingId');

export const getIsProfileModalShow = state => state.business.pointsRewardDetail.isProfileModalShow;

export const getLoadPointsRewardDetailData = state =>
  state.business.pointsRewardDetail.loadPointsRewardDetailRequest.data;

export const getLoadPointsRewardDetailStatus = state =>
  state.business.pointsRewardDetail.loadPointsRewardDetailRequest.status;

export const getLoadPointsRewardDetailError = state =>
  state.business.pointsRewardDetail.loadPointsRewardDetailRequest.error;

export const getPointsRewardValidPeriod = createSelector(getLoadPointsRewardDetailData, loadPointsRewardDetailData =>
  _get(loadPointsRewardDetailData, 'validPeriod', 0)
);

export const getPointsRewardValidPeriodUnit = createSelector(
  getLoadPointsRewardDetailData,
  loadPointsRewardDetailData => _get(loadPointsRewardDetailData, 'validPeriodUnit', '')
);

export const getPointsRewardCostOfPoints = createSelector(getLoadPointsRewardDetailData, loadPointsRewardDetailData =>
  _get(loadPointsRewardDetailData, 'costOfPoints', 0)
);

export const getPointsRewardIsEnabled = createSelector(getLoadPointsRewardDetailData, loadPointsRewardDetailData =>
  _get(loadPointsRewardDetailData, 'isEnabled', false)
);

export const getPointsRewardIsDeleted = createSelector(getLoadPointsRewardDetailData, loadPointsRewardDetailData =>
  _get(loadPointsRewardDetailData, 'isDeleted', false)
);

export const getPointsRewardPromotionUniquePromoCodeId = createSelector(
  getLoadPointsRewardDetailData,
  loadPointsRewardDetailData => _get(loadPointsRewardDetailData, 'uniquePromotionCodeId', null)
);

export const getPointsRewardPromotionId = createSelector(getLoadPointsRewardDetailData, loadPointsRewardDetailData =>
  _get(loadPointsRewardDetailData, 'promotion.id', null)
);

export const getPointsRewardPromotionName = createSelector(getLoadPointsRewardDetailData, loadPointsRewardDetailData =>
  _get(loadPointsRewardDetailData, 'promotion.name', null)
);

export const getPointsRewardPromotionType = createSelector(getLoadPointsRewardDetailData, loadPointsRewardDetailData =>
  _get(loadPointsRewardDetailData, 'promotion.type', null)
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

export const getPointsRewardApplyToLimits = createSelector(getLoadPointsRewardDetailData, loadPointsRewardDetailData =>
  _get(loadPointsRewardDetailData, 'promotion.applyToLimits', {})
);

export const getPointsRewardLimitsConditions = createSelector(getPointsRewardApplyToLimits, pointsRewardApplyToLimits =>
  _get(pointsRewardApplyToLimits, 'conditions', [])
);

export const getClaimPointsRewardStatus = state => state.business.pointsRewardDetail.claimPointsRewardRequest.status;

export const getClaimPointsRewardError = state => state.business.pointsRewardDetail.claimPointsRewardRequest.error;
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

export const getPointsRewardMinSpendPrice = createSelector(
  getPointsRewardLimitsConditions,
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
  (pointsRewardLimitsConditions, merchantCountry, merchantCurrency, merchantLocale) => {
    const minSpendAmountObject = pointsRewardLimitsConditions.find(
      ({ entity, propertyName, operator }) =>
        entity === REWARD_APPLY_TO_LIMITS_CONDITIONS.ENTITY.TRANSACTION &&
        propertyName === REWARD_APPLY_TO_LIMITS_CONDITIONS.PROPERTY_NAME.TOTAL &&
        operator === REWARD_APPLY_TO_LIMITS_CONDITIONS.OPERATOR.GTE
    );
    const { operand } = minSpendAmountObject || {};

    if (!minSpendAmountObject || !operand[0]) {
      return null;
    }

    return getPrice(Number(operand[0]), {
      country: merchantCountry,
      currency: merchantCurrency,
      locale: merchantLocale,
    });
  }
);

export const getPointsRewardFormatAppliedProductsText = createSelector(
  getPointsRewardProductLimits,
  getPointsRewardLimitsConditions,
  (pointsRewardProductLimits, pointsRewardLimitsConditions) => {
    const applyLimitedProducts = pointsRewardLimitsConditions.filter(
      ({ entity, propertyName }) =>
        entity === REWARD_APPLY_TO_LIMITS_CONDITIONS.ENTITY.PRODUCT &&
        [
          REWARD_APPLY_TO_LIMITS_CONDITIONS.PROPERTY_NAME.CATEGORY,
          REWARD_APPLY_TO_LIMITS_CONDITIONS.PROPERTY_NAME.TAGS,
          REWARD_APPLY_TO_LIMITS_CONDITIONS.PROPERTY_NAME.ID,
        ].includes(propertyName)
    );

    if (!pointsRewardProductLimits) {
      return null;
    }

    if (pointsRewardProductLimits.length === 0 && applyLimitedProducts.length === 0) {
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

export const getIsPointsRewardGetRewardButtonDisabled = createSelector(
  getPointsRewardIsEnabled,
  getPointsRewardIsDeleted,
  getCustomerAvailablePointsBalance,
  getPointsRewardCostOfPoints,
  (pointsRewardIsEnabled, pointsRewardIsDeleted, customerAvailablePointsBalance, pointsRewardCostOfPoints) =>
    !pointsRewardIsEnabled || pointsRewardIsDeleted || customerAvailablePointsBalance < pointsRewardCostOfPoints
);

export const getIsClaimPointsRewardPending = createSelector(
  getClaimPointsRewardStatus,
  claimPointsRewardStatus => claimPointsRewardStatus === API_REQUEST_STATUS.PENDING
);

export const getIsClaimPointsRewardFulfilled = createSelector(
  getClaimPointsRewardStatus,
  claimPointsRewardStatus => claimPointsRewardStatus === API_REQUEST_STATUS.FULFILLED
);

export const getClaimPointsRewardErrorI18nKeys = createSelector(getClaimPointsRewardError, claimPointsRewardError => {
  if (!claimPointsRewardError) {
    return null;
  }

  const { code } = claimPointsRewardError;
  const errorI18nKeys = {};

  switch (code) {
    case CLAIMED_POINTS_REWARD_ERROR_CODES.PROMO_IS_NOT_REDEEMABLE:
      errorI18nKeys.titleI18nKey = 'PromotionIsNotRedeemableTitle';
      errorI18nKeys.descriptionI18nKey = 'PromotionIsNotRedeemableDescription';
      break;
    case CLAIMED_POINTS_REWARD_ERROR_CODES.INVALID_POINT_SOURCE:
    case CLAIMED_POINTS_REWARD_ERROR_CODES.POINT_LOG_NOT_FOUND:
      errorI18nKeys.titleI18nKey = 'InsufficientPointsTitle';
      errorI18nKeys.descriptionI18nKey = 'InsufficientPointsDescription';
      break;
    default:
      errorI18nKeys.titleI18nKey = 'SomethingWentWrongTitle';
      errorI18nKeys.descriptionI18nKey = 'SomethingWentWrongDescription';
      break;
  }

  return errorI18nKeys;
});
