import { getQueryString } from '../../../../../../common/utils';

export const getUniquePromoRewardsSetId = getQueryString('rewardsSetId');

export const getClaimUniquePromoRequestStatus = state => state.rewards.business.claimUniquePromo.status;
