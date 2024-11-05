import { get } from '../../../../../../utils/api/api-fetch';

export const getPointsRewardDetail = async rewardSettingId => get(`/api/v3/points/rewards/${rewardSettingId}`);
