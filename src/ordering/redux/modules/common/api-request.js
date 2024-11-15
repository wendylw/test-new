import { get } from '../../../../utils/api/api-fetch';

export const getUniquePromosAvailableCount = (consumerId, { business, shippingType }) =>
  get(`/api/v3/consumers/${consumerId}/unique-promos/available-count`, {
    queryParams: {
      business,
      shippingType,
    },
  });
