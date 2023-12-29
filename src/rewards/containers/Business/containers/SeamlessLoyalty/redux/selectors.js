import { createSelector } from '@reduxjs/toolkit';
import { getQueryString } from '../../../../../../common/utils';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { getIsLoadMerchantRequestCompleted } from '../../../../../redux/modules/merchant/selectors';
import { getIsLogin } from '../../../../../../redux/modules/user/selectors';

export const getSeamlessLoyaltyRequestId = () => getQueryString('shareInfoReqId');

export const getConfirmSharingConsumerInfoStatus = state =>
  state.rewards.business.seamlessLoyalty.confirmSharingConsumerInfo.status;

/**
 * Derived selectors
 */
export const getIsConfirmSharingConsumerInfoCompleted = createSelector(
  getConfirmSharingConsumerInfoStatus,
  confirmSharingConsumerInfoStatus =>
    [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(confirmSharingConsumerInfoStatus)
);

export const getIsSharingConsumerInfoEnabled = createSelector(
  getIsLogin,
  getSeamlessLoyaltyRequestId,
  (isLogin, requestId) => isLogin && !!requestId
);

export const getIsAllInitialRequestsCompleted = createSelector(
  getIsConfirmSharingConsumerInfoCompleted,
  getIsLoadMerchantRequestCompleted,
  (isConfirmSharingConsumerInfoCompleted, isLoadMerchantRequestCompleted) =>
    isConfirmSharingConsumerInfoCompleted && isLoadMerchantRequestCompleted
);
