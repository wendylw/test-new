import { createSelector } from 'reselect';
import { getQueryString } from '../../../../../../common/utils';
import {
  getIsMerchantEnabledMembership,
  getIsLoadMerchantRequestCompleted,
  getIsMerchantMembershipTurnOn,
} from '../../../../../redux/modules/merchant/selectors';
import { getHasUserJoinedMerchantMembership } from '../../../../../redux/modules/customer/selectors';

export const getSeamlessLoyaltyRequestId = getQueryString('shareInfoReqId');

export const getIsRedirectToSeamlessLoyalty = createSelector(
  getIsMerchantEnabledMembership,
  getIsLoadMerchantRequestCompleted,
  (isMerchantEnabledMembership, isLoadMerchantRequestCompleted) =>
    isLoadMerchantRequestCompleted && !isMerchantEnabledMembership
);

export const getIsRedirectToMembershipDetail = createSelector(
  getIsMerchantMembershipTurnOn,
  getHasUserJoinedMerchantMembership,
  (isMerchantMembershipTurnOn, hasUserJoinedMerchantMembership) =>
    isMerchantMembershipTurnOn && hasUserJoinedMerchantMembership
);
