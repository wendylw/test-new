import _get from 'lodash/get';
import _last from 'lodash/last';
import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../common/utils/constants';
import { getCustomerIsNewMember } from '../../../ordering/redux/modules/app';

export const getJoinMembershipRequest = state => state.membership.joinMembershipRequest;

export const getJoinMembershipRequestInfo = createSelector(
  getJoinMembershipRequest,
  joinMembershipRequest => joinMembershipRequest.data
);

export const getJoinMembershipRequestStatus = createSelector(
  getJoinMembershipRequest,
  joinMembershipRequest => joinMembershipRequest.status
);

export const getIsJoinMembershipRequestStatusPending = createSelector(
  getJoinMembershipRequestStatus,
  joinMembershipRequestStatus => joinMembershipRequestStatus === API_REQUEST_STATUS.PENDING
);

export const getIsJoinMembershipRequestStatusFulfilled = createSelector(
  getJoinMembershipRequestStatus,
  joinMembershipRequestStatus => joinMembershipRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsJoinMembershipRequestStatusCompleted = createSelector(
  getJoinMembershipRequestStatus,
  joinMembershipRequestStatus =>
    [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(joinMembershipRequestStatus)
);

export const getIsJoinMembershipNewMember = createSelector(getJoinMembershipRequestInfo, joinMembershipRequestInfo =>
  _get(joinMembershipRequestInfo, 'isNewMember', false)
);

export const getMembershipsData = state => state.membership.loadMembershipRequest.data;

export const getLoadMembershipsRequestStatus = state => state.membership.loadMembershipRequest.status;

export const getLoadMembershipsRequestError = state => state.membership.loadMembershipRequest.error;

export const getMembershipTierList = createSelector(getMembershipsData, membershipsData =>
  _get(membershipsData, 'businessMembershipTiers', [])
);

/**
 * Derived selectors
 */
export const getHighestMembershipTier = createSelector(
  getMembershipTierList,
  membershipTierList => _last(membershipTierList) || {}
);
