import _isArray from 'lodash/isArray';
import { createSelector } from 'reselect';
import i18next from 'i18next';
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
  GET_REWARDS_MAX_LENGTH,
  NEW_MEMBER_CASHBACK_STATUS_TYPES,
  NEW_MEMBER_ICONS,
  RETURNING_MEMBER_CASHBACK_STATUS_TYPES,
  CLAIMED_ORDER_REWARD_NAMES,
} from '../utils/constants';
import { getPrice, toCapitalize } from '../../../../../../common/utils';
import { formatTimeToDateString } from '../../../../../../utils/datetime-lib';
import { getReceiptOrderRewardsStatusCategories } from '../utils';
import {
  getIsMerchantEnabledCashback,
  getIsMerchantEnabledLoyalty,
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
  getIsFromReceiptJoinMembershipUrlQRScan,
} from '../../../../../redux/modules/common/selectors';
import {
  getCustomerTierLevel,
  getCustomerTierTotalSpent,
  getCustomerTierPointsTotalEarned,
  getCustomerTierNextReviewTime,
  getCustomerTierLevelName,
  getIsLoadCustomerRequestCompleted,
  getCustomerCashback,
} from '../../../../../redux/modules/customer/selectors';
import {
  getIsUniquePromoListBannersEmpty,
  getOrderReceiptClaimedCashback,
  getPointsRewardList,
  getRemainingCashbackExpiredDays,
  getOrderReceiptClaimedCashbackStatus,
  getClaimOrderRewardsPointsStatus,
  getClaimOrderRewardsCashbackStatus,
  getClaimOrderRewardsTransactionStatus,
  getClaimOrderRewardsPointsValue,
  getClaimOrderRewardsCashbackPrice,
  getIsNewMember,
} from '../../../redux/common/selectors';

export const getIsProfileModalShow = state => state.business.membershipDetailV2.isProfileModalShow;

export const getFetchUniquePromoListBannersLimit = state => state.business.membershipDetailV2.isProfileModalShow;

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

export const getIsFromEarnedCashbackQrScan = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.EARNED_CASHBACK_QR_SCAN
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

export const getCurrentSpendingTotalOrPointsTier = createSelector(
  getMembershipTierList,
  getCustomerTierTotalSpent,
  getCustomerTierPointsTotalEarned,
  getIsMerchantMembershipPointsEnabled,
  (membershipTierList, customerTierTotalSpent, customerTierPointsTotalEarned, isMerchantMembershipPointsEnabled) => {
    const currentSpendingTier = {
      currentLevel: null,
      currentSpendingThreshold: 0,
      currentPointsThreshold: 0,
      exceedCurrentLevelSpending: 0,
    };

    membershipTierList.forEach(membershipTier => {
      const { spendingThreshold, pointsThreshold, level } = membershipTier;
      const isCurrentSpendingTotalPoints = isMerchantMembershipPointsEnabled
        ? pointsThreshold <= customerTierPointsTotalEarned
        : spendingThreshold <= customerTierTotalSpent;

      if (isCurrentSpendingTotalPoints && level > currentSpendingTier.currentLevel) {
        currentSpendingTier.currentLevel = level;
        currentSpendingTier.currentSpendingThreshold = spendingThreshold;
        currentSpendingTier.currentPointsThreshold = pointsThreshold;
        currentSpendingTier.exceedCurrentLevelSpending = customerTierTotalSpent - spendingThreshold;
        currentSpendingTier.exceedCurrentLevelPoints = customerTierPointsTotalEarned - pointsThreshold;
      }
    });

    return currentSpendingTier;
  }
);

export const getCustomerSpendingTotalNextTier = createSelector(
  getCurrentSpendingTotalOrPointsTier,
  getMembershipTierList,
  (currentSpendingTotalPointsTier, membershipTierList) =>
    membershipTierList.find(({ level }) => level === currentSpendingTotalPointsTier.currentLevel + 1) || {}
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
  getCurrentSpendingTotalOrPointsTier,
  getCustomerSpendingTotalNextTier,
  getHighestMembershipTier,
  getIsMerchantMembershipPointsEnabled,
  (
    membershipTierListLength,
    currentSpendingTotalOrPointsTier,
    customerSpendingTotalNextTier,
    highestMembershipTier,
    isMerchantMembershipPointsEnabled
  ) => {
    const MEMBER_ICON_WIDTH = 30;

    if (membershipTierListLength === 1) {
      return null;
    }

    const {
      currentLevel,
      currentPointsThreshold,
      currentSpendingThreshold,
      exceedCurrentLevelSpending,
      exceedCurrentLevelPoints,
    } = currentSpendingTotalOrPointsTier;
    const { level: highestTierLevel } = highestMembershipTier;
    const {
      spendingThreshold: nextSpendingThreshold,
      pointsThreshold: nextPointsThreshold,
    } = customerSpendingTotalNextTier;
    // eachTierRate point is at the center of the icon (except for Tier 1)
    // Tier 1 adds the diameter, and Tier > 1 adds the radius.
    const iconCoveredWidth = MEMBER_ICON_WIDTH / (currentLevel > 1 ? 2 : 1);

    if (currentLevel === highestTierLevel) {
      return { width: '100%' };
    }

    const eachTierRate = 1 / (membershipTierListLength - 1);
    const currentLevelTotalRate = eachTierRate * (currentLevel - 1);

    if (isMerchantMembershipPointsEnabled) {
      if (exceedCurrentLevelPoints === 0) {
        return { width: `${100 * currentLevelTotalRate}%` };
      }

      const exceedPointsRate =
        (eachTierRate * exceedCurrentLevelPoints) / (nextPointsThreshold - currentPointsThreshold);

      return {
        width: `calc(${100 * (exceedPointsRate + currentLevelTotalRate)}% + ${iconCoveredWidth}px)`,
      };
    }

    if (exceedCurrentLevelSpending === 0) {
      return { width: `${100 * currentLevelTotalRate}%` };
    }

    const exceedSpendingRate =
      (eachTierRate * exceedCurrentLevelSpending) / (nextSpendingThreshold - currentSpendingThreshold);

    return {
      width: `calc(${100 * (exceedSpendingRate + currentLevelTotalRate)}% + ${iconCoveredWidth}px)`,
    };
  }
);

export const getCustomerCurrentTierMembershipInfo = createSelector(
  getMembershipTierList,
  getCustomerTierLevel,
  (membershipTierList, customerTierLevel) => membershipTierList.find(({ level }) => level === customerTierLevel) || {}
);

export const getCustomerMemberTierStatus = createSelector(
  getCustomerTierLevel,
  getCustomerTierTotalSpent,
  getCustomerTierPointsTotalEarned,
  getMembershipTierListLength,
  getCustomerCurrentTierMembershipInfo,
  getHighestMembershipTier,
  getIsMerchantMembershipPointsEnabled,
  (
    customerTierLevel,
    customerTierTotalSpent,
    customerTierPointsTotalEarned,
    membershipTierListLength,
    customerCurrentTierMembershipInfo,
    highestMembershipTier,
    isMerchantMembershipPointsEnabled
  ) => {
    if (membershipTierListLength === 1) {
      return null;
    }

    const {
      spendingThreshold: currentTierSpendingThreshold,
      pointsThreshold: currentTierPointsThreshold,
    } = customerCurrentTierMembershipInfo;
    const {
      level: highestTierLevel,
      spendingThreshold: highestTierSpendingThreshold,
      pointsThreshold: highestPointsThreshold,
    } = highestMembershipTier;

    if (isMerchantMembershipPointsEnabled) {
      if (!customerTierLevel) {
        return MEMBERSHIP_TIER_STATUS.POINTS_UNLOCK_NEXT_TIER;
      }

      if (currentTierPointsThreshold > customerTierPointsTotalEarned) {
        return MEMBERSHIP_TIER_STATUS.POINTS_TIER_MAINTAIN;
      }

      return customerTierLevel === highestTierLevel || customerTierPointsTotalEarned >= highestPointsThreshold
        ? MEMBERSHIP_TIER_STATUS.TIER_COMPLETED
        : MEMBERSHIP_TIER_STATUS.POINTS_UNLOCK_NEXT_TIER;
    }

    if (!customerTierLevel) {
      return MEMBERSHIP_TIER_STATUS.UNLOCK_NEXT_TIER;
    }

    if (currentTierSpendingThreshold > customerTierTotalSpent) {
      return MEMBERSHIP_TIER_STATUS.TIER_MAINTAIN;
    }

    return customerTierLevel === highestTierLevel || customerTierTotalSpent >= highestTierSpendingThreshold
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
  getCustomerTierPointsTotalEarned,
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
    customerTierPointsTotalEarned,
    customerSpendingTotalNextTier,
    membershipTierList,
    customerTierNextReviewTime
  ) => {
    if (membershipTierList.length === 1) {
      return null;
    }

    const priceOptional = {
      country: merchantCountry,
      currency: merchantCurrency,
      locale: merchantLocale,
    };
    const {
      spendingThreshold: nextTierSpendingThreshold,
      pointsThreshold: nextTierPointsThreshold,
      name: nextTierName,
    } = customerSpendingTotalNextTier;
    const maintainTier = membershipTierList.find(({ level }) => level === customerTierLevel) || {};
    const { spendingThreshold: maintainTierSpendingThreshold, pointsThreshold: maintainPointsThreshold } = maintainTier;
    const params = {
      [MEMBERSHIP_TIER_I18N_PARAM_KEYS.TOTAL_SPEND_PRICE]: getPrice(customerTierTotalSpent, priceOptional),
      [MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_TIER_SPENDING_THRESHOLD_PRICE]: getPrice(
        nextTierSpendingThreshold,
        priceOptional
      ),
      [MEMBERSHIP_TIER_I18N_PARAM_KEYS.MAINTAIN_SPEND_PRICE]: getPrice(maintainTierSpendingThreshold, priceOptional),
      [MEMBERSHIP_TIER_I18N_PARAM_KEYS.POINTS_TOTAL_EARNED]: customerTierPointsTotalEarned,
      [MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_TIER_POINTS_THRESHOLD]: nextTierPointsThreshold,
      [MEMBERSHIP_TIER_I18N_PARAM_KEYS.MAINTAIN_TOTAL_POINTS]: maintainPointsThreshold,
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

// Rewards Buttons
export const getIsRewardsCashbackCreditsButtonShow = createSelector(
  getIsMerchantEnabledCashback,
  getIsMerchantEnabledLoyalty,
  (isMerchantEnabledCashback, isMerchantEnabledLoyalty) => isMerchantEnabledCashback || isMerchantEnabledLoyalty
);

export const getIsExpiringIconShown = createSelector(
  getIsMerchantEnabledCashback,
  getRemainingCashbackExpiredDays,
  (isMerchantEnabledCashback, remainingCashbackExpiredDays) =>
    isMerchantEnabledCashback && remainingCashbackExpiredDays !== null
);

// My Rewards
export const getIsMyRewardsSectionShow = createSelector(
  getIsMerchantMembershipPointsEnabled,
  getIsUniquePromoListBannersEmpty,
  (isMerchantMembershipPointsEnabled, isUniquePromoListBannersEmpty) =>
    !isMerchantMembershipPointsEnabled && !isUniquePromoListBannersEmpty
);

// Points Rewards
export const getMembershipDetailPointsRewardList = createSelector(getPointsRewardList, pointsRewardList =>
  pointsRewardList.slice(0, GET_REWARDS_MAX_LENGTH)
);

export const getIsPointsRewardListMoreButtonShown = createSelector(
  getMembershipDetailPointsRewardList,
  membershipDetailPointsRewardList => membershipDetailPointsRewardList.length === GET_REWARDS_MAX_LENGTH
);

// Member Prompt
export const getClaimOrderRewardsPrompt = createSelector(
  getClaimOrderRewardsPointsStatus,
  getClaimOrderRewardsCashbackStatus,
  getClaimOrderRewardsTransactionStatus,
  getClaimOrderRewardsPointsValue,
  getClaimOrderRewardsCashbackPrice,
  getIsNewMember,
  (pointsStatus, cashbackStatus, transactionStatus, pointsValue, cashbackPrice, isNewMember) => {
    const baseParams = {
      [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_POINTS_VALUE]: pointsValue,
      [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_CASHBACK_VALUE]: cashbackPrice,
    };
    const categories = getReceiptOrderRewardsStatusCategories({
      pointsStatus,
      cashbackStatus,
      transactionStatus,
      isNewMember,
    });

    return categories.map(category => {
      const { key, status } = category;
      const { titleI18nKey, descriptionI18nKey, titleI18nParamsKeys } = NEW_MEMBER_I18N_KEYS[status] || {};
      const rewardsParams = {
        [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARDS]: i18next.t('Rewards:Rewards').toLowerCase(),
        [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARD_TYPE]: i18next.t('Rewards:Reward').toLowerCase(),
      };
      const titleI18nParams = null;

      if (key === CLAIMED_ORDER_REWARD_NAMES.CASHBACK) {
        rewardsParams[MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARDS] = i18next.t('Common:Cashback').toLowerCase();
        rewardsParams[MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARD_TYPE] = i18next.t('Common:Cashback').toLowerCase();
      } else if (key === CLAIMED_ORDER_REWARD_NAMES.POINTS) {
        rewardsParams[MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARDS] = i18next.t('Rewards:Points').toLowerCase();
        rewardsParams[MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARD_TYPE] = i18next.t('Rewards:Points').toLowerCase();
      }

      if (titleI18nParamsKeys) {
        titleI18nParamsKeys.forEach(paramKey => {
          titleI18nParams[paramKey] = baseParams[paramKey] || rewardsParams[paramKey];
        });
      }

      return {
        id: status,
        title: i18next.t(`Rewards:${titleI18nKey}`, titleI18nParams),
        description: descriptionI18nKey && i18next.t(`Rewards:${descriptionI18nKey}`),
        icons: _isArray(NEW_MEMBER_ICONS[status]) ? NEW_MEMBER_ICONS[status] : [NEW_MEMBER_ICONS[status]],
      };
    });
  }
);

export const getNewMemberPromptCategory = createSelector(
  getIsFromJoinMembershipUrlClick,
  getIsLoadCustomerRequestCompleted,
  getIsLoadMerchantRequestCompleted,
  getIsFromSeamlessLoyaltyQrScan,
  getIsMerchantMembershipPointsEnabled,
  getIsMerchantEnabledCashback,
  getIsFromEarnedCashbackQrScan,
  getOrderReceiptClaimedCashbackStatus,
  getCustomerCashback,
  getIsFromReceiptJoinMembershipUrlQRScan,
  (
    isFromJoinMembershipUrlClick,
    // From seamless loyalty
    isLoadCustomerRequestCompleted,
    isLoadMerchantRequestCompleted,
    isFromSeamlessLoyaltyQrScan,
    isMerchantMembershipPointsEnabled,
    isMerchantEnabledCashback,
    // From claim cashback page
    isFromEarnedCashbackQrScan,
    claimedCashbackStatus,
    customerCashback,
    // From receipt join membership URL
    isFromReceiptJoinMembershipUrlQRScan
  ) => {
    if (isFromJoinMembershipUrlClick) {
      return NEW_MEMBER_TYPES.DEFAULT;
    }

    if (isFromSeamlessLoyaltyQrScan) {
      if (!isLoadMerchantRequestCompleted) {
        return null;
      }

      if (isMerchantMembershipPointsEnabled) {
        return NEW_MEMBER_TYPES.ENABLED_POINTS;
      }

      if (!isLoadCustomerRequestCompleted) {
        return null;
      }

      if (isMerchantEnabledCashback && customerCashback > 0) {
        return NEW_MEMBER_TYPES.REDEEM_CASHBACK;
      }

      return NEW_MEMBER_TYPES.DEFAULT;
    }

    if (isFromEarnedCashbackQrScan) {
      const claimedCashbackType = NEW_MEMBER_CASHBACK_STATUS_TYPES[claimedCashbackStatus];

      return claimedCashbackType || NEW_MEMBER_TYPES.DEFAULT;
    }

    if (isFromReceiptJoinMembershipUrlQRScan) {
      return null;
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
  getIsFromSeamlessLoyaltyQrScan,
  getIsFromEarnedCashbackQrScan,
  getIsLoadMerchantRequestCompleted,
  getIsMerchantMembershipPointsEnabled,
  getIsLoadCustomerRequestCompleted,
  getIsMerchantEnabledCashback,
  getOrderReceiptClaimedCashbackStatus,
  getCustomerCashback,
  getIsFromReceiptJoinMembershipUrlQRScan,
  (
    isFromJoinMembershipUrlClick,
    isFromSeamlessLoyaltyQrScan,
    isFromEarnedCashbackQrScan,
    isLoadMerchantRequestCompleted,
    isMerchantMembershipPointsEnabled,
    isLoadCustomerRequestCompleted,
    isMerchantEnabledCashback,
    claimedCashbackStatus,
    customerCashback,
    // From receipt join membership URL
    isFromReceiptJoinMembershipUrlQRScan
  ) => {
    if (isFromJoinMembershipUrlClick) {
      return RETURNING_MEMBER_TYPES.DEFAULT;
    }

    if (isFromSeamlessLoyaltyQrScan) {
      if (isLoadMerchantRequestCompleted && isMerchantMembershipPointsEnabled) {
        return RETURNING_MEMBER_TYPES.ENABLED_POINTS;
      }

      if (isLoadMerchantRequestCompleted && isLoadCustomerRequestCompleted) {
        return isMerchantEnabledCashback && customerCashback > 0
          ? RETURNING_MEMBER_TYPES.REDEEM_CASHBACK
          : RETURNING_MEMBER_TYPES.THANKS_COMING_BACK;
      }
    }

    if (isFromEarnedCashbackQrScan) {
      const claimedCashbackType = RETURNING_MEMBER_CASHBACK_STATUS_TYPES[claimedCashbackStatus];

      return claimedCashbackType || RETURNING_MEMBER_TYPES.DEFAULT;
    }

    if (isFromReceiptJoinMembershipUrlQRScan) {
      return null;
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
