import { get, post } from '../../../../../../utils/api/api-fetch';

export const getPointsRewardDetail = async rewardSettingId => get(`/api/v3/points/rewards/${rewardSettingId}`);

export const postClaimedPointsReward = async ({ consumerId, business: merchantName, id }) =>
  post(
    `/api/v3/points/rewards`,
    {
      id,
      merchantName,
    },
    {
      queryParams: {
        consumerId,
        merchantName,
      },
    }
  );
