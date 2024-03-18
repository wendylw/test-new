import { get } from '../../../../utils/api/api-fetch';

export const getCustomerInfo = ({ consumerId, business }) =>
  get(`http://127.0.0.1:4523/m1/2755399-0-0a18a6d8/api/v3/consumers/${consumerId}/customer`, {
    queryParams: {
      business,
    },
  });
