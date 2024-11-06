import _isArray from 'lodash/isArray';
import _get from 'lodash/get';
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
import { getIsUserProfileIncomplete } from '../../../../../../redux/modules/user/selectors';
import {
  getIsMerchantEnabledCashback,
  getIsMerchantEnabledLoyalty,
  getIsMerchantMembershipPointsEnabled,
  getMerchantCountry,
  getMerchantCurrency,
  getMerchantLocale,
  getIsLoadMerchantRequestCompleted,
  getIsMerchantMembershipEnabled,
  getIsMerchantEnabledStoreCredits,
} from '../../../../../../redux/modules/merchant/selectors';
import { getMembershipTierList, getHighestMembershipTier } from '../../../../../../redux/modules/membership/selectors';
import {
  getSource,
  getIsFromJoinMembershipUrlClick,
  getIsFromReceiptJoinMembershipUrlQRScan,
  getIsFromEarnedCashbackQRScan,
  getIsFromSeamlessLoyaltyQrScan,
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

export const getIsCashbackPromptDrawerShow = state => state.business.membershipDetailV2.isCashbackPromptDrawerShow;

export const getIsStoreCreditsPromptDrawerShow = state =>
  state.business.membershipDetailV2.isStoreCreditsPromptDrawerShow;

export const getLoadMerchantBirthdayCampaignData = state =>
  state.business.membershipDetailV2.loadMerchantBirthdayCampaignRequest.data;

export const getLoadMerchantBirthdayCampaignStatus = state =>
  state.business.membershipDetailV2.loadMerchantBirthdayCampaignRequest.status;

export const getLoadMerchantBirthdayCampaignError = state =>
  state.business.membershipDetailV2.loadMerchantBirthdayCampaignRequest.error;

export const getIsProfileModalShow = state => state.business.membershipDetailV2.profileModalRequest.show;

export const getIsProfileModalSkipButtonShow = state =>
  state.business.membershipDetailV2.profileModalRequest.showSkipButton;

/**
 * Derived selectors
 */

export const getIsBirthdayCampaignActivated = createSelector(
  getLoadMerchantBirthdayCampaignData,
  loadMerchantBirthdayCampaignData => _get(loadMerchantBirthdayCampaignData, 'isActivated', false)
);

export const getIsBirthdayCampaignEntryShow = createSelector(
  getIsBirthdayCampaignActivated,
  getIsUserProfileIncomplete,
  (isBirthdayCampaignActivated, isUserProfileIncomplete) => isBirthdayCampaignActivated && isUserProfileIncomplete
);

export const getFetchUniquePromoListBannersLimit = createSelector(
  getIsProfileModalShow,
  isProfileModalShow => isProfileModalShow
);

export const getIsUserFromOrdering = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.THANK_YOU_CASHBACK_CLICK
);

// Header
export const getShouldShowBackButton = createSelector(getIsUserFromOrdering, isUserFromOrdering => isUserFromOrdering);

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
 * - left total rate = (left to reach next total / tier spendThreshold gap) * each tier rate
 * - 100 * (next level rate + left total rate)% - icon radius
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
    // eachTierRate point is at the center of the icon
    // Some progress bar process will be covered, should minus half icon width
    const iconCoveredWidth = MEMBER_ICON_WIDTH / 2;

    if (currentLevel === highestTierLevel) {
      return { width: '100%' };
    }

    const eachTierRate = 1 / (membershipTierListLength - 1);
    const currentLevelTotalRate = eachTierRate * (currentLevel - 1);
    const nextLevelTotalRate = eachTierRate * currentLevel;

    if (isMerchantMembershipPointsEnabled) {
      if (exceedCurrentLevelPoints === 0) {
        return { width: `${100 * currentLevelTotalRate}%` };
      }

      const leftPointsRate =
        (eachTierRate * (nextPointsThreshold - currentPointsThreshold - exceedCurrentLevelPoints)) /
        (nextPointsThreshold - currentPointsThreshold);

      return {
        width: `calc(${100 * nextLevelTotalRate}% - ${100 * leftPointsRate}% - ${iconCoveredWidth}px)`,
      };
    }

    if (exceedCurrentLevelSpending === 0) {
      return { width: `${100 * currentLevelTotalRate}%` };
    }

    const leftSpendingRate =
      eachTierRate *
      ((nextSpendingThreshold - currentSpendingThreshold - exceedCurrentLevelSpending) /
        (nextSpendingThreshold - currentSpendingThreshold));

    return {
      width: `calc(${100 * nextLevelTotalRate}% - ${100 * leftSpendingRate}% - ${iconCoveredWidth}px)`,
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
      [MEMBERSHIP_TIER_I18N_PARAM_KEYS.NEXT_TIER_POINTS_THRESHOLD]: nextTierPointsThreshold || 0,
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

export const getIsMemberCardShow = createSelector(
  getIsMerchantMembershipEnabled,
  getIsMerchantEnabledCashback,
  getIsMerchantEnabledStoreCredits,
  getMembershipTierListLength,
  (isMerchantMembershipEnabled, isMerchantEnabledCashback, isMerchantEnabledStoreCredits, membershipTierListLength) =>
    !(
      isMerchantMembershipEnabled &&
      (isMerchantEnabledCashback || isMerchantEnabledStoreCredits) &&
      membershipTierListLength === 1
    )
);

// Rewards Buttons
export const getIsRewardsButtonsShow = createSelector(
  getIsMerchantMembershipPointsEnabled,
  getMembershipTierListLength,
  (isMerchantMembershipPointsEnabled, membershipTierListLength) =>
    isMerchantMembershipPointsEnabled || membershipTierListLength > 1
);

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
  getMembershipTierListLength,
  (isMerchantMembershipPointsEnabled, membershipTierListLength) =>
    !isMerchantMembershipPointsEnabled && membershipTierListLength === 1
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
export const getClaimOrderRewardsCategories = createSelector(
  getClaimOrderRewardsPointsStatus,
  getClaimOrderRewardsCashbackStatus,
  getClaimOrderRewardsTransactionStatus,
  getIsNewMember,
  (pointsStatus, cashbackStatus, transactionStatus, isNewMember) =>
    getReceiptOrderRewardsStatusCategories({
      pointsStatus,
      cashbackStatus,
      transactionStatus,
      isNewMember,
    })
);

export const getClaimOrderRewardsPrompt = createSelector(
  getIsFromReceiptJoinMembershipUrlQRScan,
  getClaimOrderRewardsCategories,
  getClaimOrderRewardsPointsValue,
  getClaimOrderRewardsCashbackPrice,
  getIsNewMember,
  (isFromReceiptJoinMembershipUrlQRScan, categories, pointsValue, cashbackPrice, isNewMember) => {
    const baseParams = {
      [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_POINTS_VALUE]: pointsValue,
      [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_CASHBACK_VALUE]: cashbackPrice,
    };

    if (categories.length === 0 || !isFromReceiptJoinMembershipUrlQRScan) {
      return null;
    }

    return categories.map(category => {
      const { key, status } = category;
      const { titleI18nKey, descriptionI18nKey, titleI18nParamsKeys } =
        (isNewMember ? NEW_MEMBER_I18N_KEYS[status] : RETURNING_MEMBER_I18N_KEYS[status]) || {};
      const rewardsParams = {
        [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARDS]: i18next.t('Rewards:Rewards').toLowerCase(),
        [MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARD_TYPE]: i18next.t('Rewards:Reward').toLowerCase(),
      };
      let titleI18nParams = null;

      if (key === CLAIMED_ORDER_REWARD_NAMES.CASHBACK) {
        rewardsParams[MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARDS] = i18next.t('Common:Cashback').toLowerCase();
        rewardsParams[MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARD_TYPE] = i18next.t('Common:Cashback').toLowerCase();
      } else if (key === CLAIMED_ORDER_REWARD_NAMES.POINTS) {
        rewardsParams[MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARDS] = i18next.t('Rewards:Points').toLowerCase();
        rewardsParams[MEMBER_TYPE_I18N_PARAM_KEYS.RECEIPT_REWARD_TYPE] = i18next.t('Rewards:Points').toLowerCase();
      }

      if (titleI18nParamsKeys) {
        titleI18nParamsKeys.forEach(paramKey => {
          const param = baseParams[paramKey] || rewardsParams[paramKey];

          if (param) {
            titleI18nParams = titleI18nParams || {};
            titleI18nParams[paramKey] = param;
          }
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

export const getIsOrderRewardsEarned = createSelector(getClaimOrderRewardsCategories, claimOrderRewardsCategories =>
  claimOrderRewardsCategories.some(category => category.isEarned)
);

export const getNewMemberPromptCategory = createSelector(
  getIsFromJoinMembershipUrlClick,
  getIsLoadCustomerRequestCompleted,
  getIsLoadMerchantRequestCompleted,
  getIsFromSeamlessLoyaltyQrScan,
  getIsMerchantMembershipPointsEnabled,
  getIsMerchantEnabledCashback,
  getIsFromEarnedCashbackQRScan,
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
    isFromEarnedCashbackQRScan,
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

    if (isFromEarnedCashbackQRScan) {
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
  getIsFromEarnedCashbackQRScan,
  getIsLoadMerchantRequestCompleted,
  getIsMerchantMembershipPointsEnabled,
  getIsLoadCustomerRequestCompleted,
  getIsMerchantEnabledCashback,
  getOrderReceiptClaimedCashbackStatus,
  getCustomerCashback,
  getIsFromReceiptJoinMembershipUrlQRScan,
  (
    isFromJoinMembershipUrlClick,
    isFromSeamlessLoyaltyQRScan,
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

    if (isFromSeamlessLoyaltyQRScan) {
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
