import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../common/utils/constants';

export const getLoadRewardListRequestData = state => state.rewards.loadRewardListRequest.data;

export const getLoadRewardListRequestStatus = state => state.rewards.loadRewardListRequest.status;

export const getLoadRewardListRequestError = state => state.rewards.loadRewardListRequest.error;

export const getLoadRewardDetailRequestData = state => state.rewards.loadRewardDetailRequest.data;

export const getLoadRewardDetailRequestStatus = state => state.rewards.loadRewardDetailRequest.status;

export const getLoadRewardDetailRequestError = state => state.rewards.loadRewardDetailRequest.error;

export const getApplyPromoRequestStatus = state => state.rewards.applyPromoRequest.status;

export const getApplyPromoRequestError = state => state.rewards.applyPromoRequest.error;

export const getApplyVoucherRequestStatus = state => state.rewards.applyVoucherRequest.status;

export const getApplyVoucherRequestError = state => state.rewards.applyVoucherRequest.error;

export const getApplyPayLaterPromoRequestStatus = state => state.rewards.applyPayLaterPromoRequest.status;

export const getApplyPayLaterPromoRequestError = state => state.rewards.applyPayLaterPromoRequest.error;

export const getApplyPayLaterVoucherRequestStatus = state => state.rewards.applyPayLaterVoucherRequest.status;

export const getApplyPayLaterVoucherRequestError = state => state.rewards.applyPayLaterVoucherRequest.error;

/*
 * Selectors derived from state
 */
export const getIsApplyPromoOrVoucherPending = createSelector(
  getApplyPromoRequestStatus,
  getApplyVoucherRequestStatus,
  (applyPromoRequestStatus, applyVoucherRequestStatus) =>
    applyPromoRequestStatus === API_REQUEST_STATUS.PENDING || applyVoucherRequestStatus === API_REQUEST_STATUS.PENDING
);

export const getIsApplyPromoFulfilled = createSelector(
  getApplyPromoRequestStatus,
  applyPromoRequestStatus => applyPromoRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsApplyVoucherFulfilled = createSelector(
  getApplyVoucherRequestStatus,
  applyVoucherRequestStatus => applyVoucherRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsApplyPayLaterPromoOrVoucherPending = createSelector(
  getApplyPayLaterPromoRequestStatus,
  getApplyPayLaterVoucherRequestStatus,
  (applyPayLaterPromoRequestStatus, applyPayLaterVoucherRequestStatus) =>
    applyPayLaterPromoRequestStatus === API_REQUEST_STATUS.PENDING ||
    applyPayLaterVoucherRequestStatus === API_REQUEST_STATUS.PENDING
);

export const getIsApplyPayLaterPromoFulfilled = createSelector(
  getApplyPayLaterPromoRequestStatus,
  applyPayLaterPromoRequestStatus => applyPayLaterPromoRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsApplyPayLaterVoucherFulfilled = createSelector(
  getApplyPayLaterVoucherRequestStatus,
  applyPayLaterVoucherRequestStatus => applyPayLaterVoucherRequestStatus === API_REQUEST_STATUS.FULFILLED
);
