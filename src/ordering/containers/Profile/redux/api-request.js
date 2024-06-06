import { put } from '../../../../utils/api/api-fetch';

export const putProfileInfo = (consumerId, { firstName, lastName, email, birthday }) =>
  put(`/api/v3/consumers/${consumerId}/profile`, { firstName, lastName, email, birthday });
