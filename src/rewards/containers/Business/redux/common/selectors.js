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

export const getIsJoinMembershipNewMember = createSelector(getJoinMembershipRequestInfo, joinMembershipRequestInfo =>
  _get(joinMembershipRequestInfo, 'isNewMember', false)
);

export const getConfirmSharingConsumerInfoData = state => state.business.common.confirmSharingConsumerInfo.data;

export const getConfirmSharingConsumerInfoStatus = state => state.business.common.confirmSharingConsumerInfo.status;

export const getConfirmSharingConsumerInfoError = state => state.business.common.confirmSharingConsumerInfo.error;

export const getIsConfirmSharingNewMember = createSelector(
  getConfirmSharingConsumerInfoData,
  confirmSharingConsumerInfoData => _get(confirmSharingConsumerInfoData, 'joinMembershipResult.isNewMember', false)
);

export const getIsNewMember = createSelector(
  getIsJoinMembershipNewMember,
  getIsConfirmSharingNewMember,
  (isJoinMembershipNewMember, isConfirmSharingNewMember) => isJoinMembershipNewMember || isConfirmSharingNewMember
);
