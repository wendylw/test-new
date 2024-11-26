import _get from 'lodash/get';
import { createSelector } from 'reselect';
import { API_REQUEST_STATUS, REWARDS_TYPE } from '../../../common/utils/constants';

export const getLoadRewardListRequestData = state => state.rewards.loadRewardListRequest.data;

export const getLoadRewardListRequestStatus = state => state.rewards.loadRewardListRequest.status;

export const getLoadRewardListRequestError = state => state.rewards.loadRewardListRequest.error;

export const getLoadRewardDetailRequestData = state => state.rewards.loadRewardDetailRequest.data;

export const getLoadRewardDetailRequestStatus = state => state.rewards.loadRewardDetailRequest.status;

export const getLoadRewardDetailRequestError = state => state.rewards.loadRewardDetailRequest.error;

export const getRewardDetailId = createSelector(getLoadRewardDetailRequestData, loadRewardDetailRequestData =>
  _get(loadRewardDetailRequestData, 'id', null)
);

export const getRewardDetailUniquePromotionCodeId = createSelector(
  getLoadRewardDetailRequestData,
  loadRewardDetailRequestData => _get(loadRewardDetailRequestData, 'uniquePromotionCodeId', null)
);

export const getRewardDetailCode = createSelector(getLoadRewardDetailRequestData, loadRewardDetailRequestData =>
  _get(loadRewardDetailRequestData, 'code', null)
);

export const getRewardDetailType = createSelector(getLoadRewardDetailRequestData, loadRewardDetailRequestData =>
  _get(loadRewardDetailRequestData, 'type', null)
);

export const getRewardDetailDiscountType = createSelector(getLoadRewardDetailRequestData, loadRewardDetailRequestData =>
  _get(loadRewardDetailRequestData, 'discountType', null)
);

export const getRewardDetailDiscountValue = createSelector(
  getLoadRewardDetailRequestData,
  loadRewardDetailRequestData => _get(loadRewardDetailRequestData, 'discountValue', null)
);

export const getRewardDetailName = createSelector(getLoadRewardDetailRequestData, loadRewardDetailRequestData =>
  _get(loadRewardDetailRequestData, 'name', null)
);

export const getRewardDetailValidTo = createSelector(getLoadRewardDetailRequestData, loadRewardDetailRequestData =>
  _get(loadRewardDetailRequestData, 'validTo', null)
);

export const getRewardDetailMinSpendAmount = createSelector(
  getLoadRewardDetailRequestData,
  loadRewardDetailRequestData => _get(loadRewardDetailRequestData, 'minSpendAmount', null)
);

export const getRewardDetailStatus = createSelector(getLoadRewardDetailRequestData, loadRewardDetailRequestData =>
  _get(loadRewardDetailRequestData, 'status', null)
);

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
export const getIsRewardDetailTypeVoucher = createSelector(
  getRewardDetailType,
  rewardDetailType => rewardDetailType === REWARDS_TYPE.VOUCHER
);

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
