import { get } from '../../../../utils/api/api-fetch';

export const getCustomerInfo = ({ consumerId, business }) =>
  get(`/api/v3/consumers/${consumerId}/customer`, {
    queryParams: {
      business,
    },
  });
