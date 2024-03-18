import { get, post } from '../../../../../../utils/api/api-fetch';

export const getUniquePromoList = async ({ consumerId, business }) =>
  get(`/api/v3/consumers/${consumerId}/unique-promos`, {
    queryParams: {
      business,
    },
  });

export const getPointsRewardList = async ({ consumerId, business: merchantName }) =>
  get(`http://127.0.0.1:4523/m1/2755399-0-default/api/v3/points/rewards`, {
    queryParams: {
      consumerId,
      merchantName,
    },
  });

export const postClaimedPointsReward = async ({ consumerId, business: merchantName, id, type }) =>
  post(
    `http://127.0.0.1:4523/m1/2755399-0-default/api/v3/points/rewards`,
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
