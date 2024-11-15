import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../common/utils/constants';

export const getLoadOrderRewardsRequestData = state => state.transaction.loadOrderRewardsRequest.data;

export const getLoadOrderRewardsRequestStatus = state => state.transaction.loadOrderRewardsRequest.status;

export const getLoadOrderRewardsRequestError = state => state.transaction.loadOrderRewardsRequest.error;

export const getOrderRewardsPoints = createSelector(getLoadOrderRewardsRequestData, loadOrderRewardsRequestData =>
  _get(loadOrderRewardsRequestData, 'points.amount', 0)
);

export const getOrderRewardsCashback = createSelector(getLoadOrderRewardsRequestData, loadOrderRewardsRequestData =>
  _get(loadOrderRewardsRequestData, 'cashback.amount', 0)
);

export const getClaimOrderRewardsRequestData = state => state.transaction.claimOrderRewardsRequest.data;

export const getClaimOrderRewardsRequestStatus = state => state.transaction.claimOrderRewardsRequest.status;

export const getClaimOrderRewardsRequestError = state => state.transaction.claimOrderRewardsRequest.error;

export const getClaimOrderRewardsPointsValue = createSelector(
  getClaimOrderRewardsRequestData,
  claimOrderRewardsRequestData => _get(claimOrderRewardsRequestData, 'points.amount', null)
);

export const getClaimOrderRewardsPointsStatus = createSelector(
  getClaimOrderRewardsRequestData,
  claimOrderRewardsRequestData => _get(claimOrderRewardsRequestData, 'points.status', null)
);

export const getClaimOrderRewardsCashbackValue = createSelector(
  getClaimOrderRewardsRequestData,
  claimOrderRewardsRequestData => _get(claimOrderRewardsRequestData, 'cashback.amount', null)
);

export const getClaimOrderRewardsCashbackStatus = createSelector(
  getClaimOrderRewardsRequestData,
  claimOrderRewardsRequestData => _get(claimOrderRewardsRequestData, 'cashback.status', null)
);

export const getClaimOrderRewardsTransactionStatus = createSelector(
  getClaimOrderRewardsRequestData,
  claimOrderRewardsRequestData => _get(claimOrderRewardsRequestData, 'transactionValidation.status', null)
);

export const getIsClaimOrderRewardsIsNewMember = createSelector(
  getClaimOrderRewardsRequestData,
  claimOrderRewardsRequestData => _get(claimOrderRewardsRequestData, 'joinMembershipResult.isNewMember', false)
);

/**
 * Derived selectors
 */
export const getIsLoadOrderRewardsRequestFulfilled = createSelector(
  getLoadOrderRewardsRequestStatus,
  loadOrderRewardsRequestStatus => loadOrderRewardsRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsLoadOrderRewardsRequestCompleted = createSelector(
  getLoadOrderRewardsRequestStatus,
  loadOrderRewardsRequestStatus =>
    [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(loadOrderRewardsRequestStatus)
);
