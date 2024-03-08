import { get } from '../../../../utils/api/api-fetch';

export const getConsumerCustomerInfo = consumerId => get(`/api/v3/consumers/${consumerId}/customer`);
