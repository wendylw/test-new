import _get from 'lodash/get';
import { createSelector } from 'reselect';

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
