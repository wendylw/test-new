import { createSelector } from 'reselect';
import { BECOME_MERCHANT_MEMBER_METHODS } from '../../../../../../common/utils/constants';
import { getIsMerchantMembershipPointsEnabled } from '../../../../../../redux/modules/merchant/selectors';
import { getSource, getIsWebview } from '../../../../../redux/modules/common/selectors';
import { getIsUniquePromoListEmpty, getIsUniquePromoListBannersEmpty } from '../../../redux/common/selectors';

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

export const getIsMyRewardsSectionShow = createSelector(
  getIsMerchantMembershipPointsEnabled,
  getIsUniquePromoListEmpty,
  getIsUniquePromoListBannersEmpty,
  (isMerchantMembershipPointsEnabled, isUniquePromoListEmpty, isUniquePromoListBannersEmpty) =>
    !isMerchantMembershipPointsEnabled && (!isUniquePromoListEmpty || !isUniquePromoListBannersEmpty)
);
