import { createSelector } from 'reselect';
import {
  BECOME_MERCHANT_MEMBER_METHODS,
  MEMBER_LEVELS,
  MEMBER_CARD_LEVELS_PALETTES,
} from '../../../../../../common/utils/constants';
import { getIsMerchantMembershipPointsEnabled } from '../../../../../../redux/modules/merchant/selectors';
import { getMembershipTierList } from '../../../../../../redux/modules/membership/selectors';
import { getSource, getIsWebview } from '../../../../../redux/modules/common/selectors';
import { getCustomerTierLevel, getCustomerTierTotalSpent } from '../../../../../redux/modules/customer/selectors';
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

export const getCustomerMemberLevelProgressStyles = createSelector(
  getMembershipTierList,
  getCustomerTierTotalSpent,
  (membershipTierList, customerTierTotalSpent) => {
    const MEMBER_ICON_WIDTH = 30;
    const membershipTiersLength = membershipTierList.length;

    if (membershipTiersLength === 1) {
      return null;
    }

    let currentLevel = null;
    let currentSpendingThreshold = 0;
    let exceedCurrentLevelSpending = 0;

    membershipTierList.forEach(membershipTier => {
      const { spendingThreshold, level } = membershipTier;

      if (spendingThreshold <= customerTierTotalSpent && level > currentLevel) {
        currentLevel = level;
        currentSpendingThreshold = spendingThreshold;
        exceedCurrentLevelSpending = customerTierTotalSpent - spendingThreshold;
      }
    });

    if (currentLevel === membershipTierList.length) {
      return { width: '100%' };
    }

    const eachTierRate = 1 / (membershipTiersLength - 1);
    const currentLevelTotalRate = eachTierRate * (currentLevel - 1);

    if (exceedCurrentLevelSpending === 0) {
      return { width: `calc(${100 * currentLevelTotalRate}% + ${currentLevel * MEMBER_ICON_WIDTH}px)` };
    }

    const nextTier = membershipTierList.find(({ level }) => level === currentLevel + 1);
    const { spendingThreshold: nextSpendingThreshold } = nextTier;
    const exceedSpendingRate =
      eachTierRate * (exceedCurrentLevelSpending / (nextSpendingThreshold - currentSpendingThreshold));

    return {
      width: `calc(${100 * (exceedSpendingRate + currentLevelTotalRate)}% + ${currentLevel * MEMBER_ICON_WIDTH}px)`,
    };
  }
);

export const getIsMyRewardsSectionShow = createSelector(
  getIsMerchantMembershipPointsEnabled,
  getIsUniquePromoListBannersEmpty,
  (isMerchantMembershipPointsEnabled, isUniquePromoListBannersEmpty) =>
    !isMerchantMembershipPointsEnabled && !isUniquePromoListBannersEmpty
);
