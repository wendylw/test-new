import { put } from '../../../../utils/api/api-fetch';

export const putProfileInfo = (consumerId, { firstName, email, birthday }) =>
  put(`/api/consumers/${consumerId}/profile`, { firstName, email, birthday });
