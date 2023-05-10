import { get } from '../../../utils/api/api-fetch';

export const getConsumerLoginStatus = () => get('/api/ping');

export const getProfileInfo = consumerId => get(`/api/v3/consumers/${consumerId}/profile`);

export const getConsumerCustomerInfo = consumerId => get(`/api/consumers/${consumerId}/customer`);
