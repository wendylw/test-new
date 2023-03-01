import { put } from '../../../../utils/api/api-fetch';

export const updateProfileInfo = (consumerId, { name, email, birthday }) =>
  put(`/api/consumers/${consumerId}/profile`, { firstName: name, email, birthday });

export const putProfileInfo = (consumerId, { firstName, email, birthday }) =>
  put(`/api/consumers/${consumerId}/profile`, { firstName, email, birthday });
