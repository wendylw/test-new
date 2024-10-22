import { getQueryString } from '../../../../../common/utils';

export const getMyRewardId = () => getQueryString('id');

export const getMyRewardUniquePromotionId = () => getQueryString('uniquePromotionId');

export const getLoadMyRewardDetailData = state => state.myRewardDetail.loadMyRewardDetailRequest.data;

export const getLoadMyRewardDetailStatus = state => state.myRewardDetail.loadMyRewardDetailRequest.status;

export const getLoadMyRewardDetailError = state => state.myRewardDetail.loadMyRewardDetailRequest.error;
