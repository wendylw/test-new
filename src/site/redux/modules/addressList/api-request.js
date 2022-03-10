import { get } from '../../../../utils/api/api-fetch';

export const fetchAddressList = consumerId => get(`/api/consumers/${consumerId}/address`);
