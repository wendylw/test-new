import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../../../utils/constants';
import { getIsWebview } from '../../../../../redux/modules/common/selectors';
import { FEATURE_KEYS } from '../../../../../../redux/modules/growthbook/constants';
import { getFeatureFlagResult } from '../../../../../../redux/modules/growthbook/selectors';
import { getIsCheckLoginRequestCompleted } from '../../../../../../redux/modules/user/selectors';

export const getBusinessLogo = () =>
  'https://i.etsystatic.com/isla/2d7134/54253089/isla_500x500.54253089_5oqc7two.jpg?version=0';

export const getBusinessName = () => 'Loopy Slime - Best Slime Shop on Etsy';

export const getBusinessRewardsUrl = state =>
  getFeatureFlagResult(state, FEATURE_KEYS.FOUNDATION_OF_TIERED_MEMBERSHIP).introURL;

export const getCongratulationUrl = state =>
  getFeatureFlagResult(state, FEATURE_KEYS.FOUNDATION_OF_TIERED_MEMBERSHIP).congratsURL;

export const getShouldShowPageLoader = createSelector(
  getIsCheckLoginRequestCompleted,
  isCheckLoginRequestCompleted => !isCheckLoginRequestCompleted
);

export const getShouldShowUnknownError = () => false;

export const getJoinMembershipRequest = state => state.business.membershipForm.joinMembershipRequest;

export const getJoinMembershipRequestStatus = createSelector(
  getJoinMembershipRequest,
  joinMembershipRequest => joinMembershipRequest.status
);

export const getIsJoinMembershipRequestStatusFulfilled = createSelector(
  getJoinMembershipRequestStatus,
  joinMembershipRequestStatus => joinMembershipRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getShouldShowCongratulation = createSelector(
  getIsJoinMembershipRequestStatusFulfilled,
  isJoinMembershipRequestStatusFulfilled => isJoinMembershipRequestStatusFulfilled
);

export const getShouldShowBackButton = createSelector(getIsWebview, isInWebview => isInWebview);

export const getIsJoinNowButtonDisabled = () => false;
