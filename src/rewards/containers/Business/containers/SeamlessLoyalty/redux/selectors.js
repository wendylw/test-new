import { getQueryString } from '../../../../../../common/utils';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { getIsLoadMerchantRequestCompleted } from '../../../../../redux/modules/merchant/selectors';

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

export const getIsAllInitialRequestsCompleted = createSelector(
  getIsConfirmSharingConsumerInfoCompleted,
  getIsLoadMerchantRequestCompleted,
  (isConfirmSharingConsumerInfoCompleted, isLoadMerchantRequestCompleted) =>
    !isConfirmSharingConsumerInfoCompleted || !isLoadMerchantRequestCompleted
);
