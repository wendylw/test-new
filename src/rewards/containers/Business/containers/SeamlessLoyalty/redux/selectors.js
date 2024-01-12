import { createSelector } from '@reduxjs/toolkit';
import { getQueryString } from '../../../../../../common/utils';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import {
  getLoadMerchantRequestError,
  getIsLoadMerchantRequestCompleted,
} from '../../../../../../redux/modules/merchant/selectors';
import { getIsLogin } from '../../../../../../redux/modules/user/selectors';
import {
  getConfirmSharingConsumerInfoStatus,
  getConfirmSharingConsumerInfoError,
} from '../../../redux/common/selectors';

export const getSeamlessLoyaltyRequestId = () => getQueryString('shareInfoReqId');

export const getSeamlessLoyaltyPageHashCode = () => getQueryString('h');

export const getUpdateSharingConsumerInfoError = state =>
  state.business.seamlessLoyalty.updateSharingConsumerInfo.error;

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

export const getAnyInitialRequestError = createSelector(
  getUpdateSharingConsumerInfoError,
  getConfirmSharingConsumerInfoError,
  getLoadMerchantRequestError,
  (updateSharingConsumerInfoError, confirmSharingConsumerInfoError, loadMerchantRequestError) =>
    updateSharingConsumerInfoError || confirmSharingConsumerInfoError || loadMerchantRequestError
);
