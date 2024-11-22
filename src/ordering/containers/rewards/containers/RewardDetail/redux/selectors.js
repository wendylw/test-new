import { getQueryString } from '../../../../../../common/utils';

export const getRewardId = () => getQueryString('id');

export const getRewardUniquePromotionCodeId = () => getQueryString('upid');

export const getRewardType = () => getQueryString('type');
