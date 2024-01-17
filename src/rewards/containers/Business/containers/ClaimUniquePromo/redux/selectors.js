import { createSelector } from 'reselect';
import { getQueryString } from '../../../../../../common/utils';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { CLAIM_UNIQUE_PROMO_ERROR_CODES } from '../utils/constants';
import { FEATURE_KEYS } from '../../../../../../redux/modules/growthbook/constants';
import { getFeatureFlagResult } from '../../../../../../redux/modules/growthbook/selectors';

export const getUniquePromoRewardsSetId = getQueryString('rewardsSetId');

export const getUniquePromosRewardsUrl = state => getFeatureFlagResult(state, FEATURE_KEYS.CLAIM_UNIQUE_PROMO).introURL;

export const getUniquePromosCongratulationUrl = state =>
  getFeatureFlagResult(state, FEATURE_KEYS.CLAIM_UNIQUE_PROMO).congratsURL;

export const getClaimUniquePromoRequestData = state => state.rewards.business.claimUniquePromo.data;

export const getClaimUniquePromoRequestStatus = state => state.rewards.business.claimUniquePromo.status;

export const getClaimUniquePromoRequestError = state => state.rewards.business.claimUniquePromo.error;

export const getIsClaimUniquePromoRequestPending = createSelector(
  getClaimUniquePromoRequestStatus,
  claimUniquePromoRequestStatus => claimUniquePromoRequestStatus === API_REQUEST_STATUS.PENDING
);

export const getIsClaimUniquePromoRequestFulfilled = createSelector(
  getClaimUniquePromoRequestStatus,
  claimUniquePromoRequestStatus => claimUniquePromoRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsClaimUniquePromoRequestDuplicated = createSelector(
  getClaimUniquePromoRequestError,
  claimUniquePromoRequestError =>
    claimUniquePromoRequestError?.code === CLAIM_UNIQUE_PROMO_ERROR_CODES.DUPLICATED_PROMO_CODE
);
