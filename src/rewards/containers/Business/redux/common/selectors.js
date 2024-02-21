import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { getQueryString } from '../../../../../common/utils';
import { getIsJoinMembershipNewMember } from '../../../../../redux/modules/membership/selectors';

export const getIsClaimedOrderCashbackNewMember = () => getQueryString('isNewMember') === 'true';

export const getConfirmSharingConsumerInfoData = state => state.business.common.confirmSharingConsumerInfoRequest.data;

export const getConfirmSharingConsumerInfoStatus = state =>
  state.business.common.confirmSharingConsumerInfoRequest.status;

export const getConfirmSharingConsumerInfoError = state =>
  state.business.common.confirmSharingConsumerInfoRequest.error;

export const getIsConfirmSharingNewCustomer = createSelector(
  getConfirmSharingConsumerInfoData,
  confirmSharingConsumerInfoData => _get(confirmSharingConsumerInfoData, 'isNewCustomer', false)
);

export const getIsConfirmSharingNewMember = createSelector(
  getConfirmSharingConsumerInfoData,
  confirmSharingConsumerInfoData => _get(confirmSharingConsumerInfoData, 'joinMembershipResult.isNewMember', false)
);

export const getIsNewMember = createSelector(
  getIsJoinMembershipNewMember,
  getIsConfirmSharingNewMember,
  getIsClaimedOrderCashbackNewMember,
  (isJoinMembershipNewMember, isConfirmSharingNewMember, isClaimedOrderCashbackNewMember) =>
    isJoinMembershipNewMember || isConfirmSharingNewMember || isClaimedOrderCashbackNewMember
);
