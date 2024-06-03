import { createSelector } from 'reselect';
import {
  BECOME_MERCHANT_MEMBER_METHODS,
  MEMBER_LEVELS,
  MEMBER_CARD_LEVELS_PALETTES,
} from '../../../../../../common/utils/constants';
import { getIsMerchantMembershipPointsEnabled } from '../../../../../../redux/modules/merchant/selectors';
import { getMembershipTierList } from '../../../../../../redux/modules/membership/selectors';
import { getSource, getIsWebview } from '../../../../../redux/modules/common/selectors';
import { getIsUniquePromoListEmpty, getIsUniquePromoListBannersEmpty } from '../../../redux/common/selectors';
import { getCustomerTierLevel } from '../../../../../redux/modules/customer/selectors';

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
      iconColorPalettes: MEMBER_CARD_LEVELS_PALETTES[level],
    };
  })
);

export const getIsMyRewardsSectionShow = createSelector(
  getIsMerchantMembershipPointsEnabled,
  getIsUniquePromoListEmpty,
  getIsUniquePromoListBannersEmpty,
  (isMerchantMembershipPointsEnabled, isUniquePromoListEmpty, isUniquePromoListBannersEmpty) =>
    !isMerchantMembershipPointsEnabled && (!isUniquePromoListEmpty || !isUniquePromoListBannersEmpty)
);
