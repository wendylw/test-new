import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../common/utils/constants';

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

export const getMembershipTiersData = state => state.membership.loadMembershipTiersRequest.data;

export const getLoadMembershipTiersRequestStatus = state => state.membership.loadMembershipTiersRequest.status;

export const getLoadMembershipTiersRequestError = state => state.membership.loadMembershipTiersRequest.error;

/**
 * Derived selectors
 */
export const getIsMembershipTierList = createSelector(getMembershipTiersData, membershipTiersData =>
  _get(membershipTiersData, 'businessMembershipTiers', [])
);
