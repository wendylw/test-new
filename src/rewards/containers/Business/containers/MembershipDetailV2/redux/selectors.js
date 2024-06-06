import { createSelector } from 'reselect';
import {
  BECOME_MERCHANT_MEMBER_METHODS,
  MEMBER_LEVELS,
  MEMBER_CARD_LEVELS_PALETTES,
} from '../../../../../../common/utils/constants';
import { MEMBERSHIP_TIER_STATUS, MEMBERSHIP_TIER_I18N_PARAM_KEYS, MEMBERSHIP_TIER_I18N_KEYS } from '../utils/constants';
import { getPrice, toCapitalize } from '../../../../../../common/utils';
import { formatTimeToDateString } from '../../../../../../utils/datetime-lib';
import {
  getIsMerchantMembershipPointsEnabled,
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
} from '../../../../../../redux/modules/merchant/selectors';
import { getMembershipTierList, getHighestMembershipTier } from '../../../../../../redux/modules/membership/selectors';
import { getSource, getIsWebview } from '../../../../../redux/modules/common/selectors';
import {
  getCustomerTierLevel,
  getCustomerTierTotalSpent,
  getCustomerTierNextReviewTime,
  getCustomerTierLevelName,
} from '../../../../../redux/modules/customer/selectors';
import { getIsUniquePromoListBannersEmpty } from '../../../redux/common/selectors';

/**
 * Derived selectors
 */

export const getIsUserFromOrdering = createSelector(getSource, source =>
  [BECOME_MERCHANT_MEMBER_METHODS.THANK_YOU_CASHBACK_CLICK].includes(source)
);

export const getShouldShowBackButton = createSelector(
  getIsWebview,
  getIsUserFromOrdering,
  (isInWebview, isUserFromOrdering) => isInWebview || isUserFromOrdering
);

// If the level is not by design, use member style by default.
export const getMemberColorPalettes = createSelector(
  getCustomerTierLevel,
  customerTierLevel =>
    MEMBER_CARD_LEVELS_PALETTES[customerTierLevel] || MEMBER_CARD_LEVELS_PALETTES[MEMBER_LEVELS.MEMBER]
);

export const getMemberCardStyles = createSelector(getMemberColorPalettes, memberCardColorPalettes => ({
  color: memberCardColorPalettes.font,
  background: `linear-gradient(105deg, ${memberCardColorPalettes.background.startColor} 0%, ${memberCardColorPalettes.background.midColor} 50%,${memberCardColorPalettes.background.endColor} 100%)`,
}));

export const getMerchantMembershipTierList = createSelector(getMembershipTierList, membershipTierList =>
  membershipTierList.map(membershipTier => {
    const { level } = membershipTier;

    return {
      ...membershipTier,
      iconColorPalettes: MEMBER_CARD_LEVELS_PALETTES[level].icon,
    };
  })
);

export const getCurrentSpendingTotalTier = createSelector(
  getMembershipTierList,
  getCustomerTierTotalSpent,
  (membershipTierList, customerTierTotalSpent) => {
    const currentSpendingTier = {
      currentLevel: null,
      currentSpendingThreshold: 0,
      exceedCurrentLevelSpending: 0,
    };

    membershipTierList.forEach(membershipTier => {
      const { spendingThreshold, level } = membershipTier;

      if (spendingThreshold <= customerTierTotalSpent && level > currentSpendingTier.currentLevel) {
        currentSpendingTier.currentLevel = level;
        currentSpendingTier.currentSpendingThreshold = spendingThreshold;
        currentSpendingTier.exceedCurrentLevelSpending = customerTierTotalSpent - spendingThreshold;
      }
    });

    return currentSpendingTier;
  }
);

export const getCustomerSpendingTotalNextTier = createSelector(
  getCurrentSpendingTotalTier,
  getMembershipTierList,
  (currentSpendingTotalTier, membershipTierList) =>
    membershipTierList.find(({ level }) => level === currentSpendingTotalTier.currentLevel + 1)
);

export const getMembershipTierListLength = createSelector(
  getMembershipTierList,
  membershipTierList => membershipTierList.length
);

/**
 * progress bar percentage calculation method:
 * only 1 tier: no progress bar
 *
 * merchant tiers > 1
 * 1. current spending total's level === highest tier level: 100%
 * 2. current spending total === current tier spendThreshold: 100 * ((level - 1) / (total tier length - 1))%
 * 3. current spending total > current tier spendThreshold && current spending total < next tier spendThreshold:
 * - exceed total rate = (exceed current total / tier spendThreshold gap) * each tier rate
 * - 100 * (No.2 result + exceed total rate)% + icon radius
 */
export const getCustomerMemberTierProgressStyles = createSelector(
  getMembershipTierListLength,
  getCurrentSpendingTotalTier,
  getCustomerSpendingTotalNextTier,
  getHighestMembershipTier,
  (membershipTierListLength, currentSpendingTotalTier, customerSpendingTotalNextTier, highestMembershipTier) => {
    const MEMBER_ICON_WIDTH = 30;

    if (membershipTierListLength === 1) {
      return null;
    }

    const { currentLevel, currentSpendingThreshold, exceedCurrentLevelSpending } = currentSpendingTotalTier;
    const { level: highestTierLevel } = highestMembershipTier;

    if (currentLevel === highestTierLevel) {
      return { width: '100%' };
    }

    const eachTierRate = 1 / (membershipTierListLength - 1);
    const currentLevelTotalRate = eachTierRate * (currentLevel - 1);

    if (exceedCurrentLevelSpending === 0) {
      return { width: `${100 * currentLevelTotalRate}%` };
    }

    const { spendingThreshold: nextSpendingThreshold } = customerSpendingTotalNextTier;
    const exceedSpendingRate =
      (eachTierRate * exceedCurrentLevelSpending) / (nextSpendingThreshold - currentSpendingThreshold);

    // eachTierRate point is at the center of the icon (except for Tier 1)
    // Tier 1 adds the diameter, and Tier > 1 adds the radius.
    const iconCoveredWidth = MEMBER_ICON_WIDTH / (currentLevel > 1 ? 2 : 1);

    return {
      width: `calc(${100 * (exceedSpendingRate + currentLevelTotalRate)}% + ${iconCoveredWidth}px)`,
    };
  }
);

export const getCustomerCurrentTierMembershipInfo = createSelector(
  getMembershipTierList,
  getCustomerTierLevel,
  (membershipTierList, customerTierLevel) => membershipTierList.find(({ level }) => level === customerTierLevel)
);

export const getCustomerMemberTierStatus = createSelector(
  getCustomerTierLevel,
  getCustomerTierTotalSpent,
  getMembershipTierListLength,
  getCustomerCurrentTierMembershipInfo,
  getHighestMembershipTier,
  (
    customerTierLevel,
    customerTierTotalSpent,
    membershipTierListLength,
    customerCurrentTierMembershipInfo,
    highestMembershipTier
  ) => {
    if (membershipTierListLength === 1) {
      return null;
    }

    if (!customerTierLevel) {
      return MEMBERSHIP_TIER_STATUS.UNLOCK_NEXT_TIER;
    }

    const { spendingThreshold: currentTierSpendingThreshold } = customerCurrentTierMembershipInfo;

    if (currentTierSpendingThreshold > customerTierTotalSpent) {
      return MEMBERSHIP_TIER_STATUS.TIER_MAINTAIN;
    }

    const { level: highestTierLevel, spendingThreshold: highestTierSpendingThreshold } = highestMembershipTier || {};

    return customerTierLevel === highestTierLevel || currentTierSpendingThreshold === highestTierSpendingThreshold
      ? MEMBERSHIP_TIER_STATUS.TIER_COMPLETED
      : MEMBERSHIP_TIER_STATUS.UNLOCK_NEXT_TIER;
  }
);

export const getCustomerCurrentStatusPromptI18nInfo = createSelector(
  getCustomerMemberTierStatus,
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
  getCustomerTierLevel,
  getCustomerTierLevelName,
  getCustomerTierTotalSpent,
  getCustomerSpendingTotalNextTier,
  getMembershipTierList,
  getCustomerTierNextReviewTime,
  (
    customerMemberTierStatus,
    merchantCountry,
    merchantCurrency,
    merchantLocale,
    customerTierLevel,
    customerTierLevelName,
    customerTierTotalSpent,
    customerSpendingTotalNextTier,
    membershipTierList,
    customerTierNextReviewTime
  ) => {
    const priceOptional = {
      country: merchantCountry,
      currency: merchantCurrency,
      locale: merchantLocale,
    };
    const { spendingThreshold: nextTierSpendingThreshold, name: nextTierName } = customerSpendingTotalNextTier || {};
    const maintainTier = membershipTierList.find(({ level }) => level === customerTierLevel);
    const { spendingThreshold: maintainTierSpendingThreshold } = maintainTier || {};
    const params = {
      [MEMBERSHIP_TIER_I18N_PARAM_KEYS.TOTAL_SPEND_PRICE]: getPrice(customerTierTotalSpent, priceOptional),
      [MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_TIER_SPENDING_THRESHOLD_PRICE]: getPrice(
        nextTierSpendingThreshold,
        priceOptional
      ),
      [MEMBERSHIP_TIER_I18N_PARAM_KEYS.MAINTAIN_SPEND_PRICE]: getPrice(maintainTierSpendingThreshold, priceOptional),
      [MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_REVIEW_DATE]: formatTimeToDateString(
        merchantCountry,
        customerTierNextReviewTime
      ),
      [MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_TIER_NAME]: toCapitalize(nextTierName),
      [MEMBERSHIP_TIER_I18N_PARAM_KEYS.CURRENT_TIER_NAME]: toCapitalize(customerTierLevelName),
    };
    const { messageI18nKey, messageI18nParamsKeys } = MEMBERSHIP_TIER_I18N_KEYS[customerMemberTierStatus];
    const messageI18nParams = {};

    messageI18nParamsKeys.forEach(paramsKey => {
      messageI18nParams[paramsKey] = params[paramsKey];
    });

    return {
      messageI18nKey,
      messageI18nParams,
    };
  }
);

export const getIsMyRewardsSectionShow = createSelector(
  getIsMerchantMembershipPointsEnabled,
  getIsUniquePromoListBannersEmpty,
  (isMerchantMembershipPointsEnabled, isUniquePromoListBannersEmpty) =>
    !isMerchantMembershipPointsEnabled && !isUniquePromoListBannersEmpty
);
