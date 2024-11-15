import { get } from '../../../../../../utils/api/api-fetch';

export const getUniquePromotionDetail = async ({ consumerId, uniquePromotionCodeId }) =>
  get(`/api/v3/consumers/${consumerId}/unique-promos/${uniquePromotionCodeId}`);
