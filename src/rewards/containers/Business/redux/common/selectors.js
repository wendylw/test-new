import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { getIsJoinMembershipNewMember } from '../../../../../redux/modules/membership/selectors';

export const getConfirmSharingConsumerInfoData = state => state.business.common.confirmSharingConsumerInfoRequest.data;

export const getConfirmSharingConsumerInfoStatus = state =>
  state.business.common.confirmSharingConsumerInfoRequest.status;

export const getConfirmSharingConsumerInfoError = state =>
  state.business.common.confirmSharingConsumerInfoRequest.error;

export const getIsConfirmSharingNewMember = createSelector(
  getConfirmSharingConsumerInfoData,
  confirmSharingConsumerInfoData => _get(confirmSharingConsumerInfoData, 'joinMembershipResult.isNewMember', false)
);

export const getIsNewMember = createSelector(
  getIsJoinMembershipNewMember,
  getIsConfirmSharingNewMember,
  (isJoinMembershipNewMember, isConfirmSharingNewMember) => isJoinMembershipNewMember || isConfirmSharingNewMember
);
