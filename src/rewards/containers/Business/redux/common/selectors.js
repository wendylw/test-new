import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { getQueryString } from '../../../../../common/utils';
import { API_REQUEST_STATUS } from '../../../../../common/utils/constants';

export const getSource = () => getQueryString('source');

export const getJoinMembershipRequest = state => state.business.common.joinMembershipRequest;

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

export const getIsNewMember = createSelector(getJoinMembershipRequestInfo, joinMembershipRequestInfo =>
  _get(joinMembershipRequestInfo, 'isNewMember', false)
);
