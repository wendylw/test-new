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

export const getBusinessInfoRequest = state => state.business.membershipForm.fetchBusinessInfoRequest;

export const getBusinessInfo = createSelector(getBusinessInfoRequest, businessInfoRequest => businessInfoRequest.data);

export const getBusinessLogo = createSelector(getBusinessInfo, businessInfo => _get(businessInfo, 'logo', ''));

export const getBusinessName = createSelector(getBusinessInfo, businessInfo => _get(businessInfo, 'displayName', ''));

export const getIsBusinessMembershipEnabled = createSelector(getBusinessInfo, businessInfo =>
  _get(businessInfo, 'membershipEnabled', false)
);

export const getBusinessInfoRequestStatus = createSelector(
  getBusinessInfoRequest,
  businessInfoRequest => businessInfoRequest.status
);

export const getIsBusinessInfoRequestStatusFulfilled = createSelector(
  getBusinessInfoRequestStatus,
  businessInfoRequestStatus => businessInfoRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsBusinessInfoRequestStatusRejected = createSelector(
  getBusinessInfoRequestStatus,
  businessInfoRequestStatus => businessInfoRequestStatus === API_REQUEST_STATUS.REJECTED
);

export const getIsBusinessInfoRequestStatusCompleted = createSelector(
  getBusinessInfoRequestStatus,
  businessInfoRequestStatus =>
    [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(businessInfoRequestStatus)
);
