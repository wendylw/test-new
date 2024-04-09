import { createSelector } from 'reselect';
import {
  BECOME_MERCHANT_MEMBER_METHODS,
  PROMO_VOUCHER_DISCOUNT_TYPES,
  PROMO_VOUCHER_STATUS,
  MEMBER_LEVELS,
  MEMBER_CARD_COLOR_PALETTES,
  API_REQUEST_STATUS,
} from '../../../../../../common/utils/constants';
import { getPrice, toCapitalize } from '../../../../../../common/utils';
import { formatTimeToDateString } from '../../../../../../utils/datetime-lib';
import {
  MEMBER_TYPE_I18N_PARAM_KEYS,
  NEW_MEMBER_TYPES,
  NEW_MEMBER_CASHBACK_STATUS_TYPES,
  NEW_MEMBER_I18N_KEYS,
  RETURNING_MEMBER_TYPES,
  RETURNING_MEMBER_CASHBACK_STATUS_TYPES,
  RETURNING_MEMBER_I18N_KEYS,
  MEMBERSHIP_LEVEL_I18N_PARAM_KEYS,
  MEMBERSHIP_LEVEL_I18N_KEYS,
  MEMBERSHIP_LEVEL_STATUS,
  CLAIMED_POINTS_REWARD_ERROR_CODES,
  CLAIMED_POINTS_REWARD_ERROR_I18N_KEYS,
} from '../utils/constants';
import { getSource, getIsWebview } from '../../../../../redux/modules/common/selectors';
import {
  getOrderReceiptClaimedCashbackStatus,
  getOrderReceiptClaimedCashback,
  getRemainingCashbackExpiredDays,
} from '../../../redux/common/selectors';
import {
  getMerchantCurrency,
  getMerchantLocale,
  getMerchantCountry,
  getIsMerchantEnabledCashback,
  getIsMerchantEnabledLoyalty,
  getIsMerchantEnabledDelivery,
  getIsMerchantEnabledOROrdering,
  getIsMerchantMembershipPointsEnabled,
} from '../../../../../../redux/modules/merchant/selectors';
import { getMembershipTierList, getHighestMembershipTier } from '../../../../../../redux/modules/membership/selectors';
import {
  getCustomerCashback,
  getCustomerTierTotalSpent,
  getCustomerTierPointsTotal,
  getCustomerTierLevel,
  getCustomerTierNextReviewTime,
  getIsLoadCustomerRequestCompleted,
  getCustomerTierLevelName,
  getCustomerAvailablePointsBalance,
} from '../../../../../redux/modules/customer/selectors';

export const getIsProfileModalShow = state => state.business.membershipDetail.isProfileModalShow;

export const getLoadPointsRewardListData = state =>
  state.business.membershipDetail.loadPointsRewardListRequest.data || [];

export const getLoadPointsRewardListStatus = state =>
  state.business.membershipDetail.loadPointsRewardListRequest.status;

export const getLoadPointsRewardListError = state => state.business.membershipDetail.loadPointsRewardListRequest.error;

export const getClaimPointsRewardStatus = state => state.business.membershipDetail.claimPointsRewardRequest.status;

export const getClaimPointsRewardError = state => state.business.membershipDetail.claimPointsRewardRequest.error;

/**
 * Derived selectors
 */

export const getIsFromEarnedCashbackQRScan = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.EARNED_CASHBACK_QR_SCAN
);

export const getIsFromJoinMembershipUrlClick = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.JOIN_MEMBERSHIP_URL_CLICK
);

export const getIsFromSeamlessLoyaltyQrScan = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.SEAMLESS_LOYALTY_QR_SCAN
);

export const getIsUserFromOrdering = createSelector(getSource, source =>
  [BECOME_MERCHANT_MEMBER_METHODS.THANK_YOU_CASHBACK_CLICK].includes(source)
);

export const getIsFromEarnedCashbackQrScan = createSelector(
  getSource,
  source => source === BECOME_MERCHANT_MEMBER_METHODS.EARNED_CASHBACK_QR_SCAN
);

export const getIsOrderAndRedeemButtonDisplay = createSelector(
  getIsMerchantEnabledOROrdering,
  getIsMerchantEnabledDelivery,
  getIsUserFromOrdering,
  (isOROrderingEnabled, isDeliveryEnabled, isUserFromOrdering) =>
    !isUserFromOrdering && isOROrderingEnabled && isDeliveryEnabled
);

export const getNewMemberPromptCategory = createSelector(
  getIsLoadCustomerRequestCompleted,
  getIsMerchantEnabledCashback,
  getIsMerchantMembershipPointsEnabled,
  getCustomerCashback,
  getOrderReceiptClaimedCashbackStatus,
  getIsFromSeamlessLoyaltyQrScan,
  getIsFromJoinMembershipUrlClick,
  getIsFromEarnedCashbackQrScan,
  (
    isLoadCustomerRequestCompleted,
    isMerchantEnabledCashback,
    isMerchantMembershipPointsEnabled,
    customerCashback,
    claimedCashbackStatus,
    isFromSeamlessLoyaltyQrScan,
    isFromJoinMembershipUrlClick,
    isFromEarnedCashbackQrScan
  ) => {
    if (isFromJoinMembershipUrlClick) {
      return NEW_MEMBER_TYPES.DEFAULT;
    }

    if (isFromSeamlessLoyaltyQrScan && isMerchantMembershipPointsEnabled) {
      return NEW_MEMBER_TYPES.ENABLED_POINTS;
    }

    if (isFromSeamlessLoyaltyQrScan && isLoadCustomerRequestCompleted) {
      return isMerchantEnabledCashback && customerCashback > 0
        ? NEW_MEMBER_TYPES.REDEEM_CASHBACK
        : NEW_MEMBER_TYPES.DEFAULT;
    }

    if (isFromEarnedCashbackQrScan) {
      const claimedCashbackType = NEW_MEMBER_CASHBACK_STATUS_TYPES[claimedCashbackStatus];

      return claimedCashbackType || NEW_MEMBER_TYPES.DEFAULT;
    }

    // WB-6499: show default new member prompt.
    return NEW_MEMBER_TYPES.DEFAULT;
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
  getIsLoadCustomerRequestCompleted,
  getIsMerchantEnabledCashback,
  getIsMerchantMembershipPointsEnabled,
  getCustomerCashback,
  getOrderReceiptClaimedCashbackStatus,
  getIsFromJoinMembershipUrlClick,
  getIsFromSeamlessLoyaltyQrScan,
  getIsFromEarnedCashbackQrScan,
  (
    isLoadCustomerRequestCompleted,
    isMerchantEnabledCashback,
    isMerchantMembershipPointsEnabled,
    customerCashback,
    claimedCashbackStatus,
    isFromJoinMembershipUrlClick,
    isFromSeamlessLoyaltyQrScan,
    isFromEarnedCashbackQrScan
  ) => {
    if (isFromJoinMembershipUrlClick) {
      return RETURNING_MEMBER_TYPES.DEFAULT;
    }

    if (isFromSeamlessLoyaltyQrScan && isMerchantMembershipPointsEnabled) {
      return RETURNING_MEMBER_TYPES.ENABLED_POINTS;
    }

    if (isFromSeamlessLoyaltyQrScan && isLoadCustomerRequestCompleted) {
      return isMerchantEnabledCashback && customerCashback > 0
        ? RETURNING_MEMBER_TYPES.REDEEM_CASHBACK
        : RETURNING_MEMBER_TYPES.THANKS_COMING_BACK;
    }

    if (isFromEarnedCashbackQrScan) {
      const claimedCashbackType = RETURNING_MEMBER_CASHBACK_STATUS_TYPES[claimedCashbackStatus];

      return claimedCashbackType || RETURNING_MEMBER_TYPES.DEFAULT;
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

export const getShouldShowBackButton = createSelector(
  getIsWebview,
  getIsUserFromOrdering,
  (isInWebview, isUserFromOrdering) => isInWebview || isUserFromOrdering
);

// If the level is not by design, use member style by default.
export const getMemberColorPalettes = createSelector(
  getCustomerTierLevel,
  customerTierLevel => MEMBER_CARD_COLOR_PALETTES[customerTierLevel] || MEMBER_CARD_COLOR_PALETTES[MEMBER_LEVELS.MEMBER]
);

export const getMemberCardStyles = createSelector(getMemberColorPalettes, memberCardColorPalettes => ({
  color: memberCardColorPalettes.font,
  background: `linear-gradient(105deg, ${memberCardColorPalettes.background.startColor} 0%, ${memberCardColorPalettes.background.midColor} 50%,${memberCardColorPalettes.background.endColor} 100%)`,
}));

export const getMemberCardTierProgressBarStyles = createSelector(getMemberColorPalettes, memberCardColorPalettes => ({
  color: memberCardColorPalettes.font,
  activeBackground: memberCardColorPalettes.icon.outlineColor,
  progressBackground: memberCardColorPalettes.progress,
}));

export const getMemberCardIconColors = createSelector(getMemberColorPalettes, memberCardColorPalettes => ({
  crownStartColor: memberCardColorPalettes.icon.crown.startColor,
  crownEndColor: memberCardColorPalettes.icon.crown.endColor,
  backgroundStartColor: memberCardColorPalettes.icon.background.startColor,
  backgroundEndColor: memberCardColorPalettes.icon.background.endColor,
}));

export const getIsMemberCardMembershipProgressBarShow = createSelector(
  getMembershipTierList,
  membershipTierList => membershipTierList.length > 1
);

export const getCustomerMembershipNextLevel = createSelector(getCustomerTierLevel, customerTierLevel => {
  const memberLevels = Object.values(MEMBER_LEVELS);
  const currentLevelIndex = memberLevels.indexOf(customerTierLevel);

  return memberLevels[currentLevelIndex + 1];
});

export const getCurrentCustomerLevelSpendingThreshold = createSelector(
  getCustomerTierLevel,
  getMembershipTierList,
  (customerTierLevel, membershipTierList) => {
    const currentTier = membershipTierList.find(({ level }) => level === customerTierLevel);

    return currentTier ? currentTier.spendingThreshold : 0;
  }
);

export const getCurrentCustomerLevelPointsThreshold = createSelector(
  getCustomerTierLevel,
  getMembershipTierList,
  (customerTierLevel, membershipTierList) => {
    const currentTier = membershipTierList.find(({ level }) => level === customerTierLevel);

    return currentTier ? currentTier.pointsThreshold : 0;
  }
);

export const getMemberCardMembershipProgressTierList = createSelector(
  getCustomerTierLevel,
  getCustomerMembershipNextLevel,
  getCurrentCustomerLevelSpendingThreshold,
  getCustomerTierTotalSpent,
  getMembershipTierList,
  getIsMerchantMembershipPointsEnabled,
  getCurrentCustomerLevelPointsThreshold,
  getCustomerTierPointsTotal,
  (
    customerTierLevel,
    customerMembershipNextLevel,
    currentCustomerLevelSpendingThreshold,
    customerTierTotalSpent,
    membershipTierList,
    isMerchantMembershipPointsEnabled,
    currentCustomerLevelPointsThreshold,
    customerTierPointsTotal
  ) =>
    membershipTierList.map(({ level, name, spendingThreshold }) => {
      const tierColorPalette = MEMBER_CARD_COLOR_PALETTES[level] || MEMBER_CARD_COLOR_PALETTES[MEMBER_LEVELS.MEMBER];
      const tier = {
        level,
        name,
        spendingThreshold,
        pointsThreshold,
        progress: '0%',
        active: false,
        iconColors: {
          crownStartColor: tierColorPalette.icon.crown.startColor,
          crownEndColor: tierColorPalette.icon.crown.endColor,
          backgroundStartColor: tierColorPalette.icon.background.startColor,
          backgroundEndColor: tierColorPalette.icon.background.endColor,
        },
      };
      const isAchievedCurrentLevel = level <= customerTierLevel;

      if (isAchievedCurrentLevel) {
        tier.progress = '100%';
        tier.active = true;
      } else if (level === customerMembershipNextLevel) {
        // calculate current level spent total or collected points
        const unlockSpentCollectNumber = isMerchantMembershipPointsEnabled
          ? customerTierPointsTotal - currentCustomerLevelPointsThreshold
          : customerTierTotalSpent - currentCustomerLevelSpendingThreshold;
        // calculate current level should spending total or collecting points total
        const unlockSpentCollectThreshold = isMerchantMembershipPointsEnabled
          ? pointsThreshold - currentCustomerLevelPointsThreshold
          : spendingThreshold - currentCustomerLevelSpendingThreshold;
        // calculate completing percentage
        const progressPercentageNumber = Number.parseFloat(
          ((unlockSpentCollectNumber < 0 ? 0 : unlockSpentCollectNumber) / unlockSpentCollectThreshold) * 100
        ).toFixed(6);

        tier.progress = `${progressPercentageNumber}%`;
      }

      return tier;
    })
);

export const getMemberCardMembershipLevelStatus = createSelector(
  getCustomerTierLevel,
  getCustomerTierTotalSpent,
  getHighestMembershipTier,
  getIsMerchantMembershipPointsEnabled,
  getCustomerTierPointsTotal,
  (
    customerTierLevel,
    customerTierTotalSpent,
    highestMembershipTier,
    isMerchantMembershipPointsEnabled,
    customerTierPointsTotal
  ) => {
    const {
      level: highestTierLevel,
      spendingThreshold: highestTierSpendingThreshold,
      pointsThreshold: highestTierPointsThreshold,
    } = highestMembershipTier;

    if (isMerchantMembershipPointsEnabled) {
      if (customerTierLevel < highestTierLevel) {
        return MEMBERSHIP_LEVEL_STATUS.POINTS_UNLOCK_NEXT_LEVEL;
      }

      if (customerTierLevel === highestTierLevel && customerTierPointsTotal >= highestTierPointsThreshold) {
        return MEMBERSHIP_LEVEL_STATUS.LEVEL_COMPLETED;
      }

      // Customer achieved highest points threshold last review time, customer still maintain highest level.
      // But we will prompt customer to maintain highest level. Because collect points total will be cleared.
      if (customerTierLevel === highestTierLevel && customerTierPointsTotal < highestTierPointsThreshold) {
        return MEMBERSHIP_LEVEL_STATUS.LEVEL_MAINTAIN;
      }
    }

    if (customerTierLevel < highestTierLevel) {
      return MEMBERSHIP_LEVEL_STATUS.UNLOCK_NEXT_LEVEL;
    }

    // Customer achieved highest spending threshold for next review time.
    if (customerTierLevel === highestTierLevel && customerTierTotalSpent >= highestTierSpendingThreshold) {
      return MEMBERSHIP_LEVEL_STATUS.LEVEL_COMPLETED;
    }

    // Customer achieved highest spending threshold last review time, customer still maintain highest level.
    // But we will prompt customer to maintain highest level. Because spend total will be cleared.
    if (customerTierLevel === highestTierLevel && customerTierTotalSpent < highestTierSpendingThreshold) {
      return MEMBERSHIP_LEVEL_STATUS.LEVEL_MAINTAIN;
    }

    return null;
  }
);

export const getMemberCardMembershipProgressMessageIn18nParams = createSelector(
  getCustomerTierLevelName,
  getCustomerTierTotalSpent,
  getCustomerTierNextReviewTime,
  getMembershipTierList,
  getHighestMembershipTier,
  getMerchantLocale,
  getMerchantCurrency,
  getMerchantCountry,
  getCustomerMembershipNextLevel,
  getMemberCardMembershipLevelStatus,
  getCustomerTierPointsTotal,
  (
    customerTierLevelName,
    customerTierTotalSpent,
    customerTierPointsTotal,
    customerTierNextReviewTime,
    membershipTierList,
    highestMembershipTier,
    merchantLocale,
    merchantCurrency,
    merchantCountry,
    customerMembershipNextLevel,
    membershipLevelStatus
  ) => {
    const membershipProgressMessageI18nParams = {};

    if (!membershipLevelStatus) {
      return membershipProgressMessageI18nParams;
    }

    const { messageI18nParamsKeys } = MEMBERSHIP_LEVEL_I18N_KEYS[membershipLevelStatus];
    const nextTier = membershipTierList.find(({ level }) => level === customerMembershipNextLevel);
    const { name: nextTierName, spendingThreshold: nextTierSpendingThreshold, pointsThreshold: nextPointsThreshold } =
      nextTier || {};

    messageI18nParamsKeys.forEach(paramKey => {
      switch (paramKey) {
        case MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.UNLOCK_COLLECT_POINTS:
          membershipProgressMessageI18nParams[paramKey] = nextPointsThreshold - customerTierPointsTotal;
        case MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.MAINTAIN_COLLECT_POINTS:
        case MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.UNLOCK_SPEND_PRICE:
          membershipProgressMessageI18nParams[paramKey] =
            highestMembershipTier.pointsThreshold - customerTierPointsTotal;
          membershipProgressMessageI18nParams[paramKey] = getPrice(nextTierSpendingThreshold - customerTierTotalSpent, {
            locale: merchantLocale,
            currency: merchantCurrency,
            country: merchantCountry,
          });
          break;
        case MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.MAINTAIN_SPEND_PRICE:
          membershipProgressMessageI18nParams[paramKey] = getPrice(
            highestMembershipTier.spendingThreshold - customerTierTotalSpent,
            {
              locale: merchantLocale,
              currency: merchantCurrency,
              country: merchantCountry,
            }
          );
          break;
        case MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.NEXT_REVIEW_DATE:
          membershipProgressMessageI18nParams[paramKey] = formatTimeToDateString(
            merchantCountry,
            customerTierNextReviewTime
          );
          break;
        case MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.NEXT_LEVEL_NAME:
          membershipProgressMessageI18nParams[paramKey] = toCapitalize(nextTierName);
          break;
        case MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.CURRENT_LEVEL_NAME:
          membershipProgressMessageI18nParams[paramKey] = toCapitalize(customerTierLevelName);
          break;
        default:
          break;
      }
    });

    return membershipProgressMessageI18nParams;
  }
);

export const getPointsRewardList = createSelector(
  getLoadPointsRewardListData,
  getCustomerAvailablePointsBalance,
  getMerchantCurrency,
  getMerchantLocale,
  getMerchantCountry,
  (pointsRewardList, customerAvailablePointsBalance, merchantCurrency, merchantLocale, merchantCountry) =>
    pointsRewardList.map(reward => {
      if (!reward) {
        return reward;
      }

      const { id, type, discountType, discountValue, name, redeemedStatus, costOfPoints } = reward;
      const isUnavailableStatus = [PROMO_VOUCHER_STATUS.EXPIRED, PROMO_VOUCHER_STATUS.REDEEMED].includes(
        redeemedStatus
      );
      const isInsufficientPoints = customerAvailablePointsBalance < costOfPoints;

      return {
        id,
        type,
        value:
          discountType === PROMO_VOUCHER_DISCOUNT_TYPES.PERCENTAGE
            ? `${discountValue}%`
            : getPrice(discountValue, { locale: merchantLocale, currency: merchantCurrency, country: merchantCountry }),
        name,
        costOfPoints,
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

export const getIsClaimPointsRewardPending = createSelector(
  getClaimPointsRewardStatus,
  claimPointsRewardStatus => claimPointsRewardStatus === API_REQUEST_STATUS.PENDING
);

export const getIsClaimPointsRewardFulfilled = createSelector(
  getClaimPointsRewardStatus,
  claimPointsRewardStatus => claimPointsRewardStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsClaimPointsRewardLoaderShow = createSelector(
  getIsClaimPointsRewardPending,
  isClaimPointsRewardPending => isClaimPointsRewardPending
);

export const getIsClaimPointsRewardSuccessfulAlertShow = createSelector(
  getIsClaimPointsRewardFulfilled,
  isClaimPointsRewardFulfilled => isClaimPointsRewardFulfilled
);

export const getClaimPointsRewardErrorI18nKeys = createSelector(getClaimPointsRewardError, claimPointsRewardError => {
  if (!claimPointsRewardError) {
    return null;
  }

  const { code } = claimPointsRewardError;

  if (CLAIMED_POINTS_REWARD_ERROR_CODES[code]) {
    return CLAIMED_POINTS_REWARD_ERROR_I18N_KEYS[CLAIMED_POINTS_REWARD_ERROR_CODES[code]];
  }

  return {
    titleI18nKey: 'SomethingWentWrongTitle',
    descriptionI18nKey: 'SomethingWentWrongDescription',
  };
});

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
