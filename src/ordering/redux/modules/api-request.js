import { get } from '../../../utils/api/api-fetch';

export const getProfileInfo = consumerId => get(`/api/v3/consumers/${consumerId}/profile`);
