import { createSelector } from 'reselect';
import { getQueryString } from '../../../../../../common/utils';
import {
  getIsBusinessMembershipEnabled,
  getIsBusinessInfoRequestStatusCompleted,
} from '../../../redux/common/selectors';
import {
  getHasUserJoinedBusinessMembership,
  getIsLoadCustomerRequestCompleted,
} from '../../../../../redux/modules/customer/selectors';

export const getSeamlessLoyaltyRequestId = getQueryString('shareInfoReqId');

export const getIsRedirectToSeamlessLoyalty = createSelector(
  getIsBusinessMembershipEnabled,
  getIsBusinessInfoRequestStatusCompleted,
  (isBusinessMembershipEnabled, isBusinessInfoRequestStatusCompleted) =>
    isBusinessInfoRequestStatusCompleted && isBusinessMembershipEnabled
);

export const getIsRedirectToMembershipDetail = createSelector(
  getIsBusinessMembershipEnabled,
  getIsLoadCustomerRequestCompleted,
  getHasUserJoinedBusinessMembership,
  getIsBusinessInfoRequestStatusCompleted,
  (
    isBusinessMembershipEnabled,
    isLoadCustomerRequestCompleted,
    hasUserJoinedBusinessMembership,
    isBusinessInfoRequestStatusCompleted
  ) =>
    isBusinessInfoRequestStatusCompleted &&
    isBusinessMembershipEnabled &&
    isLoadCustomerRequestCompleted &&
    hasUserJoinedBusinessMembership
);
