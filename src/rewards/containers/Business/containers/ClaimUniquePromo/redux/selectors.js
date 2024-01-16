import { createSelector } from 'reselect';
import { getQueryString } from '../../../../../../common/utils';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { CLAIM_UNIQUE_PROMO_ERROR_CODES } from '../utils/constants';

export const getUniquePromoRewardsSetId = getQueryString('rewardsSetId');

export const getIsClaimPromotionClicked = state => state.rewards.business.claimUniquePromo.isClaimPromotionClicked;

export const getClaimUniquePromoRequestData = state => state.rewards.business.claimUniquePromo.data;

export const getClaimUniquePromoRequestStatus = state => state.rewards.business.claimUniquePromo.status;

export const getClaimUniquePromoRequestError = state => state.rewards.business.claimUniquePromo.error;

export const getIsClaimUniquePromoRequestFulfilled = createSelector(
  getClaimUniquePromoRequestStatus,
  claimUniquePromoRequestStatus => claimUniquePromoRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsClaimUniquePromoRequestDuplicated = createSelector(
  getClaimUniquePromoRequestError,
  claimUniquePromoRequestError =>
    claimUniquePromoRequestError?.code === CLAIM_UNIQUE_PROMO_ERROR_CODES.DUPLICATED_PROMO_CODE
);
