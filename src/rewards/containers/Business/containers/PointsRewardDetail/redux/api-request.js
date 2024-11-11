import { get, post } from '../../../../../../utils/api/api-fetch';

export const getPointsRewardDetail = async (rewardSettingId, { customerId }) =>
  get(`/api/v3/points/rewards/${rewardSettingId}`, {
    queryParams: { customerId },
  });

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
