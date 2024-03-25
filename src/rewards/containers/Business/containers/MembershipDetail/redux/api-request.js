import { get, post } from '../../../../../../utils/api/api-fetch';

export const getPointsRewardList = async ({ consumerId, business: merchantName }) =>
  get(`/api/v3/points/rewards`, {
    queryParams: {
      consumerId,
      merchantName,
    },
  });

export const postClaimedPointsReward = async ({ consumerId, business: merchantName, id, type }) =>
  post(
    `/api/v3/points/rewards`,
    {
      id,
      type,
      merchantName,
    },
    {
      queryParams: {
        consumerId,
        merchantName,
      },
    }
  );
