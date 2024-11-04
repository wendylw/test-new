import { get } from '../../../../../../utils/api/api-fetch';

export const getUniquePromotionDetail = async ({ consumerId, uniquePromotionId }) =>
  get(`/api/v3/consumers/${consumerId}/unique-promos/${uniquePromotionId}`);
