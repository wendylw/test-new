import * as ApiFetch from '../../../../utils/api/api-fetch';

// eslint-disable-next-line camelcase
export const updateProfileInfo = (consumerId, { name, email, birthday }) =>
  ApiFetch.put(`/api/consumers/${consumerId}/profile`, { firstName: name, email, birthday });
