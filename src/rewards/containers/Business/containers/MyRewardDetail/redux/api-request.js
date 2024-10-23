import { get } from '../../../../../../utils/api/api-fetch';

export const getUniquePromotionDetail = async ({ id, uniquePromotionId }) =>
  get(`/api/v3/consumers/${id}/unique-promos/${uniquePromotionId}`);
