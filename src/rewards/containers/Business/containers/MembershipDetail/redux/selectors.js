import { createSelector } from 'reselect';
import {
  BECOME_MERCHANT_MEMBER_METHODS,
  PROMO_VOUCHER_DISCOUNT_TYPES,
  PROMO_VOUCHER_STATUS,
  MEMBER_LEVELS,
  MEMBER_CARD_COLOR_PALETTES,
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
} from '../utils/constants';
import { getSource, getIsWebview } from '../../../../../redux/modules/common/selectors';
import { getOrderReceiptClaimedCashbackStatus, getOrderReceiptClaimedCashback } from '../../../redux/common/selectors';
import {
  getMerchantCurrency,
  getMerchantLocale,
  getMerchantCountry,
  getIsMerchantEnabledCashback,
  getIsMerchantEnabledDelivery,
  getIsMerchantEnabledOROrdering,
} from '../../../../../../redux/modules/merchant/selectors';
import { getMembershipTierList, getHighestMembershipTier } from '../../../../../../redux/modules/membership/selectors';
import {
  getCustomerCashback,
  getCustomerTierTotalSpent,
  getCustomerTierLevel,
  getCustomerTierNextReviewTime,
  getIsLoadCustomerRequestCompleted,
  getCustomerTierLevelName,
} from '../../../../../redux/modules/customer/selectors';

export const getLoadUniquePromoListData = state =>
  state.business.membershipDetail.loadUniquePromoListRequest.data || [];

export const getLoadUniquePromoListStatus = state => state.business.membershipDetail.loadUniquePromoListRequest.status;

export const getLoadUniquePromoListError = state => state.business.membershipDetail.loadUniquePromoListRequest.error;

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

export const getUniquePromoList = createSelector(
  getMerchantCurrency,
  getMerchantLocale,
  getMerchantCountry,
  getLoadUniquePromoListData,
  (merchantCurrency, merchantLocale, merchantCountry, uniquePromoList) =>
    uniquePromoList.map(promo => {
      if (!promo) {
        return promo;
      }

      const { id, discountType, discountValue, name, validTo, status, minSpendAmount } = promo;

      return {
        id,
        value:
          discountType === PROMO_VOUCHER_DISCOUNT_TYPES.PERCENTAGE
            ? `${discountValue}%`
            : getPrice(discountValue, { locale: merchantLocale, currency: merchantCurrency, country: merchantCountry }),
        name,
        status,
        limitations: [
          minSpendAmount && {
            key: `unique-promo-${id}-limitation-0`,
            i18nKey: 'MinConsumption',
            params: {
              amount: getPrice(minSpendAmount, {
                locale: merchantLocale,
                currency: merchantCurrency,
                country: merchantCountry,
              }),
            },
          },
          validTo && {
            key: `unique-promo-${id}-limitation-1`,
            i18nKey: 'ValidUntil',
            params: { date: formatTimeToDateString(merchantCountry, validTo) },
          },
        ].filter(limitation => Boolean(limitation)),
        isUnavailable: [PROMO_VOUCHER_STATUS.EXPIRED, PROMO_VOUCHER_STATUS.REDEEMED].includes(status),
      };
    })
);

export const getNewMemberPromptCategory = createSelector(
  getIsLoadCustomerRequestCompleted,
  getIsMerchantEnabledCashback,
  getCustomerCashback,
  getOrderReceiptClaimedCashbackStatus,
  getIsFromSeamlessLoyaltyQrScan,
  getIsFromJoinMembershipUrlClick,
  getIsFromEarnedCashbackQrScan,
  (
    isLoadCustomerRequestCompleted,
    isMerchantEnabledCashback,
    customerCashback,
    claimedCashbackStatus,
    isFromSeamlessLoyaltyQrScan,
    isFromJoinMembershipUrlClick,
    isFromEarnedCashbackQrScan
  ) => {
    if (isFromJoinMembershipUrlClick) {
      return NEW_MEMBER_TYPES.DEFAULT;
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
  getCustomerCashback,
  getOrderReceiptClaimedCashbackStatus,
  getIsFromJoinMembershipUrlClick,
  getIsFromSeamlessLoyaltyQrScan,
  getIsFromEarnedCashbackQrScan,
  (
    isLoadCustomerRequestCompleted,
    isMerchantEnabledCashback,
    customerCashback,
    claimedCashbackStatus,
    isFromJoinMembershipUrlClick,
    isFromSeamlessLoyaltyQrScan,
    isFromEarnedCashbackQrScan
  ) => {
    if (isFromJoinMembershipUrlClick) {
      return RETURNING_MEMBER_TYPES.DEFAULT;
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

export const getMemberCardMembershipProgressTierList = createSelector(
  getCustomerTierLevel,
  getCustomerMembershipNextLevel,
  getCurrentCustomerLevelSpendingThreshold,
  getCustomerTierTotalSpent,
  getMembershipTierList,
  (
    customerTierLevel,
    customerMembershipNextLevel,
    currentCustomerLevelSpendingThreshold,
    customerTierTotalSpent,
    membershipTierList
  ) =>
    membershipTierList.map(({ level, name, spendingThreshold }) => {
      const tierColorPalette = MEMBER_CARD_COLOR_PALETTES[level] || MEMBER_CARD_COLOR_PALETTES[MEMBER_LEVELS.MEMBER];
      const tier = {
        level,
        name,
        spendingThreshold,
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
        const unlockSpentNumber = customerTierTotalSpent - currentCustomerLevelSpendingThreshold;
        const unlockSpentThreshold = spendingThreshold - currentCustomerLevelSpendingThreshold;
        const progressPercentageNumber = Number.parseFloat(
          ((unlockSpentNumber < 0 ? 0 : unlockSpentNumber) / unlockSpentThreshold) * 100
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
  (customerTierLevel, customerTierTotalSpent, highestMembershipTier) => {
    const { level: highestTierLevel, spendingThreshold: highestTierSpendingThreshold } = highestMembershipTier;

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
  (
    customerTierLevelName,
    customerTierTotalSpent,
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
    const { name: nextTierName, spendingThreshold: nextTierSpendingThreshold } = nextTier || {};

    messageI18nParamsKeys.forEach(paramKey => {
      switch (paramKey) {
        case MEMBERSHIP_LEVEL_I18N_PARAM_KEYS.UNLOCK_SPEND_PRICE:
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
