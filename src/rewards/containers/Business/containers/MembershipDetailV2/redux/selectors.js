import { createSelector } from 'reselect';
import {
  BECOME_MERCHANT_MEMBER_METHODS,
  MEMBER_LEVELS,
  MEMBER_CARD_LEVELS_PALETTES,
} from '../../../../../../common/utils/constants';
import {
  MEMBERSHIP_TIER_STATUS,
  MEMBERSHIP_TIER_I18N_PARAM_KEYS,
  MEMBERSHIP_TIER_I18N_KEYS,
  NEW_MEMBER_TYPES,
  NEW_MEMBER_I18N_KEYS,
  MEMBER_TYPE_I18N_PARAM_KEYS,
  RETURNING_MEMBER_TYPES,
  RETURNING_MEMBER_I18N_KEYS,
} from '../utils/constants';
import { getPrice, toCapitalize } from '../../../../../../common/utils';
import { formatTimeToDateString } from '../../../../../../utils/datetime-lib';
import {
  getIsMerchantMembershipPointsEnabled,
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
  getIsLoadMerchantRequestCompleted,
} from '../../../../../../redux/modules/merchant/selectors';
import { getMembershipTierList, getHighestMembershipTier } from '../../../../../../redux/modules/membership/selectors';
import {
  getSource,
  getIsWebview,
  getIsFromJoinMembershipUrlClick,
} from '../../../../../redux/modules/common/selectors';
import {
  getCustomerTierLevel,
  getCustomerTierTotalSpent,
  getCustomerTierNextReviewTime,
  getCustomerTierLevelName,
  getIsLoadCustomerRequestCompleted,
} from '../../../../../redux/modules/customer/selectors';
import { getIsUniquePromoListBannersEmpty, getOrderReceiptClaimedCashback } from '../../../redux/common/selectors';

/**
 * Derived selectors
 */

export const getIsUserFromOrdering = createSelector(getSource, source =>
  [BECOME_MERCHANT_MEMBER_METHODS.THANK_YOU_CASHBACK_CLICK].includes(source)
);

export const getIsFromSeamlessLoyaltyQrScan = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.SEAMLESS_LOYALTY_QR_SCAN
);

// Header
export const getShouldShowBackButton = createSelector(
  getIsWebview,
  getIsUserFromOrdering,
  (isInWebview, isUserFromOrdering) => isInWebview || isUserFromOrdering
);

// Member Card
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

export const getCustomerMemberTierProgressStyles = createSelector(
  getMembershipTierListLength,
  getCurrentSpendingTotalTier,
  getCustomerSpendingTotalNextTier,
  (membershipTierListLength, currentSpendingTotalTier, customerSpendingTotalNextTier) => {
    const MEMBER_ICON_WIDTH = 30;

    if (membershipTierListLength === 1) {
      return null;
    }

    const { currentLevel, currentSpendingThreshold, exceedCurrentLevelSpending } = currentSpendingTotalTier;

    if (currentLevel === membershipTierListLength) {
      return { width: '100%' };
    }

    const eachTierRate = (1 / (membershipTierListLength - 1)).toFixed(4);
    const currentLevelTotalRate = eachTierRate * (currentLevel - 1);

    if (exceedCurrentLevelSpending === 0) {
      return { width: `${100 * currentLevelTotalRate}%` };
    }

    const { spendingThreshold: nextSpendingThreshold } = customerSpendingTotalNextTier;
    const exceedSpendingRate =
      eachTierRate * (exceedCurrentLevelSpending / (nextSpendingThreshold - currentSpendingThreshold)).toFixed(4);

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

export const getCustomerMemberTierPromptParams = createSelector(
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
    const { spendingThreshold: nextTierSpendingThreshold, name: nextTierName } = customerSpendingTotalNextTier || {};
    const maintainTier = membershipTierList.find(({ level }) => level === customerTierLevel);
    const { spendingThreshold: maintainTierSpendingThreshold } = maintainTier || {};
    const params = {};

    Object.values(MEMBERSHIP_TIER_I18N_PARAM_KEYS).forEach(paramKey => {
      switch (paramKey) {
        case MEMBERSHIP_TIER_I18N_PARAM_KEYS.TOTAL_SPEND_PRICE:
          params[MEMBERSHIP_TIER_I18N_PARAM_KEYS.TOTAL_SPEND_PRICE] = getPrice(customerTierTotalSpent, {
            country: merchantCountry,
            currency: merchantCurrency,
            locale: merchantLocale,
          });
          break;
        case MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_TIER_SPENDING_THRESHOLD_PRICE:
          params[MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_TIER_SPENDING_THRESHOLD_PRICE] = getPrice(
            nextTierSpendingThreshold,
            {
              country: merchantCountry,
              currency: merchantCurrency,
              locale: merchantLocale,
            }
          );
          break;
        case MEMBERSHIP_TIER_I18N_PARAM_KEYS.MAINTAIN_SPEND_PRICE:
          params[MEMBERSHIP_TIER_I18N_PARAM_KEYS.MAINTAIN_SPEND_PRICE] = getPrice(maintainTierSpendingThreshold, {
            country: merchantCountry,
            currency: merchantCurrency,
            locale: merchantLocale,
          });
          break;
        case MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_REVIEW_DATE:
          params[MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_REVIEW_DATE] = formatTimeToDateString(
            merchantCountry,
            customerTierNextReviewTime
          );
          break;
        case MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_TIER_NAME:
          params[MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_TIER_NAME] = toCapitalize(nextTierName);
          break;
        case MEMBERSHIP_TIER_I18N_PARAM_KEYS.CURRENT_TIER_NAME:
          params[MEMBERSHIP_TIER_I18N_PARAM_KEYS.CURRENT_TIER_NAME] = toCapitalize(customerTierLevelName);
          break;
        default:
          break;
      }
    });

    return params;
  }
);

export const getCustomerCurrentStatusParams = createSelector(
  getCustomerMemberTierStatus,
  getCustomerMemberTierPromptParams,
  (customerMemberTierStatus, customerMemberTierPromptParams) => {
    const { messageI18nParamsKeys } = MEMBERSHIP_TIER_I18N_KEYS[customerMemberTierStatus];
    const promptParams = {};

    messageI18nParamsKeys.forEach(paramsKey => {
      promptParams[paramsKey] = customerMemberTierPromptParams[paramsKey];
    });

    return promptParams;
  }
);

// My Rewards
export const getIsMyRewardsSectionShow = createSelector(
  getIsMerchantMembershipPointsEnabled,
  getIsUniquePromoListBannersEmpty,
  (isMerchantMembershipPointsEnabled, isUniquePromoListBannersEmpty) =>
    !isMerchantMembershipPointsEnabled && !isUniquePromoListBannersEmpty
);

// Member Prompt
export const getNewMemberPromptCategory = createSelector(
  getIsLoadCustomerRequestCompleted,
  getIsLoadMerchantRequestCompleted,
  getIsFromSeamlessLoyaltyQrScan,
  getIsFromJoinMembershipUrlClick,
  (
    isLoadCustomerRequestCompleted,
    isLoadMerchantRequestCompleted,
    isFromSeamlessLoyaltyQrScan,
    isFromJoinMembershipUrlClick
  ) => {
    if (isFromJoinMembershipUrlClick) {
      return NEW_MEMBER_TYPES.DEFAULT;
    }

    if (isFromSeamlessLoyaltyQrScan) {
      if (!isLoadMerchantRequestCompleted) {
        return null;
      }

      if (!isLoadCustomerRequestCompleted) {
        return null;
      }

      return NEW_MEMBER_TYPES.DEFAULT;
    }

    return null;
  }
);

export const getNewMemberTitleIn18nParams = createSelector(
  getOrderReceiptClaimedCashback,
  getNewMemberPromptCategory,
  (claimedCashback, newMemberPromptCategory) => {
    const { titleI18nParamsKeys } = NEW_MEMBER_I18N_KEYS[newMemberPromptCategory] || {};
    const newMemberTitleI18nParams = {};

    if (!titleI18nParamsKeys) {
      return null;
    }

    titleI18nParamsKeys.forEach(paramKey => {
      if (paramKey === MEMBER_TYPE_I18N_PARAM_KEYS.CASHBACK_VALUE) {
        newMemberTitleI18nParams[paramKey] = claimedCashback;
      }
    });

    return newMemberTitleI18nParams;
  }
);

export const getReturningMemberPromptCategory = createSelector(
  getIsFromJoinMembershipUrlClick,
  isFromJoinMembershipUrlClick => {
    if (isFromJoinMembershipUrlClick) {
      return RETURNING_MEMBER_TYPES.DEFAULT;
    }

    return null;
  }
);

export const getReturningMemberTitleIn18nParams = createSelector(
  getOrderReceiptClaimedCashback,
  getReturningMemberPromptCategory,
  (claimedCashback, returningMemberPromptCategory) => {
    const { titleI18nParamsKeys } = RETURNING_MEMBER_I18N_KEYS[returningMemberPromptCategory] || {};
    const returningMemberTitleI18nParams = {};

    if (!titleI18nParamsKeys) {
      return null;
    }

    titleI18nParamsKeys.forEach(paramKey => {
      if (paramKey === MEMBER_TYPE_I18N_PARAM_KEYS.CASHBACK_VALUE) {
        returningMemberTitleI18nParams[paramKey] = claimedCashback;
      }
    });

    return returningMemberTitleI18nParams;
  }
);
